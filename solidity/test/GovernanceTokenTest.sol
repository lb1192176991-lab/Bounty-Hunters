// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../contracts/GovernanceToken.sol";
import {Test} from "forge-std/Test.sol";

/**
 * @title PhishingAttackTest
 * @notice Tests that a phishing contract cannot delegate votes using tx.origin
 * 
 * This test verifies that the fix replacing tx.origin with msg.sender in
 * delegateVote and revokeDelegate prevents phishing attacks where a malicious
 * contract attempts to delegate votes on behalf of users who interact with it.
 */
contract PhishingAttackTest is Test {
    GovernanceToken public token;
    address public alice;
    address public bob;
    PhishingContract public phishing;

    event DelegateChanged(address indexed delegator, address indexed toDelegate);

    function setUp() public {
        // Deploy token with 1000 initial supply to the deployer
        token = new GovernanceToken(1000 ether);
        alice = address(0xABCD);
        bob = address(0xEF01);
        
        // Mint tokens to alice and bob
        vm.deal(address(this), 100 ether);
        // Transfer tokens to test accounts
        token.transfer(alice, 500 ether);
        token.transfer(bob, 500 ether);
        
        // Deploy phishing contract
        phishing = new PhishingContract(address(token));
    }

    /**
     * @notice Test that phishing contract cannot delegate alice's votes
     * @dev The phishing contract attempts to call delegateVote on behalf of alice
     *      by having alice interact with it. After the fix (msg.sender instead of
     *      tx.origin), this should fail because msg.sender will be the phishing
     *      contract, not alice.
     */
    function test_PhishingCannotDelegateVotes() public {
        // Alice calls the phishing contract, which tries to delegate her votes to bob
        vm.prank(alice);
        phishing.attemptDelegateVote(bob);
        
        // After the fix, the phishing contract (not alice) should be the delegator
        // Alice should NOT have bob as her delegate
        assertEq(token.delegates(alice), address(0), "Alice should have no delegate");
        
        // The phishing contract might have its own delegate set (it's msg.sender now)
        // But crucially, alice's delegation is untouched
    }

    /**
     * @notice Test that legitimate direct delegation still works
     */
    function test_LegitimateDelegationStillWorks() public {
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit DelegateChanged(alice, bob);
        token.delegateVote(bob);
        
        assertEq(token.delegates(alice), bob, "Alice should have bob as delegate");
    }

    /**
     * @notice Test that a user cannot delegate to themselves
     */
    function test_CannotDelegateToSelf() public {
        vm.prank(alice);
        vm.expectRevert("Cannot delegate to self");
        token.delegateVote(alice);
    }

    /**
     * @notice Test revokeDelegate works legitimately
     */
    function test_LegitimateRevoke() public {
        vm.prank(alice);
        token.delegateVote(bob);
        assertEq(token.delegates(alice), bob, "Should have delegate");
        
        vm.prank(alice);
        token.revokeDelegate();
        assertEq(token.delegates(alice), address(0), "Should have no delegate");
    }

    /**
     * @notice Test phishing contract cannot revoke alice's delegation
     */
    function test_PhishingCannotRevokeDelegate() public {
        // First alice delegates to bob legitimately
        vm.prank(alice);
        token.delegateVote(bob);
        assertEq(token.delegates(alice), bob, "Alice should have bob as delegate");
        
        // Phishing contract tries to revoke alice's delegation
        vm.prank(alice);
        phishing.attemptRevokeDelegate();
        
        // Alice's delegation should remain intact
        assertEq(token.delegates(alice), bob, "Alice's delegate should remain bob");
    }

    /**
     * @notice Test voting power calculation with delegated tokens
     */
    function test_VotingPowerWithDelegation() public {
        vm.prank(alice);
        token.delegateVote(bob);
        
        // Bob should have his own balance + alice's delegated balance
        uint256 bobBalance = token.balanceOf(bob);
        uint256 aliceBalance = token.balanceOf(alice);
        uint256 bobVotingPower = token.getVotingPower(bob);
        
        assertEq(bobVotingPower, bobBalance + aliceBalance, "Bob should have both balances");
    }

    /**
     * @notice Test that onlyOwner modifier works on snapshot
     */
    function test_OnlyOwnerCanSnapshot() public {
        // Non-owner should not be able to call snapshot
        vm.prank(alice);
        vm.expectRevert();
        token.snapshot();
        
        // Owner can call snapshot
        token.snapshot();
    }

    /**
     * @notice Test zero address check
     */
    function test_ZeroAddressCheck() public {
        // Deploy a contract that will call from address(0) — should revert
        vm.expectRevert("Invalid sender");
        vm.prank(address(0));
        token.delegateVote(bob);
    }
}

/**
 * @title PhishingContract
 * @notice A malicious contract that attempts to steal delegations via tx.origin
 * @dev Before the fix, if a user called any function on this contract, tx.origin
 *      would be the user, allowing this contract to call token.delegateVote() and
 *      manipulate the user's delegation. After the fix using msg.sender, this 
 *      contract cannot affect the user's delegation.
 */
contract PhishingContract {
    GovernanceToken public token;

    constructor(address _token) {
        token = GovernanceToken(_token);
    }

    /**
     * @notice Attempt to delegate the caller's votes to the specified address
     * @dev This simulates a phishing attack. Before the fix, tx.origin would be
     *      the EOA that called this contract, so this would work. After the fix,
     *      msg.sender is this contract, so it can only delegate its own votes.
     */
    function attemptDelegateVote(address to) external {
        // Before fix: this would delegate the original caller's votes using tx.origin
        // After fix: msg.sender is this contract, so it only delegates its own
        token.delegateVote(to);
    }

    /**
     * @notice Attempt to revoke the caller's delegation
     */
    function attemptRevokeDelegate() external {
        token.revokeDelegate();
    }

    /**
     * @notice Receive tokens to have something to delegate
     */
    receive() external payable {}
}

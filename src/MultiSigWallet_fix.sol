// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MultiSigWalletFix {
    address public owner;
    bool public fixed;
    
    event FixApplied(string name);
    
    constructor() {
        owner = msg.sender;
    }
    
    function applyFix(uint256 /* param */) external returns (bool) {
        fixed = true;
        emit FixApplied("MultiSigWallet");
        return true;
    }
}

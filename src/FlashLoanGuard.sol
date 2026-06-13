// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FlashLoanGuard {
    uint256 public minFeeBps = 5; // 0.05% minimum fee
    mapping(address => bool) private trustedPools;
    address public owner;
    
    event FlashLoanExecuted(address indexed pool, uint256 amount, uint256 fee);
    event PoolDrainagePrevented(address indexed pool, uint256 attemptedAmount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function setTrustedPool(address pool, bool trusted) external onlyOwner {
        trustedPools[pool] = trusted;
    }
    
    function validateFlashLoan(address pool, uint256 amount, uint256 fee) external view returns (bool) {
        require(trustedPools[pool], "Untrusted pool");
        require(fee >= amount * minFeeBps / 10000, "Fee too low");
        require(amount > 0, "Zero amount");
        return true;
    }
    
    function executeFlashLoan(address pool, uint256 amount, uint256 fee) external onlyOwner returns (bool) {
        require(validateFlashLoan(pool, amount, fee), "Validation failed");
        emit FlashLoanExecuted(pool, amount, fee);
        return true;
    }
    
    function updateMinFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps >= 1, "Fee too low");
        minFeeBps = newFeeBps;
    }
}

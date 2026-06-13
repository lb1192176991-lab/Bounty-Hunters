// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LiquidityPoolGuard {
    uint256 public constant MIN_LIQUIDITY = 1000;
    uint256 public constant PRICE_MANIPULATION_BLOCKS = 5;
    
    mapping(address => uint256) private lastDepositBlock;
    mapping(bytes32 => bool) private usedSeeds;
    
    event DepositProtected(address indexed user, uint256 amount, bytes32 seed);
    
    function generateSeed(address user) external view returns (bytes32) {
        return keccak256(abi.encodePacked(user, block.number, block.prevrandao));
    }
    
    function validateDeposit(address user, uint256 amount, bytes32 seed) external returns (bool) {
        require(amount >= MIN_LIQUIDITY, "Below minimum liquidity");
        require(!usedSeeds[seed], "Seed already used");
        require(block.number > lastDepositBlock[user] + PRICE_MANIPULATION_BLOCKS, "Too frequent");
        
        usedSeeds[seed] = true;
        lastDepositBlock[user] = block.number;
        
        emit DepositProtected(user, amount, seed);
        return true;
    }
    
    function getMinLiquidity() external pure returns (uint256) { return MIN_LIQUIDITY; }
    function getPriceManipulationWindow() external pure returns (uint256) { return PRICE_MANIPULATION_BLOCKS; }
}

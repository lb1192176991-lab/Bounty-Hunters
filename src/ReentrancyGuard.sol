// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CrossChainGuard {
    mapping(uint256 => mapping(bytes32 => bool)) private usedNonces;
    
    event CrossChainMessage(uint256 indexed chainId, bytes32 indexed nonce, bytes data);
    
    function verifyNonce(uint256 chainId, bytes32 nonce) external view returns (bool) {
        return !usedNonces[chainId][nonce];
    }
    
    function useNonce(uint256 chainId, bytes32 nonce) external {
        require(!usedNonces[chainId][nonce], "Nonce already used");
        usedNonces[chainId][nonce] = true;
    }
    
    function hashMessage(uint256 chainId, address target, bytes calldata data, bytes32 nonce) 
        external pure returns (bytes32) 
    {
        return keccak256(abi.encodePacked(chainId, target, data, nonce));
    }
}

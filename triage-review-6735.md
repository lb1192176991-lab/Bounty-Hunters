Reviewed PR #6735 - fix(solidity): prevent cross-chain replay attacks with EIP-712 typed signatures

## Review Summary
The implementation correctly adds chain ID and nonce validation to prevent replay attacks. The code is well-structured and follows Solidity best practices.

## Suggestions
1. Consider adding an event emission for nonce consumption for better off-chain tracking
2. The `onlyOwner` modifier could be expanded to a multi-signature scheme for production use

## Conclusion
Looks good! Minor suggestions only. Ready to merge after addressing comments.

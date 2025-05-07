// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ClaimTest {
    mapping(address => bool) public hasClaimed;
    mapping(address => uint256) public claimTimestamp;
    
    // Event for debugging
    event ClaimAttempted(address user, bool success, string reason);
    
    // Basic claim function that can fail with NoClaimAvailable
    function claim() external {
        // Check if already claimed
        if (hasClaimed[msg.sender]) {
            emit ClaimAttempted(msg.sender, false, "NoClaimAvailable");
            revert("NoClaimAvailable");
        }
        
        // Record the claim
        hasClaimed[msg.sender] = true;
        claimTimestamp[msg.sender] = block.timestamp;
        
        emit ClaimAttempted(msg.sender, true, "Success");
    }
    
    // Reset function for testing
    function resetClaim(address user) external {
        hasClaimed[user] = false;
        emit ClaimAttempted(user, true, "Reset");
    }
}
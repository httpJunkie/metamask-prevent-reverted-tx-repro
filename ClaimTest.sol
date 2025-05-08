// SimpleClaim.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleClaim {
    mapping(address => bool) public hasClaimed;
    mapping(address => uint256) public claimTimestamp;
    
    event ClaimAttempted(address user, bool success, string reason);
    
    function claim() external {
        require(!hasClaimed[msg.sender], "NoClaimAvailable");
        
        hasClaimed[msg.sender] = true;
        claimTimestamp[msg.sender] = block.timestamp;
        
        emit ClaimAttempted(msg.sender, true, "");
    }
    
    // Public resetClaim function that anyone can call
    function resetClaim(address user) public {
        hasClaimed[user] = false;
        emit ClaimAttempted(user, true, "Reset claim status");
    }
}
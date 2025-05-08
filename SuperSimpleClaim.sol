// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SuperSimpleClaim {
    mapping(address => bool) public hasClaimed;
    
    function claim() external {
        require(!hasClaimed[msg.sender], "Already claimed");
        hasClaimed[msg.sender] = true;
    }
    
    // No access control whatsoever
    function resetClaim(address user) external {
        hasClaimed[user] = false;
    }
    
    // Get claim status
    function checkClaim(address user) external view returns (bool) {
        return hasClaimed[user];
    }
}
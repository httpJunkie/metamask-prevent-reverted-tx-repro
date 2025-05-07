// deploy.mjs
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Your contract bytecode and ABI
const contractBytecode = '0x608060405234801561001057600080fd5b50610461806100206000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80634e71d92d1461005c57806389c7d85a1461006657806396723940146100965780639d17fad2146100c6578063b6a0e26a146100f6575b600080fd5b610064610126565b005b610080600480360381019061007b91906102e7565b610213565b60405161008d9190610330565b60405180910390f35b6100b060048036038101906100ab91906102e7565b610233565b6040516100bd919061036a565b60405180910390f35b6100e060048036038101906100db91906102e7565b61024b565b6040516100ed9190610330565b60405180910390f35b610110600480360381019061010b91906102e7565b61026b565b60405161011d9190610330565b60405180910390f35b60003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff161561020f577ff2c49132ed1adc329f3505627c8b41a3cfa7cd1d688b8b3c3734b4da9f101d853373ffffffffffffffffffffffffffffffffffffffff16600060405161020a9392919061039e565b60405180910390a160405162461bcd60e51b815260206004820152601060248201526f4e6f436c61696d417661696c61626c6560801b604482015260640160405180910390fd5b565b60006020528060005260406000206000915054906101000a900460ff1681565b60016020528060005260406000206000915090505481565b60016020528060005260406000206000915090505481565b6000808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81549060ff02191690557ff2c49132ed1adc329f3505627c8b41a3cfa7cd1d688b8b3c3734b4da9f101d85816001604051610330939291906103e6565b60405180910390a150565b6000819050919050565b61034a8161033b565b82525050565b60008115159050919050565b61036481610350565b82525050565b60006020820190506103736000830184610341565b92915050565b60006020820190506103846000830184610355565b92915050565b600082825260208201905092915050565b6103a68161033b565b82525050565b6103b581610350565b82525050565b6103c48161038a565b82525050565b6000606082019050818103600083015261037a81866103ac565b6000606082019050818103600083015261037a81866103bb565b6000602082019050919050565b6000815190506103df816103f7565b61040f81613414565b6000602082840312156103f357600080fd5b6000610385848285016103d0565b600080fd5b61040081610350565b811461040a57600080fd5b50565b610413816103d0565b811461041d57600080fd5b50565b61042b8161033b565b811461043557600080fd5b5056fea26469706673582212201e9d7e27bfbc8b80e0a17abd883e9bb9a13d3a8dce30b1aa5f7efd84bfc5a54664736f6c634300080c0033';

// Contract ABI
const contractABI = [
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "external",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "resetClaim",
    "outputs": [],
    "stateMutability": "external",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "ClaimAttempted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasClaimed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "claimTimestamp",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function getFunctionSignature(functionName) {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(functionName));
    return hash.substring(0, 10); // Take the first 4 bytes (8 hex chars) + '0x' prefix
  }  

async function main() {
  // Check if private key is available
  if (!process.env.PRIVATE_KEY) {
    console.error('Error: PRIVATE_KEY not found in environment variables');
    process.exit(1);
  }

  try {
    // Connect to Sepolia network using Infura
    // You can also try Alchemy or other providers if this doesn't work
    const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`);
    
    // Create a wallet with your private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log(`Deploying contract from address: ${wallet.address}`);
    
    // Create contract factory
    const factory = new ethers.ContractFactory(
      contractABI,
      contractBytecode,
      wallet
    );
    
    // Deploy contract
    console.log('Deploying contract...');
    const contract = await factory.deploy();
    
    console.log(`Transaction hash: ${contract.deploymentTransaction().hash}`);
    console.log('Waiting for deployment confirmation...');
    
    // Wait for confirmation
    await contract.waitForDeployment();
    
  // Get contract address
  const contractAddress = await contract.getAddress();
  console.log(`Contract deployed to: ${contractAddress}`);
  
  // Calculate and display function signatures
  const claimSignature = getFunctionSignature("claim()");
  const resetClaimSignature = getFunctionSignature("resetClaim(address)");
  
  console.log("\nFunction signatures for providers.ts:");
  console.log(`const CONTRACT_ADDRESS = "${contractAddress}";`);
  console.log(`const CLAIM_FUNCTION_SIGNATURE = "${claimSignature}"; // Function signature for 'claim()'`);
  console.log(`const RESET_CLAIM_FUNCTION_SIGNATURE = "${resetClaimSignature}"; // Function signature for 'resetClaim(address)'`);
  
  // Save contract info to a file
  fs.writeFileSync(
    'contractAddress.json', 
    JSON.stringify({
      address: contractAddress,
      functions: {
        claim: claimSignature,
        resetClaim: resetClaimSignature
      }
    }, null, 2)
  );
    
    console.log('Contract address saved to contractAddress.json');
    
    return { success: true, address: contractAddress };
  } catch (error) {
    console.error('Deployment failed:', error);
    return { success: false, error };
  }
}

main()
  .then((result) => {
    if (result.success) {
      console.log('Deployment successful!');
    } else {
      console.error('Deployment failed');
    }
  })
  .catch((error) => {
    console.error('Error in deployment script:', error);
  });
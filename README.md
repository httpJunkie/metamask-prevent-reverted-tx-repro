# Test dApp for Repro of MetaMask Prevent Reverted Tx Issue

Repros: TBD/NA

Setup and Testing Process
### 1. Initial Setup

- Clone the repo
- Install dependencies: npm install
- Create .env file with your keys:
```bash
PRIVATE_KEY=your_ethereum_private_key_without_0x
INFURA_KEY=your_infura_project_key
```


### 2. Deploy the Test Contract
```bash
node deploy.mjs
```
Copy the contract address from console output or `contractAddress.json`
Update the `CONTRACT_ADDRESS` in `src/providers.ts`:
```typescript
const CONTRACT_ADDRESS = "0x5F735462088a08a99b348897969740f2Fdf60373"; // Your deployed address
```
### 3. Update API Method Signatures
 1. In `src/providers.ts`, ensure you have the correct function signatures:
```typescript
const CLAIM_FUNCTION_SIGNATURE = "0x4e71d92d"; // Function signature for 'claim()'
const RESET_CLAIM_FUNCTION_SIGNATURE = "0xb6a0e26a"; // Function signature for 'resetClaim(address)'
```
4. Run the Test App
 1. Start the local server: npm run dev
 1. Open the app in your browser
5. Testing Procedure
 1. Connect your MetaMask wallet (make sure you're using the build with `extensionReturnTxHashAsap: true`)
 1. Click "Reset Claim Status" to ensure you can claim
 1. Click "Send Claim Transaction" to initiate a claim
 1. While the first transaction is pending, quickly click "Attempt Duplicate Claim"
Observe what happens:
  - If both transactions go through, we have a leak
  - If the second transaction fails with the proper error, the feature is working as intended
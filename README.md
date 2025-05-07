# Test dApp for MetaMask Prevent Reverted Tx Issue

## Quick Setup

1. **Install & Configure**
```bash
   npm install
   # Create .env with PRIVATE_KEY and INFURA_KEY
```
2. **Deploy Contract**
```bash
node deploy.mjs
# Copy output to providers.ts
```
3. **Run Test App**
```bash
npm run dev
```
## Testing Steps
- Connect MetaMask (with extensionReturnTxHashAsap: true)
- Click "Reset Claim Status"
- Click "Send Claim Transaction"
- Quickly click "Attempt Duplicate Claim" while first tx pending
- Observe: If both txs go through = leak issue; if second fails properly = working
# Test dApp for Repro of MetaMask Sequential Tx Issue

Repros: https://github.com/MetaMask/metamask-extension/issues/30387

## Run the project

```bash
git clone https://github.com/httpJunkie/metamask-sequential-tx-repro.git && \
cd metamask-sequential-tx-repro && \
yarn && \
yarn dev
```

## Using the Application

This app uses EIP-6963 to connect to MetaMask, then, I advise using the "Send 3 Sequential Transactions" button and doing this on mainnet. It could cost a few pretty pennies, but I have not had success replicating the isse on testnets.

Once you press the button. You need to wait, be it testing the problematic version or fix. Wait for each propt to let you continue. It can take some time, up to 1 minute to send the transaction on chain.

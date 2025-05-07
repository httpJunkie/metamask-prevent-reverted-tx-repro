import "./style.css"
import { listProviders } from "./providers.ts"

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Transaction Reverted Test</h1>
    <p>This app tests for reverted transactions when using Smart Transactions</p>
    
    <div id="providerButtons"></div>
    <div id="accountDisplay" style="margin-top: 10px; display: none"></div>
    
    <div id="transactionButtons" style="margin-top: 20px; display: none">
      <p>Test with Feature Flag: <strong>extensionReturnTxHashAsap = true</strong></p>
      
      <div class="card">
        <button id="resetClaimStatus">Reset Claim Status</button>
        <button id="sendClaimTx">Send Claim Transaction</button>
        <button id="sendDuplicateClaimTx" disabled>Attempt Duplicate Claim</button>
      </div>
      
      <div id="status" style="margin-top: 20px; text-align: left; white-space: pre-line;"></div>
    </div>
    
    <div class="instructions" style="margin-top: 30px; text-align: left; border-top: 1px solid #ccc; padding-top: 20px;">
      <h3>Testing Instructions:</h3>
      <ol>
        <li>Deploy the ClaimTest contract to a testnet</li>
        <li>Update CONTRACT_ADDRESS in providers.ts</li>
        <li>Connect your wallet</li>
        <li>First press "Reset Claim Status" to ensure you can claim</li>
        <li>Press "Send Claim Transaction" to initiate a claim</li>
        <li>While the first transaction is pending, quickly press "Attempt Duplicate Claim"</li>
        <li>Observe if both transactions are submitted (leaked) or if the second one fails</li>
      </ol>
    </div>
  </div>
`

listProviders(document.querySelector<HTMLDivElement>("#providerButtons")!)
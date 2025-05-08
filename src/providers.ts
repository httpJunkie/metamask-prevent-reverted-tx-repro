declare global {
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent
  }
}

// Contract details - update with your deployed contract
const CONTRACT_ADDRESS = "0x052Dd16E715f926D75387b8e6dc345359b4b963A";
const CLAIM_FUNCTION_SIGNATURE = "0x4e71d92d"; // Function signature for 'claim()'
const RESET_CLAIM_FUNCTION_SIGNATURE = "0x700805e3"; // Function signature for 'resetClaim(address)'

// Declare selectedProvider at the top level
let selectedProvider: EIP1193Provider | null = null;
let selectedAccount: string | null = null;
let pendingClaimTxHash: string | null = null;

// Connect to the selected provider using eth_requestAccounts.
const connectWithProvider = async (
  wallet: EIP6963AnnounceProviderEvent["detail"]
) => {
  try {
    const accounts = await wallet.provider.request({ method: "eth_requestAccounts" }) as string[];
    selectedProvider = wallet.provider;
    selectedAccount = accounts[0];
    
    // Show transaction buttons after connection
    const txButtons = document.getElementById('transactionButtons');
    if (txButtons) txButtons.style.display = 'block';
    
    // Display connected account
    const accountDisplay = document.getElementById('accountDisplay');
    if (accountDisplay) {
      accountDisplay.textContent = `Connected: ${selectedAccount}`;
      accountDisplay.style.display = 'block';
    }
    
    // Add click handlers for transaction buttons
    const claimButton = document.getElementById('sendClaimTx');
    if (claimButton) {
      claimButton.onclick = sendClaimTransaction;
    }
    
    const duplicateButton = document.getElementById('sendDuplicateClaimTx');
    if (duplicateButton) {
      duplicateButton.onclick = sendDuplicateClaimTransaction;
    }
    
    const resetButton = document.getElementById('resetClaimStatus');
    if (resetButton) {
      resetButton.onclick = resetClaimStatus;
    }
  } catch (error) {
    console.error("Failed to connect to provider:", error)
    const statusDiv = document.getElementById('status');
    if (statusDiv) statusDiv.innerHTML = `Failed to connect: ${error}`;
  }
}

async function sendClaimTransaction() {
  if (!selectedProvider || !selectedAccount) {
    console.error('No provider or account selected');
    return;
  }

  const statusDiv = document.getElementById('status');
  if (statusDiv) statusDiv.innerHTML = '🔄 Sending claim transaction...';

  try {
    // Prepare claim transaction - simplified like the console test
    const txParams = {
      from: selectedAccount,
      to: CONTRACT_ADDRESS,
      data: CLAIM_FUNCTION_SIGNATURE,
      gas: '0x6000', // Increased to 24,576
    };

    // Send claim transaction
    pendingClaimTxHash = await selectedProvider.request({
      method: 'eth_sendTransaction',
      params: [txParams]
    }) as string;

    if (statusDiv) {
      statusDiv.innerHTML = `<br>📤 Claim transaction sent: ${pendingClaimTxHash}`;
      statusDiv.innerHTML += `<br>⏳ Status: Pending`;
      console.log(`Claim transaction sent: ${pendingClaimTxHash}`);
    }
    
    // Enable duplicate button once we have a pending transaction
    const duplicateButton = document.getElementById('sendDuplicateClaimTx') as HTMLButtonElement;
    if (duplicateButton) {
      duplicateButton.disabled = false;
      duplicateButton.classList.add('active');
    }

    // Monitor transaction status
    monitorTransaction(pendingClaimTxHash);

  } catch (error: unknown) {
    console.error('Transaction error:', error);
    if (statusDiv) {
      if (error instanceof Error) {
        statusDiv.innerHTML += `<br>❌ Error: ${error.message}`;
      } else {
        statusDiv.innerHTML += `<br>❌ Error: ${String(error)}`;
      }
    }
  }
}

async function sendDuplicateClaimTransaction() {
  if (!selectedProvider || !selectedAccount || !pendingClaimTxHash) {
    console.error('Cannot send duplicate - missing provider, account, or pending transaction');
    return;
  }

  const statusDiv = document.getElementById('status');
  if (statusDiv) statusDiv.innerHTML += '<br>🔄 Sending duplicate claim transaction...';

  try {
    // Prepare identical claim transaction - match the same format as sendClaimTransaction
    const txParams = {
      from: selectedAccount,
      to: CONTRACT_ADDRESS,
      data: CLAIM_FUNCTION_SIGNATURE,
      gas: '0x6000', // Increased to 24,576
    };

    // Log for debugging
    console.log('Attempting duplicate transaction while first is pending', {
      pendingTx: pendingClaimTxHash,
      featureFlag: 'extensionReturnTxHashAsap = true',
    });

    // Send duplicate claim transaction
    const duplicateTxHash = await selectedProvider.request({
      method: 'eth_sendTransaction',
      params: [txParams]
    }) as string;

    if (statusDiv) {
      statusDiv.innerHTML += `<br>📤 Duplicate claim transaction sent: ${duplicateTxHash}`;
      statusDiv.innerHTML += `<br>⏳ Status: Pending`;
      statusDiv.innerHTML += `<br>🚨 <strong>Issue detected:</strong> Duplicate transaction was accepted by MetaMask`;
      console.log(`Duplicate transaction sent: ${duplicateTxHash}`);
    }

    // Monitor the duplicate transaction
    monitorTransaction(duplicateTxHash);

  } catch (error: unknown) {
    console.error('Duplicate transaction error:', error);
    if (statusDiv) {
      if (error instanceof Error) {
        statusDiv.innerHTML += `<br>❌ Duplicate error: ${error.message}`;
        
        // If the error contains specific words that indicate proper rejection
        if (error.message.includes('NoClaimAvailable') || 
            error.message.includes('already claimed') || 
            error.message.includes('rejected') ||
            error.message.includes('reverted')) {
          statusDiv.innerHTML += `<br>✅ <strong>Correct behavior:</strong> MetaMask properly rejected the duplicate transaction`;
        }
      } else {
        statusDiv.innerHTML += `<br>❌ Duplicate error: ${String(error)}`;
      }
    }
  }
}

async function resetClaimStatus() {
  if (!selectedProvider || !selectedAccount) {
    console.error('No provider or account selected');
    return;
  }

  const statusDiv = document.getElementById('status');
  if (statusDiv) statusDiv.innerHTML = '🔄 Resetting claim status...';

  try {
    // Use the exact same approach that worked in the console test
    const addressParam = selectedAccount.substring(2).padStart(64, '0');
    const txData = `${RESET_CLAIM_FUNCTION_SIGNATURE}${addressParam}`;
    
    console.log('Reset transaction data:', txData);
    console.log('Selected account:', selectedAccount);

    // Let's use a MASSIVE gas limit to ensure it's not a gas issue
    const txParams = {
      from: selectedAccount,
      to: CONTRACT_ADDRESS,
      data: txData,
      gas: '0x7A120', // 500,000 gas - extreme overkill
    };

    // Send reset transaction
    const resetTxHash = await selectedProvider.request({
      method: 'eth_sendTransaction',
      params: [txParams]
    }) as string;

    if (statusDiv) {
      statusDiv.innerHTML = `📤 Claim status reset transaction sent: ${resetTxHash}`;
      statusDiv.innerHTML += `<br>⏳ Status: Pending`;
      
      // Clear the pending transaction
      pendingClaimTxHash = null;
      
      // Disable duplicate button
      const duplicateButton = document.getElementById('sendDuplicateClaimTx') as HTMLButtonElement;
      if (duplicateButton) {
        duplicateButton.disabled = true;
      }
      
      // Monitor the reset transaction
      monitorTransaction(resetTxHash);
    }

  } catch (error: unknown) {
    console.error('Reset transaction error:', error);
    if (statusDiv) {
      if (error instanceof Error) {
        statusDiv.innerHTML += `<br>❌ Reset error: ${error.message}`;
      } else {
        statusDiv.innerHTML += `<br>❌ Reset error: ${String(error)}`;
      }
    }
  }
}

async function monitorTransaction(txHash: string) {
  const statusDiv = document.getElementById('status');
  let attempts = 0;
  const maxAttempts = 30; // Try for about 5 minutes
  
  const checkReceipt = async () => {
    if (attempts >= maxAttempts) {
      if (statusDiv) statusDiv.innerHTML += `<br>⏱️ Transaction ${txHash.substring(0, 10)}... timed out after ${maxAttempts} checks`;
      return;
    }
    
    attempts++;
    
    try {
      const receipt = await selectedProvider?.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      });
      
      if (receipt) {
        const success = (receipt as any).status === '0x1';
        if (statusDiv) {
          if (success) {
            statusDiv.innerHTML += `<br>✅ Transaction ${txHash.substring(0, 10)}... succeeded`;
          } else {
            statusDiv.innerHTML += `<br>❌ Transaction ${txHash.substring(0, 10)}... failed`;
            
            // Check if this is a duplicate transaction that failed
            if (pendingClaimTxHash && txHash !== pendingClaimTxHash) {
              statusDiv.innerHTML += `<br>ℹ️ <strong>Expected behavior:</strong> The duplicate claim should be rejected by MetaMask before reaching the network`;
              statusDiv.innerHTML += `<br>🐞 <strong>Bug detected:</strong> Transaction was submitted to network despite being a duplicate claim`;
            }
          }
          
          // If this was the pending claim and it succeeded, disable duplicate button
          if (txHash === pendingClaimTxHash && success) {
            pendingClaimTxHash = null;
            const duplicateButton = document.getElementById('sendDuplicateClaimTx') as HTMLButtonElement;
            if (duplicateButton) duplicateButton.disabled = true;
          }
        }
      } else {
        // Still pending, check again after 10 seconds
        setTimeout(checkReceipt, 10000);
      }
    } catch (error) {
      console.error('Error checking receipt:', error);
      if (statusDiv) statusDiv.innerHTML += `<br>⚠️ Error checking ${txHash.substring(0, 10)}...: ${error}`;
      // Try again after a delay
      setTimeout(checkReceipt, 10000);
    }
  };
  
  // Start checking
  setTimeout(checkReceipt, 5000);
}

// Display detected providers as connect buttons.
export function listProviders(element: HTMLDivElement) {
  window.addEventListener(
    "eip6963:announceProvider",
    (event: EIP6963AnnounceProviderEvent) => {
      const button = document.createElement("button")

      button.innerHTML = `
        <img src="${event.detail.info.icon}" alt="${event.detail.info.name}" />
        <div>${event.detail.info.name}</div>
      `

      // Call connectWithProvider when a user selects the button.
      button.onclick = () => connectWithProvider(event.detail)
      element.appendChild(button)
    }
  )

  // Notify event listeners and other parts of the dapp that a provider is requested.
  window.dispatchEvent(new Event("eip6963:requestProvider"))
}
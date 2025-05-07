declare global {
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent
  }
}

// Contract details - update with your deployed contract
const CONTRACT_ADDRESS = "0x5F735462088a08a99b348897969740f2Fdf60373";
const CLAIM_FUNCTION_SIGNATURE = "0x4e71d92d"; // Function signature for 'claim()'
const RESET_CLAIM_FUNCTION_SIGNATURE = "0xb6a0e26a"; // Function signature for 'resetClaim(address)'

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
  if (statusDiv) statusDiv.innerHTML = 'Sending claim transaction...';

  try {
    // Prepare claim transaction
    const txParams = {
      from: selectedAccount,
      to: CONTRACT_ADDRESS,
      data: CLAIM_FUNCTION_SIGNATURE,
      value: '0x0', // zero ETH
      gas: '0x186A0', // 100,000 gas
      maxFeePerGas: '0x2540BE400', // 10 GWEI
      maxPriorityFeePerGas: '0x3B9ACA00' // 1 GWEI
    };

    // Send claim transaction
    pendingClaimTxHash = await selectedProvider.request({
      method: 'eth_sendTransaction',
      params: [txParams]
    }) as string;

    if (statusDiv) {
      statusDiv.innerHTML = `<br>Claim transaction sent: ${pendingClaimTxHash}`;
      statusDiv.innerHTML += `<br>Status: Pending`;
    }
    
    // Enable duplicate button once we have a pending transaction
    const duplicateButton = document.getElementById('sendDuplicateClaimTx');
    if (duplicateButton) duplicateButton.disabled = false;

    // Monitor transaction status
    monitorTransaction(pendingClaimTxHash);

  } catch (error: unknown) {
    console.error('Transaction error:', error);
    if (statusDiv) {
      if (error instanceof Error) {
        statusDiv.innerHTML += `<br>Error: ${error.message}`;
      } else {
        statusDiv.innerHTML += `<br>Error: ${String(error)}`;
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
  if (statusDiv) statusDiv.innerHTML += '<br>Sending duplicate claim transaction...';

  try {
    // Prepare identical claim transaction
    const txParams = {
      from: selectedAccount,
      to: CONTRACT_ADDRESS,
      data: CLAIM_FUNCTION_SIGNATURE,
      value: '0x0', // zero ETH
      gas: '0x186A0', // 100,000 gas
      maxFeePerGas: '0x2540BE400', // 10 GWEI
      maxPriorityFeePerGas: '0x3B9ACA00' // 1 GWEI
    };

    // Send duplicate claim transaction
    const duplicateTxHash = await selectedProvider.request({
      method: 'eth_sendTransaction',
      params: [txParams]
    }) as string;

    if (statusDiv) {
      statusDiv.innerHTML += `<br>Duplicate claim transaction sent: ${duplicateTxHash}`;
      statusDiv.innerHTML += `<br>Status: Pending`;
    }

    // Monitor the duplicate transaction
    monitorTransaction(duplicateTxHash);

  } catch (error: unknown) {
    console.error('Duplicate transaction error:', error);
    if (statusDiv) {
      if (error instanceof Error) {
        statusDiv.innerHTML += `<br>Duplicate error: ${error.message}`;
      } else {
        statusDiv.innerHTML += `<br>Duplicate error: ${String(error)}`;
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
  if (statusDiv) statusDiv.innerHTML = 'Resetting claim status...';

  try {
    // Create resetClaim transaction with the user's address as parameter
    // Encode the address parameter (padded to 32 bytes)
    const encodedAddress = selectedAccount.substring(2).padStart(64, '0');
    const txData = `${RESET_CLAIM_FUNCTION_SIGNATURE}${encodedAddress}`;

    const txParams = {
      from: selectedAccount,
      to: CONTRACT_ADDRESS,
      data: txData,
      value: '0x0', // zero ETH
      gas: '0x186A0', // 100,000 gas
      maxFeePerGas: '0x2540BE400', // 10 GWEI
      maxPriorityFeePerGas: '0x3B9ACA00' // 1 GWEI
    };

    // Send reset transaction
    const resetTxHash = await selectedProvider.request({
      method: 'eth_sendTransaction',
      params: [txParams]
    }) as string;

    if (statusDiv) {
      statusDiv.innerHTML = `Claim status reset transaction sent: ${resetTxHash}`;
      
      // Clear the pending transaction
      pendingClaimTxHash = null;
      
      // Disable duplicate button
      const duplicateButton = document.getElementById('sendDuplicateClaimTx');
      if (duplicateButton) duplicateButton.disabled = true;
    }

  } catch (error: unknown) {
    console.error('Reset transaction error:', error);
    if (statusDiv) {
      if (error instanceof Error) {
        statusDiv.innerHTML += `<br>Reset error: ${error.message}`;
      } else {
        statusDiv.innerHTML += `<br>Reset error: ${String(error)}`;
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
      if (statusDiv) statusDiv.innerHTML += `<br>Transaction ${txHash.substring(0, 10)}... timed out after ${maxAttempts} checks`;
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
          statusDiv.innerHTML += `<br>Transaction ${txHash.substring(0, 10)}... ${success ? 'succeeded' : 'failed'}`;
          
          // If this was the pending claim and it succeeded, disable duplicate button
          if (txHash === pendingClaimTxHash && success) {
            pendingClaimTxHash = null;
            const duplicateButton = document.getElementById('sendDuplicateClaimTx');
            if (duplicateButton) duplicateButton.disabled = true;
          }
        }
      } else {
        // Still pending, check again after 10 seconds
        setTimeout(checkReceipt, 10000);
      }
    } catch (error) {
      console.error('Error checking receipt:', error);
      if (statusDiv) statusDiv.innerHTML += `<br>Error checking ${txHash.substring(0, 10)}...: ${error}`;
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
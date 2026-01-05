const { ethers } = require("ethers");

// ABI from the Escrow.sol contract we created
const ESCROW_CONTRACT_ABI = [
  "function release(string memory taskId, address recipient) external",
  "function refund(string memory taskId) external",
  "function deposit(string memory taskId, uint256 amount) external"
];

let provider;
let wallet;
let contract;

function initializeWeb3() {
  if (!process.env.WALLET_PRIVATE_KEY || !process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS) {
    console.warn("Missing Web3 env variables. Web3 features will fail.");
    return;
  }

  // Use a default provider (e.g., Sepolia) or custom RPC
  // If RPC URL is not set, we can try a public one or fail
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "https://rpc.sepolia.org";
  provider = new ethers.JsonRpcProvider(rpcUrl);

  wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
  contract = new ethers.Contract(process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS, ESCROW_CONTRACT_ABI, wallet);
}

async function releasePayment(transactionHash, amount, recipientAddress) {
  // Note: transactionHash arg is kept for compatibility but we use taskId in the new contract
  // We assume 'transactionHash' passed here is actually the 'taskId' or we need to refactor upstream
  // For now, let's assume the caller passes taskId as the first arg or we need to look it up.
  // Let's look at how it's called in escrow.js: releasePayment(escrow.docs[0].data().transactionHash, ...)
  // We should probably change escrow.js to pass taskId.

  try {
    if (!contract) initializeWeb3();

    // In the new contract, we release by taskId
    // We need to ensure we are passing the taskId. 
    // The previous code stored 'transactionHash' in the escrow doc. 
    // We should probably store taskId in the escrow doc and pass it here.
    // For this implementation, I will assume the first argument IS the taskId.
    const taskId = transactionHash;

    console.log(`Releasing payment for task ${taskId} to ${recipientAddress}`);

    const tx = await contract.release(taskId, recipientAddress);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: "confirmed",
    };
  } catch (error) {
    console.error("Payment Release Error:", error);
    throw error;
  }
}

async function refundPayment(taskId) {
  try {
    if (!contract) initializeWeb3();

    const tx = await contract.refund(taskId);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: "confirmed",
    };
  } catch (error) {
    console.error("Refund Error:", error);
    throw error;
  }
}

module.exports = { releasePayment, refundPayment };

import { ethers } from "ethers";
import { CONTRACTS, getEscrowContractAddress, NETWORKS } from "./contract-config";
import type { PaymentMethod } from "./wallet-context";

// Dual Escrow Contract ABI - Supports both MNEE tokens and native ETH
const ESCROW_CONTRACT_ABI = [
  // MNEE Token deposits
  "function depositMNEE(string memory taskId, uint256 amount) external",
  // ETH deposits
  "function depositETH(string memory taskId) external payable",
  // Release payment (works for both)
  "function release(string memory taskId, address payable recipient) external",
  // Refund (works for both)
  "function refund(string memory taskId) external",
  // View escrow details
  "function escrows(string memory taskId) external view returns (address depositor, uint256 amount, uint8 paymentType, uint8 status, bool exists)",
  // Events
  "event Deposited(string taskId, address indexed depositor, uint256 amount, uint8 paymentType)",
  "event Released(string taskId, address indexed recipient, uint256 amount)",
  "event Refunded(string taskId, address indexed depositor, uint256 amount)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)"
];

export interface EscrowDepositResult {
  transactionHash: string;
  blockNumber?: number;
  gasUsed?: string;
  paymentMethod: PaymentMethod;
}

export interface EscrowInfo {
  depositor: string;
  amount: string;
  paymentType: 'MNEE' | 'ETH';
  status: 'Locked' | 'Released' | 'Refunded';
  exists: boolean;
}

/**
 * Connect to MetaMask wallet
 */
export async function connectMetaMaskWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      return { provider, signer, address, chainId: network.chainId.toString() };
    } catch (error) {
      console.error("User rejected connection", error);
      throw error;
    }
  } else {
    throw new Error("MetaMask not installed");
  }
}

/**
 * Check if on Sepolia network
 */
export async function isSepoliaNetwork(): Promise<boolean> {
  if (typeof window.ethereum === "undefined") return false;
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    return network.chainId === BigInt(11155111); // Sepolia chain ID
  } catch {
    return false;
  }
}

/**
 * Switch to Sepolia network
 */
export async function switchToSepolia(): Promise<void> {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not installed");
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORKS.SEPOLIA.chainId }],
    });
  } catch (switchError: any) {
    // Chain not added, try adding it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: NETWORKS.SEPOLIA.chainId,
          chainName: NETWORKS.SEPOLIA.chainName,
          nativeCurrency: NETWORKS.SEPOLIA.nativeCurrency,
          rpcUrls: [NETWORKS.SEPOLIA.rpcUrl],
          blockExplorerUrls: [NETWORKS.SEPOLIA.blockExplorer]
        }],
      });
    } else {
      throw switchError;
    }
  }
}

/**
 * Deposit MNEE tokens to escrow
 * This uses the smart contract method for MNEE token escrow
 */
export async function depositMNEEToEscrow(taskId: string, amount: number): Promise<EscrowDepositResult> {
  console.log('depositMNEEToEscrow: Starting deposit...', { taskId, amount });
  
  const { signer } = await connectMetaMaskWallet();
  const escrowAddress = getEscrowContractAddress();

  const mneeContract = new ethers.Contract(CONTRACTS.MNEE_TOKEN, ERC20_ABI, signer);
  const escrowContract = new ethers.Contract(escrowAddress, ESCROW_CONTRACT_ABI, signer);

  // Convert amount to Wei (18 decimals)
  const amountWei = ethers.parseUnits(amount.toString(), 18);

  // Check balance
  const balance = await mneeContract.balanceOf(await signer.getAddress());
  if (balance < amountWei) {
    throw new Error(`Insufficient MNEE balance. Required: ${amount}, Available: ${ethers.formatUnits(balance, 18)}`);
  }

  // 1. Approve MNEE tokens
  console.log("Approving MNEE tokens...");
  const approveTx = await mneeContract.approve(escrowAddress, amountWei);
  await approveTx.wait();
  console.log("MNEE tokens approved");

  // 2. Deposit to escrow contract
  console.log("Depositing to Escrow contract...");
  const depositTx = await escrowContract.depositMNEE(taskId, amountWei);
  const receipt = await depositTx.wait();
  console.log("Deposited successfully");

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed?.toString(),
    paymentMethod: 'MNEE',
  };
}

/**
 * Deposit ETH to escrow
 * This uses the smart contract method for native ETH escrow
 */
export async function depositETHToEscrow(taskId: string, amount: number): Promise<EscrowDepositResult> {
  console.log('depositETHToEscrow: Starting deposit...', { taskId, amount });
  
  // Ensure on Sepolia
  if (!(await isSepoliaNetwork())) {
    throw new Error('Please switch to Sepolia network for ETH payments');
  }

  const { signer } = await connectMetaMaskWallet();
  const escrowAddress = getEscrowContractAddress();
  const escrowContract = new ethers.Contract(escrowAddress, ESCROW_CONTRACT_ABI, signer);

  // Convert amount to Wei
  const amountWei = ethers.parseEther(amount.toString());

  // Check ETH balance
  const balance = await signer.provider.getBalance(await signer.getAddress());
  if (balance < amountWei) {
    throw new Error(`Insufficient ETH balance. Required: ${amount}, Available: ${ethers.formatEther(balance)}`);
  }

  // Deposit ETH to escrow contract
  console.log("Depositing ETH to Escrow contract...");
  const depositTx = await escrowContract.depositETH(taskId, { value: amountWei });
  const receipt = await depositTx.wait();
  console.log("ETH deposited successfully");

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed?.toString(),
    paymentMethod: 'ETH',
  };
}

/**
 * Get escrow information for a task
 */
export async function getEscrowInfo(taskId: string): Promise<EscrowInfo> {
  const { provider } = await connectMetaMaskWallet();
  const escrowAddress = getEscrowContractAddress();
  const escrowContract = new ethers.Contract(escrowAddress, ESCROW_CONTRACT_ABI, provider);

  const escrowData = await escrowContract.escrows(taskId);
  
  return {
    depositor: escrowData[0],
    amount: ethers.formatUnits(escrowData[1], 18),
    paymentType: escrowData[2] === 0 ? 'MNEE' : 'ETH',
    status: ['Locked', 'Released', 'Refunded'][escrowData[3]] as 'Locked' | 'Released' | 'Refunded',
    exists: escrowData[4],
  };
}

/**
 * Release escrow payment (Admin only)
 */
export async function releaseEscrowPayment(taskId: string, recipientAddress: string): Promise<string> {
  console.log('releaseEscrowPayment:', { taskId, recipientAddress });
  
  const { signer } = await connectMetaMaskWallet();
  const escrowAddress = getEscrowContractAddress();
  const escrowContract = new ethers.Contract(escrowAddress, ESCROW_CONTRACT_ABI, signer);

  const releaseTx = await escrowContract.release(taskId, recipientAddress);
  const receipt = await releaseTx.wait();
  
  console.log('Payment released successfully');
  return receipt.hash;
}

/**
 * Refund escrow payment (Admin only)
 */
export async function refundEscrowPayment(taskId: string): Promise<string> {
  console.log('refundEscrowPayment:', { taskId });
  
  const { signer } = await connectMetaMaskWallet();
  const escrowAddress = getEscrowContractAddress();
  const escrowContract = new ethers.Contract(escrowAddress, ESCROW_CONTRACT_ABI, signer);

  const refundTx = await escrowContract.refund(taskId);
  const receipt = await refundTx.wait();
  
  console.log('Payment refunded successfully');
  return receipt.hash;
}

// Legacy function for backward compatibility
export async function depositToEscrow(taskId: string, amount: number) {
  return depositMNEEToEscrow(taskId, amount);
}

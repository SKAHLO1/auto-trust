import { ethers } from "ethers";

const ESCROW_CONTRACT_ABI = [
    "function deposit(string memory taskId, uint256 amount) external",
    "function escrows(string memory taskId) external view returns (address depositor, uint256 amount, uint8 status, bool exists)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)"
];

// MNEE Token Address (Testnet/Mainnet as per user request)
// User provided: 0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF
const MNEE_TOKEN_ADDRESS = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF";

export async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            return { provider, signer, address: await signer.getAddress() };
        } catch (error) {
            console.error("User rejected connection", error);
            throw error;
        }
    } else {
        throw new Error("MetaMask not found");
    }
}

export async function depositToEscrow(taskId: string, amount: number) {
    const { signer } = await connectWallet();
    const escrowAddress = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;

    if (!escrowAddress) {
        throw new Error("Escrow contract address not configured");
    }

    const mneeContract = new ethers.Contract(MNEE_TOKEN_ADDRESS, ERC20_ABI, signer);
    const escrowContract = new ethers.Contract(escrowAddress, ESCROW_CONTRACT_ABI, signer);

    // Convert amount to Wei (assuming 18 decimals for MNEE)
    const amountWei = ethers.parseUnits(amount.toString(), 18);

    // 1. Approve
    console.log("Approving MNEE...");
    const approveTx = await mneeContract.approve(escrowAddress, amountWei);
    await approveTx.wait();
    console.log("Approved");

    // 2. Deposit
    console.log("Depositing to Escrow...");
    const depositTx = await escrowContract.deposit(taskId, amountWei);
    const receipt = await depositTx.wait();
    console.log("Deposited");

    return receipt.hash;
}

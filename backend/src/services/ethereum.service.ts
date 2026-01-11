import { ethers } from 'ethers';

// Smart contract ABI - only the functions we need
const ESCROW_ABI = [
  // Release function
  'function release(string taskId, address recipient) external',
  // Refund function
  'function refund(string taskId) external',
  // Get escrow details
  'function getEscrow(string taskId) external view returns (address depositor, uint256 amount, uint8 paymentType, uint8 status, bool exists)',
  // Events
  'event Released(string indexed taskId, address indexed recipient, uint256 amount, uint8 paymentType)',
  'event Refunded(string indexed taskId, address indexed depositor, uint256 amount, uint8 paymentType)',
];

export interface EthereumTransactionResult {
  success: boolean;
  txHash?: string;
  txId?: string;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}

class EthereumService {
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private escrowContract: ethers.Contract | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Ethereum provider and wallet
   */
  private initialize(): void {
    try {
      console.log('🔧 Initializing Ethereum Service...');
      
      const rpcUrl = process.env.ETH_RPC_URL;
      const privateKey = process.env.ETH_ADMIN_PRIVATE_KEY;
      const contractAddress = process.env.ESCROW_CONTRACT_ADDRESS;

      console.log('Environment variables check:');
      console.log('  ETH_RPC_URL:', rpcUrl ? '✅ Set' : '❌ Missing');
      console.log('  ETH_ADMIN_PRIVATE_KEY:', privateKey ? '✅ Set' : '❌ Missing');
      console.log('  ESCROW_CONTRACT_ADDRESS:', contractAddress ? '✅ Set' : '❌ Missing');

      if (!rpcUrl) {
        console.error('❌ ETH_RPC_URL not set - Ethereum functionality disabled');
        return;
      }

      if (!privateKey) {
        console.error('❌ ETH_ADMIN_PRIVATE_KEY not set - Ethereum functionality disabled');
        return;
      }

      if (!contractAddress) {
        console.error('❌ ESCROW_CONTRACT_ADDRESS not set - Ethereum functionality disabled');
        return;
      }

      // Initialize provider
      console.log('📡 Connecting to RPC:', rpcUrl);
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      console.log('✅ Ethereum provider initialized:', rpcUrl.includes('sepolia') ? 'Sepolia Testnet' : rpcUrl);

      // Initialize wallet
      console.log('🔑 Loading wallet with private key...');
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      console.log('✅ Ethereum wallet initialized:', this.wallet.address);

      // Initialize contract
      console.log('📄 Connecting to escrow contract:', contractAddress);
      this.escrowContract = new ethers.Contract(
        contractAddress,
        ESCROW_ABI,
        this.wallet
      );
      console.log('✅ Escrow contract initialized:', contractAddress);
      
      // Test contract connectivity
      this.testContractConnection();
      
      console.log('🎉 Ethereum Service ready!');
    } catch (error: any) {
      console.error('❌ Failed to initialize Ethereum service:', error.message);
      console.error('Full error:', error);
    }
  }

  /**
   * Test contract connectivity and deployment
   */
  private async testContractConnection(): Promise<void> {
    try {
      if (!this.provider) return;
      
      console.log('🧪 Testing contract connectivity...');
      
      // Test 1: Check if contract exists (has code)
      const code = await this.provider.getCode(this.escrowContract!.target as string);
      if (code === '0x') {
        console.error('❌ Contract not deployed at address:', this.escrowContract!.target);
        return;
      }
      console.log('✅ Contract deployed and accessible');
      
      // Test 2: Check wallet balance
      const balance = await this.provider.getBalance(this.wallet!.address);
      const balanceEth = ethers.formatEther(balance);
      console.log('💰 Wallet balance:', balanceEth, 'ETH');
      
      if (balance === 0n) {
        console.warn('⚠️  Wallet has 0 ETH - you need ETH for gas fees!');
        console.warn('   Get testnet ETH from: https://sepoliafaucet.com/');
      }
    } catch (error: any) {
      console.error('❌ Contract connection test failed:', error.message);
    }
  }

  /**
   * Check if service is ready to use
   */
  isReady(): boolean {
    return !!(this.provider && this.wallet && this.escrowContract);
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string | null {
    return this.wallet?.address || null;
  }

  /**
   * Check if escrow exists in smart contract
   * @param taskId Unique task identifier
   */
  async escrowExistsInContract(taskId: string): Promise<boolean> {
    try {
      if (!this.isReady()) {
        return false;
      }

      const escrow = await this.escrowContract!.getEscrow(taskId);
      return escrow[4]; // exists field
    } catch (error) {
      console.error('Error checking escrow existence:', error);
      return false;
    }
  }

  /**
   * Release payment from escrow via smart contract
   * @param taskId Unique task identifier
   * @param recipientAddress Developer's wallet address
   */
  async releaseEscrowPayment(
    taskId: string,
    recipientAddress: string
  ): Promise<EthereumTransactionResult> {
    try {
      if (!this.isReady()) {
        throw new Error('Ethereum service not initialized. Check environment variables.');
      }

      console.log(`Releasing ETH escrow for task ${taskId} to ${recipientAddress}`);

      // Validate recipient address
      if (!ethers.isAddress(recipientAddress)) {
        throw new Error(`Invalid Ethereum address: ${recipientAddress}`);
      }

      // Check if escrow exists in contract
      const exists = await this.escrowExistsInContract(taskId);
      if (!exists) {
        console.warn(`Escrow ${taskId} not found in smart contract. May have been deposited via legacy method.`);
        throw new Error('ESCROW_NOT_IN_CONTRACT');
      }

      // Call smart contract release function
      const tx = await this.escrowContract!.release(taskId, recipientAddress);
      console.log('Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);

      return {
        success: true,
        txHash: receipt.hash,
        txId: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error: any) {
      console.error('Error releasing ETH escrow:', error);
      
      // Parse error message
      let errorMessage = error.message || 'Unknown error';
      
      // Check for common errors
      if (error.message === 'ESCROW_NOT_IN_CONTRACT') {
        errorMessage = 'Escrow not found in smart contract. ETH must be deposited via smart contract to be released automatically.';
      } else if (error.code === 'CALL_EXCEPTION') {
        errorMessage = 'Smart contract call failed. Check if escrow exists and is locked.';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient ETH for gas fees';
      } else if (error.code === 'NONCE_EXPIRED') {
        errorMessage = 'Transaction nonce error. Please try again.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Refund payment from escrow via smart contract
   * @param taskId Unique task identifier
   */
  async refundEscrowPayment(taskId: string): Promise<EthereumTransactionResult> {
    try {
      if (!this.isReady()) {
        throw new Error('Ethereum service not initialized. Check environment variables.');
      }

      console.log(`Refunding ETH escrow for task ${taskId}`);

      // Call smart contract refund function
      const tx = await this.escrowContract!.refund(taskId);
      console.log('Refund transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Refund confirmed in block:', receipt.blockNumber);

      return {
        success: true,
        txHash: receipt.hash,
        txId: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error: any) {
      console.error('Error refunding ETH escrow:', error);
      
      return {
        success: false,
        error: error.message || 'Refund failed',
      };
    }
  }

  /**
   * Get escrow details from smart contract
   * @param taskId Unique task identifier
   */
  async getEscrowDetails(taskId: string): Promise<{
    depositor: string;
    amount: string;
    paymentType: number;
    status: number;
    exists: boolean;
  } | null> {
    try {
      if (!this.isReady()) {
        throw new Error('Ethereum service not initialized');
      }

      const escrow = await this.escrowContract!.getEscrow(taskId);
      
      return {
        depositor: escrow[0],
        amount: ethers.formatEther(escrow[1]),
        paymentType: escrow[2], // 0 = MNEE, 1 = ETH
        status: escrow[3], // 0 = Locked, 1 = Released, 2 = Refunded
        exists: escrow[4],
      };
    } catch (error: any) {
      console.error('Error getting escrow details:', error);
      return null;
    }
  }

  /**
   * Get wallet ETH balance
   */
  async getBalance(): Promise<string> {
    try {
      if (!this.wallet || !this.provider) {
        return '0';
      }

      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error: any) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  /**
   * Estimate gas for release transaction
   */
  async estimateReleaseGas(taskId: string, recipientAddress: string): Promise<bigint | null> {
    try {
      if (!this.isReady()) {
        return null;
      }

      const gasEstimate = await this.escrowContract!.release.estimateGas(taskId, recipientAddress);
      return gasEstimate;
    } catch (error: any) {
      console.error('Error estimating gas:', error);
      return null;
    }
  }
}

// Export singleton instance
const ethereumService = new EthereumService();
export default ethereumService;

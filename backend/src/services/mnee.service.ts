import Mnee, { MNEEBalance, MNEEUtxo, TransferResponse, TransferStatus } from '@mnee/ts-sdk';
import { MNEETransferParams, MNEETransferResult, MNEEWallet } from '../types';

class MNEEService {
  private mnee: Mnee;
  private hdWallet: ReturnType<Mnee['HDWallet']> | null = null;

  constructor() {
    const environment = (process.env.MNEE_ENVIRONMENT || 'production') as 'production' | 'sandbox';
    const apiKey = process.env.MNEE_API_KEY;

    this.mnee = new Mnee({
      environment,
      apiKey,
    });

    console.log(`MNEE Service initialized in ${environment} mode`);
  }

  /**
   * Initialize HD Wallet from mnemonic
   */
  initializeWallet(mnemonic: string): void {
    try {
      this.hdWallet = this.mnee.HDWallet(mnemonic, {
        derivationPath: "m/44'/236'/0'",
        cacheSize: 1000,
      });
      console.log('HD Wallet initialized successfully');
    } catch (error) {
      console.error('Failed to initialize HD Wallet:', error);
      throw error;
    }
  }

  /**
   * Generate a new mnemonic phrase
   */
  generateMnemonic(): string {
    return Mnee.HDWallet.generateMnemonic();
  }

  /**
   * Derive a new address from HD wallet
   */
  deriveAddress(index: number, isChange: boolean = false): MNEEWallet {
    if (!this.hdWallet) {
      throw new Error('HD Wallet not initialized');
    }

    const addressInfo = this.hdWallet.deriveAddress(index, isChange);
    return {
      address: addressInfo.address,
      privateKey: addressInfo.privateKey,
    };
  }

  /**
   * Derive multiple addresses
   */
  async deriveAddresses(startIndex: number, count: number, isChange: boolean = false): Promise<MNEEWallet[]> {
    if (!this.hdWallet) {
      throw new Error('HD Wallet not initialized');
    }

    const addresses = await this.hdWallet.deriveAddresses(startIndex, count, isChange);
    return addresses.map((addr: any) => ({
      address: addr.address,
      privateKey: addr.privateKey,
    }));
  }

  /**
   * Get balance for a single address
   */
  async getBalance(address: string): Promise<MNEEBalance> {
    try {
      return await this.mnee.balance(address);
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }

  /**
   * Get balances for multiple addresses
   */
  async getBalances(addresses: string[]): Promise<MNEEBalance[]> {
    try {
      return await this.mnee.balances(addresses);
    } catch (error) {
      console.error('Error fetching balances:', error);
      throw error;
    }
  }

  /**
   * Get UTXOs for an address
   */
  async getUtxos(address: string, page: number = 0, size: number = 10): Promise<MNEEUtxo[]> {
    try {
      return await this.mnee.getUtxos(address, page, size);
    } catch (error) {
      console.error('Error fetching UTXOs:', error);
      throw error;
    }
  }

  /**
   * Get enough UTXOs for a specific amount
   */
  async getEnoughUtxos(address: string, amountInMNEE: number): Promise<MNEEUtxo[]> {
    try {
      const requiredAmount = this.mnee.toAtomicAmount(amountInMNEE);
      return await this.mnee.getEnoughUtxos(address, requiredAmount);
    } catch (error) {
      console.error('Error fetching enough UTXOs:', error);
      throw error;
    }
  }

  /**
   * Get all UTXOs for an address
   */
  async getAllUtxos(address: string): Promise<MNEEUtxo[]> {
    try {
      return await this.mnee.getAllUtxos(address);
    } catch (error) {
      console.error('Error fetching all UTXOs:', error);
      throw error;
    }
  }

  /**
   * Transfer MNEE tokens
   */
  async transfer(params: MNEETransferParams): Promise<MNEETransferResult> {
    try {
      const response: TransferResponse = await this.mnee.transfer(
        params.recipients,
        params.senderPrivateKey,
        {
          broadcast: params.broadcast ?? true,
          callbackUrl: params.callbackUrl,
        }
      );

      return {
        ticketId: response.ticketId,
        rawtx: response.rawtx,
      };
    } catch (error) {
      console.error('Error transferring MNEE:', error);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(ticketId: string): Promise<TransferStatus> {
    try {
      return await this.mnee.getTxStatus(ticketId);
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      throw error;
    }
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(address: string, fromScore?: number, limit: number = 50) {
    try {
      return await this.mnee.recentTxHistory(address, fromScore, limit);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  /**
   * Parse a transaction by txid
   */
  async parseTransaction(txid: string, includeRaw: boolean = false) {
    try {
      return await this.mnee.parseTx(txid, { includeRaw });
    } catch (error) {
      console.error('Error parsing transaction:', error);
      throw error;
    }
  }

  /**
   * Validate a MNEE transaction
   */
  async validateTransaction(rawTxHex: string, recipients?: Array<{ address: string; amount: number }>): Promise<boolean> {
    try {
      return await this.mnee.validateMneeTx(rawTxHex, recipients);
    } catch (error) {
      console.error('Error validating transaction:', error);
      throw error;
    }
  }

  /**
   * Submit a raw transaction
   */
  async submitRawTransaction(rawTxHex: string, callbackUrl?: string): Promise<MNEETransferResult> {
    try {
      const response = await this.mnee.submitRawTx(rawTxHex, {
        broadcast: true,
        callbackUrl,
      });

      return {
        ticketId: response.ticketId,
        rawtx: response.rawtx,
      };
    } catch (error) {
      console.error('Error submitting raw transaction:', error);
      throw error;
    }
  }

  /**
   * Convert MNEE to atomic units
   */
  toAtomicAmount(mneeAmount: number): number {
    return this.mnee.toAtomicAmount(mneeAmount);
  }

  /**
   * Convert atomic units to MNEE
   */
  fromAtomicAmount(atomicAmount: number): number {
    return this.mnee.fromAtomicAmount(atomicAmount);
  }

  /**
   * Get MNEE service configuration
   */
  async getConfig() {
    try {
      return await this.mnee.config();
    } catch (error) {
      console.error('Error fetching MNEE config:', error);
      throw error;
    }
  }

  /**
   * Create an escrow deposit transaction
   */
  async createEscrowDeposit(
    senderPrivateKey: string,
    amount: number,
    escrowAddress: string,
    callbackUrl?: string
  ): Promise<MNEETransferResult> {
    try {
      const recipients = [{ address: escrowAddress, amount }];
      
      const result = await this.transfer({
        recipients,
        senderPrivateKey,
        broadcast: true,
        callbackUrl,
      });

      // Get transaction status to retrieve tx_id
      if (result.ticketId) {
        const status = await this.getTransactionStatus(result.ticketId);
        result.txId = status.tx_id;
        result.status = status.status;
      }

      return result;
    } catch (error) {
      console.error('Error creating escrow deposit:', error);
      throw error;
    }
  }

  /**
   * Release payment from escrow
   */
  async releaseEscrowPayment(
    escrowPrivateKey: string,
    amount: number,
    recipientAddress: string,
    callbackUrl?: string
  ): Promise<MNEETransferResult> {
    try {
      const recipients = [{ address: recipientAddress, amount }];
      
      const result = await this.transfer({
        recipients,
        senderPrivateKey: escrowPrivateKey,
        broadcast: true,
        callbackUrl,
      });

      // Get transaction status to retrieve tx_id
      if (result.ticketId) {
        const status = await this.getTransactionStatus(result.ticketId);
        result.txId = status.tx_id;
        result.status = status.status;
      }

      return result;
    } catch (error) {
      console.error('Error releasing escrow payment:', error);
      throw error;
    }
  }

  /**
   * Refund payment from escrow back to original sender
   */
  async refundEscrowPayment(
    escrowPrivateKey: string,
    amount: number,
    originalSenderAddress: string,
    callbackUrl?: string
  ): Promise<MNEETransferResult> {
    try {
      const recipients = [{ address: originalSenderAddress, amount }];
      
      const result = await this.transfer({
        recipients,
        senderPrivateKey: escrowPrivateKey,
        broadcast: true,
        callbackUrl,
      });

      // Get transaction status to retrieve tx_id
      if (result.ticketId) {
        const status = await this.getTransactionStatus(result.ticketId);
        result.txId = status.tx_id;
        result.status = status.status;
      }

      return result;
    } catch (error) {
      console.error('Error refunding escrow payment:', error);
      throw error;
    }
  }

  /**
   * Scan addresses with gap limit to discover used addresses
   */
  async scanAddressesWithGapLimit(
    gapLimit: number = 20,
    maxScan: number = 1000
  ): Promise<{ receive: MNEEWallet[]; change: MNEEWallet[] }> {
    if (!this.hdWallet) {
      throw new Error('HD Wallet not initialized');
    }

    const checkAddressUsed = async (address: string): Promise<boolean> => {
      const balance = await this.getBalance(address);
      return balance.amount > 0;
    };

    const discovered = await this.hdWallet.scanAddressesWithGapLimit(
      checkAddressUsed,
      {
        gapLimit,
        scanChange: true,
        maxScan,
      }
    );

    return {
      receive: discovered.receive.map((addr: any) => ({
        address: addr.address,
        privateKey: addr.privateKey,
      })),
      change: discovered.change.map((addr: any) => ({
        address: addr.address,
        privateKey: addr.privateKey,
      })),
    };
  }
}

// Export singleton instance
export const mneeService = new MNEEService();
export default mneeService;

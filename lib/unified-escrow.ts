/**
 * Unified Escrow Service
 * 
 * This service provides a single interface for both MNEE blockchain escrow
 * and Ethereum smart contract escrow, showcasing MNEE capabilities while
 * supporting ETH as an alternative payment method.
 */

import type { PaymentMethod } from './wallet-context'
import { depositMNEEToEscrow, depositETHToEscrow, type EscrowDepositResult } from './web3'

export interface UnifiedEscrowDeposit {
  taskId: string
  amount: number
  paymentMethod: PaymentMethod
  senderAddress?: string
  senderPrivateKey?: string // For MNEE blockchain direct transactions
}

export interface UnifiedEscrowResult {
  success: boolean
  transactionHash?: string
  ticketId?: string // For MNEE blockchain transactions
  paymentMethod: PaymentMethod
  error?: string
}

/**
 * Deposit to escrow using the selected payment method
 * 
 * For MNEE: Can use either smart contract or direct blockchain transfer
 * For ETH: Uses Sepolia smart contract
 */
export async function depositToUnifiedEscrow(
  params: UnifiedEscrowDeposit
): Promise<UnifiedEscrowResult> {
  const { taskId, amount, paymentMethod, senderAddress, senderPrivateKey } = params

  try {
    if (paymentMethod === 'MNEE') {
      // MNEE Payment - Use smart contract for hackathon showcase
      // This demonstrates MNEE token integration with Ethereum-compatible contracts
      console.log('Processing MNEE escrow deposit via smart contract...')
      
      const result: EscrowDepositResult = await depositMNEEToEscrow(taskId, amount)
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        paymentMethod: 'MNEE',
      }
    } else if (paymentMethod === 'ETH') {
      // ETH Payment - Use Sepolia smart contract
      console.log('Processing ETH escrow deposit via smart contract...')
      
      const result: EscrowDepositResult = await depositETHToEscrow(taskId, amount)
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        paymentMethod: 'ETH',
      }
    } else {
      throw new Error(`Unsupported payment method: ${paymentMethod}`)
    }
  } catch (error: any) {
    console.error('Escrow deposit failed:', error)
    return {
      success: false,
      paymentMethod,
      error: error.message || 'Unknown error occurred',
    }
  }
}

/**
 * Get display name for payment method
 */
export function getPaymentMethodDisplay(method: PaymentMethod): string {
  return method === 'MNEE' ? 'MNEE Tokens' : 'Sepolia ETH'
}

/**
 * Get payment method icon
 */
export function getPaymentMethodIcon(method: PaymentMethod): string {
  return method === 'MNEE' ? '⚡' : '💎'
}

/**
 * Validate payment method selection
 */
export function validatePaymentMethod(
  method: PaymentMethod,
  walletType: 'MNEE' | 'METAMASK' | null
): { valid: boolean; message?: string } {
  if (!walletType) {
    return {
      valid: false,
      message: 'Please connect a wallet first',
    }
  }

  if (method === 'MNEE' && walletType !== 'MNEE') {
    return {
      valid: false,
      message: 'MNEE wallet required for MNEE payments. Please connect MNEE wallet.',
    }
  }

  if (method === 'ETH' && walletType !== 'METAMASK') {
    return {
      valid: false,
      message: 'MetaMask required for ETH payments. Please connect MetaMask.',
    }
  }

  return { valid: true }
}

export default {
  depositToUnifiedEscrow,
  getPaymentMethodDisplay,
  getPaymentMethodIcon,
  validatePaymentMethod,
}

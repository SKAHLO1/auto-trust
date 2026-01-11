/**
 * Contract Configuration
 * 
 * After deploying your smart contract to Remix:
 * 1. Copy the deployed contract address
 * 2. Set it as NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS in your .env.local file
 * 3. Or update ESCROW_CONTRACT_ADDRESS below (not recommended for production)
 */

// Contract Addresses
export const CONTRACTS = {
  // MNEE Token Address (provided by user)
  MNEE_TOKEN: '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
  
  // AutoTrust Dual Escrow Contract Address
  // ⚠️ UPDATE THIS AFTER DEPLOYMENT FROM REMIX ⚠️
  // Or set NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS in .env.local
  ESCROW_CONTRACT: process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || '',
} as const

// Network Configuration
export const NETWORKS = {
  SEPOLIA: {
    chainId: '0xaa36a7', // 11155111 in decimal
    chainName: 'Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.org',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'SepoliaETH',
      decimals: 18,
    },
  },
  MNEE: {
    name: 'MNEE Blockchain',
    // MNEE network configuration handled by @mnee/ts-sdk
  },
} as const

// Validate contract configuration
export function validateContractConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = []
  
  if (!CONTRACTS.MNEE_TOKEN) {
    missing.push('MNEE_TOKEN address')
  }
  
  if (!CONTRACTS.ESCROW_CONTRACT) {
    missing.push('ESCROW_CONTRACT address - Please deploy contract and update configuration')
  }
  
  return {
    valid: missing.length === 0,
    missing,
  }
}

// Check if contract is configured
export function isContractConfigured(): boolean {
  return !!CONTRACTS.ESCROW_CONTRACT
}

// Get contract address with validation
export function getEscrowContractAddress(): string {
  if (!CONTRACTS.ESCROW_CONTRACT) {
    throw new Error(
      'Escrow contract address not configured. ' +
      'Please deploy your contract to Remix and set NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS in .env.local'
    )
  }
  return CONTRACTS.ESCROW_CONTRACT
}

export default CONTRACTS

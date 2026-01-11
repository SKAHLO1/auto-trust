"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'

export type WalletType = 'MNEE' | 'METAMASK' | null
export type PaymentMethod = 'MNEE' | 'ETH'

interface WalletContextType {
  walletAddress: string | null
  walletType: WalletType
  isConnected: boolean
  paymentMethod: PaymentMethod
  chainId: string | null
  connectWallet: (type: WalletType) => Promise<void>
  disconnectWallet: () => void
  setPaymentMethod: (method: PaymentMethod) => void
  switchToSepolia: () => Promise<void>
}

const WalletContext = createContext<WalletContextType>({
  walletAddress: null,
  walletType: null,
  isConnected: false,
  paymentMethod: 'MNEE',
  chainId: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  setPaymentMethod: () => {},
  switchToSepolia: async () => {},
})

export const useWallet = () => useContext(WalletContext)

declare global {
  interface Window {
    ethereum?: any
  }
}

const SEPOLIA_CHAIN_ID = '0xaa36a7' // 11155111 in hex

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletType, setWalletType] = useState<WalletType>(null)
  const [paymentMethod, setPaymentMethodState] = useState<PaymentMethod>('MNEE')
  const [chainId, setChainId] = useState<string | null>(null)

  useEffect(() => {
    // Load wallet from localStorage on mount
    const savedWallet = localStorage.getItem('walletAddress')
    const savedType = localStorage.getItem('walletType') as WalletType
    const savedPaymentMethod = localStorage.getItem('paymentMethod') as PaymentMethod
    
    if (savedWallet && savedType) {
      setWalletAddress(savedWallet)
      setWalletType(savedType)
      setPaymentMethodState(savedPaymentMethod || 'MNEE')
      
      // If MetaMask, check chain
      if (savedType === 'METAMASK' && typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.request({ method: 'eth_chainId' }).then((id: string) => {
          setChainId(id)
        })
      }
    }

    // Listen for MetaMask account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (walletType === 'METAMASK') {
          setWalletAddress(accounts[0])
          localStorage.setItem('walletAddress', accounts[0])
        }
      })

      window.ethereum.on('chainChanged', (newChainId: string) => {
        setChainId(newChainId)
        if (newChainId !== SEPOLIA_CHAIN_ID) {
          toast.warning('Please switch to Sepolia network for ETH payments')
        }
      })
    }
  }, [])

  const connectWallet = async (type: WalletType) => {
    try {
      if (type === 'MNEE') {
        // Mock MNEE wallet - keep existing functionality
        const mockAddress = `MNEE_${Math.random().toString(36).substring(2, 15)}`
        setWalletAddress(mockAddress)
        setWalletType('MNEE')
        setPaymentMethodState('MNEE')
        localStorage.setItem('walletAddress', mockAddress)
        localStorage.setItem('walletType', 'MNEE')
        localStorage.setItem('paymentMethod', 'MNEE')
        toast.success('MNEE wallet connected successfully!')
      } else if (type === 'METAMASK') {
        // MetaMask wallet for Sepolia ETH
        if (typeof window === 'undefined' || !window.ethereum) {
          toast.error('MetaMask is not installed. Please install MetaMask to use ETH payments.')
          return
        }

        // Request accounts
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        
        if (accounts.length === 0) {
          toast.error('No accounts found in MetaMask')
          return
        }

        const address = accounts[0]
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
        
        setWalletAddress(address)
        setWalletType('METAMASK')
        setPaymentMethodState('ETH')
        setChainId(currentChainId)
        localStorage.setItem('walletAddress', address)
        localStorage.setItem('walletType', 'METAMASK')
        localStorage.setItem('paymentMethod', 'ETH')

        if (currentChainId !== SEPOLIA_CHAIN_ID) {
          toast.warning('Please switch to Sepolia network', {
            action: {
              label: 'Switch Network',
              onClick: () => switchToSepolia()
            }
          })
        } else {
          toast.success('MetaMask connected successfully!')
        }
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error)
      toast.error(error.message || 'Failed to connect wallet')
    }
  }

  const switchToSepolia = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('MetaMask is not installed')
      return
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      })
      toast.success('Switched to Sepolia network')
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'SepoliaETH',
                decimals: 18
              },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }],
          })
          toast.success('Sepolia network added and switched')
        } catch (addError: any) {
          toast.error('Failed to add Sepolia network')
        }
      } else {
        toast.error('Failed to switch network')
      }
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
    setWalletType(null)
    setChainId(null)
    localStorage.removeItem('walletAddress')
    localStorage.removeItem('walletType')
    localStorage.removeItem('paymentMethod')
    toast.success('Wallet disconnected')
  }

  const setPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethodState(method)
    localStorage.setItem('paymentMethod', method)
    
    // If switching to ETH but not connected to MetaMask
    if (method === 'ETH' && walletType !== 'METAMASK') {
      toast.info('ETH payments require MetaMask. Please connect MetaMask.')
    }
    
    // If switching to MNEE but not connected to MNEE wallet
    if (method === 'MNEE' && walletType !== 'MNEE') {
      toast.info('MNEE payments require MNEE wallet. Please connect MNEE wallet.')
    }
  }

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        walletType,
        isConnected: !!walletAddress,
        paymentMethod,
        chainId,
        connectWallet,
        disconnectWallet,
        setPaymentMethod,
        switchToSepolia,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

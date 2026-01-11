"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'

interface WalletContextType {
  walletAddress: string | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType>({
  walletAddress: null,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
})

export const useWallet = () => useContext(WalletContext)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    // Load wallet from localStorage on mount
    const savedWallet = localStorage.getItem('walletAddress')
    if (savedWallet) {
      setWalletAddress(savedWallet)
    }
  }, [])

  const connectWallet = async () => {
    try {
      // For now, generate a mock MNEE wallet address
      // In production, integrate with actual MNEE wallet SDK
      const mockAddress = `MNEE_${Math.random().toString(36).substring(2, 15)}`
      
      setWalletAddress(mockAddress)
      localStorage.setItem('walletAddress', mockAddress)
      toast.success('Wallet connected successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet')
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
    localStorage.removeItem('walletAddress')
    toast.success('Wallet disconnected')
  }

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected: !!walletAddress,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

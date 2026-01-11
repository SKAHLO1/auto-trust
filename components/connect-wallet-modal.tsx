"use client"

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Wallet, X, Zap } from 'lucide-react'
import { useWallet, type WalletType } from '@/lib/wallet-context'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function ConnectWalletModal() {
  const { isConnected, connectWallet } = useWallet()
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and wallet is not connected
    const userId = localStorage.getItem('userId')
    const hasSeenModal = localStorage.getItem('hasSeenWalletModal')
    
    if (userId && !isConnected && !hasSeenModal) {
      // Show modal after 1 second
      setTimeout(() => {
        setShowModal(true)
      }, 1000)
    }
  }, [isConnected])

  const handleConnect = async (type: WalletType) => {
    setLoading(true)
    try {
      await connectWallet(type)
      localStorage.setItem('hasSeenWalletModal', 'true')
      setShowModal(false)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('hasSeenWalletModal', 'true')
    setShowModal(false)
  }

  if (!showModal || isConnected) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-card border-border p-8 max-w-md w-full relative">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Choose a wallet to receive and send payments securely
          </p>
        </div>

        <div className="space-y-3">
          {/* MNEE Wallet */}
          <button
            onClick={() => handleConnect('MNEE')}
            disabled={loading}
            className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-card/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-base mb-1">MNEE Wallet</h3>
                <p className="text-sm text-muted-foreground">
                  Use MNEE tokens for escrow payments
                </p>
              </div>
              <div className="text-primary group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </button>

          {/* MetaMask Wallet */}
          <button
            onClick={() => handleConnect('METAMASK')}
            disabled={loading}
            className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-card/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none">
                  <path d="M37.5 0L22.5 10.5L25.2 4.2L37.5 0Z" fill="#E17726"/>
                  <path d="M2.5 0L17.3 10.6L15 4.2L2.5 0Z" fill="#E27625"/>
                  <path d="M32.2 28.6L28.1 34.8L36.7 37.1L39 28.7L32.2 28.6Z" fill="#E27625"/>
                  <path d="M1 28.7L3.3 37.1L11.9 34.8L7.8 28.6L1 28.7Z" fill="#E27625"/>
                  <path d="M11.5 17.3L9.5 20.5L18 20.9L17.7 11.8L11.5 17.3Z" fill="#E27625"/>
                  <path d="M28.5 17.3L22.2 11.7L22 20.9L30.5 20.5L28.5 17.3Z" fill="#E27625"/>
                </svg>
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-base mb-1">MetaMask</h3>
                <p className="text-sm text-muted-foreground">
                  Use Sepolia ETH for payments
                </p>
              </div>
              <div className="text-primary group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </button>
          
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full mt-4"
            disabled={loading}
          >
            Skip for now
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          You can connect your wallet anytime from the dashboard
        </p>
      </Card>
    </div>
  )
}

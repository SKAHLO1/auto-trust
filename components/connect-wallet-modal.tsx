"use client"

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Wallet, X } from 'lucide-react'
import { useWallet } from '@/lib/wallet-context'
import { useRouter } from 'next/navigation'

export function ConnectWalletModal() {
  const { isConnected, connectWallet } = useWallet()
  const [showModal, setShowModal] = useState(false)
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

  const handleConnect = async () => {
    await connectWallet()
    localStorage.setItem('hasSeenWalletModal', 'true')
    setShowModal(false)
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
            Connect your MNEE wallet to receive and send payments securely
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleConnect}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
          
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full"
          >
            Skip for now
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          You can connect your wallet anytime from settings
        </p>
      </Card>
    </div>
  )
}

"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { Wallet, ChevronDown, Zap } from 'lucide-react'
import { useWallet, type WalletType } from '@/lib/wallet-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface WalletConnectButtonProps {
  className?: string
  variant?: "default" | "outline" | "ghost"
}

export function WalletConnectButton({ className, variant = "default" }: WalletConnectButtonProps) {
  const { isConnected, walletType, walletAddress, connectWallet, disconnectWallet } = useWallet()
  const [loading, setLoading] = useState(false)

  const handleConnect = async (type: WalletType) => {
    setLoading(true)
    try {
      await connectWallet(type)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">
            {walletType === 'MNEE' ? 'MNEE' : 'MetaMask'}
          </span>
          <span className="hidden md:inline">
            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className={className}
          variant={variant}
          disabled={loading}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {loading ? 'Connecting...' : 'Connect Wallet'}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem 
          onClick={() => handleConnect('MNEE')}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-500 rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium">MNEE Wallet</div>
              <div className="text-xs text-muted-foreground">Token payments</div>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleConnect('METAMASK')}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 bg-orange-500/20 rounded flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                <path d="M37.5 0L22.5 10.5L25.2 4.2L37.5 0Z" fill="#E17726"/>
                <path d="M2.5 0L17.3 10.6L15 4.2L2.5 0Z" fill="#E27625"/>
                <path d="M32.2 28.6L28.1 34.8L36.7 37.1L39 28.7L32.2 28.6Z" fill="#E27625"/>
                <path d="M1 28.7L3.3 37.1L11.9 34.8L7.8 28.6L1 28.7Z" fill="#E27625"/>
                <path d="M11.5 17.3L9.5 20.5L18 20.9L17.7 11.8L11.5 17.3Z" fill="#E27625"/>
                <path d="M28.5 17.3L22.2 11.7L22 20.9L30.5 20.5L28.5 17.3Z" fill="#E27625"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium">MetaMask</div>
              <div className="text-xs text-muted-foreground">Sepolia ETH</div>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { WalletProvider } from "@/lib/wallet-context"
import { AuthProvider } from "@/lib/auth-context"
import { ConnectWalletModal } from "@/components/connect-wallet-modal"
import { Analytics } from "@vercel/analytics/next"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AutoTrust - Programmable Trust for Work",
  description: "Escrow + AI verification + MNEE payments for freelance work and AI services",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <WalletProvider>
            {children}
            <ConnectWalletModal />
            <Toaster />
            <Analytics />
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

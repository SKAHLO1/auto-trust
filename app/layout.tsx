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
  title: "AutoTrust - Decentralized Freelance Escrow Platform",
  description: "Secure blockchain-based escrow platform powered by MNEE. Connect employers and developers with trustless payments.",
  icons: {
    icon: [
      {
        url: "/icon-light.svg",
        media: "(prefers-color-scheme: light)",
        type: "image/svg+xml",
      },
      {
        url: "/icon-dark.svg",
        media: "(prefers-color-scheme: dark)",
        type: "image/svg+xml",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: "AutoTrust - Decentralized Freelance Escrow Platform",
    description: "Secure blockchain-based escrow platform powered by MNEE blockchain",
    type: "website",
  },
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8B5CF6" },
    { media: "(prefers-color-scheme: dark)", color: "#1F2937" },
  ],
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

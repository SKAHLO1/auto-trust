"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Lock, Brain, Zap } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold">
            <span className="text-primary">Auto</span>Trust
          </div>
          <div className="hidden md:flex gap-8 text-sm">
            <a href="#features" className="hover:text-primary transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-primary transition">
              How it Works
            </a>
            <a href="#" className="hover:text-primary transition">
              Docs
            </a>
          </div>
          <Link href="/auth/login">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Sign In</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Gradient background elements */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-balance mb-6">Programmable Trust for Work</h1>
              <p className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
                Escrow + AI verification + MNEE payments. Automatically release funds when work meets your criteria. No
                intermediaries, no delays.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero illustration placeholder */}
            <div className="relative h-96 bg-card rounded-xl border border-border overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20"></div>
              <div className="relative z-10 text-center">
                <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Secure Escrow System</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why AutoTrust</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The platform that brings together escrow, AI, and programmable money
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "Secure Escrow",
                description: "Funds locked in smart contracts until work completion conditions are met",
              },
              {
                icon: Brain,
                title: "AI Verification",
                description: "Intelligent verification of code, content, and deliverables in seconds",
              },
              {
                icon: Zap,
                title: "Instant Payments",
                description: "MNEE stablecoin payments released automatically when approved",
              },
            ].map((feature, i) => (
              <Card key={i} className="bg-background border-border p-8 hover:border-primary/50 transition">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>

          <div className="space-y-8">
            {[
              { step: 1, title: "Create Task", desc: "Define deliverables, milestones, and payment in MNEE" },
              { step: 2, title: "Deposit Funds", desc: "Lock MNEE in smart contract escrow" },
              { step: 3, title: "Submit Work", desc: "Worker submits deliverables (code, content, data)" },
              { step: 4, title: "AI Verifies", desc: "AI agent checks work against criteria" },
              { step: 5, title: "Payment Releases", desc: "Smart contract automatically releases MNEE" },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to experience programmable trust?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Start creating tasks and using AI-verified escrow in minutes
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

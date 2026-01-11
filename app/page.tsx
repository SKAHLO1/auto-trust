"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Lock, Brain, Zap, Shield, Sparkles, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground">
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">Auto</span>
              <span className="text-white">Trust</span>
            </span>
          </div>
          <div className="hidden md:flex gap-8 text-sm">
            <a href="#features" className="text-slate-300 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-slate-300 hover:text-primary transition-colors">
              How it Works
            </a>
            <a href="#" className="text-slate-300 hover:text-primary transition-colors">
              Docs
            </a>
          </div>
          <Link href="/auth/login">
            <Button className="bg-gradient-to-r from-primary to-purple-500 text-white hover:shadow-lg hover:shadow-primary/50 transition-all">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">AI-Powered Escrow Platform</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Programmable
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Trust for Work
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
                Revolutionary escrow platform combining <span className="text-primary font-semibold">AI verification</span> and <span className="text-purple-400 font-semibold">MNEE payments</span>. Release funds automatically when work meets your criteria—zero intermediaries, zero delays.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-purple-500 text-white hover:shadow-xl hover:shadow-primary/50 hover:scale-105 transition-all w-full sm:w-auto group">
                    Get Started Free 
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="border-slate-700 bg-slate-900/50 text-white hover:bg-slate-800 hover:border-primary/50 backdrop-blur-sm w-full sm:w-auto transition-all">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-slate-400">Blockchain Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-slate-400">AI Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-slate-400">Instant Payments</span>
                </div>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="relative">
              <div className="relative h-[500px] bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10"></div>
                
                {/* Floating elements */}
                <div className="absolute top-12 left-12 w-24 h-24 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce" style={{animationDuration: '3s'}}>
                  <Lock className="w-12 h-12 text-white" />
                </div>
                
                <div className="absolute top-32 right-16 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce" style={{animationDuration: '2.5s', animationDelay: '0.5s'}}>
                  <Brain className="w-10 h-10 text-white" />
                </div>
                
                <div className="absolute bottom-24 left-20 w-20 h-20 bg-gradient-to-br from-purple-500 to-primary rounded-2xl flex items-center justify-center shadow-lg animate-bounce" style={{animationDuration: '2.8s', animationDelay: '1s'}}>
                  <Zap className="w-10 h-10 text-white" />
                </div>

                {/* Center glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="space-y-4">
                    <div className="text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Secure Escrow
                    </div>
                    <div className="text-slate-400 text-lg">Built for the Future of Work</div>
                  </div>
                </div>
              </div>
              
              {/* Decorative rings */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/20 rounded-full"></div>
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-purple-500/10 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400 font-medium">Why Choose AutoTrust</span>
            </div>
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              The Complete Solution
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Everything you need for secure, automated work transactions in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "Secure Escrow",
                description: "Funds locked in smart contracts until work completion conditions are met",
                gradient: "from-primary to-purple-500",
              },
              {
                icon: Brain,
                title: "AI Verification",
                description: "Intelligent verification of code, content, and deliverables in seconds",
                gradient: "from-blue-500 to-purple-500",
              },
              {
                icon: Zap,
                title: "Instant Payments",
                description: "MNEE stablecoin payments released automatically when approved",
                gradient: "from-purple-500 to-primary",
              },
            ].map((feature, i) => (
              <Card 
                key={i} 
                className="relative group bg-slate-900/50 border-slate-800 p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 backdrop-blur-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className={`w-14 h-14 mb-6 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">Simple Process</span>
            </div>
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-slate-400 text-lg">
              From task creation to payment—fully automated
            </p>
          </div>

          <div className="space-y-6">
            {[
              { step: 1, title: "Create Task", desc: "Define deliverables, milestones, and payment in MNEE", icon: "📝" },
              { step: 2, title: "Deposit Funds", desc: "Lock MNEE in smart contract escrow", icon: "🔒" },
              { step: 3, title: "Submit Work", desc: "Worker submits deliverables (code, content, data)", icon: "📤" },
              { step: 4, title: "AI Verifies", desc: "AI agent checks work against criteria", icon: "🤖" },
              { step: 5, title: "Payment Releases", desc: "Smart contract automatically releases MNEE", icon: "⚡" },
            ].map((item, index) => (
              <div key={item.step} className="relative group">
                <div className="flex gap-6 items-start bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-primary/50 transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/20">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center font-bold text-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-semibold text-primary">STEP {item.step}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                </div>
                {index < 4 && (
                  <div className="h-6 w-0.5 bg-gradient-to-b from-primary/50 to-transparent ml-7 my-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700 rounded-3xl p-12 backdrop-blur-xl shadow-2xl">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Ready to Experience Programmable Trust?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Join the future of work with AI-verified escrow. Start creating tasks and automating payments in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-500 text-white hover:shadow-xl hover:shadow-primary/50 hover:scale-105 transition-all group">
                  Get Started Free 
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700 hover:border-primary/50 backdrop-blur-sm">
                  Learn More
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-slate-700">
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-2">$1M+</div>
                <div className="text-sm text-slate-400">Escrowed</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">500+</div>
                <div className="text-sm text-slate-400">Tasks Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-primary bg-clip-text text-transparent mb-2">99.9%</div>
                <div className="text-sm text-slate-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2026 AutoTrust. Built with AI for the future of work.</p>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { signUp, signInWithGoogle, sendVerificationEmail } from "@/lib/firebase-auth"
import { createUserProfile } from "@/lib/user-profile"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "developer" as "developer" | "employer",
    displayName: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const { user, error } = await signUp(formData.email, formData.password)

    if (error) {
      toast.error(error)
      setLoading(false)
    } else if (user) {
      // Save userId to localStorage for dashboard redirect
      localStorage.setItem('userId', user.uid)
      
      // Create user profile with role
      try {
        await createUserProfile(
          user.uid,
          formData.email,
          formData.role,
          formData.displayName || undefined
        )
      } catch (profileError) {
        console.error("Failed to create user profile:", profileError)
      }

      // Send verification email
      const { error: verifyError } = await sendVerificationEmail()
      if (!verifyError) {
        toast.success("Account created! Check your email to verify your account.")
      } else {
        toast.success("Account created! Welcome to AutoTrust")
      }
      router.push("/dashboard")
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const { user, error } = await signInWithGoogle()

    if (error) {
      toast.error(error)
      setLoading(false)
    } else if (user) {
      // Save userId to localStorage for dashboard redirect
      localStorage.setItem('userId', user.uid)
      
      // Create user profile with selected role
      try {
        await createUserProfile(
          user.uid,
          user.email || '',
          formData.role,
          user.displayName || undefined
        )
      } catch (profileError) {
        console.error("Failed to create user profile:", profileError)
      }
      
      toast.success("Welcome to AutoTrust!")
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <Card className="relative bg-slate-900/80 border-slate-700 backdrop-blur-xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">A</span>
            </div>
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">Auto</span>
              <span className="text-white">Trust</span>
            </h1>
          </div>
          <p className="text-slate-400">Create your account</p>
        </div>

        {/* Google Sign In */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          variant="outline"
          className="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-primary/50 text-white mb-4 backdrop-blur-sm transition-all"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900/80 text-slate-400">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-3 text-slate-300">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "developer" })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.role === "developer"
                    ? "border-primary bg-primary/20 shadow-lg shadow-primary/20"
                    : "border-slate-700 bg-slate-800/30 hover:border-primary/50 hover:bg-slate-800/50"
                }`}
              >
                <div className="font-semibold text-white text-base mb-1">🧑‍💻 Developer</div>
                <div className="text-xs text-slate-400">
                  Complete tasks & earn MNEE
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "employer" })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.role === "employer"
                    ? "border-primary bg-primary/20 shadow-lg shadow-primary/20"
                    : "border-slate-700 bg-slate-800/30 hover:border-primary/50 hover:bg-slate-800/50"
                }`}
              >
                <div className="font-semibold text-white text-base mb-1">💼 Employer</div>
                <div className="text-xs text-slate-400">
                  Post tasks & hire talent
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={6}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-purple-500 text-white hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02] transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating account...
              </span>
            ) : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:text-purple-400 font-medium transition-colors">
            Sign in
          </Link>
        </div>
        
        {/* Back to home */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
            ← Back to home
          </Link>
        </div>
      </Card>
    </div>
  )
}

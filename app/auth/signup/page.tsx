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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="bg-card border-border p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-primary">Auto</span>Trust
          </h1>
          <p className="text-muted-foreground">Create your account</p>
        </div>

        {/* Google Sign In */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          variant="outline"
          className="w-full border-border bg-transparent hover:bg-card mb-4"
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
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "developer" })}
                className={`p-4 rounded-lg border-2 transition ${
                  formData.role === "developer"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-semibold">Developer</div>
                <div className="text-xs text-muted-foreground mt-1">
                  I complete tasks and earn MNEE
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "employer" })}
                className={`p-4 rounded-lg border-2 transition ${
                  formData.role === "employer"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-semibold">Employer</div>
                <div className="text-xs text-muted-foreground mt-1">
                  I post tasks and hire developers
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={6}
              className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserProfile } from "@/lib/user-profile"
import { useAuth } from "@/lib/auth-context"
import { Loader } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const redirectToDashboard = async () => {
      // Wait for auth to finish loading
      if (authLoading) return

      // If no user, redirect to login
      if (!user) {
        router.push('/auth/login')
        return
      }

      if (redirecting) return
      setRedirecting(true)

      try {
        const profile = await getUserProfile(user.uid)
        
        if (!profile) {
          // User authenticated but no profile, redirect to login to recreate
          console.warn('User authenticated but no profile found')
          router.push('/auth/login')
          return
        }

        // Redirect based on user role
        if (profile.role === 'developer') {
          router.push('/dashboard/developer')
        } else if (profile.role === 'employer') {
          router.push('/dashboard/employer')
        } else {
          // Default to employer if role not set
          router.push('/dashboard/employer')
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
        router.push('/auth/login')
      }
    }

    redirectToDashboard()
  }, [user, authLoading, router, redirecting])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  )
}

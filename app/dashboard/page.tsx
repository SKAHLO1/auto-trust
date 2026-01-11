"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getUserProfile } from "@/lib/user-profile"
import { useAuth } from "@/lib/auth-context"
import { Loader } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const hasRedirected = useRef(false)

  useEffect(() => {
    const redirectToDashboard = async () => {
      console.log('Dashboard: Auth loading:', authLoading, 'User:', user?.uid)
      
      // Wait for auth to finish loading
      if (authLoading) {
        console.log('Dashboard: Still loading authentication...')
        return
      }

      // Prevent multiple redirects
      if (hasRedirected.current) {
        console.log('Dashboard: Already redirected, skipping')
        return
      }
      hasRedirected.current = true

      // If no user, redirect to login
      if (!user) {
        console.log('Dashboard: No user found, redirecting to login')
        router.push('/auth/login')
        return
      }

      try {
        console.log('Dashboard: Fetching user profile for:', user.uid)
        const profile = await getUserProfile(user.uid)
        console.log('Dashboard: Profile fetched:', profile)
        
        if (!profile) {
          // User authenticated but no profile, redirect to login to recreate
          console.warn('Dashboard: User authenticated but no profile found')
          router.push('/auth/login')
          return
        }

        // Redirect based on user role
        console.log('Dashboard: Redirecting to', profile.role, 'dashboard')
        if (profile.role === 'developer') {
          router.push('/dashboard/developer')
        } else if (profile.role === 'employer') {
          router.push('/dashboard/employer')
        } else {
          // Default to employer if role not set
          console.log('Dashboard: No role set, defaulting to employer')
          router.push('/dashboard/employer')
        }
      } catch (error) {
        console.error('Dashboard: Failed to load user profile:', error)
        router.push('/auth/login')
      }
    }

    redirectToDashboard()
  }, [user, authLoading, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  )
}

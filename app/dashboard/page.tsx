"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserProfile } from "@/lib/user-profile"
import { Loader } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    const redirectToDashboard = async () => {
      try {
        const userId = localStorage.getItem('userId')
        
        if (!userId) {
          router.push('/auth/login')
          return
        }

        const profile = await getUserProfile(userId)
        
        if (!profile) {
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
        console.error('Failed to load user profile', error)
        router.push('/auth/login')
      }
    }

    redirectToDashboard()
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  )
}

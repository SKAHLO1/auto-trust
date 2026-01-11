"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { auth } from './firebase-auth'
import { onAuthStateChanged } from 'firebase/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthContext: Initializing auth listener')
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('AuthContext: Auth state changed, user:', user?.uid)
      setUser(user)
      // Sync userId with localStorage for compatibility
      if (user) {
        localStorage.setItem('userId', user.uid)
        console.log('AuthContext: User logged in, userId saved to localStorage')
      } else {
        localStorage.removeItem('userId')
        console.log('AuthContext: User logged out, userId removed from localStorage')
      }
      setLoading(false)
    })

    return () => {
      console.log('AuthContext: Cleaning up auth listener')
      unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}

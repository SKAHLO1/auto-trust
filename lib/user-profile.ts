import { db } from './firebase-config'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export type UserRole = 'developer' | 'employer'

export interface UserProfile {
  uid: string
  email: string
  role: UserRole
  displayName?: string
  walletAddress?: string
  createdAt: string
  updatedAt: string
}

// Create user profile after signup
export async function createUserProfile(
  uid: string,
  email: string,
  role: UserRole,
  displayName?: string
): Promise<void> {
  const userProfile: UserProfile = {
    uid,
    email,
    role,
    displayName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await setDoc(doc(db, 'users', uid), userProfile)
}

// Get user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile
  }

  return null
}

// Update user profile
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    {
      ...updates,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  )
}

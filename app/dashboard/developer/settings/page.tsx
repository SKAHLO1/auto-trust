"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Save, User, Briefcase, Wallet, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useWallet } from "@/lib/wallet-context"
import { getUserProfile, updateUserProfile } from "@/lib/user-profile"
import Link from "next/link"

export default function DeveloperSettings() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useWallet()
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    specialties: [] as string[],
    hourlyRate: "",
    portfolio: "",
    github: "",
    linkedin: "",
  })
  const [newSpecialty, setNewSpecialty] = useState("")

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('userId')
      if (!userId) return

      const profile = await getUserProfile(userId)
      if (profile) {
        setFormData({
          displayName: profile.displayName || "",
          bio: (profile as any).bio || "",
          specialties: (profile as any).specialties || [],
          hourlyRate: (profile as any).hourlyRate || "",
          portfolio: (profile as any).portfolio || "",
          github: (profile as any).github || "",
          linkedin: (profile as any).linkedin || "",
        })
      }
    } catch (error) {
      console.error("Failed to load profile", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const userId = localStorage.getItem('userId')
      if (!userId) {
        toast.error("User not authenticated")
        return
      }

      await updateUserProfile(userId, {
        ...formData,
        walletAddress: isConnected ? walletAddress || undefined : undefined,
      } as any)

      toast.success("Profile updated successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()]
      })
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty)
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard/developer">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">Developer Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Wallet Section */}
            <Card className="bg-card border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">MNEE Wallet</h2>
              </div>
              
              {isConnected ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Connected Address</p>
                    <p className="font-mono text-sm">{walletAddress}</p>
                  </div>
                  <Button 
                    onClick={disconnectWallet}
                    variant="outline"
                    className="w-full"
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    Connect your MNEE wallet to receive payments for completed tasks
                  </p>
                  <Button 
                    onClick={connectWallet}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              )}
            </Card>

            {/* Profile Section */}
            <Card className="bg-card border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Profile Information</h2>
              </div>

              <div className="space-y-4">
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
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                    placeholder="Tell employers about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hourly Rate (MNEE)</label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="50"
                  />
                </div>
              </div>
            </Card>

            {/* Specialties Section */}
            <Card className="bg-card border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Specialties</h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                    className="flex-1 bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., React, Node.js, Python"
                  />
                  <Button onClick={addSpecialty}>Add</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty) => (
                    <div
                      key={specialty}
                      className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-2"
                    >
                      {specialty}
                      <button
                        onClick={() => removeSpecialty(specialty)}
                        className="hover:text-primary-foreground"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Links Section */}
            <Card className="bg-card border-border p-6">
              <h2 className="text-xl font-bold mb-6">Professional Links</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Portfolio URL</label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://your-portfolio.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">GitHub Username</label>
                  <input
                    type="text"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

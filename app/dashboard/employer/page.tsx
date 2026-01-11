"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Eye, Clock, CheckCircle, AlertCircle, Loader, Wallet, DollarSign, Users, LogOut } from "lucide-react"
import { api } from "@/lib/api"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useWallet } from "@/lib/wallet-context"
import { signOut } from "@/lib/firebase-auth"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { toast } from "sonner"

interface Task {
  id: string
  title: string
  status: string
  totalBudget: number
  deadline?: string
  createdAt: string
  escrowStatus?: string
  paymentMethod?: 'MNEE' | 'ETH'
}

export default function EmployerDashboard() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { isConnected } = useWallet()

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleLogout = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error("Failed to log out")
    } else {
      toast.success("Logged out successfully")
      router.push("/")
    }
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await api.getTasks()
      const taskList = Array.isArray(data) ? data : (data.tasks || [])
      
      // Filter tasks created by current user
      const userId = localStorage.getItem('userId')
      const myTasks = userId ? taskList.filter((t: any) => t.creatorId === userId) : taskList
      
      setTasks(myTasks)
    } catch (error) {
      console.error("Failed to load tasks", error)
      toast.error("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "open":
        return "bg-blue-500/20 text-blue-300"
      case "in-progress":
        return "bg-yellow-500/20 text-yellow-300"
      case "submitted":
        return "bg-purple-500/20 text-purple-300"
      case "completed":
        return "bg-green-500/20 text-green-300"
      case "disputed":
        return "bg-red-500/20 text-red-300"
      default:
        return "bg-muted"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "open":
        return <AlertCircle className="w-4 h-4" />
      case "submitted":
        return <Clock className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const mneeTasks = tasks.filter(t => !t.paymentMethod || t.paymentMethod === 'MNEE')
  const ethTasks = tasks.filter(t => t.paymentMethod === 'ETH')
  const mneeTotal = mneeTasks.reduce((sum, t) => sum + (t.totalBudget || 0), 0)
  const ethTotal = ethTasks.reduce((sum, t) => sum + (t.totalBudget || 0), 0)

  const stats = [
    { 
      label: "Total Escrow (MNEE)", 
      value: `${mneeTotal.toFixed(2)} MNEE`, 
      icon: DollarSign,
      color: "text-purple-400" 
    },
    { 
      label: "Total Escrow (ETH)", 
      value: `${ethTotal.toFixed(4)} ETH`, 
      icon: DollarSign,
      color: "text-blue-400" 
    },
    { 
      label: "Active Tasks", 
      value: tasks.filter(t => t.status !== 'completed').length.toString(), 
      icon: AlertCircle,
      color: "text-orange-400" 
    },
    { 
      label: "Completed", 
      value: tasks.filter(t => t.status === 'completed').length.toString(), 
      icon: CheckCircle,
      color: "text-green-400" 
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Employer Dashboard</h1>
              <p className="text-muted-foreground">Manage your tasks and escrow contracts</p>
            </div>
            <div className="flex gap-3">
              <WalletConnectButton variant="outline" />
              <Link href="/tasks/create">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Wallet Warning */}
        {!isConnected && (
          <Card className="bg-yellow-500/10 border-yellow-500/50 p-4 mb-6">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="font-semibold text-yellow-400">Connect your wallet</p>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to deposit escrow and make payments (MNEE or Sepolia ETH)
                </p>
              </div>
              <WalletConnectButton className="ml-auto" />
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="bg-card border-border p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </Card>
            )
          })}
        </div>

        {/* Tasks List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Tasks</h2>

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <Card className="bg-card border-border p-12">
              <div className="text-center">
                <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No tasks found. Create one to get started.</p>
                <Link href="/tasks/create">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Task
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id} className="bg-card border-border p-6 hover:border-primary/50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                        >
                          {getStatusIcon(task.status)}
                          <span className="capitalize">{task.status.replace("-", " ")}</span>
                        </div>
                        {task.escrowStatus && (
                          <div className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                            Escrow: {task.escrowStatus}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          Budget: 
                          <span className={task.paymentMethod === 'ETH' ? "text-blue-400 font-semibold" : "text-purple-400 font-semibold"}>
                            {task.totalBudget} {task.paymentMethod === 'ETH' ? 'ETH' : 'MNEE'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            task.paymentMethod === 'ETH' 
                              ? 'bg-blue-500/20 text-blue-300' 
                              : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {task.paymentMethod === 'ETH' ? '💎 ETH' : '⚡ MNEE'}
                          </span>
                        </span>
                        {task.deadline && (
                          <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                        )}
                        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link href={`/tasks/${task.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

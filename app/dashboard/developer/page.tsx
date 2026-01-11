"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Briefcase, Clock, DollarSign, Settings, Wallet, TrendingUp, Filter, LogOut } from "lucide-react"
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
  description: string
  totalBudget: number
  status: string
  creatorId: string
  deadline?: string
  createdAt: string
  paymentMethod?: 'MNEE' | 'ETH'
}

export default function DeveloperDashboard() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [mySubmissions, setMySubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'recent' | 'high-paying'>('all')
  const { isConnected } = useWallet()

  useEffect(() => {
    fetchData()
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

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all available tasks
      const tasksData = await api.getTasks()
      const taskList = Array.isArray(tasksData) ? tasksData : (tasksData.tasks || [])
      
      // Filter out completed tasks and show only active ones
      const activeTasks = taskList.filter((t: any) => 
        t.status === 'active' || t.status === 'open'
      )
      
      setTasks(activeTasks)
      
      // TODO: Fetch my submissions when endpoint is ready
      // const submissions = await api.getMySubmissions()
      // setMySubmissions(submissions)
      
    } catch (error) {
      console.error("Failed to load data", error)
      toast.error("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  const getFilteredTasks = () => {
    switch (filter) {
      case 'recent':
        return [...tasks].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 10)
      case 'high-paying':
        return [...tasks].sort((a, b) => b.totalBudget - a.totalBudget).slice(0, 10)
      default:
        return tasks
    }
  }

  const mneeTasks = tasks.filter(t => !t.paymentMethod || t.paymentMethod === 'MNEE')
  const ethTasks = tasks.filter(t => t.paymentMethod === 'ETH')

  const stats = [
    { 
      label: "MNEE Tasks", 
      value: mneeTasks.length.toString(), 
      icon: Briefcase,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    },
    { 
      label: "ETH Tasks", 
      value: ethTasks.length.toString(), 
      icon: Briefcase,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    { 
      label: "My Submissions", 
      value: mySubmissions.length.toString(), 
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20"
    },
    { 
      label: "Total Earned", 
      value: "0.00", 
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/20"
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Developer Dashboard</h1>
              <p className="text-muted-foreground">Find tasks and earn in MNEE or ETH</p>
            </div>
            <div className="flex gap-3">
              <WalletConnectButton className="bg-primary text-primary-foreground hover:bg-primary/90" />
              <Link href="/dashboard/developer/settings">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="bg-card border-border p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </Card>
            )
          })}
        </div>

        {/* Wallet Warning */}
        {!isConnected && (
          <Card className="bg-yellow-500/10 border-yellow-500/50 p-4 mb-6">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="font-semibold text-yellow-400">Connect your wallet</p>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to submit work and receive payments (MNEE or Sepolia ETH)
                </p>
              </div>
              <WalletConnectButton className="ml-auto" />
            </div>
          </Card>
        )}

        {/* Task Feed */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Available Tasks</h2>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All Tasks
              </Button>
              <Button
                variant={filter === 'recent' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('recent')}
              >
                <Clock className="w-4 h-4 mr-1" />
                Recent
              </Button>
              <Button
                variant={filter === 'high-paying' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('high-paying')}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                High Paying
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : getFilteredTasks().length === 0 ? (
            <Card className="bg-card border-border p-12">
              <div className="text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tasks available at the moment</p>
                <p className="text-sm text-muted-foreground mt-2">Check back later for new opportunities</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {getFilteredTasks().map((task) => (
                <Card key={task.id} className="bg-card border-border p-6 hover:border-primary/50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          Open
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {task.description}
                      </p>
                      <div className="flex gap-6 text-sm">
                        <span className="flex items-center gap-2">
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
                          <span className="text-muted-foreground">
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          Posted {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link href={`/tasks/${task.id}`}>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        View Task
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

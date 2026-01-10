"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Eye, Clock, CheckCircle, AlertCircle, Loader } from "lucide-react"
import { api } from "@/lib/api"
import Link from "next/link"

interface Task {
  id: string
  title: string
  status: "open" | "in-progress" | "submitted" | "verified" | "completed" | "pending_deposit"
  amountMNEE: number // Note: Backend might return 'totalBudget' or 'amount'. We need to map it.
  deadline: string
  totalBudget?: number
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await api.getTasks()
        // Map backend data to frontend interface if needed
        // Assuming backend returns array of tasks directly or { tasks: [] }
        // Let's assume array for now based on typical express routes
        const taskList = Array.isArray(data) ? data : (data.tasks || [])

        setTasks(taskList.map((t: any) => ({
          ...t,
          amountMNEE: t.totalBudget || t.amount || 0, // Handle different field names
          status: t.status || "open"
        })))
      } catch (error) {
        console.error("Failed to load tasks", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "open":
        return "bg-blue-500/20 text-blue-300"
      case "in-progress":
        return "bg-yellow-500/20 text-yellow-300"
      case "submitted":
        return "bg-purple-500/20 text-purple-300"
      case "verified":
        return "bg-green-500/20 text-green-300"
      case "completed":
        return "bg-emerald-500/20 text-emerald-300"
      case "pending_deposit":
        return "bg-orange-500/20 text-orange-300"
      default:
        return "bg-muted"
    }
  }

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4" />
      case "submitted":
        return <Clock className="w-4 h-4" />
      case "verified":
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Manage your tasks and escrow contracts</p>
            </div>
            <Link href="/tasks/create">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Total Escrow", value: `${tasks.reduce((sum, t) => sum + (t.amountMNEE || 0), 0)} MNEE`, color: "text-primary" },
            { label: "Active Tasks", value: tasks.filter(t => t.status !== 'completed').length.toString(), color: "text-secondary" },
            { label: "Completed", value: tasks.filter(t => t.status === 'completed').length.toString(), color: "text-green-400" },
            { label: "Pending Review", value: tasks.filter(t => t.status === 'submitted').length.toString(), color: "text-yellow-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card border-border p-6">
              <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Tasks List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Active Tasks</h2>

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">No tasks found. Create one to get started.</p>
            </div>
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
                      </div>
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <span>
                          Amount: <span className="text-primary font-semibold">{task.amountMNEE} MNEE</span>
                        </span>
                        <span>Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</span>
                      </div>
                    </div>
                    <Link href={`/tasks/${task.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
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

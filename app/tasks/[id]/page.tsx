"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Clock, Lock } from "lucide-react"

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const [task] = useState({
    id: params.id,
    title: "Build REST API with Authentication",
    description:
      "Create a production-ready REST API with JWT authentication, user management, and proper error handling.",
    status: "submitted" as const,
    milestones: [
      {
        id: 1,
        name: "Core API Setup",
        description: "Database schema, basic endpoints",
        amount: 40,
        status: "completed",
      },
      { id: 2, name: "Authentication", description: "JWT implementation", amount: 35, status: "completed" },
      { id: 3, name: "User Management", description: "CRUD operations", amount: 25, status: "submitted" },
    ],
    totalAmount: 100,
    deadline: "2025-02-15",
    verificationCriteria: "Code compiles, all endpoints working, tests pass, authentication works, README complete",
    submissionLink: "https://github.com/worker/api-repo",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "submitted":
        return "text-yellow-400"
      case "pending":
        return "text-blue-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20"
      case "submitted":
        return "bg-yellow-500/20"
      default:
        return "bg-muted"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
              <p className="text-muted-foreground">{task.description}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${getStatusBg(task.status)}`}>
              <div className={`flex items-center gap-2 ${getStatusColor(task.status)}`}>
                {task.status === "completed" && <CheckCircle className="w-4 h-4" />}
                {task.status === "submitted" && <Clock className="w-4 h-4" />}
                <span className="capitalize">{task.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Milestones */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Milestones</h2>
              <div className="space-y-4">
                {task.milestones.map((milestone) => (
                  <Card key={milestone.id} className="bg-card border-border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{milestone.name}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBg(milestone.status)}`}
                          >
                            <span className={getStatusColor(milestone.status)}>
                              {milestone.status === "completed" && (
                                <>
                                  <CheckCircle className="w-3 h-3 inline mr-1" />
                                  Completed
                                </>
                              )}
                              {milestone.status === "submitted" && (
                                <>
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  Awaiting Verification
                                </>
                              )}
                            </span>
                          </span>
                        </div>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-sm">Payment</p>
                        <p className="text-2xl font-bold text-primary">{milestone.amount} MNEE</p>
                      </div>
                    </div>

                    {milestone.status === "submitted" && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm font-medium mb-3">AI Verification In Progress...</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-muted-foreground">Checking code quality and tests</span>
                        </div>
                      </div>
                    )}

                    {milestone.status === "completed" && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-green-400">MNEE Released on Jan 28, 2025</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Verification Criteria */}
            <div>
              <h2 className="text-2xl font-bold mb-4">AI Verification Criteria</h2>
              <Card className="bg-card border-border p-6">
                <p className="text-muted-foreground leading-relaxed">{task.verificationCriteria}</p>
              </Card>
            </div>

            {/* Submission */}
            {task.status === "submitted" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Work Submission</h2>
                <Card className="bg-card border-border p-6">
                  <p className="text-muted-foreground text-sm mb-2">Submitted Link</p>
                  <p className="font-mono text-primary">{task.submissionLink}</p>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Escrow Status */}
            <Card className="bg-card border-border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Escrow Status
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-sm">Total Locked</p>
                  <p className="text-2xl font-bold text-primary">{task.totalAmount} MNEE</p>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-muted-foreground text-sm">Released</p>
                  <p className="text-xl font-bold text-green-400">75 MNEE</p>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-muted-foreground text-sm">Pending</p>
                  <p className="text-xl font-bold text-yellow-400">25 MNEE</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <p className="text-muted-foreground text-sm">Deadline</p>
                <p className="font-semibold">{new Date(task.deadline).toLocaleDateString()}</p>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {task.status === "submitted" && (
                <>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    View AI Analysis
                  </Button>
                  <Button variant="outline" className="w-full border-border bg-transparent">
                    Request Revision
                  </Button>
                </>
              )}

              {task.status === "completed" && (
                <Button variant="outline" className="w-full border-border bg-transparent">
                  Leave Review
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

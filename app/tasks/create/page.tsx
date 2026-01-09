"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Loader, Wallet } from "lucide-react"
import { depositToEscrow, connectWallet } from "@/lib/web3"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Step = "basic" | "milestones" | "verification" | "review"

export default function CreateTaskPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deliverableType: "code",
    milestones: [{ name: "Milestone 1", description: "", amount: 0 }],
    verificationCriteria: "",
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { name: "", description: "", amount: 0 }],
    }))
  }

  const updateMilestone = (index: number, field: string, value: string | number) => {
    setFormData((prev) => {
      const updated = [...prev.milestones]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, milestones: updated }
    })
  }

  const totalAmount = formData.milestones.reduce((sum, m) => sum + (m.amount || 0), 0)

  const steps: Step[] = ["basic", "milestones", "verification", "review"]
  const stepLabels = {
    basic: "Basic Info",
    milestones: "Milestones",
    verification: "Verification",
    review: "Review",
  }

  const handleCreateTask = async () => {
    try {
      setIsSubmitting(true)

      // 1. Generate a Task ID (or let backend do it, but we need it for deposit)
      // Ideally, backend creates task first with 'pending_deposit' status, returns ID
      // Then we deposit.
      // For simplicity here, we'll create the task on backend first to get an ID.

      toast.info("Creating task record...")
      const task = await api.createTask({
        ...formData,
        totalBudget: totalAmount,
        status: "pending_deposit"
      })

      if (!task.id) throw new Error("Failed to get task ID")

      // 2. Deposit to Escrow
      toast.info("Please confirm the transaction in your wallet...")
      const txHash = await depositToEscrow(task.id, totalAmount)

      toast.success("Deposit successful! Transaction: " + txHash.slice(0, 10) + "...")

      // 3. Record escrow deposit in backend
      toast.info("Recording escrow deposit...")
      await api.depositEscrow(task.id, totalAmount, txHash)

      toast.success("Task created successfully!")
      router.push("/dashboard")
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to create task")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">Create New Task</h1>
          <p className="text-muted-foreground">Set up your first milestone-based escrow task</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between mb-12">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold cursor-pointer transition ${step === s
                    ? "bg-primary text-primary-foreground"
                    : steps.indexOf(step) > i
                      ? "bg-green-500 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                onClick={() => setStep(s)}
              >
                {steps.indexOf(step) > i ? "✓" : i + 1}
              </div>
              <div className="flex-1 px-4">
                <p className="text-sm font-medium">{stepLabels[s]}</p>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-1 flex-1 ${steps.indexOf(step) > i ? "bg-green-500" : "bg-muted"}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="bg-card border-border p-8">
              {/* Basic Info Step */}
              {step === "basic" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Task Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Build REST API with Authentication"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      placeholder="Describe what you're looking for..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={5}
                      className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Deliverable Type</label>
                    <select
                      value={formData.deliverableType}
                      onChange={(e) => handleInputChange("deliverableType", e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="code">Code Repository</option>
                      <option value="content">Written Content</option>
                      <option value="data">Data/Dataset</option>
                      <option value="design">Design Files</option>
                      <option value="api">API/Endpoint</option>
                    </select>
                  </div>

                  <Button
                    onClick={() => setStep("milestones")}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Next: Milestones <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Milestones Step */}
              {step === "milestones" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Create Milestones</h3>
                    <p className="text-muted-foreground mb-6">
                      Break down your project into milestones with payment attached to each
                    </p>
                  </div>

                  <div className="space-y-6">
                    {formData.milestones.map((milestone, i) => (
                      <div key={i} className="border border-border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">Milestone {i + 1}</h4>
                        </div>

                        <input
                          type="text"
                          placeholder="Milestone name"
                          value={milestone.name}
                          onChange={(e) => updateMilestone(i, "name", e.target.value)}
                          className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        />

                        <textarea
                          placeholder="What should be delivered?"
                          value={milestone.description}
                          onChange={(e) => updateMilestone(i, "description", e.target.value)}
                          rows={3}
                          className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        ></textarea>

                        <div>
                          <label className="block text-sm font-medium mb-2">Amount (MNEE)</label>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            placeholder="0"
                            value={milestone.amount || ""}
                            onChange={(e) => updateMilestone(i, "amount", Number.parseFloat(e.target.value) || 0)}
                            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={addMilestone}
                    variant="outline"
                    className="w-full border-border hover:bg-card bg-transparent"
                  >
                    + Add Milestone
                  </Button>

                  <div className="flex gap-3">
                    <Button onClick={() => setStep("basic")} variant="outline" className="flex-1 border-border">
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep("verification")}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Next <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Verification Step */}
              {step === "verification" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">AI Verification Criteria</h3>
                    <p className="text-muted-foreground mb-6">Tell AI what to look for when verifying completed work</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Verification Checklist</label>
                    <textarea
                      placeholder="e.g., Code compiles without errors, all endpoints are working, tests pass, README is complete, authentication is implemented"
                      value={formData.verificationCriteria}
                      onChange={(e) => handleInputChange("verificationCriteria", e.target.value)}
                      rows={6}
                      className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    ></textarea>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => setStep("milestones")} variant="outline" className="flex-1 border-border">
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep("review")}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Review <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {step === "review" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-6">Review Your Task</h3>
                  </div>

                  <div className="space-y-4 border-t border-border pt-6">
                    <div>
                      <p className="text-muted-foreground text-sm">Title</p>
                      <p className="font-semibold">{formData.title || "Not set"}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">Deliverable Type</p>
                      <p className="font-semibold capitalize">{formData.deliverableType}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">Total Amount</p>
                      <p className="text-2xl font-bold text-primary">{totalAmount} MNEE</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm mb-2">Milestones</p>
                      <div className="space-y-2">
                        {formData.milestones.map((m, i) => (
                          <div
                            key={i}
                            className="flex justify-between text-sm bg-card p-3 rounded-lg border border-border"
                          >
                            <span>{m.name || `Milestone ${i + 1}`}</span>
                            <span className="font-semibold">{m.amount} MNEE</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => setStep("verification")} variant="outline" className="flex-1 border-border">
                      Back
                    </Button>
                    <Button
                      onClick={handleCreateTask}
                      disabled={isSubmitting}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4 mr-2" />
                          Create Task & Deposit MNEE
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar Summary */}
          <div>
            <Card className="bg-card border-border p-6 sticky top-20">
              <h3 className="font-semibold mb-4">Task Summary</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground text-sm">Status</p>
                  <p className="font-semibold capitalize">{stepLabels[step]}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">Total Escrow</p>
                  <p className="text-2xl font-bold text-primary">{totalAmount} MNEE</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">Milestones</p>
                  <p className="font-semibold">{formData.milestones.length}</p>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-3">Progress</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${((steps.indexOf(step) + 1) / steps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

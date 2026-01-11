"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Clock, Lock, Loader } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise (Next.js 15+ requirement)
  const { id: taskId } = use(params)
  
  const [task, setTask] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [releasingPayment, setReleasingPayment] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get current user ID from localStorage
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId')
      setCurrentUserId(userId)
    }
    
    const fetchTaskData = async () => {
      try {
        setLoading(true)
        const taskData = await api.getTaskById(taskId)
        setTask(taskData)
        
        // Try to fetch submissions
        try {
          const submissionsData = await api.getTaskSubmissions(taskId)
          setSubmissions(Array.isArray(submissionsData) ? submissionsData : [])
        } catch (err) {
          console.log("No submissions found")
          setSubmissions([])
        }
      } catch (error: any) {
        console.error("Failed to load task", error)
        toast.error("Failed to load task details")
      } finally {
        setLoading(false)
      }
    }

    fetchTaskData()
  }, [taskId])

  // Trigger AI Verification
  const handleVerifySubmission = async () => {
    if (!latestSubmission) return
    
    try {
      setVerifying(true)
      toast.info("Starting AI verification...")
      
      await api.verifySubmission(latestSubmission.id)
      
      toast.success("Verification started! Refreshing...")
      
      // Refresh task data to get verification results
      setTimeout(async () => {
        const taskData = await api.getTaskById(taskId)
        setTask(taskData)
        const submissionsData = await api.getTaskSubmissions(taskId)
        setSubmissions(Array.isArray(submissionsData) ? submissionsData : [])
      }, 2000)
    } catch (error: any) {
      console.error("Verification error:", error)
      toast.error(error.message || "Failed to verify submission")
    } finally {
      setVerifying(false)
    }
  }

  // Release Payment (for employer after verification passes)
  const handleReleasePayment = async () => {
    if (!latestSubmission) return
    
    try {
      setReleasingPayment(true)
      toast.info("Releasing payment from escrow...")
      
      // Call backend to release payment
      const result = await api.releasePayment(latestSubmission.id)
      
      console.log('Payment released:', result)
      
      // Check if this is a manual release (not via smart contract)
      if (result.manual) {
        toast.warning("Payment marked as released", {
          description: result.instructions || "Please transfer funds manually to developer",
          duration: 10000,
        })
        console.warn('Manual release required:', result.instructions)
        console.warn('Recipient address:', result.recipientAddress)
        
        // Show alert with instructions
        alert(
          `⚠️ MANUAL TRANSFER REQUIRED\n\n` +
          `${result.instructions || 'Please transfer funds to developer'}\n\n` +
          `Amount: ${result.amount} ${result.paymentMethod || 'ETH'}\n` +
          `Recipient: ${result.recipientAddress || 'See submission details'}`
        )
      } else {
        toast.success("Payment released successfully! Funds sent to developer's wallet.")
      }
      
      // Wait a moment for user to see the message
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (error: any) {
      console.error("Payment release error:", error)
      toast.error(error.message || "Failed to release payment")
      setReleasingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card border-border p-8 max-w-md w-full text-center">
          <p className="text-muted-foreground">Task not found</p>
          <Link href="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const milestones = task.milestones || []
  const totalAmount = task.totalBudget || task.amount || 0
  const latestSubmission = submissions[0]

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
              {milestones.length > 0 ? (
              <div className="space-y-4">
                {milestones.map((milestone: any, index: number) => (
                  <Card key={`milestone-${index}`} className="bg-card border-border p-6">
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
                        <p className="text-2xl font-bold text-primary">
                          {milestone.amount} {task.paymentMethod === 'ETH' ? '💎 ETH' : 'MNEE'}
                        </p>
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
                        <p className="text-sm text-green-400">
                          {task.paymentMethod === 'ETH' ? 'ETH' : 'MNEE'} Released on {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
              ) : (
                <Card className="bg-card border-border p-6">
                  <p className="text-muted-foreground text-center">No milestones defined for this task</p>
                </Card>
              )}
            </div>

            {/* Verification Criteria */}
            <div>
              <h2 className="text-2xl font-bold mb-4">AI Verification Criteria</h2>
              <Card className="bg-card border-border p-6">
                {typeof task.verificationCriteria === 'string' ? (
                  <p className="text-muted-foreground leading-relaxed">{task.verificationCriteria}</p>
                ) : task.verificationCriteria?.requirements ? (
                  <div className="space-y-3">
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      {task.verificationCriteria.requirements.map((req: string, idx: number) => (
                        <li key={`req-${idx}`}>{req}</li>
                      ))}
                    </ul>
                    {task.verificationCriteria.additionalNotes && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">{task.verificationCriteria.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No verification criteria specified</p>
                )}
              </Card>
            </div>

            {/* Submission */}
            {latestSubmission && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Work Submission</h2>
                  {latestSubmission.status === "pending" && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                      Pending Review
                    </span>
                  )}
                  {latestSubmission.status === "approved" && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Approved
                    </span>
                  )}
                  {latestSubmission.status === "rejected" && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                      Rejected
                    </span>
                  )}
                </div>
                
                <Card className="bg-card border-border p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground text-sm mb-2">Submitted Link</p>
                      <a 
                        href={latestSubmission.data?.submissionLink || latestSubmission.submissionLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-mono text-primary hover:underline break-all"
                      >
                        {latestSubmission.data?.submissionLink || latestSubmission.submissionLink || "No link provided"}
                      </a>
                    </div>
                    
                    {latestSubmission.data?.walletAddress && (
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">Payment Wallet Address</p>
                        <p className="font-mono text-foreground break-all">{latestSubmission.data.walletAddress}</p>
                      </div>
                    )}
                    
                    {(latestSubmission.data?.notes || latestSubmission.notes) && (
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">Developer Notes</p>
                        <p className="text-foreground">{latestSubmission.data?.notes || latestSubmission.notes}</p>
                      </div>
                    )}
                    
                    <div className="border-t border-border pt-4">
                      <p className="text-muted-foreground text-sm">
                        Submitted on {new Date(latestSubmission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Verification Result */}
                    {latestSubmission.verificationResult && (
                      <div className="border-t border-border pt-4">
                        <p className="text-sm font-semibold mb-2">AI Verification Result</p>
                        <div className={`p-4 rounded-lg ${
                          latestSubmission.verificationResult.verdict === 'passed' 
                            ? 'bg-green-500/10 border border-green-500/20' 
                            : 'bg-red-500/10 border border-red-500/20'
                        }`}>
                          <p className={`font-medium mb-2 ${
                            latestSubmission.verificationResult.verdict === 'passed' 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            {latestSubmission.verificationResult.verdict === 'passed' 
                              ? '✓ Verification Passed' 
                              : '✗ Verification Failed'}
                          </p>
                          {latestSubmission.verificationResult.summary && (
                            <p className="text-sm text-muted-foreground">
                              {latestSubmission.verificationResult.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
            
            {/* Submit Work Button - Show for active tasks without submissions */}
            {(task.status === "active" || task.status === "open") && submissions.length === 0 && (
              <Link href={`/work/submit/${taskId}`}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Submit Your Work
                </Button>
              </Link>
            )}
            
            {/* Resubmit Button - Show if previous submission was rejected */}
            {task.status === "active" && submissions.length > 0 && latestSubmission?.status === "rejected" && (
              <Link href={`/work/submit/${taskId}`}>
                <Button className="w-full bg-yellow-500 text-white hover:bg-yellow-600">
                  Resubmit Work
                </Button>
              </Link>
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
                  <p className="text-muted-foreground text-sm">Total Budget</p>
                  <p className="text-2xl font-bold text-primary">
                    {totalAmount} {task.paymentMethod === 'ETH' ? '💎 ETH' : 'MNEE'}
                  </p>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-muted-foreground text-sm">Status</p>
                  <p className="text-xl font-bold capitalize">{task.status || "Open"}</p>
                </div>

                {task.escrowStatus && (
                  <div className="border-t border-border pt-3">
                    <p className="text-muted-foreground text-sm">Escrow</p>
                    <p className="text-xl font-bold text-green-400 capitalize">{task.escrowStatus}</p>
                  </div>
                )}
              </div>

              {task.deadline && (
                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <p className="text-muted-foreground text-sm">Deadline</p>
                  <p className="font-semibold">{new Date(task.deadline).toLocaleDateString()}</p>
                </div>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Employer Actions */}
              {currentUserId === task.creatorId && (
                <>
                  {/* Verify Submission Button - Show when submission is pending */}
                  {latestSubmission && latestSubmission.status === "pending" && (
                    <Button 
                      onClick={handleVerifySubmission}
                      disabled={verifying}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {verifying ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Run AI Verification"
                      )}
                    </Button>
                  )}

                  {/* View Verification Results */}
                  {latestSubmission && latestSubmission.verificationResult && (
                    <Link href={`/verify/${latestSubmission.id}`}>
                      <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
                        View AI Analysis
                      </Button>
                    </Link>
                  )}

                  {/* Release Payment Button - Show when verified and approved */}
                  {latestSubmission && 
                   latestSubmission.status === "approved" && 
                   task.status !== "completed" && (
                    <Button 
                      onClick={handleReleasePayment}
                      disabled={releasingPayment}
                      className="w-full bg-green-500 text-white hover:bg-green-600"
                    >
                      {releasingPayment ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Releasing...
                        </>
                      ) : (
                        "Release Payment"
                      )}
                    </Button>
                  )}

                  {/* Request Revision - Show when rejected */}
                  {latestSubmission && latestSubmission.status === "rejected" && (
                    <Button variant="outline" className="w-full border-border bg-transparent">
                      Request Revision
                    </Button>
                  )}
                </>
              )}

              {/* Completed Task Actions */}
              {task.status === "completed" && (
                <Button variant="outline" className="w-full border-border bg-transparent">
                  Leave Review
                </Button>
              )}

              {/* Developer Info */}
              {currentUserId !== task.creatorId && submissions.length > 0 && (
                <Card className="bg-muted/50 border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    {latestSubmission?.status === "pending" && "⏳ Waiting for employer to review"}
                    {latestSubmission?.status === "approved" && "✓ Your work has been approved!"}
                    {latestSubmission?.status === "rejected" && "✗ Revision requested"}
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

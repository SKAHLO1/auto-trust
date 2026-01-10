"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, LinkIcon, CheckCircle, Loader } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type SubmissionType = "github" | "file" | "url"

export default function SubmitWorkPage({ params }: { params: { taskId: string } }) {
  const router = useRouter()
  const [submissionType, setSubmissionType] = useState<SubmissionType>("github")
  const [submission, setSubmission] = useState({
    github: "",
    file: null as File | null,
    url: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskData = await api.getTaskById(params.taskId)
        setTask(taskData)
      } catch (error) {
        toast.error("Failed to load task details")
      } finally {
        setLoading(false)
      }
    }
    fetchTask()
  }, [params.taskId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setSubmission((prev) => ({ ...prev, file: files[0] }))
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      let submissionLink = ""
      if (submissionType === "github") {
        submissionLink = submission.github
      } else if (submissionType === "url") {
        submissionLink = submission.url
      } else if (submissionType === "file" && submission.file) {
        // For file uploads, we'd need to implement file upload endpoint
        // For now, just use the filename
        submissionLink = `File: ${submission.file.name}`
        toast.warning("File upload not yet implemented. Using filename as placeholder.")
      }

      await api.createSubmission(params.taskId, {
        submissionLink,
        notes: submission.notes,
        deliverableType: submissionType,
      })

      toast.success("Work submitted successfully!")
      setSubmitted(true)
    } catch (error: any) {
      console.error("Submission error:", error)
      toast.error(error.message || "Failed to submit work")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const taskInfo = {
    id: params.taskId,
    title: task?.title || "Task",
    milestone: task?.milestones?.[0]?.name || "Milestone",
    expectedAmount: task?.totalBudget || task?.amount || 0,
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card border-border p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Work Submitted</h1>
            <p className="text-muted-foreground">Your work has been submitted for AI verification</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <p className="text-muted-foreground text-sm mb-2">Task</p>
            <p className="font-semibold mb-4">{taskInfo.title}</p>

            <p className="text-muted-foreground text-sm mb-2">Verification Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-400 font-semibold">In Progress...</span>
            </div>
          </div>

          <p className="text-muted-foreground text-sm mb-6">
            The AI agent is analyzing your submission. We'll notify you when verification is complete.
          </p>

          <Button 
            onClick={() => router.push(`/tasks/${params.taskId}`)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            View Task
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">Submit Your Work</h1>
          <p className="text-muted-foreground">Task: {taskInfo.title}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="bg-card border-border p-8">
              {/* Submission Type Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">How would you like to submit?</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { type: "github" as const, label: "GitHub Repo", icon: "🔗" },
                    { type: "file" as const, label: "Upload File", icon: "📦" },
                    { type: "url" as const, label: "URL Link", icon: "🔗" },
                  ].map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setSubmissionType(option.type)}
                      className={`p-4 rounded-lg border-2 transition ${
                        submissionType === option.type
                          ? "border-primary bg-primary/10"
                          : "border-border bg-transparent hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <p className="font-semibold text-sm">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* GitHub Submission */}
              {submissionType === "github" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">GitHub Repository URL</label>
                    <div className="flex gap-2">
                      <LinkIcon className="w-5 h-5 text-muted-foreground mt-3" />
                      <input
                        type="url"
                        placeholder="https://github.com/username/repo"
                        value={submission.github}
                        onChange={(e) => setSubmission((prev) => ({ ...prev, github: e.target.value }))}
                        className="flex-1 bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Make sure your repository is public and includes all necessary files
                    </p>
                  </div>
                </div>
              )}

              {/* File Upload */}
              {submissionType === "file" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-4">Select Files</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition cursor-pointer">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        accept=".zip,.rar,.tar,.gz,.pdf,.doc,.docx,.xls,.xlsx"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="font-semibold mb-1">
                          {submission.file ? submission.file.name : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-sm text-muted-foreground">ZIP, RAR, PDF, or Office files</p>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* URL Submission */}
              {submissionType === "url" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project URL</label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={submission.url}
                      onChange={(e) => setSubmission((prev) => ({ ...prev, url: e.target.value }))}
                      className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="mt-8 pt-8 border-t border-border">
                <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                <textarea
                  placeholder="Add any notes or context about your submission..."
                  value={submission.notes}
                  onChange={(e) => setSubmission((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex gap-3">
                <Button variant="outline" className="flex-1 border-border bg-transparent">
                  Save as Draft
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    (submissionType === "github" && !submission.github) ||
                    (submissionType === "file" && !submission.file) ||
                    (submissionType === "url" && !submission.url)
                  }
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Work"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Info */}
            <Card className="bg-card border-border p-6">
              <h3 className="font-semibold mb-4">Task Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground text-sm">Task</p>
                  <p className="font-semibold">{taskInfo.title}</p>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-muted-foreground text-sm">Milestone</p>
                  <p className="font-semibold">{taskInfo.milestone}</p>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-muted-foreground text-sm">Payment on Completion</p>
                  <p className="text-2xl font-bold text-primary">{taskInfo.expectedAmount} MNEE</p>
                </div>
              </div>
            </Card>

            {/* Verification Info */}
            <Card className="bg-card border-border p-6">
              <h3 className="font-semibold mb-4">What Will Be Checked</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">✓</span> Code compiles without errors
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span> All endpoints working
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span> Tests passing
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span> Authentication implemented
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span> Documentation complete
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

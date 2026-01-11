"use client"

import { useState, use } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader } from "lucide-react"

type VerificationStatus = "analyzing" | "passed" | "failed"

export default function VerificationPage({ params }: { params: Promise<{ submissionId: string }> }) {
  // Unwrap the params Promise (Next.js 15+ requirement)
  const { submissionId } = use(params)
  
  const [status, setStatus] = useState<VerificationStatus>("analyzing")

  const submission = {
    id: submissionId,
    title: "Build REST API with Authentication",
    workerName: "Alex Developer",
    submittedLink: "https://github.com/worker/api-repo",
    submittedAt: "2025-02-10",
    milestone: "User Management",
    amount: 25,
  }

  const checks = [
    {
      name: "Code Compilation",
      status: "completed" as const,
      detail: "Repository compiled successfully without errors",
    },
    {
      name: "Test Suite",
      status: "completed" as const,
      detail: "All 47 tests passed",
    },
    {
      name: "API Endpoints",
      status: "completed" as const,
      detail: "All required endpoints implemented and responding correctly",
    },
    {
      name: "Authentication",
      status: "completed" as const,
      detail: "JWT authentication working as specified",
    },
    {
      name: "Documentation",
      status: "completed" as const,
      detail: "README and API documentation complete",
    },
    {
      name: "Code Quality",
      status: "completed" as const,
      detail: "Code follows best practices and is well-structured",
    },
  ]

  const overallPassed = checks.every((check) => check.status === "completed")

  if (status === "analyzing") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-2">AI Verification in Progress</h1>
            <p className="text-muted-foreground">Analyzing submission for {submission.title}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-card border-border p-12 text-center">
            <div className="mb-8">
              <Loader className="w-16 h-16 text-primary mx-auto animate-spin" />
            </div>

            <h2 className="text-2xl font-bold mb-4">Analyzing Submission</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Our AI agent is verifying your code against the defined criteria. This usually takes 30-60 seconds.
            </p>

            <div className="bg-background rounded-lg p-6 space-y-3 text-left">
              <div className="flex items-center gap-3">
                <Loader className="w-4 h-4 text-blue-400 animate-spin" />
                <span>Cloning repository...</span>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <Loader className="w-4 h-4 text-blue-400" />
                <span>Compiling code...</span>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <Loader className="w-4 h-4 text-blue-400" />
                <span>Running tests...</span>
              </div>
            </div>

            <Button
              onClick={() => setStatus(overallPassed ? "passed" : "failed")}
              className="mt-8 w-full max-w-xs mx-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Simulate Completion
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (status === "passed") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-green-500/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h1 className="text-3xl font-bold mb-2">Verification Passed</h1>
                <p className="text-muted-foreground">Work meets all criteria. Payment will be released.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Verification Results */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Verification Results</h2>
                <div className="space-y-4">
                  {checks.map((check, i) => (
                    <Card key={i} className="bg-card border-border p-6">
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{check.name}</h3>
                          <p className="text-muted-foreground text-sm">{check.detail}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              <div>
                <h2 className="text-2xl font-bold mb-4">AI Analysis Summary</h2>
                <Card className="bg-card border-border p-6">
                  <div className="bg-background rounded-lg p-6 mb-4">
                    <p className="text-muted-foreground leading-relaxed">
                      The submitted repository demonstrates a comprehensive implementation of the requested API with
                      authentication. The codebase is well-organized with proper error handling and follows REST
                      conventions. All endpoints are functional and tests show 100% pass rate. The project includes
                      complete documentation with examples. No blockers identified.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Overall Score</p>
                      <p className="text-2xl font-bold text-green-400">94%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Code Quality</p>
                      <p className="text-2xl font-bold text-primary">9.2/10</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Tests Passing</p>
                      <p className="text-2xl font-bold text-green-400">47/47</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Release */}
              <Card className="bg-green-500/10 border border-green-500/30 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Payment Ready
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-muted-foreground text-sm">Amount to Release</p>
                    <p className="text-3xl font-bold text-primary">{submission.amount} MNEE</p>
                  </div>

                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white">Release Payment</Button>
                </div>
              </Card>

              {/* Submission Details */}
              <Card className="bg-card border-border p-6">
                <h3 className="font-semibold mb-4">Submission Details</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Worker</p>
                    <p className="font-semibold">{submission.workerName}</p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-muted-foreground text-sm">Submitted Link</p>
                    <p className="font-mono text-sm text-primary break-all">{submission.submittedLink}</p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-muted-foreground text-sm">Submitted On</p>
                    <p className="font-semibold">{new Date(submission.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-red-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h1 className="text-3xl font-bold mb-2">Verification Failed</h1>
              <p className="text-muted-foreground">Some criteria were not met. Worker has been notified.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="space-y-4">
              {checks.map((check, i) => (
                <Card key={i} className="bg-card border-border p-6">
                  <div className="flex items-start gap-4">
                    {check.name === "Code Compilation" && (
                      <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    )}
                    {check.name !== "Code Compilation" && (
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{check.name}</h3>
                      <p className="text-muted-foreground text-sm">
                        {check.name === "Code Compilation"
                          ? "Compilation errors detected: Missing import statement in auth.ts line 45"
                          : check.detail}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Card className="bg-red-500/10 border border-red-500/30 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Fund Status
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-sm">Amount Locked</p>
                  <p className="text-2xl font-bold text-yellow-400">{submission.amount} MNEE</p>
                </div>

                <Button variant="outline" className="w-full border-border bg-transparent">
                  Request Revision
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

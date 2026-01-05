const express = require("express")
const router = express.Router()
const admin = require("firebase-admin")
const db = admin.firestore()
const { generateVerification } = require("../utils/ai-verification")

// Verify a submission
router.post("/", async (req, res) => {
  try {
    const { submissionId } = req.body

    const submissionDoc = await db.collection("submissions").doc(submissionId).get()
    if (!submissionDoc.exists) {
      return res.status(404).json({ error: "Submission not found" })
    }

    const submission = submissionDoc.data()
    const task = await db.collection("tasks").doc(submission.taskId).get()

    // Run AI verification
    const verificationResult = await generateVerification(submission, task.data())

    // Update submission with verification result
    await db.collection("submissions").doc(submissionId).update({
      verificationStatus: "completed",
      verificationResult,
      updatedAt: new Date().toISOString(),
    })

    res.json({ verificationResult })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get verification result
router.get("/:submissionId", async (req, res) => {
  try {
    const doc = await db.collection("submissions").doc(req.params.submissionId).get()
    if (!doc.exists) {
      return res.status(404).json({ error: "Submission not found" })
    }

    const submission = doc.data()
    res.json({
      status: submission.verificationStatus,
      result: submission.verificationResult,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

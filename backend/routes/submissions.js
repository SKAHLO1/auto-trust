const express = require("express")
const router = express.Router()
const admin = require("firebase-admin")
const db = admin.firestore()

const getUserId = (req) => req.headers["x-user-id"]

// Submit work for a task
router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const { taskId, submissionType, submissionData } = req.body

    const submissionRef = db.collection("submissions").doc()
    const submissionDoc = {
      id: submissionRef.id,
      taskId,
      submitterId: userId,
      type: submissionType,
      data: submissionData,
      status: "pending",
      verificationStatus: "processing",
      verificationResult: null,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await submissionRef.set(submissionDoc)
    res.status(201).json(submissionDoc)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get submissions for a task
router.get("/task/:taskId", async (req, res) => {
  try {
    const snapshot = await db.collection("submissions").where("taskId", "==", req.params.taskId).get()

    const submissions = snapshot.docs.map((doc) => doc.data())
    res.json(submissions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get a specific submission
router.get("/:id", async (req, res) => {
  try {
    const doc = await db.collection("submissions").doc(req.params.id).get()
    if (!doc.exists) {
      return res.status(404).json({ error: "Submission not found" })
    }
    res.json(doc.data())
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

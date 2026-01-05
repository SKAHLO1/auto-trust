const express = require("express")
const router = express.Router()
const admin = require("firebase-admin")
const db = admin.firestore()

// Middleware to get user ID from headers
const getUserId = (req) => req.headers["x-user-id"]

// Create a new task
router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const { title, description, milestones, totalBudget, verificationCriteria } = req.body

    const taskRef = db.collection("tasks").doc()
    const taskData = {
      id: taskRef.id,
      creatorId: userId,
      title,
      description,
      milestones,
      totalBudget,
      verificationCriteria,
      status: "active",
      escrowAmount: totalBudget,
      escrowStatus: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await taskRef.set(taskData)
    res.status(201).json(taskData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("tasks").limit(50).get()
    const tasks = snapshot.docs.map((doc) => doc.data())
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get a specific task
router.get("/:id", async (req, res) => {
  try {
    const doc = await db.collection("tasks").doc(req.params.id).get()
    if (!doc.exists) {
      return res.status(404).json({ error: "Task not found" })
    }
    res.json(doc.data())
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update task status
router.patch("/:id", async (req, res) => {
  try {
    const userId = getUserId(req)
    const task = await db.collection("tasks").doc(req.params.id).get()

    if (!task.exists) {
      return res.status(404).json({ error: "Task not found" })
    }

    if (task.data().creatorId !== userId) {
      return res.status(403).json({ error: "Forbidden" })
    }

    const { status } = req.body
    await db.collection("tasks").doc(req.params.id).update({
      status,
      updatedAt: new Date().toISOString(),
    })

    const updated = await db.collection("tasks").doc(req.params.id).get()
    res.json(updated.data())
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

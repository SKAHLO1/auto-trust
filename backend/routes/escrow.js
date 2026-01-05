const express = require("express")
const router = express.Router()
const admin = require("firebase-admin")
const db = admin.firestore()
const { releasePayment, refundPayment } = require("../utils/web3-escrow")

const getUserId = (req) => req.headers["x-user-id"]

// Deposit funds to escrow
router.post("/deposit", async (req, res) => {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const { taskId, amount, transactionHash } = req.body

    const escrowRef = db.collection("escrows").doc()
    const escrowData = {
      id: escrowRef.id,
      taskId,
      depositorId: userId,
      amount,
      status: "locked",
      transactionHash,
      deposittedAt: new Date().toISOString(),
      releasedAt: null,
    }

    await escrowRef.set(escrowData)

    // Update task escrow status
    await db.collection("tasks").doc(taskId).update({
      escrowStatus: "locked",
      escrowAmount: amount,
    })

    res.status(201).json(escrowData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Release payment from escrow
router.post("/release", async (req, res) => {
  try {
    const { submissionId } = req.body

    const submission = await db.collection("submissions").doc(submissionId).get()
    if (!submission.exists) {
      return res.status(404).json({ error: "Submission not found" })
    }

    const task = await db.collection("tasks").doc(submission.data().taskId).get()
    const escrow = await db.collection("escrows").where("taskId", "==", submission.data().taskId).limit(1).get()

    if (escrow.empty) {
      return res.status(404).json({ error: "Escrow not found" })
    }

    // Trigger smart contract payment release
    const result = await releasePayment(
      escrow.docs[0].data().transactionHash,
      task.data().totalBudget,
      submission.data().submitterId,
    )

    // Update escrow status
    await db.collection("escrows").doc(escrow.docs[0].id).update({
      status: "released",
      releasedAt: new Date().toISOString(),
    })

    res.json({ success: true, result })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

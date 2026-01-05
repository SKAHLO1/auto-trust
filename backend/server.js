const express = require("express")
const cors = require("cors")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Firebase Admin Setup
const admin = require("firebase-admin")
const serviceAccount = require("./firebase-service-account.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})

const db = admin.firestore()

// Routes
const tasksRouter = require("./routes/tasks")
const submissionsRouter = require("./routes/submissions")
const verifyRouter = require("./routes/verify")
const escrowRouter = require("./routes/escrow")
const healthRouter = require("./routes/health")

app.use("/api/tasks", tasksRouter)
app.use("/api/submissions", submissionsRouter)
app.use("/api/verify", verifyRouter)
app.use("/api/escrow", escrowRouter)
app.use("/api/health", healthRouter)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`AutoTrust backend running on port ${PORT}`)
})

module.exports = app

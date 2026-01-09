import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db';
import tasksRouter from './routes/tasks';
import submissionsRouter from './routes/submissions';
import verifyRouter from './routes/verify';
import escrowRouter from './routes/escrow';
import healthRouter from './routes/health';
import mneeRouter from './routes/mnee';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/verify', verifyRouter);
app.use('/api/escrow', escrowRouter);
app.use('/api/health', healthRouter);
app.use('/api/mnee', mneeRouter);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`AutoTrust MNEE backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.MNEE_ENVIRONMENT || 'production'}`);
});

export default app;

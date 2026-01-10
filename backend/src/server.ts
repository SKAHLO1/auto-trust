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
import disputesRouter from './routes/disputes';
import paymentsRouter from './routes/payments';
import escrowTimeoutService from './services/escrow-timeout.service';

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
app.use('/api/disputes', disputesRouter);
app.use('/api/payments', paymentsRouter);

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
  
  // Start escrow timeout checker (runs every 24 hours)
  setInterval(async () => {
    try {
      console.log('Running escrow timeout check...');
      await escrowTimeoutService.processExpiredEscrows();
      console.log('Escrow timeout check completed');
    } catch (error) {
      console.error('Escrow timeout check failed:', error);
    }
  }, 24 * 60 * 60 * 1000); // Run every 24 hours
  
  // Run once on startup
  escrowTimeoutService.processExpiredEscrows().catch((err: any) => 
    console.error('Initial escrow timeout check failed:', err)
  );
});

export default app;

import express, { Request, Response } from 'express';
import escrowTimeoutService from '../services/escrow-timeout.service';

const router = express.Router();

// Cron job endpoint - to be pinged by UptimeRobot
router.get('/trigger', async (req: Request, res: Response) => {
  try {
    console.log('Cron job triggered via UptimeRobot');
    
    // Run escrow timeout check
    await escrowTimeoutService.processExpiredEscrows();
    
    res.json({
      success: true,
      message: 'Cron job executed successfully',
      timestamp: new Date().toISOString(),
      tasks: ['escrow_timeout_check'],
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check for the cron system
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    message: 'Cron system is operational',
    timestamp: new Date().toISOString(),
  });
});

export default router;

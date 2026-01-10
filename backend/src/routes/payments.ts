import express, { Request, Response } from 'express';
import { db } from '../db';

const router = express.Router();

const getUserId = (req: Request): string | undefined => {
  return req.headers['x-user-id'] as string;
};

interface PaymentHistory {
  id: string;
  taskId: string;
  taskTitle: string;
  amount: number;
  type: 'received' | 'sent' | 'refunded';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  txId?: string;
}

// Get payment history for a user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payments: PaymentHistory[] = [];

    // Get escrows where user is the depositor (sent payments)
    const sentEscrowsSnapshot = await db
      .collection('escrows')
      .where('depositorId', '==', userId)
      .orderBy('deposittedAt', 'desc')
      .get();

    for (const escrowDoc of sentEscrowsSnapshot.docs) {
      const escrow = escrowDoc.data();
      const taskDoc = await db.collection('tasks').doc(escrow.taskId).get();
      const task = taskDoc.data();

      payments.push({
        id: escrow.id,
        taskId: escrow.taskId,
        taskTitle: task?.title || 'Unknown Task',
        amount: escrow.amount,
        type: escrow.status === 'refunded' ? 'refunded' : 'sent',
        status: escrow.status === 'locked' ? 'pending' : 'completed',
        createdAt: escrow.deposittedAt,
        txId: escrow.mneeTransactionId,
      });
    }

    // Get escrows where user received payment (find tasks created by others and completed by user)
    const submissionsSnapshot = await db
      .collection('submissions')
      .where('submitterId', '==', userId)
      .where('status', '==', 'approved')
      .get();

    for (const submissionDoc of submissionsSnapshot.docs) {
      const submission = submissionDoc.data();
      
      // Get the task
      const taskDoc = await db.collection('tasks').doc(submission.taskId).get();
      const task = taskDoc.data();

      // Find released escrow for this task
      const escrowSnapshot = await db
        .collection('escrows')
        .where('taskId', '==', submission.taskId)
        .where('status', '==', 'released')
        .limit(1)
        .get();

      if (!escrowSnapshot.empty) {
        const escrow = escrowSnapshot.docs[0].data();
        
        payments.push({
          id: `${escrow.id}-received`,
          taskId: submission.taskId,
          taskTitle: task?.title || 'Unknown Task',
          amount: escrow.amount,
          type: 'received',
          status: 'completed',
          createdAt: escrow.releasedAt || escrow.deposittedAt,
          txId: escrow.mneeTransactionId,
        });
      }
    }

    // Sort by date (most recent first)
    payments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json(payments);
  } catch (error: any) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment summary for a user
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Calculate totals
    const sentEscrowsSnapshot = await db
      .collection('escrows')
      .where('depositorId', '==', userId)
      .get();

    let totalSent = 0;
    let pending = 0;

    sentEscrowsSnapshot.docs.forEach(doc => {
      const escrow = doc.data();
      if (escrow.status === 'locked') {
        pending += escrow.amount;
      }
      if (escrow.status !== 'refunded') {
        totalSent += escrow.amount;
      }
    });

    // Get received payments
    const submissionsSnapshot = await db
      .collection('submissions')
      .where('submitterId', '==', userId)
      .where('status', '==', 'approved')
      .get();

    let totalReceived = 0;

    for (const submissionDoc of submissionsSnapshot.docs) {
      const submission = submissionDoc.data();
      
      const escrowSnapshot = await db
        .collection('escrows')
        .where('taskId', '==', submission.taskId)
        .where('status', '==', 'released')
        .limit(1)
        .get();

      if (!escrowSnapshot.empty) {
        totalReceived += escrowSnapshot.docs[0].data().amount;
      }
    }

    res.json({
      totalSent,
      totalReceived,
      pending,
    });
  } catch (error: any) {
    console.error('Payment summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

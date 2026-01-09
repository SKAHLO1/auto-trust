import express, { Request, Response } from 'express';
import { db } from '../db';
import { Escrow, Submission, Task, AuthenticatedRequest } from '../types';
import mneeService from '../services/mnee.service';

const router = express.Router();

const getUserId = (req: Request): string | undefined => {
  return req.headers['x-user-id'] as string;
};

// Deposit funds to escrow via MNEE
router.post('/deposit', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { taskId, amount, senderAddress, escrowAddress, senderPrivateKey } = req.body;

    // Validate inputs
    if (!taskId || !amount || !escrowAddress || !senderPrivateKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create MNEE escrow deposit transaction
    const callbackUrl = process.env.WEBHOOK_CALLBACK_URL;
    const result = await mneeService.createEscrowDeposit(
      senderPrivateKey,
      amount,
      escrowAddress,
      callbackUrl
    );

    const escrowRef = db.collection('escrows').doc();
    const escrowData: Escrow = {
      id: escrowRef.id,
      taskId,
      depositorId: userId,
      amount,
      status: 'locked',
      mneeTransactionId: result.txId || '',
      mneeTicketId: result.ticketId,
      deposittedAt: new Date().toISOString(),
      releasedAt: null,
      senderAddress,
    };

    await escrowRef.set(escrowData);

    // Update task escrow status
    await db.collection('tasks').doc(taskId).update({
      escrowStatus: 'locked',
      escrowAmount: amount,
      mneeTransactionId: result.txId,
    });

    res.status(201).json({
      escrow: escrowData,
      transaction: result,
    });
  } catch (error: any) {
    console.error('Escrow deposit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Release payment from escrow
router.post('/release', async (req: Request, res: Response) => {
  try {
    const { submissionId, escrowPrivateKey } = req.body;

    if (!submissionId || !escrowPrivateKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const submissionDoc = await db.collection('submissions').doc(submissionId).get();
    if (!submissionDoc.exists) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const submission = submissionDoc.data() as Submission;
    const taskDoc = await db.collection('tasks').doc(submission.taskId).get();
    const task = taskDoc.data() as Task;

    const escrowSnapshot = await db
      .collection('escrows')
      .where('taskId', '==', submission.taskId)
      .limit(1)
      .get();

    if (escrowSnapshot.empty) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    const escrowDoc = escrowSnapshot.docs[0];
    const escrow = escrowDoc.data() as Escrow;

    // Check if escrow is in locked status
    if (escrow.status !== 'locked') {
      return res.status(400).json({ error: 'Escrow is not in locked status' });
    }

    // Get recipient address (submitter's MNEE address)
    // You should store this in the submission or user profile
    const recipientAddress = req.body.recipientAddress;
    if (!recipientAddress) {
      return res.status(400).json({ error: 'Recipient address required' });
    }

    // Release payment via MNEE
    const callbackUrl = process.env.WEBHOOK_CALLBACK_URL;
    const result = await mneeService.releaseEscrowPayment(
      escrowPrivateKey,
      task.totalBudget,
      recipientAddress,
      callbackUrl
    );

    // Update escrow status
    await db.collection('escrows').doc(escrowDoc.id).update({
      status: 'released',
      releasedAt: new Date().toISOString(),
      recipientAddress,
      mneeTransactionId: result.txId,
    });

    // Update task status
    await db.collection('tasks').doc(submission.taskId).update({
      status: 'completed',
      escrowStatus: 'released',
    });

    res.json({
      success: true,
      transaction: result,
      message: 'Payment released successfully',
    });
  } catch (error: any) {
    console.error('Payment release error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Refund payment from escrow
router.post('/refund', async (req: Request, res: Response) => {
  try {
    const { taskId, escrowPrivateKey } = req.body;

    if (!taskId || !escrowPrivateKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const taskDoc = await db.collection('tasks').doc(taskId).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const escrowSnapshot = await db
      .collection('escrows')
      .where('taskId', '==', taskId)
      .limit(1)
      .get();

    if (escrowSnapshot.empty) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    const escrowDoc = escrowSnapshot.docs[0];
    const escrow = escrowDoc.data() as Escrow;

    // Check if escrow is in locked status
    if (escrow.status !== 'locked') {
      return res.status(400).json({ error: 'Escrow is not in locked status' });
    }

    // Refund payment via MNEE back to original sender
    const callbackUrl = process.env.WEBHOOK_CALLBACK_URL;
    const result = await mneeService.refundEscrowPayment(
      escrowPrivateKey,
      escrow.amount,
      escrow.senderAddress,
      callbackUrl
    );

    // Update escrow status
    await db.collection('escrows').doc(escrowDoc.id).update({
      status: 'refunded',
      releasedAt: new Date().toISOString(),
      mneeTransactionId: result.txId,
    });

    // Update task status
    await db.collection('tasks').doc(taskId).update({
      status: 'cancelled',
      escrowStatus: 'refunded',
    });

    res.json({
      success: true,
      transaction: result,
      message: 'Payment refunded successfully',
    });
  } catch (error: any) {
    console.error('Refund error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get escrow status
router.get('/status/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const escrowSnapshot = await db
      .collection('escrows')
      .where('taskId', '==', taskId)
      .get();

    if (escrowSnapshot.empty) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    const escrows = escrowSnapshot.docs.map(doc => doc.data());
    res.json(escrows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

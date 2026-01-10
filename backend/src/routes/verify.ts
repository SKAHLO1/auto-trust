import express, { Request, Response } from 'express';
import { db } from '../db';
import { Submission, Task, Escrow } from '../types';
import { generateVerification } from '../utils/ai-verification';
import mneeService from '../services/mnee.service';

const router = express.Router();

// Verify a submission
router.post('/', async (req: Request, res: Response) => {
  try {
    const { submissionId, autoRelease = true } = req.body;

    const submissionDoc = await db.collection('submissions').doc(submissionId).get();
    if (!submissionDoc.exists) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const submission = submissionDoc.data() as Submission;
    const taskDoc = await db.collection('tasks').doc(submission.taskId).get();
    const task = taskDoc.data() as Task;

    // Run AI verification
    const verificationResult = await generateVerification(submission, task);

    // Update submission with verification result
    await db.collection('submissions').doc(submissionId).update({
      verificationStatus: 'completed',
      verificationResult,
      status: verificationResult.verdict === 'passed' ? 'approved' : 'rejected',
      updatedAt: new Date().toISOString(),
    });

    // If work passed and autoRelease is enabled, release escrow payment
    let paymentReleased = false;
    let paymentError = null;
    let escrow: Escrow | null = null;

    if (verificationResult.verdict === 'passed' && autoRelease) {
      try {
        // Find the escrow for this task
        const escrowSnapshot = await db
          .collection('escrows')
          .where('taskId', '==', submission.taskId)
          .where('status', '==', 'locked')
          .limit(1)
          .get();

        if (!escrowSnapshot.empty) {
          const escrowDoc = escrowSnapshot.docs[0];
          escrow = escrowDoc.data() as Escrow;

          // Get recipient address from submission data
          const recipientAddress = submission.data.recipientAddress || submission.data.workerAddress;

          if (recipientAddress && process.env.ESCROW_PRIVATE_KEY) {
            // Release payment via MNEE
            const callbackUrl = process.env.WEBHOOK_CALLBACK_URL;
            const result = await mneeService.releaseEscrowPayment(
              process.env.ESCROW_PRIVATE_KEY,
              escrow.amount,
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
              updatedAt: new Date().toISOString(),
            });

            paymentReleased = true;
          } else {
            paymentError = 'Missing recipient address or escrow private key';
          }
        } else {
          paymentError = 'No locked escrow found for this task';
        }
      } catch (releaseError: any) {
        console.error('Payment release error:', releaseError);
        paymentError = releaseError.message;
      }
    }

    res.json({ 
      verificationResult,
      paymentReleased,
      paymentError,
      message: verificationResult.verdict === 'passed' 
        ? (paymentReleased ? 'Work approved and payment released!' : 'Work approved!')
        : 'Work did not meet requirements'
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get verification result
router.get('/:submissionId', async (req: Request, res: Response) => {
  try {
    const doc = await db.collection('submissions').doc(req.params.submissionId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const submission = doc.data() as Submission;
    res.json({
      status: submission.verificationStatus,
      result: submission.verificationResult,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

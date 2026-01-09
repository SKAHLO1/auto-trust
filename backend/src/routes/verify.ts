import express, { Request, Response } from 'express';
import { db } from '../db';
import { Submission, Task } from '../types';
import { generateVerification } from '../utils/ai-verification';

const router = express.Router();

// Verify a submission
router.post('/', async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.body;

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
      updatedAt: new Date().toISOString(),
    });

    res.json({ verificationResult });
  } catch (error: any) {
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

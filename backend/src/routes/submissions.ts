import express, { Request, Response } from 'express';
import { db } from '../db';
import { Submission, AuthenticatedRequest } from '../types';

const router = express.Router();

const getUserId = (req: Request): string | undefined => {
  return req.headers['x-user-id'] as string;
};

// Submit work for a task
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { taskId, submissionType, submissionData } = req.body;

    const submissionRef = db.collection('submissions').doc();
    const submissionDoc: Submission = {
      id: submissionRef.id,
      taskId,
      submitterId: userId,
      type: submissionType,
      data: submissionData,
      status: 'pending',
      verificationStatus: 'processing',
      verificationResult: null,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await submissionRef.set(submissionDoc);
    res.status(201).json(submissionDoc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get submissions for a task
router.get('/task/:taskId', async (req: Request, res: Response) => {
  try {
    const snapshot = await db
      .collection('submissions')
      .where('taskId', '==', req.params.taskId)
      .get();

    const submissions = snapshot.docs.map((doc) => doc.data());
    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific submission
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const doc = await db.collection('submissions').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.json(doc.data());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

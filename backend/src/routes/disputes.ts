import express, { Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

const getUserId = (req: Request): string | undefined => {
  return req.headers['x-user-id'] as string;
};

interface Dispute {
  id: string;
  taskId: string;
  submissionId?: string;
  openedBy: string;
  reason: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'rejected';
  resolution?: string;
  openedAt: string;
  resolvedAt?: string;
  updatedAt: string;
}

// Open a dispute
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { taskId, submissionId, reason, description } = req.body;

    if (!taskId || !reason || !description) {
      return res.status(400).json({ error: 'taskId, reason, and description are required' });
    }

    // Get task details
    const taskDoc = await db.collection('tasks').doc(taskId).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const task = taskDoc.data();

    // Create dispute
    const disputeRef = db.collection('disputes').doc();
    const dispute: Dispute = {
      id: disputeRef.id,
      taskId,
      submissionId,
      openedBy: userId,
      reason,
      description,
      status: 'open',
      openedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await disputeRef.set(dispute);

    // Update task status
    await db.collection('tasks').doc(taskId).update({
      status: 'disputed',
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json(dispute);
  } catch (error: any) {
    console.error('Dispute creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get disputes for a task
router.get('/task/:taskId', async (req: Request, res: Response) => {
  try {
    const snapshot = await db
      .collection('disputes')
      .where('taskId', '==', req.params.taskId)
      .orderBy('openedAt', 'desc')
      .get();

    const disputes = snapshot.docs.map((doc) => doc.data());
    res.json(disputes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all disputes (admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    let query = db.collection('disputes').orderBy('openedAt', 'desc');

    if (status) {
      query = query.where('status', '==', status) as any;
    }

    const snapshot = await query.limit(50).get();
    const disputes = snapshot.docs.map((doc) => doc.data());
    res.json(disputes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update dispute status (admin/resolver)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { status, resolution } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (resolution) {
      updateData.resolution = resolution;
    }

    if (status === 'resolved' || status === 'rejected') {
      updateData.resolvedAt = new Date().toISOString();
    }

    await db.collection('disputes').doc(req.params.id).update(updateData);

    const updatedDoc = await db.collection('disputes').doc(req.params.id).get();
    res.json(updatedDoc.data());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

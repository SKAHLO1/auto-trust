import express, { Request, Response } from 'express';
import { db } from '../db';
import { Task, AuthenticatedRequest } from '../types';

const router = express.Router();

// Middleware to get user ID from headers
const getUserId = (req: Request): string | undefined => {
  return req.headers['x-user-id'] as string;
};

// Create a new task
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { 
      title, 
      description, 
      milestones, 
      totalBudget, 
      verificationCriteria, 
      mneeWalletAddress,
      paymentMethod,
      deliverableType,
      status,
      deadline
    } = req.body;

    // Handle verificationCriteria - accept string or object
    let processedVerificationCriteria = verificationCriteria;
    
    if (!verificationCriteria) {
      // Provide default if not specified
      processedVerificationCriteria = {
        requirements: ['Task requirements not specified'],
        qualityThreshold: 0.8,
        additionalNotes: 'No verification criteria provided'
      };
    } else if (typeof verificationCriteria === 'string') {
      processedVerificationCriteria = {
        requirements: verificationCriteria.split('\n').filter((r: string) => r.trim()),
        qualityThreshold: 0.8,
        additionalNotes: verificationCriteria
      };
    }

    const taskRef = db.collection('tasks').doc();
    const taskData: any = {
      id: taskRef.id,
      creatorId: userId,
      title,
      description,
      milestones,
      totalBudget,
      verificationCriteria: processedVerificationCriteria,
      status: status || 'active',
      escrowAmount: totalBudget,
      escrowStatus: 'pending',
      paymentMethod: paymentMethod || 'MNEE',
      deliverableType: deliverableType || 'code',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add optional fields only if they have values
    if (deadline) taskData.deadline = deadline;
    if (mneeWalletAddress) taskData.mneeWalletAddress = mneeWalletAddress;

    console.log('Creating task with ID:', taskRef.id);
    console.log('Task data:', { ...taskData, milestones: `[${taskData.milestones?.length} milestones]` });
    
    await taskRef.set(taskData);
    
    // Verify task was saved
    const savedDoc = await taskRef.get();
    console.log('Task saved successfully:', savedDoc.exists ? 'YES' : 'NO');
    
    res.status(201).json(taskData);
  } catch (error: any) {
    console.error('Error creating task:', error);
    console.error('Request body:', req.body);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
});

// Get all tasks
router.get('/', async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('tasks').limit(50).get();
    const tasks = snapshot.docs.map((doc) => doc.data());
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific task
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    console.log('Fetching task with ID:', taskId);
    
    const doc = await db.collection('tasks').doc(taskId).get();
    
    if (!doc.exists) {
      console.log('Task not found in Firestore:', taskId);
      
      // Debug: List all tasks to see what IDs exist
      const allTasks = await db.collection('tasks').limit(10).get();
      console.log('Available task IDs:', allTasks.docs.map(d => d.id));
      
      return res.status(404).json({ 
        error: 'Task not found',
        taskId: taskId,
        availableTasksCount: allTasks.size
      });
    }
    
    console.log('Task found:', doc.id);
    res.json(doc.data());
  } catch (error: any) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update task status
router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const task = await db.collection('tasks').doc(req.params.id).get();

    if (!task.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const taskData = task.data() as Task;
    if (taskData.creatorId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { status, mneeTransactionId } = req.body;
    const updateData: Partial<Task> = {
      updatedAt: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (mneeTransactionId) updateData.mneeTransactionId = mneeTransactionId;

    await db.collection('tasks').doc(req.params.id).update(updateData);

    const updated = await db.collection('tasks').doc(req.params.id).get();
    res.json(updated.data());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

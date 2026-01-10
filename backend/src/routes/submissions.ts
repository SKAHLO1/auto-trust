import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import admin from 'firebase-admin';
import { db } from '../db';
import { Submission, AuthenticatedRequest } from '../types';

const router = express.Router();

// Initialize Firebase Storage
const bucket = admin.storage().bucket();

// Configure multer for memory storage (files will be uploaded to Firebase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Allow common file types
    const allowedTypes = /zip|rar|tar|gz|pdf|doc|docx|xls|xlsx|txt|md|json|js|ts|py|java|cpp|c|h|hpp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('application/') || file.mimetype.startsWith('text/');
    
    if (extname || mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: zip, rar, pdf, doc, code files, etc.'));
    }
  }
});

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

    const { taskId, submissionLink, notes, deliverableType, submissionType, submissionData } = req.body;

    if (!taskId) {
      return res.status(400).json({ error: 'taskId is required' });
    }

    // Support both old (submissionType/submissionData) and new (submissionLink/notes/deliverableType) formats
    const type = deliverableType || submissionType || 'github';
    const data = submissionData || {
      submissionLink: submissionLink || '',
      notes: notes || '',
      deliverableType: type,
    };

    const submissionRef = db.collection('submissions').doc();
    const submissionDoc: Submission = {
      id: submissionRef.id,
      taskId,
      submitterId: userId,
      type,
      data,
      status: 'pending',
      verificationStatus: 'processing',
      verificationResult: null,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await submissionRef.set(submissionDoc);

    // Update task status to 'submitted'
    await db.collection('tasks').doc(taskId).update({
      status: 'submitted',
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json(submissionDoc);
  } catch (error: any) {
    console.error('Submission error:', error);
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

// File upload endpoint for submissions with Firebase Storage
router.post('/upload', upload.single('file'), async (req: any, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { taskId, notes } = req.body;

    if (!taskId) {
      return res.status(400).json({ error: 'taskId is required' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = path.extname(req.file.originalname);
    const filename = `submissions/${taskId}/${timestamp}-${randomString}${fileExtension}`;

    // Upload file to Firebase Storage
    const file = bucket.file(filename);
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          uploadedBy: userId,
          taskId: taskId,
        }
      }
    });

    // Handle upload errors
    stream.on('error', (err: any) => {
      console.error('Upload error:', err);
      throw new Error('Failed to upload file to storage');
    });

    // Wait for upload to complete
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
      stream.end(req.file.buffer);
    });

    // Make file publicly accessible and get download URL
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    // Store file information with Firebase Storage URL
    const fileInfo = {
      filename: filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: publicUrl,
      uploadedAt: new Date().toISOString(),
    };

    const submissionRef = db.collection('submissions').doc();
    const submissionDoc: Submission = {
      id: submissionRef.id,
      taskId,
      submitterId: userId,
      type: 'file',
      data: {
        file: fileInfo,
        notes: notes || '',
        deliverableType: 'file',
        submissionLink: publicUrl,
      },
      status: 'pending',
      verificationStatus: 'processing',
      verificationResult: null,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await submissionRef.set(submissionDoc);

    // Update task status to 'submitted'
    await db.collection('tasks').doc(taskId).update({
      status: 'submitted',
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({
      submission: submissionDoc,
      file: fileInfo,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express, { Request, Response } from 'express';
import { db } from '../db';
import { Escrow, Submission, Task, AuthenticatedRequest } from '../types';
import mneeService from '../services/mnee.service';
import ethereumService from '../services/ethereum.service';

const router = express.Router();

const getUserId = (req: Request): string | undefined => {
  return req.headers['x-user-id'] as string;
};

// Deposit funds to escrow (supports both MNEE blockchain and smart contract deposits)
router.post('/deposit', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { taskId, amount, senderAddress, escrowAddress, senderPrivateKey, transactionHash, paymentMethod } = req.body;

    // Validate basic required fields
    if (!taskId || !amount) {
      return res.status(400).json({ error: 'Missing required fields: taskId and amount' });
    }

    console.log('Escrow deposit request:', { taskId, amount, paymentMethod, hasTransactionHash: !!transactionHash });

    let result: any = {};
    let txId = transactionHash;

    // Check if this is a MNEE blockchain deposit (has private key) or smart contract deposit (has tx hash)
    if (senderPrivateKey && escrowAddress) {
      // Legacy MNEE blockchain deposit
      const callbackUrl = process.env.WEBHOOK_CALLBACK_URL;
      result = await mneeService.createEscrowDeposit(
        senderPrivateKey,
        amount,
        escrowAddress,
        callbackUrl
      );
      txId = result.txId;
    } else if (transactionHash) {
      // New smart contract deposit (MNEE token or ETH)
      // Transaction already completed on-chain, just record it
      result.txId = transactionHash;
    } else {
      return res.status(400).json({ 
        error: 'Either provide (senderPrivateKey + escrowAddress) for MNEE blockchain or (transactionHash) for smart contract deposit' 
      });
    }

    const escrowRef = db.collection('escrows').doc();
    const escrowData: any = {
      id: escrowRef.id,
      taskId,
      depositorId: userId,
      amount,
      paymentMethod: paymentMethod || 'MNEE', // Default to MNEE if not specified
      status: 'locked',
      deposittedAt: new Date().toISOString(),
      releasedAt: null,
    };

    // Add optional fields
    if (txId) escrowData.mneeTransactionId = txId;
    if (result.ticketId) escrowData.mneeTicketId = result.ticketId;
    if (senderAddress) escrowData.senderAddress = senderAddress;

    console.log('Creating escrow with payment method:', escrowData.paymentMethod);
    await escrowRef.set(escrowData);

    // Update task escrow status
    const taskUpdate: any = {
      escrowStatus: 'locked',
      escrowAmount: amount,
      status: 'active', // Change from pending_deposit to active
      updatedAt: new Date().toISOString(),
    };
    
    if (txId) taskUpdate.mneeTransactionId = txId;

    console.log('Updating task:', taskId, 'with escrow data');
    
    // Check if task exists before updating
    const taskDoc = await db.collection('tasks').doc(taskId).get();
    if (!taskDoc.exists) {
      console.error('Task not found when trying to update escrow status:', taskId);
      throw new Error('Task not found for escrow update');
    }
    
    await db.collection('tasks').doc(taskId).update(taskUpdate);
    console.log('Task updated successfully with escrow status');

    res.status(201).json({
      escrow: escrowData,
      transaction: result,
      message: 'Escrow deposit recorded successfully',
    });
  } catch (error: any) {
    console.error('Escrow deposit error:', error);
    console.error('Request body:', req.body);
    res.status(500).json({ error: error.message });
  }
});

// Release payment from escrow
router.post('/release', async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.body;

    console.log('Releasing payment for submission:', submissionId);

    if (!submissionId) {
      return res.status(400).json({ error: 'submissionId is required' });
    }

    // Use escrow private key from environment variable for security
    const escrowPrivateKey = process.env.ESCROW_PRIVATE_KEY;
    if (!escrowPrivateKey) {
      return res.status(500).json({ error: 'Escrow private key not configured on server' });
    }

    const submissionDoc = await db.collection('submissions').doc(submissionId).get();
    if (!submissionDoc.exists) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const submission = submissionDoc.data() as Submission;
    console.log('Found submission for task:', submission.taskId);
    
    const taskDoc = await db.collection('tasks').doc(submission.taskId).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = taskDoc.data() as Task;

    // Check if submission is approved
    if (submission.status !== 'approved') {
      return res.status(400).json({ error: 'Submission must be approved before releasing payment' });
    }

    const escrowSnapshot = await db
      .collection('escrows')
      .where('taskId', '==', submission.taskId)
      .where('status', '==', 'locked')
      .limit(1)
      .get();

    if (escrowSnapshot.empty) {
      return res.status(404).json({ error: 'No locked escrow found for this task' });
    }

    const escrowDoc = escrowSnapshot.docs[0];
    const escrow = escrowDoc.data() as Escrow;

    // Get recipient address from submission data (first priority) or task's mneeWalletAddress (fallback)
    const recipientAddress = submission.data?.walletAddress || task.mneeWalletAddress || escrow.recipientAddress;
    if (!recipientAddress) {
      return res.status(400).json({ error: 'Recipient wallet address not found. Developer must provide wallet address in submission.' });
    }

    console.log('Recipient wallet address:', recipientAddress);

    const paymentMethod = task.paymentMethod || escrow.paymentMethod || 'MNEE';
    console.log('Releasing', escrow.amount, paymentMethod, 'to', recipientAddress);

    let result: any = { success: true };

    // Handle payment release based on payment method
    if (paymentMethod === 'ETH') {
      // ETH payment - call smart contract
      console.log('🔷 ETH payment - calling smart contract release');
      
      if (!ethereumService.isReady()) {
        return res.status(500).json({ 
          error: 'Ethereum service not initialized. Check backend logs and environment variables (ETH_RPC_URL, ETH_ADMIN_PRIVATE_KEY, ESCROW_CONTRACT_ADDRESS)' 
        });
      }
      
      result = await ethereumService.releaseEscrowPayment(
        submission.taskId,
        recipientAddress
      );
      
      if (!result.success) {
        console.error('❌ Smart contract release failed:', result.error);
        return res.status(500).json({ 
          error: result.error || 'Smart contract release failed',
          details: 'Check backend logs for more information'
        });
      }
      
      console.log('✅ ETH released via smart contract. TX:', result.txHash);
      
    } else {
      // MNEE payment release
      console.log('MNEE payment - calling MNEE service');
      const callbackUrl = process.env.WEBHOOK_CALLBACK_URL;
      
      try {
        result = await mneeService.releaseEscrowPayment(
          escrowPrivateKey,
          escrow.amount,
          recipientAddress,
          callbackUrl
        );
      } catch (mneeError: any) {
        console.error('MNEE release error:', mneeError);
        throw new Error(`MNEE payment release failed: ${mneeError.message}`);
      }
    }

    // Update escrow status
    const escrowUpdate: any = {
      status: 'released',
      releasedAt: new Date().toISOString(),
      recipientAddress,
      paymentMethod,
    };
    
    // Add transaction ID (ETH uses txHash, MNEE uses txId)
    if (paymentMethod === 'ETH' && result.txHash) {
      escrowUpdate.ethTransactionHash = result.txHash;
      escrowUpdate.mneeTransactionId = result.txHash; // For compatibility
    } else if (result.txId) {
      escrowUpdate.mneeTransactionId = result.txId;
    }
    
    await db.collection('escrows').doc(escrowDoc.id).update(escrowUpdate);
    console.log('Escrow updated to released');

    // Update task status to completed
    await db.collection('tasks').doc(submission.taskId).update({
      status: 'completed',
      escrowStatus: 'released',
      updatedAt: new Date().toISOString(),
    });
    console.log('Task marked as completed');

    const response: any = {
      success: true,
      transaction: result,
      message: result.manual 
        ? 'Payment marked as released (manual transfer required)' 
        : 'Payment released successfully',
      taskId: submission.taskId,
      amount: escrow.amount,
      paymentMethod,
    };

    // Add manual release instructions if applicable
    if (result.manual) {
      response.manual = true;
      response.instructions = result.message || `Please transfer ${escrow.amount} ${paymentMethod} to ${recipientAddress}`;
      response.recipientAddress = recipientAddress;
    }

    res.json(response);
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

    // Validate sender address for MNEE refund
    if (!escrow.senderAddress) {
      return res.status(400).json({ error: 'Sender address not found for refund' });
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
    const escrowRefundUpdate: any = {
      status: 'refunded',
      releasedAt: new Date().toISOString(),
    };
    if (result.txId) escrowRefundUpdate.mneeTransactionId = result.txId;
    
    await db.collection('escrows').doc(escrowDoc.id).update(escrowRefundUpdate);

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

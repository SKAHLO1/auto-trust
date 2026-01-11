import { db } from '../db';
import { Task, Escrow } from '../types';
import mneeService from './mnee.service';

class EscrowTimeoutService {
  // Check for expired escrows and process auto-refunds
  async processExpiredEscrows(): Promise<void> {
    try {
      const now = new Date();
      
      // Get all locked escrows
      const escrowSnapshot = await db
        .collection('escrows')
        .where('status', '==', 'locked')
        .get();

      for (const escrowDoc of escrowSnapshot.docs) {
        const escrow = escrowDoc.data() as Escrow;
        
        // Get associated task
        const taskDoc = await db.collection('tasks').doc(escrow.taskId).get();
        if (!taskDoc.exists) continue;
        
        const task = taskDoc.data() as Task;
        
        // Check if task has deadline and it's expired
        if (task.deadline) {
          const deadline = new Date(task.deadline);
          const timeoutBuffer = 7 * 24 * 60 * 60 * 1000; // 7 days after deadline
          const timeoutDate = new Date(deadline.getTime() + timeoutBuffer);
          
          if (now > timeoutDate && task.status !== 'completed') {
            console.log(`Processing auto-refund for expired task: ${task.id}`);
            await this.processAutoRefund(escrow, task);
          }
        } else {
          // If no deadline, check if escrow has been locked for more than 90 days
          const depositDate = new Date(escrow.deposittedAt);
          const maxLockDuration = 90 * 24 * 60 * 60 * 1000; // 90 days
          const maxLockDate = new Date(depositDate.getTime() + maxLockDuration);
          
          if (now > maxLockDate && task.status !== 'completed') {
            console.log(`Processing auto-refund for long-locked escrow: ${escrow.id}`);
            await this.processAutoRefund(escrow, task);
          }
        }
      }
    } catch (error) {
      console.error('Error processing expired escrows:', error);
      throw error;
    }
  }

  private async processAutoRefund(escrow: Escrow, task: Task): Promise<void> {
    try {
      // Check if we have escrow private key
      if (!process.env.ESCROW_PRIVATE_KEY) {
        console.error('ESCROW_PRIVATE_KEY not configured, cannot process auto-refund');
        return;
      }

      // Validate sender address exists
      if (!escrow.senderAddress) {
        console.error('Sender address not found, cannot process auto-refund');
        return;
      }

      // Perform refund via MNEE
      const callbackUrl = process.env.WEBHOOK_CALLBACK_URL;
      const result = await mneeService.refundEscrowPayment(
        process.env.ESCROW_PRIVATE_KEY,
        escrow.amount,
        escrow.senderAddress,
        callbackUrl
      );

      // Update escrow status
      const escrowUpdate: any = {
        status: 'refunded',
        releasedAt: new Date().toISOString(),
        refundReason: 'auto_refund_timeout',
      };
      if (result.txId) escrowUpdate.mneeTransactionId = result.txId;
      
      await db.collection('escrows').doc(escrow.id).update(escrowUpdate);

      // Update task status
      await db.collection('tasks').doc(task.id).update({
        status: 'cancelled',
        escrowStatus: 'refunded',
        updatedAt: new Date().toISOString(),
        cancelReason: 'auto_refund_timeout',
      });

      console.log(`Auto-refund processed successfully for task ${task.id}`);
    } catch (error) {
      console.error(`Failed to process auto-refund for task ${task.id}:`, error);
      
      // Log failed refund attempt
      await db.collection('failed_refunds').add({
        escrowId: escrow.id,
        taskId: task.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        attemptedAt: new Date().toISOString(),
      });
    }
  }

  // Manual check for specific task
  async checkTaskTimeout(taskId: string): Promise<{
    expired: boolean;
    timeoutDate?: string;
    daysRemaining?: number;
  }> {
    try {
      const taskDoc = await db.collection('tasks').doc(taskId).get();
      if (!taskDoc.exists) {
        throw new Error('Task not found');
      }

      const task = taskDoc.data() as Task;
      const now = new Date();

      if (task.deadline) {
        const deadline = new Date(task.deadline);
        const timeoutBuffer = 7 * 24 * 60 * 60 * 1000; // 7 days
        const timeoutDate = new Date(deadline.getTime() + timeoutBuffer);
        const daysRemaining = Math.ceil((timeoutDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

        return {
          expired: now > timeoutDate,
          timeoutDate: timeoutDate.toISOString(),
          daysRemaining: Math.max(0, daysRemaining),
        };
      }

      return {
        expired: false,
        daysRemaining: 90, // Default max duration
      };
    } catch (error) {
      console.error('Error checking task timeout:', error);
      throw error;
    }
  }
}

export default new EscrowTimeoutService();

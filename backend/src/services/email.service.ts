import admin from 'firebase-admin';

interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  type: 'payment_received' | 'payment_released' | 'work_submitted' | 'verification_complete' | 'dispute_opened';
}

class EmailService {
  // Store email notifications in Firestore for now
  // In production, integrate with SendGrid, AWS SES, or similar
  async sendNotification(notification: EmailNotification): Promise<void> {
    try {
      const db = admin.firestore();
      
      // Store notification in Firestore
      await db.collection('email_notifications').add({
        ...notification,
        status: 'pending',
        createdAt: new Date().toISOString(),
        sentAt: null,
      });

      console.log(`Email notification queued for ${notification.to}: ${notification.subject}`);
      
      // TODO: Integrate with actual email service
      // await this.sendViaEmailProvider(notification);
    } catch (error) {
      console.error('Email notification error:', error);
      throw error;
    }
  }

  async notifyPaymentReceived(userEmail: string, taskTitle: string, amount: number): Promise<void> {
    await this.sendNotification({
      to: userEmail,
      subject: 'Payment Received - AutoTrust',
      body: `You received ${amount} MNEE for completing "${taskTitle}". The funds have been transferred to your wallet.`,
      type: 'payment_received',
    });
  }

  async notifyPaymentReleased(clientEmail: string, taskTitle: string, amount: number): Promise<void> {
    await this.sendNotification({
      to: clientEmail,
      subject: 'Payment Released - AutoTrust',
      body: `Payment of ${amount} MNEE has been released from escrow for task "${taskTitle}". The work has been verified and approved.`,
      type: 'payment_released',
    });
  }

  async notifyWorkSubmitted(clientEmail: string, taskTitle: string, workerName: string): Promise<void> {
    await this.sendNotification({
      to: clientEmail,
      subject: 'New Work Submission - AutoTrust',
      body: `${workerName} has submitted work for "${taskTitle}". AI verification is in progress.`,
      type: 'work_submitted',
    });
  }

  async notifyVerificationComplete(
    workerEmail: string,
    taskTitle: string,
    passed: boolean,
    feedback: string
  ): Promise<void> {
    await this.sendNotification({
      to: workerEmail,
      subject: `Work Verification ${passed ? 'Approved' : 'Rejected'} - AutoTrust`,
      body: `Your submission for "${taskTitle}" has been ${passed ? 'approved' : 'rejected'}. ${feedback}`,
      type: 'verification_complete',
    });
  }

  async notifyDisputeOpened(emails: string[], taskTitle: string): Promise<void> {
    for (const email of emails) {
      await this.sendNotification({
        to: email,
        subject: 'Dispute Opened - AutoTrust',
        body: `A dispute has been opened for task "${taskTitle}". Our team will review and respond within 48 hours.`,
        type: 'dispute_opened',
      });
    }
  }
}

export default new EmailService();

import { Booking, Client } from './schemas';

// Email service interface
export interface EmailService {
  sendBookingConfirmation(booking: Booking & { id: string }, client: Client): Promise<void>;
  sendBookingNotification(booking: Booking & { id: string }, client: Client): Promise<void>;
}

// Simple email service implementation (can be replaced with SendGrid, Mailgun, etc.)
class SimpleEmailService implements EmailService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_EMAIL_API_URL || '';
    this.apiKey = process.env.EMAIL_API_KEY || '';
  }

  async sendBookingConfirmation(booking: Booking & { id: string }, client: Client): Promise<void> {
    const subject = `Booking Confirmation - Heiwa House`;
    const htmlContent = this.generateBookingConfirmationHTML(booking, client);

    await this.sendEmail(client.email, subject, htmlContent);
  }

  async sendBookingNotification(booking: Booking & { id: string }, client: Client): Promise<void> {
    const subject = `New Booking Notification - ${client.name}`;
    const htmlContent = this.generateBookingNotificationHTML(booking, client);

    // Send to admin email
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@heiwahouse.com';
    await this.sendEmail(adminEmail, subject, htmlContent);
  }

  private async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    // For development/demo purposes, we'll use console.log
    // In production, replace with actual email service API calls

    console.log('📧 EMAIL SENT:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Content:', htmlContent);
    console.log('---');

    // Uncomment and configure for production:
    /*
    const response = await fetch(`${this.apiUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        to,
        subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    */
  }

  private generateBookingConfirmationHTML(booking: Booking & { id: string }, client: Client): string {
    const bookingDate = booking.createdAt
      ? new Date(booking.createdAt as any).toLocaleDateString()
      : new Date().toLocaleDateString();

    const formatItemType = (type: string) => {
      switch (type) {
        case 'room': return '🏠 Room';
        case 'surfCamp': return '🏄‍♂️ Surf Camp';
        case 'addOn': return '🎯 Add-on';
        default: return type;
      }
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
            .total { font-size: 24px; font-weight: bold; color: #0ea5e9; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏄‍♂️ Booking Confirmed!</h1>
              <p>Welcome to Heiwa House, ${client.name}!</p>
            </div>

            <div class="content">
              <h2>Your Booking Details</h2>

              <div class="booking-details">
                <h3>📅 Booking Information</h3>
                <p><strong>Booking ID:</strong> ${booking.id}</p>
                <p><strong>Booking Date:</strong> ${bookingDate}</p>
                <p><strong>Guests:</strong> ${booking.clientIds.length}</p>
                <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
              </div>

              <div class="booking-details">
                <h3>🛍️ Booked Items</h3>
                ${booking.items.map(item => {
                  const checkIn = item.dates?.checkIn;
                  const checkOut = item.dates?.checkOut;
                  const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut as any).getTime() - new Date(checkIn as any).getTime()) / (1000 * 60 * 60 * 24)) : null;

                  return `
                  <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                    <p><strong>${formatItemType(item.type)}:</strong> ${item.itemId}</p>
                    <p><strong>Quantity:</strong> ${item.quantity}</p>
                    <p><strong>Unit Price:</strong> $${item.unitPrice.toFixed(2)}</p>
                    <p><strong>Total:</strong> $${item.totalPrice.toFixed(2)}</p>
                    ${checkIn ? `<p><strong>Check-in:</strong> ${new Date(checkIn as any).toLocaleDateString()}</p>` : ''}
                    ${checkOut ? `<p><strong>Check-out:</strong> ${new Date(checkOut as any).toLocaleDateString()}</p>` : ''}
                    ${nights ? `<p><strong>Nights:</strong> ${nights}</p>` : ''}
                  </div>
                `}).join('')}
              </div>

              <div class="total">
                Total Amount: $${booking.totalAmount.toFixed(2)}
              </div>

              ${booking.notes ? `
                <div class="booking-details">
                  <h3>📝 Additional Notes</h3>
                  <p>${booking.notes}</p>
                </div>
              ` : ''}

              <p>If you have any questions or need to make changes to your booking, please contact us at:</p>
              <p>📧 Email: info@heiwahouse.com</p>
              <p>📞 Phone: +1 (555) 123-4567</p>

              <p>We look forward to welcoming you to Heiwa House!</p>
            </div>

            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© 2024 Heiwa House. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateBookingNotificationHTML(booking: Booking & { id: string }, client: Client): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Booking Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .action-button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🆕 New Booking Received!</h1>
              <p>A new booking has been made at Heiwa House</p>
            </div>

            <div class="content">
              <h2>Booking Details</h2>

              <div class="booking-details">
                <h3>👤 Client Information</h3>
                <p><strong>Name:</strong> ${client.name}</p>
                <p><strong>Email:</strong> ${client.email}</p>
                <p><strong>Phone:</strong> ${client.phone || 'Not provided'}</p>
              </div>

              <div class="booking-details">
                <h3>📅 Booking Information</h3>
                <p><strong>Booking ID:</strong> ${booking.id}</p>
                <p><strong>Items:</strong> ${booking.items.length}</p>
                <p><strong>Total Amount:</strong> $${booking.totalAmount.toFixed(2)}</p>
                <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
              </div>

              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/bookings" class="action-button">
                View Booking Details
              </a>

              <p>Please review and confirm this booking as soon as possible.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

// Export singleton instance
export const emailService = new SimpleEmailService();

// Email queue for reliable delivery
interface EmailQueueItem {
  id: string;
  type: 'booking_confirmation' | 'booking_notification';
  booking: Booking & { id: string };
  client: Client;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  nextRetry?: Date;
}

class EmailQueue {
  private queue: EmailQueueItem[] = [];
  private processing = false;

  async addToQueue(
    type: 'booking_confirmation' | 'booking_notification',
    booking: Booking & { id: string },
    client: Client
  ): Promise<void> {
    const item: EmailQueueItem = {
      id: `${type}_${booking.id}_${Date.now()}`,
      type,
      booking,
      client,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
    };

    this.queue.push(item);

    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) continue;

      // Check if we should retry this item
      if (item.nextRetry && item.nextRetry > new Date()) {
        this.queue.push(item); // Put it back at the end
        continue;
      }

      try {
        if (item.type === 'booking_confirmation') {
          await emailService.sendBookingConfirmation(item.booking, item.client);
        } else if (item.type === 'booking_notification') {
          await emailService.sendBookingNotification(item.booking, item.client);
        }

        console.log(`✅ Email sent successfully: ${item.type} for booking ${item.booking.id}`);
      } catch (error) {
        console.error(`❌ Failed to send email: ${item.type} for booking ${item.booking.id}`, error);

        item.attempts++;

        if (item.attempts < item.maxAttempts) {
          // Schedule retry with exponential backoff
          const retryDelay = Math.pow(2, item.attempts) * 1000; // 2s, 4s, 8s
          item.nextRetry = new Date(Date.now() + retryDelay);
          this.queue.push(item);
          console.log(`📧 Scheduling retry ${item.attempts}/${item.maxAttempts} for ${item.type} in ${retryDelay}ms`);
        } else {
          console.error(`💀 Max attempts reached for ${item.type}, giving up`);
        }
      }

      // Small delay between processing items
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
  }
}

const emailQueue = new EmailQueue();

// Enhanced helper functions for common email operations
export const sendBookingEmails = async (booking: Booking & { id: string }, client: Client) => {
  try {
    // Add emails to queue for reliable delivery
    await emailQueue.addToQueue('booking_confirmation', booking, client);
    await emailQueue.addToQueue('booking_notification', booking, client);

    console.log('✅ Booking emails queued successfully');
  } catch (error) {
    console.error('❌ Failed to queue booking emails:', error);
    throw error;
  }
};

// Send immediate booking emails (without queue)
export const sendBookingEmailsImmediate = async (booking: Booking & { id: string }, client: Client) => {
  try {
    // Send confirmation to client
    await emailService.sendBookingConfirmation(booking, client);

    // Send notification to admin
    await emailService.sendBookingNotification(booking, client);

    console.log('✅ Booking emails sent immediately');
  } catch (error) {
    console.error('❌ Failed to send booking emails immediately:', error);
    throw error;
  }
};

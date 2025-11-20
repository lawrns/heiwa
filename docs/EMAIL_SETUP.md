# Email Notification System Setup

## Overview

The Heiwa House application uses [Resend](https://resend.com) for sending transactional emails. The email system automatically sends notifications for:

- **Booking Confirmations** - Sent to guests when bookings are created
- **Admin Notifications** - Sent to admin when new bookings are received
- **Invoice Emails** - Sent to clients when invoices are created (non-draft status)
- **Payment Confirmations** - Sent to clients when payments are completed
- **Enrollment Confirmations** - Sent to participants when enrolled in surf camps
- **Refund Notifications** - Sent to clients when refunds are processed
- **Pre-Trip Planning Emails** - Sent automatically X days before check-in (default: 7 days) with packing lists, travel tips, and affiliate links
- **Post-Trip Feedback Requests** - Sent automatically X days after check-out (default: 1 day) with review requests and feedback forms

## Setup Instructions

### 1. Create Resend Account

1. Sign up at [https://resend.com](https://resend.com)
2. Verify your email address
3. Complete account setup

### 2. Get API Key

1. Navigate to **API Keys** in the Resend dashboard
2. Click **Create API Key**
3. Give it a name (e.g., "Heiwa House Production")
4. Copy the API key (you won't be able to see it again)

### 3. Configure Domain (Production)

For production, you'll need to verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `heiwahouse.com`)
4. Add the DNS records provided by Resend to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)

### 4. Set Environment Variables

Add the following environment variables to your `.env.local` (development) or production environment:

```bash
# Resend API Key (required)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Email Configuration (optional, defaults provided)
FROM_EMAIL=Heiwa House <noreply@heiwahouse.com>
ADMIN_EMAIL=info@heiwahouse.com
REPLY_TO_EMAIL=info@heiwahouse.com

# Scheduled Email Cron Secret (for scheduled email endpoint)
CRON_SECRET=your-secret-key-here
```

### 5. Development Mode

In development, if `RESEND_API_KEY` is not set, emails will be logged to the console instead of being sent. This allows you to test the email flow without actually sending emails.

## Email Templates

All email templates are HTML-based and include:

- **Branded header** with Heiwa House colors
- **Responsive design** for mobile and desktop
- **Clear call-to-action** sections
- **Professional formatting**

Templates are located in `lib/email-service.ts` and can be customized as needed.

## Testing

### Test Email Sending

You can test email sending using the API endpoint:

```bash
# Send a test booking confirmation
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "booking_confirmation",
    "data": {
      "bookingId": "test-123",
      "guestName": "John Doe",
      "guestEmail": "test@example.com",
      "checkIn": "2025-01-15",
      "checkOut": "2025-01-20",
      "roomName": "Ocean View Room",
      "totalAmount": 500,
      "currency": "EUR",
      "status": "confirmed"
    }
  }'
```

### Test in Development

1. Set `RESEND_API_KEY` in `.env.local` (even with a test key)
2. Create a booking through the admin panel
3. Check the console logs for email sending status
4. Check your Resend dashboard for sent emails

## Email Types

### Booking Confirmation
- **Trigger**: When a booking is created
- **Recipient**: Guest email address
- **Includes**: Booking details, dates, amount, status

### Admin Notification
- **Trigger**: When a new booking is created
- **Recipient**: Admin email (from `ADMIN_EMAIL` env var)
- **Includes**: Booking summary for admin review

### Invoice Email
- **Trigger**: When an invoice is created with non-draft status
- **Recipient**: Client email address
- **Includes**: Invoice number, amount, due date, items

### Payment Confirmation
- **Trigger**: When a payment is marked as completed
- **Recipient**: Client email address
- **Includes**: Payment amount, method, transaction ID

### Enrollment Confirmation
- **Trigger**: When a client is enrolled in a surf camp
- **Recipient**: Participant email address
- **Includes**: Surf camp name, dates, skill level

### Refund Notification
- **Trigger**: When a refund is processed
- **Recipient**: Client email address
- **Includes**: Refund amount, reason, original payment amount

### Pre-Trip Planning Email
- **Trigger**: Automatically sent X days before check-in (default: 7 days) via scheduled email service
- **Recipient**: Guest email address
- **Includes**: 
  - Packing checklist (surf gear, clothing, essentials)
  - Travel tips and local information
  - Affiliate links for recommended products (surfboards, wetsuits, travel gear)
  - Weather forecast (if available)
  - Map/directions to Heiwa House
- **Configuration**: Set `pre_trip_email_days_before` on booking (default: 7)

### Post-Trip Feedback Request
- **Trigger**: Automatically sent X days after check-out (default: 1 day) via scheduled email service
- **Recipient**: Guest email address
- **Includes**:
  - Thank you message
  - Feedback form link
  - Review request links (Google Reviews, TripAdvisor, etc.)
  - Social media sharing options
  - Special offers for return visits

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is set correctly
2. **Check Domain**: In production, ensure domain is verified in Resend
3. **Check Logs**: Look for error messages in server logs
4. **Check Resend Dashboard**: View email logs and delivery status

### Development Mode

If emails aren't sending in development:
- Check console logs for email simulation messages
- Ensure `RESEND_API_KEY` is set if you want real emails
- Check that email addresses are valid

### Rate Limits

Resend free tier includes:
- 3,000 emails/month
- 100 emails/day

For higher limits, upgrade your Resend plan.

## Customization

### Modify Email Templates

Edit templates in `lib/email-service.ts`:
- `getBookingConfirmationTemplate()`
- `getAdminBookingNotificationTemplate()`
- `getInvoiceTemplate()`
- `getPaymentConfirmationTemplate()`
- `getEnrollmentConfirmationTemplate()`
- `getRefundNotificationTemplate()`

### Add New Email Types

1. Add new method to `EmailService` class
2. Create template method
3. Add case to `/api/email/send` route
4. Integrate into relevant workflow

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Verify email addresses before sending
- Implement rate limiting for production use
- Monitor email delivery rates

## Support

For Resend-specific issues:
- [Resend Documentation](https://resend.com/docs)
- [Resend Support](https://resend.com/support)

For application-specific issues:
- Check application logs
- Review email service implementation in `lib/email-service.ts`


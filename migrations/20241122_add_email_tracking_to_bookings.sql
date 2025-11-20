-- Migration: Add email tracking fields to bookings table
-- Purpose: Track when pre-trip and post-trip emails have been sent
-- Date: 2024-11-22

-- Add email tracking columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS pre_trip_email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS post_trip_email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pre_trip_email_days_before INT DEFAULT 7,
ADD COLUMN IF NOT EXISTS post_trip_email_days_after INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{"marketing": true, "reminders": true}'::jsonb;

-- Add indexes for efficient querying of bookings needing emails
CREATE INDEX IF NOT EXISTS idx_bookings_pre_trip_email
ON bookings (check_in_date, pre_trip_email_sent_at)
WHERE status IN ('confirmed', 'paid');

CREATE INDEX IF NOT EXISTS idx_bookings_post_trip_email
ON bookings (check_out_date, post_trip_email_sent_at)
WHERE status IN ('confirmed', 'paid', 'completed');

-- Create email_logs table for tracking all sent emails
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    email_type VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject TEXT,
    template_name VARCHAR(100),
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent',
    error_message TEXT,
    resend_message_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_booking_id ON email_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_client_id ON email_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- Add comments for documentation
COMMENT ON COLUMN bookings.pre_trip_email_sent_at IS 'Timestamp when pre-trip planning email was sent';
COMMENT ON COLUMN bookings.post_trip_email_sent_at IS 'Timestamp when post-trip feedback email was sent';
COMMENT ON COLUMN bookings.pre_trip_email_days_before IS 'Number of days before check-in to send pre-trip email';
COMMENT ON COLUMN bookings.post_trip_email_days_after IS 'Number of days after check-out to send post-trip email';
COMMENT ON COLUMN bookings.email_preferences IS 'Client email preferences for this booking';

COMMENT ON TABLE email_logs IS 'Log of all emails sent through the system';
COMMENT ON COLUMN email_logs.email_type IS 'Type of email: booking_confirmation, pre_trip, post_trip, payment_confirmation, etc.';
COMMENT ON COLUMN email_logs.resend_message_id IS 'Message ID from Resend API for tracking';
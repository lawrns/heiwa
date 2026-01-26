-- Migration: Add indexes for email tracking on bookings table
-- Purpose: Create indexes for efficient querying of bookings needing emails
-- Date: 2024-11-22

-- Create indexes for efficient querying using JSONB fields
-- Index for pre-trip emails based on check-in date in items JSONB
CREATE INDEX IF NOT EXISTS idx_bookings_pre_trip_email_json
ON bookings ((items->>'check_in_date'), pre_trip_email_sent_at)
WHERE status IN ('confirmed', 'paid');

-- Index for post-trip emails based on check-out date in items JSONB
CREATE INDEX IF NOT EXISTS idx_bookings_post_trip_email_json
ON bookings ((items->>'check_out_date'), post_trip_email_sent_at)
WHERE status IN ('confirmed', 'paid', 'completed');

-- Alternative indexes using the updated_at field for timing
CREATE INDEX IF NOT EXISTS idx_bookings_email_tracking
ON bookings (pre_trip_email_sent_at, post_trip_email_sent_at, status)
WHERE status != 'cancelled';
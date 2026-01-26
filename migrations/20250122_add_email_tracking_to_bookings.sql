-- Add email tracking fields to bookings table
-- This allows us to track which emails have been sent to prevent duplicates

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS pre_trip_email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS post_trip_email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pre_trip_email_days_before INTEGER DEFAULT 7;

-- Create index for efficient querying of bookings needing pre-trip emails
CREATE INDEX IF NOT EXISTS idx_bookings_pre_trip_email 
ON bookings(check_in, pre_trip_email_sent_at) 
WHERE pre_trip_email_sent_at IS NULL;

-- Create index for efficient querying of bookings needing post-trip emails
CREATE INDEX IF NOT EXISTS idx_bookings_post_trip_email 
ON bookings(check_out, post_trip_email_sent_at) 
WHERE post_trip_email_sent_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN bookings.pre_trip_email_sent_at IS 'Timestamp when pre-trip planning email was sent';
COMMENT ON COLUMN bookings.post_trip_email_sent_at IS 'Timestamp when post-trip feedback email was sent';
COMMENT ON COLUMN bookings.pre_trip_email_days_before IS 'Number of days before check-in to send pre-trip email (default: 7)';


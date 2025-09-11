-- Add source tracking to bookings table for WordPress integration
-- This migration adds a source column to track where bookings originated

-- Add source column to bookings table
ALTER TABLE bookings 
ADD COLUMN source TEXT DEFAULT 'dashboard' 
CHECK (source IN ('dashboard', 'wordpress', 'api'));

-- Add index for efficient filtering by source
CREATE INDEX idx_bookings_source ON bookings(source);

-- Add comment to document the column
COMMENT ON COLUMN bookings.source IS 'Tracks the origin of the booking: dashboard (admin created), wordpress (widget), or api (external)';

-- Update existing bookings to have 'dashboard' as default source
UPDATE bookings SET source = 'dashboard' WHERE source IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE bookings ALTER COLUMN source SET NOT NULL;

-- Migration Script: Add Complex Content Fields to homepage_content Table
-- This adds support for cards, booking data, testimonials, facilities, and Google rating data

-- Add new JSONB columns for complex content types
ALTER TABLE homepage_content 
ADD COLUMN IF NOT EXISTS cards JSONB,
ADD COLUMN IF NOT EXISTS booking_data JSONB,
ADD COLUMN IF NOT EXISTS testimonials JSONB,
ADD COLUMN IF NOT EXISTS facilities JSONB,
ADD COLUMN IF NOT EXISTS google_rating JSONB,
ADD COLUMN IF NOT EXISTS video_id TEXT;

-- Add indexes for better query performance on JSONB fields
CREATE INDEX IF NOT EXISTS idx_homepage_content_cards ON homepage_content USING GIN (cards);
CREATE INDEX IF NOT EXISTS idx_homepage_content_booking_data ON homepage_content USING GIN (booking_data);
CREATE INDEX IF NOT EXISTS idx_homepage_content_testimonials ON homepage_content USING GIN (testimonials);
CREATE INDEX IF NOT EXISTS idx_homepage_content_facilities ON homepage_content USING GIN (facilities);
CREATE INDEX IF NOT EXISTS idx_homepage_content_google_rating ON homepage_content USING GIN (google_rating);

-- Add comments for documentation
COMMENT ON COLUMN homepage_content.cards IS 'JSON array of card data for sections like About, Rooms, Facilities';
COMMENT ON COLUMN homepage_content.booking_data IS 'JSON array of booking data for Surf Weeks section';
COMMENT ON COLUMN homepage_content.testimonials IS 'JSON array of testimonial data for Reviews section';
COMMENT ON COLUMN homepage_content.facilities IS 'JSON array of facility data for Facilities section';
COMMENT ON COLUMN homepage_content.google_rating IS 'JSON object containing Google rating data (rating, total_reviews, url)';
COMMENT ON COLUMN homepage_content.video_id IS 'YouTube video ID for video content';

-- Verify the schema changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'homepage_content' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

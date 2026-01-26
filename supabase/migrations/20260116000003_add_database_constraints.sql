-- Migration: Add database constraints for data integrity
-- High priority data integrity fix: Add foreign keys and check constraints

-- Add foreign key constraints (if tables exist and columns are compatible)

-- Note: Bookings use client_ids (array) and room_assignments table instead of direct FKs
-- Foreign key constraints are handled via room_assignments table

-- Add check constraints for business rules

-- Bookings: check_out must be after check_in (using actual column names)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'check_booking_dates'
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT check_booking_dates
    CHECK (check_out > check_in);
  END IF;
END $$;

-- Bookings: guests must be positive and reasonable (using actual column name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'check_booking_guests'
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT check_booking_guests
    CHECK (guests > 0 AND guests <= 50);
  END IF;
END $$;

-- Bookings: total amount must be non-negative
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_booking_amount'
  ) THEN
    ALTER TABLE bookings 
    ADD CONSTRAINT check_booking_amount 
    CHECK (total_amount >= 0);
  END IF;
END $$;

-- Rooms: capacity must be positive
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_room_capacity'
  ) THEN
    ALTER TABLE rooms 
    ADD CONSTRAINT check_room_capacity 
    CHECK (capacity > 0 AND capacity <= 20);
  END IF;
END $$;

-- Note: Rooms use JSONB pricing column instead of price_per_night
-- Price validation is handled at application level

-- Surf Camps: end_date must be after start_date
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_surf_camp_dates'
  ) THEN
    ALTER TABLE surf_camps 
    ADD CONSTRAINT check_surf_camp_dates 
    CHECK (end_date > start_date);
  END IF;
END $$;

-- Surf Camps: max_participants must be positive
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_surf_camp_participants'
  ) THEN
    ALTER TABLE surf_camps 
    ADD CONSTRAINT check_surf_camp_participants 
    CHECK (max_participants > 0 AND max_participants <= 50);
  END IF;
END $$;

-- Surf Camps: price must be non-negative
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_surf_camp_price'
  ) THEN
    ALTER TABLE surf_camps 
    ADD CONSTRAINT check_surf_camp_price 
    CHECK (price >= 0);
  END IF;
END $$;

-- Add unique constraint on client email
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_client_email'
  ) THEN
    ALTER TABLE clients 
    ADD CONSTRAINT unique_client_email 
    UNIQUE (email);
  END IF;
END $$;

-- Page Sections: order_index must be non-negative
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_page_section_order'
  ) THEN
    ALTER TABLE page_sections 
    ADD CONSTRAINT check_page_section_order 
    CHECK (order_index >= 0);
  END IF;
END $$;

-- Media Library: file_size must be positive
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_media_file_size'
  ) THEN
    ALTER TABLE media_library 
    ADD CONSTRAINT check_media_file_size 
    CHECK (file_size > 0);
  END IF;
END $$;

-- Add helpful comments
COMMENT ON CONSTRAINT check_booking_dates ON bookings IS 
'Ensures checkout date is after checkin date';

COMMENT ON CONSTRAINT check_booking_guests ON bookings IS 
'Ensures number of guests is between 1 and 50';

COMMENT ON CONSTRAINT fk_bookings_client ON bookings IS 
'Cascades delete when client is deleted';

COMMENT ON CONSTRAINT fk_bookings_room ON bookings IS 
'Prevents room deletion if bookings exist';

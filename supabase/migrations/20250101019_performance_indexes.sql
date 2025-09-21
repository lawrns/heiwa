-- Performance indexes for hot database queries
-- Optimized for widget availability queries, admin dashboards, and reporting

-- Availability query indexes (most critical - used by widget)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_camp_week_availability_lookup
ON camp_week(property_id, start_date, end_date, is_active)
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bed_availability_lookup
ON bed(room_id, is_active)
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_room_property_lookup
ON room(property_id, is_active)
WHERE is_active = true;

-- Booking query optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_status_dates
ON bookings(status, created_at, check_in_date, check_out_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_customer_status
ON bookings(customer_id, status, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_camp_week_status
ON bookings(camp_week_id, status, created_at);

-- Payment query optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status_date
ON payments(status, payment_date, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_booking_status
ON payments(booking_id, status);

-- Admin dashboard query optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_brand_active
ON property(brand_id, is_active)
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_camp_week_property_active
ON camp_week(property_id, is_active)
WHERE is_active = true;

-- Reporting query optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_monthly_reporting
ON bookings(DATE_TRUNC('month', created_at), status, total_amount);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_monthly_reporting
ON payments(DATE_TRUNC('month', payment_date), status, amount);

-- Search and filtering optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_email_search
ON customer(LOWER(email), created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_location_search
ON property USING GIN ((location->'city'), (location->'country'));

-- Promo code performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_promo_code_brand_active
ON promo_code(brand_id, is_active, valid_until)
WHERE is_active = true;

-- Webhook processing optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_event_processing
ON webhook_event(processed, processing_attempts, created_at)
WHERE processed = false;

-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_camp_weeks
ON camp_week(start_date, end_date, capacity, booked_count)
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_available_rooms
ON room(property_id, room_type, max_occupancy)
WHERE is_active = true;

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_search
ON bookings(customer_id, camp_week_id, status, created_at, total_amount);

-- GIN indexes for JSON operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_location_gin
ON property USING GIN (location);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_preferences_gin
ON customer USING GIN (preferences);

-- Unique constraints with indexes
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_promo_code_unique_active
ON promo_code(UPPER(code), brand_id)
WHERE is_active = true;

-- Foreign key indexes (already created by REFERENCES, but explicit for clarity)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_bed_booking_id ON booking_bed(booking_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_addon_booking_id ON booking_addon(booking_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_room_assignments_booking_id ON room_assignments(booking_id);

-- Date range indexes for availability queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_camp_week_date_range
ON camp_week USING GIST (daterange(start_date, end_date))
WHERE is_active = true;

-- Comments for documentation
COMMENT ON INDEX idx_camp_week_availability_lookup IS 'Critical index for widget availability queries - used on every search';
COMMENT ON INDEX idx_bed_availability_lookup IS 'Bed availability lookup for room/bed selection';
COMMENT ON INDEX idx_bookings_status_dates IS 'Booking status and date filtering for admin dashboards';
COMMENT ON INDEX idx_payments_status_date IS 'Payment reporting and reconciliation queries';
COMMENT ON INDEX idx_property_location_gin IS 'Location-based property search and filtering';

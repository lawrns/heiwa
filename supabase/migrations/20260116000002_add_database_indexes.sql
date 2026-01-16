-- Migration: Add database indexes for performance optimization
-- High priority performance fix: Add indexes on frequently queried columns

-- Bookings table indexes (using actual column names)
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out ON bookings(check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_guests ON bookings(guests);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Composite index for common date range queries
CREATE INDEX IF NOT EXISTS idx_bookings_dates_status
ON bookings(check_in, check_out, status);

-- Page Sections indexes
CREATE INDEX IF NOT EXISTS idx_page_sections_page_slug ON page_sections(page_slug);
CREATE INDEX IF NOT EXISTS idx_page_sections_is_active ON page_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_page_sections_order ON page_sections(order_index);
CREATE INDEX IF NOT EXISTS idx_page_sections_section_type ON page_sections(section_type);

-- Composite index for common page queries
CREATE INDEX IF NOT EXISTS idx_page_sections_slug_active_order 
ON page_sections(page_slug, is_active, order_index);

-- Media Library indexes
CREATE INDEX IF NOT EXISTS idx_media_library_file_type ON media_library(file_type);
CREATE INDEX IF NOT EXISTS idx_media_library_category ON media_library(category);
CREATE INDEX IF NOT EXISTS idx_media_library_is_active ON media_library(is_active);
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON media_library(created_at DESC);

-- Composite index for media filtering
CREATE INDEX IF NOT EXISTS idx_media_library_type_active 
ON media_library(file_type, is_active);

-- Clients table indexes
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- Surf Camps indexes
CREATE INDEX IF NOT EXISTS idx_surf_camps_start_date ON surf_camps(start_date);
CREATE INDEX IF NOT EXISTS idx_surf_camps_end_date ON surf_camps(end_date);
CREATE INDEX IF NOT EXISTS idx_surf_camps_is_active ON surf_camps(is_active);

-- Composite index for active upcoming camps
CREATE INDEX IF NOT EXISTS idx_surf_camps_active_dates 
ON surf_camps(is_active, start_date, end_date);

-- Rooms table indexes
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at DESC);

-- Page Versions indexes (for CMS history)
CREATE INDEX IF NOT EXISTS idx_page_versions_page_slug ON page_versions(page_slug);
CREATE INDEX IF NOT EXISTS idx_page_versions_created_at ON page_versions(created_at DESC);

-- Composite index for version history queries
CREATE INDEX IF NOT EXISTS idx_page_versions_slug_created 
ON page_versions(page_slug, created_at DESC);

-- Add helpful comments
COMMENT ON INDEX idx_bookings_dates_status IS 
'Optimizes date range queries with status filtering';

COMMENT ON INDEX idx_page_sections_slug_active_order IS 
'Optimizes page section lookups with ordering';

COMMENT ON INDEX idx_media_library_type_active IS 
'Optimizes media filtering by type and active status';

COMMENT ON INDEX idx_surf_camps_active_dates IS 
'Optimizes queries for upcoming active surf camps';

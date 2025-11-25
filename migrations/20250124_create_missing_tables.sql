-- Create missing tables identified during validation
-- room_assignments, add_ons, external_calendar_events

-- ============================================
-- room_assignments table
-- ============================================
CREATE TABLE IF NOT EXISTS room_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    surf_camp_id UUID REFERENCES surf_camps(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES surf_camp_enrollments(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    bed_number INTEGER,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for room_assignments
CREATE INDEX IF NOT EXISTS idx_room_assignments_room_id ON room_assignments(room_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_client_id ON room_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_booking_id ON room_assignments(booking_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_surf_camp_id ON room_assignments(surf_camp_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_dates ON room_assignments(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_room_assignments_status ON room_assignments(status);

-- Enable RLS for room_assignments
ALTER TABLE room_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for room_assignments
CREATE POLICY "Allow public read access on room_assignments" ON room_assignments
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage room_assignments" ON room_assignments
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- add_ons table
-- ============================================
CREATE TABLE IF NOT EXISTS add_ons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('equipment', 'service', 'food', 'transport', 'other')),
    is_active BOOLEAN DEFAULT true,
    max_quantity INTEGER,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for add_ons
CREATE INDEX IF NOT EXISTS idx_add_ons_category ON add_ons(category);
CREATE INDEX IF NOT EXISTS idx_add_ons_is_active ON add_ons(is_active);
CREATE INDEX IF NOT EXISTS idx_add_ons_name ON add_ons(name);

-- Enable RLS for add_ons
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for add_ons
CREATE POLICY "Allow public read active add_ons" ON add_ons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage add_ons" ON add_ons
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- external_calendar_events table
-- ============================================
CREATE TABLE IF NOT EXISTS external_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    event_type VARCHAR(50),
    location TEXT,
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for external_calendar_events
CREATE INDEX IF NOT EXISTS idx_external_calendar_events_start_date ON external_calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_external_calendar_events_end_date ON external_calendar_events(end_date);
CREATE INDEX IF NOT EXISTS idx_external_calendar_events_type ON external_calendar_events(event_type);

-- Enable RLS for external_calendar_events
ALTER TABLE external_calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for external_calendar_events
CREATE POLICY "Allow authenticated users to read external_calendar_events" ON external_calendar_events
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage external_calendar_events" ON external_calendar_events
  FOR ALL USING (auth.role() = 'authenticated');

-- Create triggers for updated_at
CREATE TRIGGER trigger_room_assignments_updated_at
    BEFORE UPDATE ON room_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_add_ons_updated_at
    BEFORE UPDATE ON add_ons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_external_calendar_events_updated_at
    BEFORE UPDATE ON external_calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


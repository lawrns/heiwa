-- Create camp_week table for specific week-long sessions
CREATE TABLE camp_week (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    booked_count INTEGER DEFAULT 0 CHECK (booked_count >= 0),
    is_active BOOLEAN DEFAULT true,
    blackout_dates DATE[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validation constraints
    CONSTRAINT camp_week_dates_valid CHECK (end_date > start_date),
    CONSTRAINT camp_week_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT camp_week_capacity_not_exceeded CHECK (booked_count <= capacity),
    CONSTRAINT camp_week_no_negative_capacity CHECK (capacity > 0),
    CONSTRAINT camp_week_blackout_dates_valid CHECK (
        blackout_dates <@ ARRAY(
            SELECT generate_series(start_date, end_date, '1 day'::interval)::date
        )
    )
);

-- Add updated_at trigger
CREATE TRIGGER update_camp_week_updated_at
    BEFORE UPDATE ON camp_week
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_camp_week_property_id ON camp_week(property_id);
CREATE INDEX idx_camp_week_dates ON camp_week(start_date, end_date);
CREATE INDEX idx_camp_week_active ON camp_week(is_active);
CREATE INDEX idx_camp_week_availability ON camp_week(property_id, start_date, end_date) WHERE is_active = true;

-- Add RLS policies
ALTER TABLE camp_week ENABLE ROW LEVEL SECURITY;

-- Public read access for active camp weeks (needed for availability search)
CREATE POLICY "Public can view active camp weeks" ON camp_week
    FOR SELECT USING (is_active = true);

-- Property owners can manage their camp weeks
CREATE POLICY "Property owners can manage their camp weeks" ON camp_week
    FOR ALL USING (
        property_id IN (
            SELECT id FROM property WHERE owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM property p
            JOIN brand b ON p.brand_id = b.id
            WHERE p.id = camp_week.property_id
            AND b.created_by = auth.uid()
        )
    );

-- Admin can manage all camp weeks
CREATE POLICY "Admin can manage camp weeks" ON camp_week
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com',
            'admin@heiwa.house',
            'manager@heiwa.house'
        )
    );

-- Insert sample camp week data
INSERT INTO camp_week (property_id, name, start_date, end_date, base_price, capacity) VALUES
((SELECT id FROM property WHERE name = 'Puerto Escondido Surf Camp'), 'Summer Surf Week 1', '2025-07-07', '2025-07-14', 1200.00, 20),
((SELECT id FROM property WHERE name = 'Puerto Escondido Surf Camp'), 'Summer Surf Week 2', '2025-07-14', '2025-07-21', 1200.00, 20),
((SELECT id FROM property WHERE name = 'Puerto Escondido Surf Camp'), 'Summer Surf Week 3', '2025-07-21', '2025-07-28', 1200.00, 20),
((SELECT id FROM property WHERE name = 'Sayulita Freedom Camp'), 'Beginner Surf Week 1', '2025-07-07', '2025-07-14', 950.00, 16),
((SELECT id FROM property WHERE name = 'Sayulita Freedom Camp'), 'Beginner Surf Week 2', '2025-07-14', '2025-07-21', 950.00, 16);

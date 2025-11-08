-- Create surf_camps table for surf weeks data
CREATE TABLE IF NOT EXISTS surf_camps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 450.00,
    available_spots INTEGER NOT NULL DEFAULT 18,
    total_spots INTEGER NOT NULL DEFAULT 18,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints
ALTER TABLE surf_camps ADD CONSTRAINT check_dates CHECK (end_date > start_date);
ALTER TABLE surf_camps ADD CONSTRAINT check_spots CHECK (available_spots >= 0 AND available_spots <= total_spots);

-- Create indexes
CREATE INDEX idx_surf_camps_dates ON surf_camps(start_date, end_date);
CREATE INDEX idx_surf_camps_active ON surf_camps(is_active);
CREATE INDEX idx_surf_camps_start_date ON surf_camps(start_date);

-- Enable RLS (Row Level Security)
ALTER TABLE surf_camps ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access for active surf camps" ON surf_camps
    FOR SELECT USING (is_active = true);

-- Create policy for admin full access
CREATE POLICY "Admin full access to surf camps" ON surf_camps
    FOR ALL USING (
        -- This would typically check for admin role
        -- For now, allow service role access
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Insert sample surf weeks data
INSERT INTO surf_camps (name, start_date, end_date, price, available_spots, total_spots, description) VALUES
('February Surf Week 2025', '2025-02-01', '2025-02-08', 450.00, 8, 18, 'Join us for an amazing week of surfing, yoga, and Portuguese adventure!'),
('Spring Surf Week 2025', '2025-05-31', '2025-06-07', 450.00, 5, 18, 'Perfect spring conditions for all skill levels with professional instruction.'),
('Summer Surf Week 2025', '2025-06-07', '2025-06-14', 450.00, 8, 18, 'Summer vibes and great waves in beautiful Ericeira and Peniche.'),
('August Surf Week 2025', '2025-08-16', '2025-08-23', 450.00, 12, 18, 'Late summer magic with the best surf conditions of the year.'),
('September Surf Week 2025', '2025-08-30', '2025-09-06', 450.00, 15, 18, 'September offers perfect waves and fewer crowds for the ideal surf experience.'),
('October Surf Week 2025', '2025-10-04', '2025-10-11', 450.00, 16, 18, 'Fall surf season with consistent swells and comfortable temperatures.');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_surf_camps_updated_at 
    BEFORE UPDATE ON surf_camps 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for surf_camps table
ALTER PUBLICATION supabase_realtime ADD TABLE surf_camps;

-- Verification queries
SELECT 'surf_camps table created successfully' as status;
SELECT COUNT(*) as surf_weeks_inserted FROM surf_camps;

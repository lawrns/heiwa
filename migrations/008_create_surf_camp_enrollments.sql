-- Create surf_camp_enrollments table for surf camp bookings
CREATE TABLE IF NOT EXISTS surf_camp_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    surf_camp_id UUID NOT NULL REFERENCES surf_camps(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    participant_name TEXT NOT NULL,
    participant_email TEXT NOT NULL,
    participant_phone TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    total_amount DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_surf_camp_id ON surf_camp_enrollments(surf_camp_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_client_id ON surf_camp_enrollments(client_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON surf_camp_enrollments(status);

-- Enable RLS
ALTER TABLE surf_camp_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access on enrollments" ON surf_camp_enrollments
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage enrollments" ON surf_camp_enrollments
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER trigger_surf_camp_enrollments_updated_at
    BEFORE UPDATE ON surf_camp_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


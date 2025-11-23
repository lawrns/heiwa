-- Migration: Create surf_camp_enrollments table
-- Date: 2025-01-20
-- Purpose: Enable surf camp enrollment system for room assignments

-- Create surf_camp_enrollments table
CREATE TABLE IF NOT EXISTS surf_camp_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surf_camp_id UUID NOT NULL REFERENCES surf_camps(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  skill_level TEXT,
  dietary_restrictions TEXT,
  emergency_contact JSONB,
  notes TEXT,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(surf_camp_id, client_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrollments_surf_camp ON surf_camp_enrollments(surf_camp_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_client ON surf_camp_enrollments(client_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_booking ON surf_camp_enrollments(booking_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON surf_camp_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_created_at ON surf_camp_enrollments(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_surf_camp_enrollments_updated_at
  BEFORE UPDATE ON surf_camp_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE surf_camp_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to read enrollments
CREATE POLICY "Authenticated users can read enrollments"
  ON surf_camp_enrollments FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert enrollments
CREATE POLICY "Authenticated users can insert enrollments"
  ON surf_camp_enrollments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update enrollments
CREATE POLICY "Authenticated users can update enrollments"
  ON surf_camp_enrollments FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete enrollments
CREATE POLICY "Authenticated users can delete enrollments"
  ON surf_camp_enrollments FOR DELETE
  USING (auth.role() = 'authenticated');

-- Add comment
COMMENT ON TABLE surf_camp_enrollments IS 'Tracks client enrollments in surf camps for room assignment purposes';












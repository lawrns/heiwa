-- Create booking_widget_settings table
-- Stores editable "from" price points for the booking widget experience selection

CREATE TABLE IF NOT EXISTS booking_widget_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_type VARCHAR(20) NOT NULL UNIQUE CHECK (experience_type IN ('room', 'surf-week')),
  price_from DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default values
INSERT INTO booking_widget_settings (experience_type, price_from) VALUES
  ('room', 45.00),
  ('surf-week', 599.00)
ON CONFLICT (experience_type) DO NOTHING;

-- Enable RLS
ALTER TABLE booking_widget_settings ENABLE ROW LEVEL SECURITY;

-- Public read access (for widget)
CREATE POLICY "Public read active settings" ON booking_widget_settings
  FOR SELECT USING (is_active = true);

-- Admin full access
CREATE POLICY "Admin full access" ON booking_widget_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_booking_widget_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_widget_settings_updated_at
  BEFORE UPDATE ON booking_widget_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_widget_settings_updated_at();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_booking_widget_settings_type ON booking_widget_settings(experience_type);
CREATE INDEX IF NOT EXISTS idx_booking_widget_settings_active ON booking_widget_settings(is_active) WHERE is_active = true;


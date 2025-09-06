-- Create custom_events table for calendar events
CREATE TABLE custom_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    color TEXT DEFAULT '#6b7280',
    is_all_day BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX custom_events_date_range_idx ON custom_events (start_date, end_date);
CREATE INDEX custom_events_created_by_idx ON custom_events (created_by);
CREATE INDEX custom_events_created_at_idx ON custom_events (created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_events_updated_at 
    BEFORE UPDATE ON custom_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for custom events
ALTER TABLE custom_events ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can do everything
CREATE POLICY "Admin users can manage custom events" ON custom_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Policy: Users can view custom events (for calendar display)
CREATE POLICY "Users can view custom events" ON custom_events
    FOR SELECT USING (true);

-- Add comment for documentation
COMMENT ON TABLE custom_events IS 'Custom calendar events created by admin users';
COMMENT ON COLUMN custom_events.title IS 'Event title displayed on calendar';
COMMENT ON COLUMN custom_events.description IS 'Optional event description';
COMMENT ON COLUMN custom_events.start_date IS 'Event start date and time';
COMMENT ON COLUMN custom_events.end_date IS 'Event end date and time';
COMMENT ON COLUMN custom_events.color IS 'Hex color code for calendar display';
COMMENT ON COLUMN custom_events.is_all_day IS 'Whether event spans entire day';
COMMENT ON COLUMN custom_events.created_by IS 'Admin user who created the event';

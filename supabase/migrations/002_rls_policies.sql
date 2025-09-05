-- Enable Row Level Security on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE surf_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the user's email is in the admin list
  RETURN auth.jwt() ->> 'email' IN (
    'julian@fyves.com',
    'julianmjavierm@gmail.com',
    'admin@heiwa.house',
    'manager@heiwa.house',
    'laurence@fyves.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for authenticated admin users
-- Clients policies
CREATE POLICY "Admin can view all clients" ON clients FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin can insert clients" ON clients FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin can update clients" ON clients FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admin can delete clients" ON clients FOR DELETE USING (is_admin_user());

-- Rooms policies
CREATE POLICY "Admin can view all rooms" ON rooms FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin can insert rooms" ON rooms FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin can update rooms" ON rooms FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admin can delete rooms" ON rooms FOR DELETE USING (is_admin_user());

-- Surf camps policies
CREATE POLICY "Admin can view all surf_camps" ON surf_camps FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin can insert surf_camps" ON surf_camps FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin can update surf_camps" ON surf_camps FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admin can delete surf_camps" ON surf_camps FOR DELETE USING (is_admin_user());

-- Add-ons policies
CREATE POLICY "Admin can view all add_ons" ON add_ons FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin can insert add_ons" ON add_ons FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin can update add_ons" ON add_ons FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admin can delete add_ons" ON add_ons FOR DELETE USING (is_admin_user());

-- Bookings policies
CREATE POLICY "Admin can view all bookings" ON bookings FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin can insert bookings" ON bookings FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin can update bookings" ON bookings FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admin can delete bookings" ON bookings FOR DELETE USING (is_admin_user());

-- Camp weeks policies
CREATE POLICY "Admin can view all camp_weeks" ON camp_weeks FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin can insert camp_weeks" ON camp_weeks FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin can update camp_weeks" ON camp_weeks FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admin can delete camp_weeks" ON camp_weeks FOR DELETE USING (is_admin_user());

-- Room assignments policies
CREATE POLICY "Admin can view all room_assignments" ON room_assignments FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin can insert room_assignments" ON room_assignments FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin can update room_assignments" ON room_assignments FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admin can delete room_assignments" ON room_assignments FOR DELETE USING (is_admin_user());

-- Payments policies
CREATE POLICY "Admin can view all payments" ON payments FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin can insert payments" ON payments FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin can update payments" ON payments FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admin can delete payments" ON payments FOR DELETE USING (is_admin_user());

-- Invoices policies
CREATE POLICY "Admin can view all invoices" ON invoices FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin can insert invoices" ON invoices FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin can update invoices" ON invoices FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admin can delete invoices" ON invoices FOR DELETE USING (is_admin_user());

-- Automations policies
CREATE POLICY "Admin can view all automations" ON automations FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin can insert automations" ON automations FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin can update automations" ON automations FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admin can delete automations" ON automations FOR DELETE USING (is_admin_user());

-- External calendar events policies
CREATE POLICY "Admin can view all external_calendar_events" ON external_calendar_events FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin can insert external_calendar_events" ON external_calendar_events FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin can update external_calendar_events" ON external_calendar_events FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admin can delete external_calendar_events" ON external_calendar_events FOR DELETE USING (is_admin_user());

-- Feature flags policies
CREATE POLICY "Admin can view all feature_flags" ON feature_flags FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin can insert feature_flags" ON feature_flags FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin can update feature_flags" ON feature_flags FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admin can delete feature_flags" ON feature_flags FOR DELETE USING (is_admin_user());

-- Public read access for certain tables (if needed for public-facing features)
-- Uncomment these if you need public access to rooms and surf camps
-- CREATE POLICY "Public can view active rooms" ON rooms FOR SELECT USING (is_active = true);
-- CREATE POLICY "Public can view active surf_camps" ON surf_camps FOR SELECT USING (is_active = true);

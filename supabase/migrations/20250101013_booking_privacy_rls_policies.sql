-- RLS policies for booking privacy and data protection
-- Ensures customers can only see their own bookings and related data

-- Function to check if user owns a booking
CREATE OR REPLACE FUNCTION user_owns_booking(booking_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM bookings
        WHERE id = booking_id
        AND customer_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access booking (owner or admin)
CREATE OR REPLACE FUNCTION user_can_access_booking(booking_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM bookings b
        JOIN camp_week cw ON b.camp_week_id = cw.id
        JOIN property p ON cw.property_id = p.id
        WHERE b.id = booking_id
        AND user_can_manage_property(p.id)
    ) OR EXISTS (
        SELECT 1 FROM admin a
        WHERE a.id = auth.uid()
        AND a.role IN ('admin', 'super_admin')
    ) OR auth.jwt() ->> 'email' IN (
        'julian@fyves.com',
        'julianmjavierm@gmail.com'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced booking privacy policies
DROP POLICY IF EXISTS "Customers can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can update their draft bookings" ON bookings;
DROP POLICY IF EXISTS "Property owners can view their property bookings" ON bookings;

-- Customers can only see their own bookings
CREATE POLICY "Customers can view their own bookings" ON bookings
    FOR SELECT USING (customer_id = auth.uid());

-- Customers can create bookings (during checkout process)
CREATE POLICY "Customers can create bookings" ON bookings
    FOR INSERT WITH CHECK (true);

-- Customers can update their own draft bookings only
CREATE POLICY "Customers can update their draft bookings" ON bookings
    FOR UPDATE USING (
        customer_id = auth.uid() AND
        status = 'draft'
    );

-- Property owners and admins can manage bookings for their properties
CREATE POLICY "Property staff can manage their property bookings" ON bookings
    FOR ALL USING (user_can_access_booking(id));

-- Platform admins have full access
CREATE POLICY "Platform admins can manage all bookings" ON bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin a
            WHERE a.id = auth.uid()
            AND a.role IN ('admin', 'super_admin')
        ) OR
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com'
        )
    );

-- Enhanced payment privacy policies
DROP POLICY IF EXISTS "Admin can view all payments" ON payments;

-- Customers can view payments for their bookings
CREATE POLICY "Customers can view their booking payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = payments.booking_id
            AND b.customer_id = auth.uid()
        )
    );

-- Property staff can view payments for their property bookings
CREATE POLICY "Property staff can view their property payments" ON payments
    FOR SELECT USING (user_can_access_booking(booking_id));

-- Platform admins have full payment access
CREATE POLICY "Platform admins can manage all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin a
            WHERE a.id = auth.uid()
            AND a.role IN ('admin', 'super_admin')
        ) OR
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com'
        )
    );

-- Customer data privacy - customers can only see their own data
-- (Already implemented in T010, but ensuring consistency)

-- Booking bed privacy policies
DROP POLICY IF EXISTS "Customers can view their booking beds" ON booking_bed;
DROP POLICY IF EXISTS "Property owners can view their booking beds" ON booking_bed;
DROP POLICY IF EXISTS "Admin can manage booking beds" ON booking_bed;

-- Customers can view beds for their bookings
CREATE POLICY "Customers can view their booking beds" ON booking_bed
    FOR SELECT USING (user_owns_booking(booking_id));

-- Property staff can manage booking beds for their properties
CREATE POLICY "Property staff can manage their booking beds" ON booking_bed
    FOR ALL USING (user_can_access_booking(booking_id));

-- Platform admins have full access
CREATE POLICY "Platform admins can manage booking beds" ON booking_bed
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin a
            WHERE a.id = auth.uid()
            AND a.role IN ('admin', 'super_admin')
        ) OR
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com'
        )
    );

-- Booking addon privacy policies
DROP POLICY IF EXISTS "Customers can view their booking addons" ON booking_addon;
DROP POLICY IF EXISTS "Property owners can view their booking addons" ON booking_addon;
DROP POLICY IF EXISTS "Admin can manage booking addons" ON booking_addon;

-- Customers can view addons for their bookings
CREATE POLICY "Customers can view their booking addons" ON booking_addon
    FOR SELECT USING (user_owns_booking(booking_id));

-- Property staff can manage booking addons for their properties
CREATE POLICY "Property staff can manage their booking addons" ON booking_addon
    FOR ALL USING (user_can_access_booking(booking_id));

-- Platform admins have full access
CREATE POLICY "Platform admins can manage booking addons" ON booking_addon
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin a
            WHERE a.id = auth.uid()
            AND a.role IN ('admin', 'super_admin')
        ) OR
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com'
        )
    );

-- Create privacy audit view for compliance
CREATE VIEW booking_privacy_audit AS
SELECT
    b.id as booking_id,
    b.customer_id,
    c.email as customer_email,
    c.first_name || ' ' || c.last_name as customer_name,
    b.status as booking_status,
    p.name as property_name,
    br.name as brand_name,
    b.total_amount,
    b.created_at,
    b.updated_at
FROM bookings b
JOIN customer c ON b.customer_id = c.id
JOIN camp_week cw ON b.camp_week_id = cw.id
JOIN property p ON cw.property_id = p.id
JOIN brand br ON p.brand_id = br.id
WHERE b.created_at >= CURRENT_DATE - INTERVAL '1 year';

-- Add RLS to privacy audit view
ALTER VIEW booking_privacy_audit SET (security_barrier = true);

-- Only platform admins can access privacy audit data
CREATE POLICY "Only platform admins can access privacy audit" ON booking_privacy_audit
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin a
            WHERE a.id = auth.uid()
            AND a.role = 'super_admin'
        ) OR
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com'
        )
    );

-- Data retention and deletion policies
-- (Note: In a real implementation, you would add data retention policies here)

-- Audit logging for privacy-sensitive operations
CREATE TABLE privacy_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS to audit log
ALTER TABLE privacy_audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view privacy audit logs" ON privacy_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin a
            WHERE a.id = auth.uid()
            AND a.role = 'super_admin'
        ) OR
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com'
        )
    );

-- Allow audit log insertion (system operations)
CREATE POLICY "Allow audit log insertion" ON privacy_audit_log
    FOR INSERT WITH CHECK (true);

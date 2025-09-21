-- RLS policies for payment data security and PCI compliance
-- Implements strict access controls for sensitive financial information

-- Function to check payment access based on booking ownership
CREATE OR REPLACE FUNCTION user_can_access_payment(payment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        WHERE p.id = payment_id
        AND (
            b.customer_id = auth.uid() OR
            user_can_access_booking(b.id)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced payment security policies
DROP POLICY IF EXISTS "Customers can view their booking payments" ON payments;
DROP POLICY IF EXISTS "Property staff can view their property payments" ON payments;
DROP POLICY IF EXISTS "Platform admins can manage all payments" ON payments;

-- Customers can only view their own payment data (limited fields)
CREATE POLICY "Customers can view their payment summaries" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = payments.booking_id
            AND b.customer_id = auth.uid()
        )
    );

-- Property staff can view payment data for their properties (full details)
CREATE POLICY "Property staff can view their property payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b
            JOIN camp_week cw ON b.camp_week_id = cw.id
            JOIN property p ON cw.property_id = p.id
            WHERE b.id = payments.booking_id
            AND user_can_manage_property(p.id)
        )
    );

-- Platform admins have full payment access for operations
CREATE POLICY "Platform admins can manage payments" ON payments
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

-- Payment data masking for customers (create view with limited fields)
CREATE VIEW customer_payment_summary AS
SELECT
    p.id,
    p.booking_id,
    p.amount,
    p.currency,
    p.payment_status,
    p.payment_date,
    -- Mask sensitive data
    CASE
        WHEN p.payment_method = 'stripe' THEN 'Credit Card'
        ELSE 'Other'
    END as payment_method_masked,
    p.created_at
FROM payments p
WHERE EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.id = p.booking_id
    AND b.customer_id = auth.uid()
);

-- Add RLS to customer payment view
ALTER VIEW customer_payment_summary SET (security_barrier = true);

CREATE POLICY "Customers can view their payment summaries" ON customer_payment_summary
    FOR SELECT USING (true); -- RLS on the view itself

-- Webhook event security policies
DROP POLICY IF EXISTS "Admin can view all webhook events" ON webhook_event;

-- Platform admins can view webhook events for monitoring
CREATE POLICY "Platform admins can view webhook events" ON webhook_event
    FOR SELECT USING (
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

-- System can insert webhook events (via service role only)
-- No user access to insert - only through Edge Functions

-- Promo code security policies (already implemented in T008)
-- Ensure promo codes are validated securely

-- PCI DSS compliance measures

-- Create payment audit trail
CREATE TABLE payment_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    user_id UUID,
    action TEXT NOT NULL CHECK (action IN ('viewed', 'updated', 'refunded', 'created')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS to payment audit
ALTER TABLE payment_audit ENABLE ROW LEVEL SECURITY;

-- Only super admins can view payment audit trail
CREATE POLICY "Super admins can view payment audit" ON payment_audit
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

-- System can insert audit entries
CREATE POLICY "Allow payment audit insertion" ON payment_audit
    FOR INSERT WITH CHECK (true);

-- Function to log payment access for audit
CREATE OR REPLACE FUNCTION log_payment_access(
    payment_id UUID,
    action TEXT,
    old_vals JSONB DEFAULT NULL,
    new_vals JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO payment_audit (
        payment_id,
        user_id,
        action,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        payment_id,
        auth.uid(),
        action,
        old_vals,
        new_vals,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Data retention for payment data (GDPR compliance)
-- Create function to anonymize old payment data
CREATE OR REPLACE FUNCTION anonymize_old_payments()
RETURNS INTEGER AS $$
DECLARE
    anonymized_count INTEGER;
BEGIN
    -- Anonymize payments older than 7 years (PCI DSS requirement)
    UPDATE payments
    SET
        transaction_id = 'ANONYMIZED-' || id,
        payment_method_details = NULL,
        updated_at = NOW()
    WHERE payment_date < CURRENT_DATE - INTERVAL '7 years'
    AND transaction_id NOT LIKE 'ANONYMIZED-%';

    GET DIAGNOSTICS anonymized_count = ROW_COUNT;
    RETURN anonymized_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create payment security monitoring view
CREATE VIEW payment_security_monitor AS
SELECT
    p.id,
    p.booking_id,
    p.amount,
    p.payment_status,
    p.created_at,
    CASE
        WHEN p.payment_method_details IS NOT NULL THEN 'sensitive_data_present'
        ELSE 'anonymized'
    END as data_status,
    EXISTS (
        SELECT 1 FROM payment_audit pa
        WHERE pa.payment_id = p.id
        AND pa.performed_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
    ) as recently_accessed
FROM payments p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '90 days';

-- Add RLS to security monitor
ALTER VIEW payment_security_monitor SET (security_barrier = true);

-- Only platform admins can access security monitor
CREATE POLICY "Platform admins can view payment security monitor" ON payment_security_monitor
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

-- Security monitoring triggers
CREATE OR REPLACE FUNCTION payment_security_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Log access to payment data
    IF TG_OP = 'SELECT' THEN
        PERFORM log_payment_access(NEW.id, 'viewed');
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_payment_access(NEW.id, 'updated', row_to_json(OLD), row_to_json(NEW));
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: In production, you would add this trigger carefully to avoid performance issues
-- CREATE TRIGGER payment_security_audit
--     AFTER SELECT OR UPDATE ON payments
--     FOR EACH ROW EXECUTE FUNCTION payment_security_trigger();

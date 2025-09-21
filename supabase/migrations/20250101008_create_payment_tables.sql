-- Create promo_code table for discount codes
CREATE TABLE promo_code (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brand(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
    minimum_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (minimum_amount >= 0),
    max_uses INTEGER CHECK (max_uses > 0),
    used_count INTEGER DEFAULT 0 CHECK (used_count >= 0),
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validation constraints
    CONSTRAINT promo_code_code_not_empty CHECK (length(trim(code)) > 0),
    CONSTRAINT promo_code_percentage_valid CHECK (
        discount_type != 'percentage' OR
        discount_value <= 100
    ),
    CONSTRAINT promo_code_uses_valid CHECK (
        max_uses IS NULL OR
        used_count <= max_uses
    ),
    CONSTRAINT promo_code_dates_valid CHECK (
        valid_from IS NULL OR
        valid_until IS NULL OR
        valid_until > valid_from
    )
);

-- Add foreign key reference to bookings table
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_promo_code
    FOREIGN KEY (promo_code_id) REFERENCES promo_code(id);

-- Create indexes for promo_code
CREATE INDEX idx_promo_code_brand_id ON promo_code(brand_id);
CREATE INDEX idx_promo_code_code ON promo_code(upper(code));
CREATE INDEX idx_promo_code_active ON promo_code(is_active);
CREATE INDEX idx_promo_code_valid_dates ON promo_code(valid_from, valid_until) WHERE is_active = true;

-- Add updated_at trigger for promo_code
CREATE TRIGGER update_promo_code_updated_at
    BEFORE UPDATE ON promo_code
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for promo_code
ALTER TABLE promo_code ENABLE ROW LEVEL SECURITY;

-- Public can validate promo codes (needed for checkout)
CREATE POLICY "Public can validate active promo codes" ON promo_code
    FOR SELECT USING (
        is_active = true AND
        (valid_from IS NULL OR valid_from <= NOW()) AND
        (valid_until IS NULL OR valid_until >= NOW())
    );

-- Brand owners can manage their promo codes
CREATE POLICY "Brand owners can manage their promo codes" ON promo_code
    FOR ALL USING (
        brand_id IN (
            SELECT id FROM brand WHERE created_by = auth.uid()
        )
    );

-- Admin can manage all promo codes
CREATE POLICY "Admin can manage promo codes" ON promo_code
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com',
            'admin@heiwa.house',
            'manager@heiwa.house'
        )
    );

-- Insert sample promo codes
INSERT INTO promo_code (brand_id, code, description, discount_type, discount_value, minimum_amount, valid_until) VALUES
((SELECT id FROM brand WHERE slug = 'heiwa-house'), 'SUMMER25', 'Summer 2025 discount', 'percentage', 10.00, 1000.00, '2025-08-31'),
((SELECT id FROM brand WHERE slug = 'heiwa-house'), 'EARLYBIRD', 'Book 60+ days in advance', 'percentage', 15.00, 1200.00, '2025-12-31'),
((SELECT id FROM brand WHERE slug = 'freedom-routes'), 'FREEDOM10', 'Freedom Routes member discount', 'fixed', 100.00, 800.00, '2025-12-31'),
((SELECT id FROM brand WHERE slug = 'freedom-routes'), 'GROUP4', '4+ people group discount', 'percentage', 20.00, 4000.00, '2025-12-31');

-- Enhance payments table with additional fields
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT UNIQUE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_fee DECIMAL(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method_details JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(10,2) DEFAULT 0.00;

-- Add check constraints for payments
ALTER TABLE payments ADD CONSTRAINT payments_refunded_valid
    CHECK (refunded_amount >= 0 AND refunded_amount <= amount);

-- Add partial index for active payments
CREATE INDEX idx_payments_active ON payments(booking_id, status) WHERE status NOT IN ('failed', 'cancelled');

-- Update RLS policies for payments (existing table, just ensuring proper policies)
-- Note: Existing policies should already cover the enhanced functionality

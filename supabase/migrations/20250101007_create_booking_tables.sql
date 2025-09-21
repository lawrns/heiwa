-- Create booking table with enhanced structure
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customer(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS camp_week_id UUID REFERENCES camp_week(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'paid', 'confirmed', 'cancelled', 'refunded', 'partial'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_in_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_out_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requests TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS promo_code_id UUID; -- Will reference promo_code table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00;

-- Create booking_bed junction table
CREATE TABLE booking_bed (
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    bed_id UUID REFERENCES bed(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (booking_id, bed_id)
);

-- Create booking_addon junction table
CREATE TABLE booking_addon (
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    addon_id UUID REFERENCES addon(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (booking_id, addon_id)
);

-- Add updated_at triggers
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_camp_week_id ON bookings(camp_week_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_promo_code_id ON bookings(promo_code_id);
CREATE INDEX idx_booking_bed_bed_id ON booking_bed(bed_id);
CREATE INDEX idx_booking_addon_addon_id ON booking_addon(addon_id);

-- Add RLS policies for bookings
-- Customers can view their own bookings
CREATE POLICY "Customers can view their own bookings" ON bookings
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create bookings" ON bookings
    FOR INSERT WITH CHECK (true); -- Allow booking creation during checkout

CREATE POLICY "Customers can update their draft bookings" ON bookings
    FOR UPDATE USING (
        customer_id = auth.uid() AND
        status = 'draft'
    );

-- Property owners can view bookings for their properties
CREATE POLICY "Property owners can view their property bookings" ON bookings
    FOR SELECT USING (
        camp_week_id IN (
            SELECT cw.id FROM camp_week cw
            JOIN property p ON cw.property_id = p.id
            WHERE p.owner_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM brand b WHERE p.brand_id = b.id AND b.created_by = auth.uid()
            )
        )
    );

-- Admin can manage all bookings
CREATE POLICY "Admin can manage all bookings" ON bookings
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com',
            'admin@heiwa.house',
            'manager@heiwa.house'
        )
    );

-- Add RLS policies for junction tables
ALTER TABLE booking_bed ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addon ENABLE ROW LEVEL SECURITY;

-- Customers can view their booking beds/addons
CREATE POLICY "Customers can view their booking beds" ON booking_bed
    FOR SELECT USING (
        booking_id IN (
            SELECT id FROM bookings WHERE customer_id = auth.uid()
        )
    );

CREATE POLICY "Customers can view their booking addons" ON booking_addon
    FOR SELECT USING (
        booking_id IN (
            SELECT id FROM bookings WHERE customer_id = auth.uid()
        )
    );

-- Property owners can view their property booking beds/addons
CREATE POLICY "Property owners can view their booking beds" ON booking_bed
    FOR SELECT USING (
        booking_id IN (
            SELECT b.id FROM bookings b
            JOIN camp_week cw ON b.camp_week_id = cw.id
            JOIN property p ON cw.property_id = p.id
            WHERE p.owner_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM brand br WHERE p.brand_id = br.id AND br.created_by = auth.uid()
            )
        )
    );

CREATE POLICY "Property owners can view their booking addons" ON booking_addon
    FOR SELECT USING (
        booking_id IN (
            SELECT b.id FROM bookings b
            JOIN camp_week cw ON b.camp_week_id = cw.id
            JOIN property p ON cw.property_id = p.id
            WHERE p.owner_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM brand br WHERE p.brand_id = br.id AND br.created_by = auth.uid()
            )
        )
    );

-- Admin can manage all junction table data
CREATE POLICY "Admin can manage booking beds" ON booking_bed
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com',
            'admin@heiwa.house',
            'manager@heiwa.house'
        )
    );

CREATE POLICY "Admin can manage booking addons" ON booking_addon
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com',
            'admin@heiwa.house',
            'manager@heiwa.house'
        )
    );

-- Add check constraints for data integrity
ALTER TABLE bookings ADD CONSTRAINT bookings_dates_valid
    CHECK (check_in_date IS NULL OR check_out_date IS NULL OR check_out_date > check_in_date);

ALTER TABLE bookings ADD CONSTRAINT bookings_discount_valid
    CHECK (discount_amount >= 0 AND discount_amount <= total_amount);

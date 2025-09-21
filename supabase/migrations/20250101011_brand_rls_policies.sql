-- Enhanced RLS policies for brand isolation and multi-tenancy
-- This migration enhances the existing basic RLS with proper brand-based access control

-- Update brand table policies for better multi-tenancy
-- (Existing policies are already in place from T005, but we can enhance them)

-- Create function to check if user owns a brand
CREATE OR REPLACE FUNCTION user_owns_brand(brand_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user created the brand
    RETURN EXISTS (
        SELECT 1 FROM brand
        WHERE id = brand_id
        AND created_by = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is brand admin
CREATE OR REPLACE FUNCTION is_brand_admin(brand_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is admin of the specified brand
    RETURN EXISTS (
        SELECT 1 FROM brand_admins
        WHERE brand_id = brand_id
        AND admin_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create brand_admins junction table for brand-specific admin access
CREATE TABLE brand_admins (
    brand_id UUID REFERENCES brand(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES admin(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'owner')),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (brand_id, admin_id)
);

-- Add RLS to brand_admins
ALTER TABLE brand_admins ENABLE ROW LEVEL SECURITY;

-- Brand owners and super admins can manage brand admins
CREATE POLICY "Brand owners and super admins can manage brand admins" ON brand_admins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM brand b
            WHERE b.id = brand_admins.brand_id
            AND b.created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM admin a
            WHERE a.id = auth.uid()
            AND a.role = 'super_admin'
        )
    );

-- Insert brand admin assignments
INSERT INTO brand_admins (brand_id, admin_id, role) VALUES
((SELECT id FROM brand WHERE slug = 'heiwa-house'), (SELECT id FROM admin WHERE email = 'admin@heiwa.house'), 'owner'),
((SELECT id FROM brand WHERE slug = 'freedom-routes'), (SELECT id FROM admin WHERE email = 'manager@heiwa.house'), 'owner');

-- Enhanced brand policies
DROP POLICY IF EXISTS "Admin can manage brands" ON brand;
CREATE POLICY "Brand owners and super admins can manage brands" ON brand
    FOR ALL USING (
        created_by = auth.uid() OR
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

-- Brand isolation for properties
DROP POLICY IF EXISTS "Property owners can manage their properties" ON property;
CREATE POLICY "Brand owners can manage their brand properties" ON property
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM brand b
            WHERE b.id = property.brand_id
            AND (
                b.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM brand_admins ba
                    WHERE ba.brand_id = b.id
                    AND ba.admin_id = auth.uid()
                )
            )
        ) OR
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

-- Brand isolation for camp weeks
DROP POLICY IF EXISTS "Property owners can manage their camp weeks" ON camp_week;
CREATE POLICY "Brand owners can manage their brand camp weeks" ON camp_week
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM camp_week cw
            JOIN property p ON cw.property_id = p.id
            JOIN brand b ON p.brand_id = b.id
            WHERE cw.id = camp_week.id
            AND (
                b.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM brand_admins ba
                    WHERE ba.brand_id = b.id
                    AND ba.admin_id = auth.uid()
                )
            )
        ) OR
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

-- Brand isolation for rooms
DROP POLICY IF EXISTS "Property owners can manage their rooms" ON room;
CREATE POLICY "Brand owners can manage their brand rooms" ON room
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM room r
            JOIN property p ON r.property_id = p.id
            JOIN brand b ON p.brand_id = b.id
            WHERE r.id = room.id
            AND (
                b.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM brand_admins ba
                    WHERE ba.brand_id = b.id
                    AND ba.admin_id = auth.uid()
                )
            )
        ) OR
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

-- Brand isolation for beds
DROP POLICY IF EXISTS "Property owners can manage their beds" ON bed;
CREATE POLICY "Brand owners can manage their brand beds" ON bed
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM bed b
            JOIN room r ON b.room_id = r.id
            JOIN property p ON r.property_id = p.id
            JOIN brand br ON p.brand_id = br.id
            WHERE b.id = bed.id
            AND (
                br.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM brand_admins ba
                    WHERE ba.brand_id = br.id
                    AND ba.admin_id = auth.uid()
                )
            )
        ) OR
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

-- Brand isolation for addons
DROP POLICY IF EXISTS "Property owners can manage their addons" ON addon;
CREATE POLICY "Brand owners can manage their brand addons" ON addon
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM addon a
            JOIN property p ON a.property_id = p.id
            JOIN brand b ON p.brand_id = b.id
            WHERE a.id = addon.id
            AND (
                b.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM brand_admins ba
                    WHERE ba.brand_id = b.id
                    AND ba.admin_id = auth.uid()
                )
            )
        ) OR
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

-- Brand isolation for promo codes
DROP POLICY IF EXISTS "Brand owners can manage their promo codes" ON promo_code;
CREATE POLICY "Brand owners can manage their brand promo codes" ON promo_code
    FOR ALL USING (
        brand_id IN (
            SELECT b.id FROM brand b
            WHERE b.created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM brand_admins ba
                WHERE ba.brand_id = b.id
                AND ba.admin_id = auth.uid()
            )
        ) OR
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

-- Add brand_id to existing tables that need brand isolation
-- Note: This would require data migration in a real scenario
-- For now, we'll work with the existing property-based isolation

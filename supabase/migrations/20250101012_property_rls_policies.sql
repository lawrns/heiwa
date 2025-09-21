-- Enhanced RLS policies for property ownership
-- This provides an additional layer of access control beyond brand-level permissions

-- Update property policies to include direct ownership
-- (Building on the brand isolation policies from T015)

-- Function to check if user directly owns a property
CREATE OR REPLACE FUNCTION user_owns_property(property_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM property
        WHERE id = property_id
        AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can manage a property (owner or brand admin)
CREATE OR REPLACE FUNCTION user_can_manage_property(property_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM property p
        LEFT JOIN brand b ON p.brand_id = b.id
        WHERE p.id = property_id
        AND (
            p.owner_id = auth.uid() OR
            b.created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM brand_admins ba
                WHERE ba.brand_id = b.id
                AND ba.admin_id = auth.uid()
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced property policies with ownership hierarchy
DROP POLICY IF EXISTS "Brand owners can manage their brand properties" ON property;
CREATE POLICY "Property owners and brand admins can manage properties" ON property
    FOR ALL USING (
        user_can_manage_property(id) OR
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

-- Property-level read access for public availability queries
-- (Already exists from T006, but ensuring it's properly scoped)

-- Camp week ownership policies
DROP POLICY IF EXISTS "Brand owners can manage their brand camp weeks" ON camp_week;
CREATE POLICY "Property owners and brand admins can manage camp weeks" ON camp_week
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM camp_week cw
            JOIN property p ON cw.property_id = p.id
            WHERE cw.id = camp_week.id
            AND user_can_manage_property(p.id)
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

-- Room ownership policies
DROP POLICY IF EXISTS "Brand owners can manage their brand rooms" ON room;
CREATE POLICY "Property owners and brand admins can manage rooms" ON room
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM room r
            JOIN property p ON r.property_id = p.id
            WHERE r.id = room.id
            AND user_can_manage_property(p.id)
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

-- Bed ownership policies
DROP POLICY IF EXISTS "Brand owners can manage their brand beds" ON bed;
CREATE POLICY "Property owners and brand admins can manage beds" ON bed
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM bed b
            JOIN room r ON b.room_id = r.id
            JOIN property p ON r.property_id = p.id
            WHERE b.id = bed.id
            AND user_can_manage_property(p.id)
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

-- Addon ownership policies
DROP POLICY IF EXISTS "Brand owners can manage their brand addons" ON addon;
CREATE POLICY "Property owners and brand admins can manage addons" ON addon
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM addon a
            JOIN property p ON a.property_id = p.id
            WHERE a.id = addon.id
            AND user_can_manage_property(p.id)
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

-- Enhanced owner table policies
-- Allow property owners to update their own information
CREATE POLICY "Property owners can update their own info" ON owner
    FOR UPDATE USING (auth.uid() = id);

-- Allow brand admins to view owners of their brands
CREATE POLICY "Brand admins can view their brand owners" ON owner
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM property p
            JOIN brand b ON p.brand_id = b.id
            WHERE p.owner_id = owner.id
            AND (
                b.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM brand_admins ba
                    WHERE ba.brand_id = b.id
                    AND ba.admin_id = auth.uid()
                )
            )
        )
    );

-- Create ownership hierarchy view for reporting
CREATE VIEW property_ownership_hierarchy AS
SELECT
    p.id as property_id,
    p.name as property_name,
    p.brand_id,
    b.name as brand_name,
    b.slug as brand_slug,
    p.owner_id,
    o.first_name || ' ' || o.last_name as owner_name,
    o.email as owner_email,
    o.company_name
FROM property p
JOIN brand b ON p.brand_id = b.id
LEFT JOIN owner o ON p.owner_id = o.id
WHERE p.is_active = true;

-- Add RLS to the view
ALTER VIEW property_ownership_hierarchy SET (security_barrier = true);

-- Only admins and brand owners can see the ownership hierarchy
CREATE POLICY "Authorized users can view ownership hierarchy" ON property_ownership_hierarchy
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin a
            WHERE a.id = auth.uid()
            AND a.role IN ('admin', 'super_admin')
        ) OR
        EXISTS (
            SELECT 1 FROM brand b
            WHERE b.id = property_ownership_hierarchy.brand_id
            AND (
                b.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM brand_admins ba
                    WHERE ba.brand_id = b.id
                    AND ba.admin_id = auth.uid()
                )
            )
        ) OR
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com'
        )
    );

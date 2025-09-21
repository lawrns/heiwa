-- Create addon table for additional services and items
CREATE TABLE addon (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('equipment', 'service', 'food', 'transport', 'accommodation', 'other')),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    is_required BOOLEAN DEFAULT false,
    max_quantity INTEGER CHECK (max_quantity > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validation constraints
    CONSTRAINT addon_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT addon_max_quantity_positive CHECK (max_quantity IS NULL OR max_quantity > 0)
);

-- Add updated_at trigger
CREATE TRIGGER update_addon_updated_at
    BEFORE UPDATE ON addon
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_addon_property_id ON addon(property_id);
CREATE INDEX idx_addon_category ON addon(category);
CREATE INDEX idx_addon_active ON addon(is_active);
CREATE INDEX idx_addon_required ON addon(is_required) WHERE is_active = true;

-- Add RLS policies
ALTER TABLE addon ENABLE ROW LEVEL SECURITY;

-- Public read access for active addons (needed for booking process)
CREATE POLICY "Public can view active addons" ON addon
    FOR SELECT USING (is_active = true);

-- Property owners can manage their addons
CREATE POLICY "Property owners can manage their addons" ON addon
    FOR ALL USING (
        property_id IN (
            SELECT id FROM property WHERE owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM property p
            JOIN brand b ON p.brand_id = b.id
            WHERE p.id = addon.property_id
            AND b.created_by = auth.uid()
        )
    );

-- Admin can manage all addons
CREATE POLICY "Admin can manage addons" ON addon
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com',
            'admin@heiwa.house',
            'manager@heiwa.house'
        )
    );

-- Insert sample addon data
-- Puerto Escondido Surf Camp addons
INSERT INTO addon (property_id, name, description, category, price, max_quantity) VALUES
((SELECT id FROM property WHERE name = 'Puerto Escondido Surf Camp'), 'Surfboard Rental', 'High-quality surfboard rental for the week', 'equipment', 150.00, 1),
((SELECT id FROM property WHERE name = 'Puerto Escondido Surf Camp'), 'Private Surf Lesson', '1-hour private surf lesson with professional instructor', 'service', 80.00, 7),
((SELECT id FROM property WHERE name = 'Puerto Escondido Surf Camp'), 'Airport Transfer', 'Round-trip airport transfer from Puerto Escondido International', 'transport', 45.00, 1),
((SELECT id FROM property WHERE name = 'Puerto Escondido Surf Camp'), 'Vegetarian Meal Plan', 'Nutritious vegetarian meals for the entire week', 'food', 200.00, 1),
((SELECT id FROM property WHERE name = 'Puerto Escondido Surf Camp'), 'Wetsuit Rental', 'Thermal wetsuit rental for cooler water', 'equipment', 25.00, 1);

-- Sayulita Freedom Camp addons
INSERT INTO addon (property_id, name, description, category, price, max_quantity) VALUES
((SELECT id FROM property WHERE name = 'Sayulita Freedom Camp'), 'Surfboard Rental', 'Quality surfboard rental for beginners', 'equipment', 100.00, 1),
((SELECT id FROM property WHERE name = 'Sayulita Freedom Camp'), 'Group Surf Lesson', 'Group surf lesson with experienced instructor', 'service', 40.00, 7),
((SELECT id FROM property WHERE name = 'Sayulita Freedom Camp'), 'Van Transfer from PV', 'Shared van transfer from Puerto Vallarta airport', 'transport', 60.00, 1),
((SELECT id FROM property WHERE name = 'Sayulita Freedom Camp'), 'Local Food Experience', 'Authentic Mexican home-cooked meals', 'food', 150.00, 1),
((SELECT id FROM property WHERE name = 'Sayulita Freedom Camp'), 'Yoga Session', 'Daily yoga sessions focusing on surf-specific poses', 'service', 30.00, 7);

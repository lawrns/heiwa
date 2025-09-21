-- Create property table for surf camp locations
CREATE TABLE property (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brand(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    location JSONB NOT NULL,
    contact_info JSONB NOT NULL DEFAULT '{}',
    owner_id UUID, -- References admin/owner (to be created later)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validation constraints
    CONSTRAINT property_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT property_location_valid CHECK (
        location ? 'address' AND
        location ? 'city' AND
        location ? 'country' AND
        location ? 'coordinates' AND
        jsonb_typeof(location->'coordinates') = 'array' AND
        jsonb_array_length(location->'coordinates') = 2
    ),
    CONSTRAINT property_contact_valid CHECK (
        contact_info ? 'email' OR contact_info ? 'phone'
    )
);

-- Add updated_at trigger
CREATE TRIGGER update_property_updated_at
    BEFORE UPDATE ON property
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_property_brand_id ON property(brand_id);
CREATE INDEX idx_property_owner_id ON property(owner_id);
CREATE INDEX idx_property_active ON property(is_active);
CREATE INDEX idx_property_location_city ON property((location->>'city'));
CREATE INDEX idx_property_location_country ON property((location->>'country'));

-- Add RLS policies
ALTER TABLE property ENABLE ROW LEVEL SECURITY;

-- Public read access for active properties (needed for availability search)
CREATE POLICY "Public can view active properties" ON property
    FOR SELECT USING (is_active = true);

-- Brand owners can view their brand's properties
CREATE POLICY "Brand owners can view their properties" ON property
    FOR SELECT USING (
        owner_id = auth.uid() OR
        brand_id IN (
            SELECT id FROM brand WHERE created_by = auth.uid()
        )
    );

-- Admin can manage all properties
CREATE POLICY "Admin can manage properties" ON property
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com',
            'admin@heiwa.house',
            'manager@heiwa.house'
        )
    );

-- Insert sample property data
INSERT INTO property (brand_id, name, description, location, contact_info, is_active) VALUES
((SELECT id FROM brand WHERE slug = 'heiwa-house'), 'Puerto Escondido Surf Camp', 'Premium surf camp in the heart of Puerto Escondido with world-class waves and luxury accommodations', '{
  "address": "Laguna de Manialtepec, Puerto Escondido",
  "city": "Puerto Escondido",
  "state": "Oaxaca",
  "country": "Mexico",
  "postal_code": "71983",
  "coordinates": [-97.0675, 15.8656],
  "timezone": "America/Mexico_City"
}', '{
  "email": "bookings@heiwa.house",
  "phone": "+52 954 123 4567",
  "website": "https://heiwa.house/puerto-escondido"
}', true),
((SELECT id FROM brand WHERE slug = 'freedom-routes'), 'Sayulita Freedom Camp', 'Adventure surf camp in the beautiful town of Sayulita with authentic Mexican culture and perfect beginner waves', '{
  "address": "Centro, Sayulita",
  "city": "Sayulita",
  "state": "Nayarit",
  "country": "Mexico",
  "postal_code": "63734",
  "coordinates": [-105.4358, 20.8689],
  "timezone": "America/Mexico_City"
}', '{
  "email": "info@freedomroutes.com",
  "phone": "+52 327 123 4567",
  "website": "https://freedomroutes.com/sayulita"
}', true);

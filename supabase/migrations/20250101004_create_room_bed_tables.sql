-- Create room table for accommodation units
CREATE TABLE room (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    room_type TEXT NOT NULL CHECK (room_type IN ('dorm', 'private', 'suite')),
    max_occupancy INTEGER NOT NULL CHECK (max_occupancy > 0),
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validation constraints
    CONSTRAINT room_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT room_max_occupancy_positive CHECK (max_occupancy > 0)
);

-- Create bed table for individual sleeping spaces
CREATE TABLE bed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES room(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bed_type TEXT NOT NULL CHECK (bed_type IN ('single', 'bunk', 'double')),
    price_modifier DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validation constraints
    CONSTRAINT bed_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Add updated_at triggers
CREATE TRIGGER update_room_updated_at
    BEFORE UPDATE ON room
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bed_updated_at
    BEFORE UPDATE ON bed
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_room_property_id ON room(property_id);
CREATE INDEX idx_room_type ON room(room_type);
CREATE INDEX idx_room_active ON room(is_active);
CREATE INDEX idx_bed_room_id ON bed(room_id);
CREATE INDEX idx_bed_active ON bed(is_active);

-- Add RLS policies for room
ALTER TABLE room ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active rooms" ON room
    FOR SELECT USING (is_active = true);

CREATE POLICY "Property owners can manage their rooms" ON room
    FOR ALL USING (
        property_id IN (
            SELECT id FROM property WHERE owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM property p
            JOIN brand b ON p.brand_id = b.id
            WHERE p.id = room.property_id
            AND b.created_by = auth.uid()
        )
    );

CREATE POLICY "Admin can manage rooms" ON room
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com',
            'admin@heiwa.house',
            'manager@heiwa.house'
        )
    );

-- Add RLS policies for bed
ALTER TABLE bed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active beds" ON bed
    FOR SELECT USING (
        is_active = true AND
        room_id IN (SELECT id FROM room WHERE is_active = true)
    );

CREATE POLICY "Property owners can manage their beds" ON bed
    FOR ALL USING (
        room_id IN (
            SELECT r.id FROM room r
            JOIN property p ON r.property_id = p.id
            WHERE p.owner_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM brand b WHERE p.brand_id = b.id AND b.created_by = auth.uid()
            )
        )
    );

CREATE POLICY "Admin can manage beds" ON bed
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com',
            'admin@heiwa.house',
            'manager@heiwa.house'
        )
    );

-- Insert sample room and bed data
-- Puerto Escondido Surf Camp rooms
INSERT INTO room (property_id, name, description, room_type, max_occupancy, base_price) VALUES
((SELECT id FROM property WHERE name = 'Puerto Escondido Surf Camp'), 'Ocean View Dorm', 'Shared dormitory with stunning ocean views', 'dorm', 6, 180.00),
((SELECT id FROM property WHERE name = 'Puerto Escondido Surf Camp'), 'Premium Private Room', 'Private room with balcony and ocean view', 'private', 2, 350.00),
((SELECT id FROM property WHERE name = 'Puerto Escondido Surf Camp'), 'Luxury Suite', 'Spacious suite with king bed and private terrace', 'suite', 2, 500.00);

-- Sayulita Freedom Camp rooms
INSERT INTO room (property_id, name, description, room_type, max_occupancy, base_price) VALUES
((SELECT id FROM property WHERE name = 'Sayulita Freedom Camp'), 'Beach Dorm', 'Basic shared dormitory close to the beach', 'dorm', 8, 120.00),
((SELECT id FROM property WHERE name = 'Sayulita Freedom Camp'), 'Garden Private', 'Cozy private room overlooking the garden', 'private', 2, 220.00);

-- Insert beds for Ocean View Dorm
INSERT INTO bed (room_id, name, bed_type) VALUES
((SELECT id FROM room WHERE name = 'Ocean View Dorm'), 'Top Bunk A1', 'bunk'),
((SELECT id FROM room WHERE name = 'Ocean View Dorm'), 'Bottom Bunk A1', 'bunk'),
((SELECT id FROM room WHERE name = 'Ocean View Dorm'), 'Top Bunk A2', 'bunk'),
((SELECT id FROM room WHERE name = 'Ocean View Dorm'), 'Bottom Bunk A2', 'bunk'),
((SELECT id FROM room WHERE name = 'Ocean View Dorm'), 'Top Bunk A3', 'bunk'),
((SELECT id FROM room WHERE name = 'Ocean View Dorm'), 'Bottom Bunk A3', 'bunk');

-- Insert beds for Premium Private Room
INSERT INTO bed (room_id, name, bed_type, price_modifier) VALUES
((SELECT id FROM room WHERE name = 'Premium Private Room'), 'Queen Bed', 'double', 50.00);

-- Insert beds for Luxury Suite
INSERT INTO bed (room_id, name, bed_type, price_modifier) VALUES
((SELECT id FROM room WHERE name = 'Luxury Suite'), 'King Bed', 'double', 100.00);

-- Insert beds for Beach Dorm
INSERT INTO bed (room_id, name, bed_type) VALUES
((SELECT id FROM room WHERE name = 'Beach Dorm'), 'Bunk 1 Top', 'bunk'),
((SELECT id FROM room WHERE name = 'Beach Dorm'), 'Bunk 1 Bottom', 'bunk'),
((SELECT id FROM room WHERE name = 'Beach Dorm'), 'Bunk 2 Top', 'bunk'),
((SELECT id FROM room WHERE name = 'Beach Dorm'), 'Bunk 2 Bottom', 'bunk'),
((SELECT id FROM room WHERE name = 'Beach Dorm'), 'Bunk 3 Top', 'bunk'),
((SELECT id FROM room WHERE name = 'Beach Dorm'), 'Bunk 3 Bottom', 'bunk'),
((SELECT id FROM room WHERE name = 'Beach Dorm'), 'Bunk 4 Top', 'bunk'),
((SELECT id FROM room WHERE name = 'Beach Dorm'), 'Bunk 4 Bottom', 'bunk');

-- Insert beds for Garden Private
INSERT INTO bed (room_id, name, bed_type, price_modifier) VALUES
((SELECT id FROM room WHERE name = 'Garden Private'), 'Full Bed', 'double', 20.00);

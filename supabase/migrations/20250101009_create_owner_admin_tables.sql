-- Create owner table for property operators
CREATE TABLE owner (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validation constraints
    CONSTRAINT owner_email_valid CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT owner_first_name_not_empty CHECK (length(trim(first_name)) > 0),
    CONSTRAINT owner_last_name_not_empty CHECK (length(trim(last_name)) > 0)
);

-- Create admin table for platform administrators
CREATE TABLE admin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validation constraints
    CONSTRAINT admin_email_valid CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT admin_first_name_not_empty CHECK (length(trim(first_name)) > 0),
    CONSTRAINT admin_last_name_not_empty CHECK (length(trim(last_name)) > 0)
);

-- Add updated_at triggers
CREATE TRIGGER update_owner_updated_at
    BEFORE UPDATE ON owner
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_updated_at
    BEFORE UPDATE ON admin
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_owner_email ON owner(email);
CREATE INDEX idx_owner_active ON owner(is_active);
CREATE INDEX idx_admin_email ON admin(email);
CREATE INDEX idx_admin_role ON admin(role);
CREATE INDEX idx_admin_active ON admin(is_active);

-- Add foreign key relationships (now that tables exist)
ALTER TABLE property ADD CONSTRAINT fk_property_owner
    FOREIGN KEY (owner_id) REFERENCES owner(id);

-- Add RLS policies for owner
ALTER TABLE owner ENABLE ROW LEVEL SECURITY;

-- Owners can view and update their own data
CREATE POLICY "Owners can view their own data" ON owner
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Owners can update their own data" ON owner
    FOR UPDATE USING (auth.uid() = id);

-- Admin can view all owners
CREATE POLICY "Admin can view all owners" ON owner
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com',
            'admin@heiwa.house',
            'manager@heiwa.house'
        )
    );

-- Allow owner creation (admin only)
CREATE POLICY "Admin can create owners" ON owner
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com',
            'admin@heiwa.house',
            'manager@heiwa.house'
        )
    );

-- Add RLS policies for admin
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;

-- Admins can view their own data
CREATE POLICY "Admins can view their own data" ON admin
    FOR SELECT USING (auth.uid() = id);

-- Super admins can manage all admins
CREATE POLICY "Super admin can manage all admins" ON admin
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com'
        ) OR
        role = 'super_admin'
    );

-- Insert sample owner data
INSERT INTO owner (email, first_name, last_name, company_name) VALUES
('carlos@heiwa.house', 'Carlos', 'Rodriguez', 'Heiwa House Operations'),
('maria@freedomroutes.com', 'Maria', 'Gonzalez', 'Freedom Routes LLC');

-- Update property ownership
UPDATE property SET owner_id = (SELECT id FROM owner WHERE email = 'carlos@heiwa.house')
WHERE name = 'Puerto Escondido Surf Camp';

UPDATE property SET owner_id = (SELECT id FROM owner WHERE email = 'maria@freedomroutes.com')
WHERE name = 'Sayulita Freedom Camp';

-- Insert sample admin data
INSERT INTO admin (email, first_name, last_name, role) VALUES
('julian@fyves.com', 'Julian', 'Developer', 'super_admin'),
('julianmjavierm@gmail.com', 'Julian', 'Admin', 'super_admin'),
('admin@heiwa.house', 'Admin', 'User', 'admin'),
('manager@heiwa.house', 'Manager', 'User', 'admin');

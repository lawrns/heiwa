-- Create customer table for WordPress widget users
CREATE TABLE customer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    emergency_contact JSONB,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validation constraints
    CONSTRAINT customer_email_valid CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT customer_first_name_not_empty CHECK (length(trim(first_name)) > 0),
    CONSTRAINT customer_last_name_not_empty CHECK (length(trim(last_name)) > 0),
    CONSTRAINT customer_phone_valid CHECK (
        phone IS NULL OR
        phone ~ '^\+?[1-9]\d{1,14}$'
    ),
    CONSTRAINT customer_emergency_contact_valid CHECK (
        emergency_contact IS NULL OR (
            emergency_contact ? 'name' AND
            emergency_contact ? 'phone'
        )
    )
);

-- Add updated_at trigger
CREATE TRIGGER update_customer_updated_at
    BEFORE UPDATE ON customer
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_customer_email ON customer(email);
CREATE UNIQUE INDEX idx_customer_email_unique ON customer(lower(email));
CREATE INDEX idx_customer_created_at ON customer(created_at);

-- Add RLS policies
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;

-- Customers can only see and update their own data
CREATE POLICY "Customers can view their own data" ON customer
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Customers can update their own data" ON customer
    FOR UPDATE USING (auth.uid() = id);

-- Admin can view all customer data (for support purposes)
CREATE POLICY "Admin can view all customers" ON customer
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com',
            'admin@heiwa.house',
            'manager@heiwa.house'
        )
    );

-- Allow customer creation during booking process (public access with proper validation)
CREATE POLICY "Allow customer creation" ON customer
    FOR INSERT WITH CHECK (true);

-- Note: No public read access - customers should only see their own data
-- This prevents privacy violations and PII exposure

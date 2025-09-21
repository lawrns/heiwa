-- Create brand table for multi-brand support
CREATE TABLE brand (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    theme_config JSONB NOT NULL DEFAULT '{}',
    api_config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validation constraints
    CONSTRAINT brand_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT brand_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT brand_slug_not_empty CHECK (length(trim(slug)) > 0)
);

-- Add updated_at trigger
CREATE TRIGGER update_brand_updated_at
    BEFORE UPDATE ON brand
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_brand_slug ON brand(slug) WHERE is_active = true;
CREATE INDEX idx_brand_active ON brand(is_active);

-- Add RLS policies
ALTER TABLE brand ENABLE ROW LEVEL SECURITY;

-- Allow public read access for brand information (needed for widget theming)
CREATE POLICY "Public can view active brands" ON brand
    FOR SELECT USING (is_active = true);

-- Admin can manage all brands
CREATE POLICY "Admin can manage brands" ON brand
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'julian@fyves.com',
            'julianmjavierm@gmail.com',
            'admin@heiwa.house',
            'manager@heiwa.house'
        )
    );

-- Insert initial brand data
INSERT INTO brand (name, slug, theme_config, api_config, is_active) VALUES
('Heiwa House', 'heiwa-house', '{
  "primary_color": "#2563eb",
  "secondary_color": "#64748b",
  "accent_color": "#f59e0b",
  "font_family": "Inter, sans-serif",
  "border_radius": "8px"
}', '{
  "stripe_publishable_key": "pk_test_heiwa_house_key",
  "api_base_url": "https://api.heiwa.house"
}', true),
('Freedom Routes', 'freedom-routes', '{
  "primary_color": "#059669",
  "secondary_color": "#6b7280",
  "accent_color": "#dc2626",
  "font_family": "Roboto, sans-serif",
  "border_radius": "6px"
}', '{
  "stripe_publishable_key": "pk_test_freedom_routes_key",
  "api_base_url": "https://api.freedomroutes.com"
}', true);

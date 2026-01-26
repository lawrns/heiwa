-- CMS Content Tables Migration
-- Creates comprehensive tables for managing all website content
-- Excludes database-connected content (rooms, bookings, surf camps, clients)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Homepage Sections Table
-- Manages all homepage content sections (hero, activities, testimonials, CTA)
CREATE TABLE IF NOT EXISTS homepage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN ('hero', 'activities_around', 'what_we_are_about', 'testimonials', 'cta')),
    title TEXT,
    subtitle TEXT,
    description TEXT,
    content JSONB DEFAULT '{}',
    video_url VARCHAR(500),
    background_image VARCHAR(500),
    link_url VARCHAR(500),
    link_text VARCHAR(200),
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page Content Table
-- Manages content for individual pages (Flow, Play, Surf, The Spot, Privacy, Terms)
CREATE TABLE IF NOT EXISTS page_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_slug VARCHAR(50) NOT NULL CHECK (page_slug IN ('flow', 'play', 'surf', 'the-spot', 'privacy', 'terms')),
    section VARCHAR(50) NOT NULL CHECK (section IN ('hero', 'intro', 'faq', 'features', 'seo')),
    title TEXT,
    content TEXT,
    video_url VARCHAR(500),
    image_url VARCHAR(500),
    json_content JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_slug, section)
);

-- Testimonials Table
-- Manages testimonials across the site
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name VARCHAR(200) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    image_url VARCHAR(500),
    verified BOOLEAN DEFAULT false,
    time_ago VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Items Table
-- Manages FAQ items for different pages
CREATE TABLE IF NOT EXISTS faq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_slug VARCHAR(50) NOT NULL CHECK (page_slug IN ('flow', 'play', 'surf', 'the-spot', 'general')),
    category VARCHAR(100) DEFAULT 'general',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Library Table
-- Centralized media management
CREATE TABLE IF NOT EXISTS media_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
    file_size BIGINT,
    supabase_path VARCHAR(500) NOT NULL,
    public_url VARCHAR(500),
    alt_text TEXT,
    tags JSONB DEFAULT '[]',
    category VARCHAR(100) DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CTA Buttons Table
-- Manages call-to-action buttons across the site
CREATE TABLE IF NOT EXISTS cta_buttons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location VARCHAR(100) NOT NULL,
    text VARCHAR(200) NOT NULL,
    link VARCHAR(500) NOT NULL,
    style VARCHAR(20) DEFAULT 'primary' CHECK (style IN ('primary', 'secondary', 'outline')),
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Log Table
-- Tracks all content changes for audit trail
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    old_values JSONB,
    new_values JSONB,
    user_id VARCHAR(100),
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_homepage_sections_type ON homepage_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON homepage_sections(order_index);

CREATE INDEX IF NOT EXISTS idx_page_content_slug ON page_content(page_slug);
CREATE INDEX IF NOT EXISTS idx_page_content_section ON page_content(section);
CREATE INDEX IF NOT EXISTS idx_page_content_active ON page_content(is_active);

CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON testimonials(order_index);

CREATE INDEX IF NOT EXISTS idx_faq_items_page ON faq_items(page_slug);
CREATE INDEX IF NOT EXISTS idx_faq_items_category ON faq_items(category);
CREATE INDEX IF NOT EXISTS idx_faq_items_active ON faq_items(is_active);

CREATE INDEX IF NOT EXISTS idx_media_library_type ON media_library(file_type);
CREATE INDEX IF NOT EXISTS idx_media_library_category ON media_library(category);
CREATE INDEX IF NOT EXISTS idx_media_library_tags ON media_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_library_active ON media_library(is_active);

CREATE INDEX IF NOT EXISTS idx_cta_buttons_location ON cta_buttons(location);
CREATE INDEX IF NOT EXISTS idx_cta_buttons_active ON cta_buttons(is_active);

CREATE INDEX IF NOT EXISTS idx_activity_log_table ON activity_log(table_name);
CREATE INDEX IF NOT EXISTS idx_activity_log_record ON activity_log(record_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_homepage_sections_updated_at BEFORE UPDATE ON homepage_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_content_updated_at BEFORE UPDATE ON page_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faq_items_updated_at BEFORE UPDATE ON faq_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_library_updated_at BEFORE UPDATE ON media_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cta_buttons_updated_at BEFORE UPDATE ON cta_buttons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create activity log trigger function
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO activity_log (table_name, record_id, action, old_values)
        VALUES (TG_TABLE_NAME, OLD.id, 'delete', row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO activity_log (table_name, record_id, action, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'update', row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO activity_log (table_name, record_id, action, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'create', row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create activity log triggers
CREATE TRIGGER log_homepage_sections_activity AFTER INSERT OR UPDATE OR DELETE ON homepage_sections FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_page_content_activity AFTER INSERT OR UPDATE OR DELETE ON page_content FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_testimonials_activity AFTER INSERT OR UPDATE OR DELETE ON testimonials FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_faq_items_activity AFTER INSERT OR UPDATE OR DELETE ON faq_items FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_media_library_activity AFTER INSERT OR UPDATE OR DELETE ON media_library FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_cta_buttons_activity AFTER INSERT OR UPDATE OR DELETE ON cta_buttons FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Insert default homepage content
INSERT INTO homepage_sections (section_type, title, subtitle, description, content, video_url, link_url, link_text, order_index) VALUES
('hero', 'Welcome to Heiwa House', 'Your surf and lifestyle destination in Santa Cruz, Portugal', 'Experience the ultimate surf camp with professional instructors, yoga, amazing food, day trips, and unforgettable memories', '{"video_id": "9nhQiKGsgHg"}', '/surf-weeks', 'Explore surf weeks', 1),
('activities_around', 'Activities Around', 'Discover endless adventures and experiences', 'From surfing to yoga, skateboarding to relaxation, we offer something for everyone', '{"activities": [{"title": "Surf Lessons", "desc": "Learn to ride the waves with professional instructors", "img": "/optimized/photography_001_dji_0098-scaled.webp"}, {"title": "Go Karts", "desc": "Feel the adrenaline rush on our local tracks", "img": "/optimized/photography_002_dsc01794.webp"}]}', NULL, NULL, NULL, 2),
('what_we_are_about', 'What we are about', 'Experience the perfect blend of surf, yoga, and coastal living', 'Discover our unique offerings that make Heiwa House the ultimate destination', '{"cards": [{"title": "Heiwa Play", "desc": "Explore activities and experiences around our location", "img": "/optimized/photography_009_dsc03491.webp", "link": "/play"}, {"title": "Heiwa Surf", "desc": "Discover the best surfing spots and conditions", "img": "/images/hh1.webp", "link": "/surf"}, {"title": "Heiwa Flow", "desc": "Wellness, yoga, and mindfulness experiences", "img": "/images/hh2.webp", "link": "/flow"}]}', NULL, NULL, NULL, 3),
('testimonials', 'What Our Guests Say', 'Real experiences from real people', 'Read about the transformative experiences our guests have had at Heiwa House', '{"testimonials": []}', NULL, NULL, NULL, 4),
('cta', 'Ready for Your Adventure?', 'Book your stay and start your journey', 'Don''t wait - limited spots available for the upcoming season', '{}', '/booking', 'Book Now', 5)
ON CONFLICT DO NOTHING;

-- Insert default page content for Flow page
INSERT INTO page_content (page_slug, section, title, content, json_content) VALUES
('flow', 'hero', 'Heiwa Flow', 'Find your flow at Heiwa House with yoga, massage, ice bath, sauna, and wellness services. Experience ultimate relaxation and rejuvenation in Portugal.', '{"video_url": "/images/videos/flow-wellness.mp4", "image_url": "/images/yoga_dome3.jpg"}'),
('flow', 'intro', 'Discover Your Flow', 'Heiwa Flow is your gateway to deeper wellness and self-discovery. Through ancient practices and modern therapies, we help you find balance, reduce stress, and connect with your true self. Whether you''re seeking physical recovery, mental clarity, or spiritual growth, our flow services provide the perfect complement to your active surf lifestyle.', '{}'),
('flow', 'faq', 'Frequently Asked Questions', 'Find answers to common questions about our wellness services', '{"faqs": []}')
ON CONFLICT (page_slug, section) DO NOTHING;

-- Insert default page content for Play page
INSERT INTO page_content (page_slug, section, title, content, json_content) VALUES
('play', 'hero', 'Heiwa Play', 'Discover endless fun at Heiwa Play! Enjoy table games, sauna & ice bath, giant pool, gym, bicycles, and more exciting activities in Santa Cruz, Portugal.', '{"video_url": "/images/videos/play-activities.mp4", "image_url": "/images/activities/pool.jpg"}'),
('play', 'intro', 'Play Your Way', 'Heiwa Play offers a diverse range of activities designed to entertain and energize. From competitive table games to relaxing sauna sessions, from refreshing pool time to energizing gym workouts, there''s something for every mood and preference. Our facilities are designed to complement your surf experience and ensure you never have a dull moment.', '{}'),
('play', 'faq', 'Frequently Asked Questions', 'Find answers to common questions about our activities and facilities', '{"faqs": []}')
ON CONFLICT (page_slug, section) DO NOTHING;

-- Insert default page content for Surf page
INSERT INTO page_content (page_slug, section, title, content, json_content) VALUES
('surf', 'hero', 'Heiwa Surf', 'Discover the ultimate surf experience at Heiwa House. Professional instruction, pristine beaches, and unforgettable memories await you in Santa Cruz, Portugal.', '{"video_url": "/images/videos/surf-experience.mp4", "image_url": "/images/surf/surf-hero.jpg"}'),
('surf', 'intro', 'Ride the Waves', 'Heiwa Surf offers world-class surfing instruction for all levels, from beginners to advanced surfers. Our experienced instructors know the local breaks inside and out, ensuring you get the best waves for your skill level. With top-quality equipment, personalized coaching, and the stunning backdrop of the Portuguese coast, your surf journey starts here.', '{}'),
('surf', 'faq', 'Frequently Asked Questions', 'Find answers to common questions about our surf programs and instruction', '{"faqs": []}')
ON CONFLICT (page_slug, section) DO NOTHING;

-- Insert default testimonials
INSERT INTO testimonials (author_name, rating, text, image_url, verified, time_ago, order_index) VALUES
('Jesús MR', 5, 'Amazing experience at Heiwa House! The surf lessons were incredible and the yoga sessions were perfect for recovery.', NULL, true, '6 days ago', 1),
('Ernesto Guevara', 5, 'Best surf camp I''ve ever been to. The instructors are professional and the atmosphere is amazing.', NULL, true, '1 week ago', 2),
('John Z', 5, 'Heiwa House exceeded all my expectations. The facilities are top-notch and the food is delicious.', NULL, true, '2 weeks ago', 3),
('Paul Egan', 5, 'Perfect place to learn surfing and meet like-minded people. Highly recommended!', NULL, true, '3 weeks ago', 4)
ON CONFLICT DO NOTHING;

-- Insert default FAQ items
INSERT INTO faq_items (page_slug, category, question, answer, order_index) VALUES
('flow', 'general', 'Are the wellness services included in the surf week package?', 'Yes! Most of our wellness services including yoga sessions, sauna access, and meditation are included in your surf week stay. Some specialized services like private massage therapy may have additional costs.', 1),
('flow', 'general', 'Do I need to bring my own equipment for yoga?', 'No need to bring equipment! We provide all necessary yoga mats, props, and equipment. Our yoga dome is fully equipped with everything you need for a comfortable practice.', 2),
('flow', 'general', 'What are the yoga and wellness session times?', 'Yoga sessions are typically held in the morning (sunrise yoga) and evening (sunset yoga). Sauna and ice bath sessions are usually scheduled in the evening. Specific times may vary based on weather and season.', 3),
('play', 'general', 'Are the play activities included in the surf week package?', 'Yes! Most of our play activities including table games, skatepark access, pool usage, and gym facilities are included in your surf week stay. Some activities like bicycle rental may have additional costs.', 4),
('play', 'general', 'Do I need to bring my own equipment for activities?', 'No need to bring equipment! We provide all necessary gear for table games, skateboarding, and gym activities. For bicycles, we offer rentals with locks and board racks included.', 5),
('surf', 'general', 'What level of surfing experience do I need?', 'We welcome all levels! Our instructors can accommodate complete beginners to advanced surfers. We assess your skill level on day one and place you in appropriate groups with personalized instruction.', 6),
('surf', 'general', 'What equipment is provided?', 'We provide high-quality surfboards, wetsuits, and all necessary safety equipment. Our equipment is regularly maintained and suitable for different wave conditions and skill levels.', 7),
('general', 'booking', 'How do I book a surf week?', 'You can book directly through our website using the booking widget, or contact us directly. We recommend booking in advance as spots fill up quickly, especially during peak season.', 8),
('general', 'booking', 'What is the cancellation policy?', 'We offer flexible cancellation policies. Cancellations made 30+ days before arrival receive a full refund. Cancellations made 15-29 days before receive a 50% refund. Cancellations made less than 15 days before are non-refundable.', 9),
('general', 'facilities', 'What accommodation options are available?', 'We offer private rooms, shared rooms, and dormitory-style accommodations. All rooms include access to shared facilities including kitchen, living areas, and outdoor spaces.', 10)
ON CONFLICT DO NOTHING;

-- Insert default CTA buttons
INSERT INTO cta_buttons (location, text, link, style, order_index) VALUES
('homepage_hero_primary', 'Explore Surf Weeks', '/surf-weeks', 'primary', 1),
('homepage_hero_secondary', 'Rent a Room', '/rooms', 'secondary', 2),
('homepage_cta', 'Book Your Adventure', '/booking', 'primary', 1),
('flow_hero', 'Discover Wellness', '/flow', 'primary', 1),
('play_hero', 'Start Playing', '/play', 'primary', 1),
('surf_hero', 'Learn to Surf', '/surf', 'primary', 1),
('footer_primary', 'Book Now', '/booking', 'primary', 1),
('footer_secondary', 'Contact Us', '/the-spot', 'secondary', 2)
ON CONFLICT DO NOTHING;

-- Create storage bucket for media if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('cms-media', 'cms-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for CMS tables
-- Homepage Sections
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for authenticated users" ON homepage_sections FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for service_role" ON homepage_sections FOR ALL USING (auth.role() = 'service_role');

-- Page Content
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for authenticated users" ON page_content FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for service_role" ON page_content FOR ALL USING (auth.role() = 'service_role');

-- Testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for authenticated users" ON testimonials FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for service_role" ON testimonials FOR ALL USING (auth.role() = 'service_role');

-- FAQ Items
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for authenticated users" ON faq_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for service_role" ON faq_items FOR ALL USING (auth.role() = 'service_role');

-- Media Library
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for authenticated users" ON media_library FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for service_role" ON media_library FOR ALL USING (auth.role() = 'service_role');

-- CTA Buttons
ALTER TABLE cta_buttons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for authenticated users" ON cta_buttons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for service_role" ON cta_buttons FOR ALL USING (auth.role() = 'service_role');

-- Activity Log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for authenticated users" ON activity_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for service_role" ON activity_log FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Set up storage policies
CREATE POLICY "Allow read access for cms-media" ON storage.objects FOR SELECT USING (bucket_id = 'cms-media');
CREATE POLICY "Allow insert for service_role on cms-media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cms-media' AND auth.role() = 'service_role');
CREATE POLICY "Allow update for service_role on cms-media" ON storage.objects FOR UPDATE USING (bucket_id = 'cms-media' AND auth.role() = 'service_role');
CREATE POLICY "Allow delete for service_role on cms-media" ON storage.objects FOR DELETE USING (bucket_id = 'cms-media' AND auth.role() = 'service_role');

COMMIT;

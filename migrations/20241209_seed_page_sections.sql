-- Seed default content for all pages
-- Uses hardcoded defaults from the existing codebase

-- Clear existing data (if re-running)
TRUNCATE page_sections;

-- ============================================
-- HOMEPAGE SECTIONS
-- ============================================

INSERT INTO page_sections (page_slug, section_key, sort_order, content) VALUES
('home', 'hero', 0, '{
  "title": "Welcome to Heiwa House",
  "subtitle": "Your surf and lifestyle destination in Santa Cruz, Portugal",
  "description": "",
  "video_url": "https://pguipwhrxdzzrndbluxb.supabase.co/storage/v1/object/public/cms-media/videos/1763932934179_Timeline-1.mp4",
  "image_url": "",
  "primary_link_url": "/surf-weeks",
  "primary_link_text": "Come for a Surf Camp",
  "secondary_link_url": "/rooms",
  "secondary_link_text": "Rent a Room"
}'::jsonb),

('home', 'surf-weeks', 1, '{
  "title": "Heiwa Surf Weeks",
  "subtitle": "All-inclusive weeks with surf, yoga, great food, and coastal adventures.",
  "description": "",
  "features": [
    "Professional surf instruction for all levels",
    "Daily yoga and meditation sessions",
    "Amazing food prepared by our chef",
    "Exciting day trips to explore Portugal",
    "Skateboarding and other activities",
    "Prices starting at 450€"
  ]
}'::jsonb),

('home', 'about', 2, '{
  "title": "What we are about",
  "subtitle": "",
  "cards": [
    {"title": "Play", "description": "Explore activities and experiences around our location", "image": "/images/skatepark-1.jpg", "link": "/play"},
    {"title": "Surf", "description": "Discover the best surfing spots and conditions", "image": "/images/surf4.jpg", "link": "/surf"},
    {"title": "Flow", "description": "Wellness, yoga, and mindfulness experiences", "image": "/images/yoga_dome1.jpg", "link": "/flow"}
  ]
}'::jsonb),

('home', 'rooms', 3, '{
  "title": "Our Rooms",
  "subtitle": "",
  "cards": [
    {"title": "Private Rooms", "description": "Step into the charm of our beautifully designed rooms, blending modern comfort with traditional Portuguese aesthetics. Perfect for couples or solo travelers seeking peace and style.", "images": ["/images/rooms/room1.jpg", "/images/rooms/room2.webp", "/images/rooms/room3.webp"], "link": "/rooms/private"},
    {"title": "Shared Rooms", "description": "Join our vibrant community in spacious shared accommodations. Meet fellow travelers, share stories, and make lifelong friendships in our comfortable dorm-style rooms.", "images": ["/images/rooms/dorm.webp", "/images/Freedomroutes-rooms-50.jpg", "/images/rooms/room1.jpg"], "link": "/rooms/shared"}
  ]
}'::jsonb),

('home', 'reviews', 4, '{
  "title": "What Our Customers Say",
  "subtitle": ""
}'::jsonb),

('home', 'facilities', 5, '{
  "title": "Activities Around",
  "subtitle": "",
  "facilities": [
    {"title": "Surf Lessons", "description": "Learn to ride the waves with professional instructors", "image": "/optimized/photography_001_dji_0098-scaled.webp"},
    {"title": "Go Karts", "description": "Feel the adrenaline rush on our local tracks", "image": "/optimized/photography_002_dsc01794.webp"},
    {"title": "Horseback Riding", "description": "Explore the countryside on horseback", "image": "/optimized/photography_003_dsc01829-enhanced-nr-2.webp"},
    {"title": "Plane Flight", "description": "Experience breathtaking aerial views", "image": "/optimized/photography_004_dsc02099-scaled.webp"},
    {"title": "Wineyard Tour", "description": "Taste local wines and learn about Portuguese vineyards", "image": "/optimized/photography_005_dsc02102-scaled.webp"},
    {"title": "Hiking", "description": "Discover scenic trails and natural beauty", "image": "/optimized/photography_006_dsc02767-scaled.webp"},
    {"title": "Paragliding", "description": "Soar above the landscape with stunning views", "image": "/optimized/photography_007_dsc03081-enhanced-nr-scaled.webp"},
    {"title": "Bicycle Riding", "description": "Pedal through coastal paths and hidden gems", "image": "/optimized/photography_008_dsc03427-enhanced-nr-scaled.webp"}
  ]
}'::jsonb);

-- ============================================
-- FLOW PAGE SECTIONS
-- ============================================

INSERT INTO page_sections (page_slug, section_key, sort_order, content) VALUES
('flow', 'hero', 0, '{
  "title": "Heiwa Flow",
  "subtitle": "Find your balance through yoga, wellness, and mindful practices",
  "image_url": "/images/yoga_dome1.jpg"
}'::jsonb),

('flow', 'intro', 1, '{
  "title": "Mind, Body & Soul",
  "description": "At Heiwa House, we believe in the harmony of movement and stillness. Our flow program combines yoga, meditation, massage, and wellness practices to help you find your center."
}'::jsonb),

('flow', 'activities', 2, '{
  "title": "Our Offerings",
  "items": [
    {"title": "Yoga", "description": "Daily yoga sessions for all levels in our beautiful dome", "image": "/images/yoga_dome1.jpg"},
    {"title": "Massage", "description": "Relaxing massage treatments to rejuvenate your body", "image": "/images/massage.jpg"},
    {"title": "Ice Bath", "description": "Cold therapy for recovery and mental clarity", "image": "/images/icebath.jpg"},
    {"title": "Sauna", "description": "Traditional sauna sessions for deep relaxation", "image": "/images/sauna.jpg"}
  ]
}'::jsonb);

-- ============================================
-- PLAY PAGE SECTIONS
-- ============================================

INSERT INTO page_sections (page_slug, section_key, sort_order, content) VALUES
('play', 'hero', 0, '{
  "title": "Heiwa Play",
  "subtitle": "Adventure awaits around every corner",
  "image_url": "/images/skatepark-1.jpg"
}'::jsonb),

('play', 'intro', 1, '{
  "title": "Explore & Discover",
  "description": "Santa Cruz and the surrounding area offer endless opportunities for adventure. From skateboarding to wine tours, there is something for everyone."
}'::jsonb),

('play', 'activities', 2, '{
  "title": "Activities",
  "items": [
    {"title": "Skateboarding", "description": "Shred at local skateparks and spots", "image": "/images/skatepark-1.jpg"},
    {"title": "Go Karts", "description": "Race around the track", "image": "/optimized/photography_002_dsc01794.webp"},
    {"title": "Horseback Riding", "description": "Explore on horseback", "image": "/optimized/photography_003_dsc01829-enhanced-nr-2.webp"},
    {"title": "Wine Tours", "description": "Taste local Portuguese wines", "image": "/optimized/photography_005_dsc02102-scaled.webp"}
  ]
}'::jsonb);

-- ============================================
-- SURF PAGE SECTIONS
-- ============================================

INSERT INTO page_sections (page_slug, section_key, sort_order, content) VALUES
('surf', 'hero', 0, '{
  "title": "Heiwa Surf",
  "subtitle": "Ride the waves of the Portuguese coast",
  "image_url": "/images/surf4.jpg"
}'::jsonb),

('surf', 'intro', 1, '{
  "title": "World-Class Waves",
  "description": "Santa Cruz is home to some of Portugal best surf spots. Whether you are a beginner or an experienced surfer, we have the perfect wave for you."
}'::jsonb),

('surf', 'lessons', 2, '{
  "title": "Surf Lessons",
  "description": "Our experienced instructors will help you catch your first wave or improve your technique.",
  "levels": [
    {"title": "Beginner", "description": "Learn the basics in safe, small waves"},
    {"title": "Intermediate", "description": "Progress your skills and read the ocean"},
    {"title": "Advanced", "description": "Challenge yourself on bigger waves"}
  ]
}'::jsonb);

-- ============================================
-- CONTACT PAGE SECTIONS
-- ============================================

INSERT INTO page_sections (page_slug, section_key, sort_order, content) VALUES
('contact', 'hero', 0, '{
  "title": "Contact Us",
  "subtitle": "We would love to hear from you"
}'::jsonb),

('contact', 'info', 1, '{
  "title": "Get in Touch",
  "email": "info@heiwahouse.com",
  "phone": "+351 123 456 789",
  "address": "Santa Cruz, Portugal",
  "social": {
    "instagram": "https://instagram.com/heiwahouse",
    "facebook": "https://facebook.com/heiwahouse"
  }
}'::jsonb),

('contact', 'map', 2, '{
  "title": "Find Us",
  "coordinates": {"lat": 39.1363, "lng": -9.3853},
  "embed_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3112.123456789!2d-9.3853!3d39.1363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDA4JzEwLjciTiA5wrAyMycwNy4xIlc!5e0!3m2!1sen!2spt!4v1234567890"
}'::jsonb);

-- ============================================
-- THE-SPOT PAGE SECTIONS
-- ============================================

INSERT INTO page_sections (page_slug, section_key, sort_order, content) VALUES
('the-spot', 'hero', 0, '{
  "title": "The Spot",
  "subtitle": "Your home away from home in Santa Cruz",
  "image_url": "/images/heiwa-house-exterior.jpg"
}'::jsonb),

('the-spot', 'about', 1, '{
  "title": "About Heiwa House",
  "description": "Heiwa House is a surf and lifestyle guesthouse located in the heart of Santa Cruz, Portugal. Our name comes from the Japanese word for peace, and we strive to create a peaceful, welcoming environment for all our guests."
}'::jsonb),

('the-spot', 'features', 2, '{
  "title": "What We Offer",
  "items": [
    {"title": "Comfortable Rooms", "description": "Private and shared accommodations"},
    {"title": "Surf Equipment", "description": "Boards and wetsuits available"},
    {"title": "Yoga Dome", "description": "Daily yoga and wellness sessions"},
    {"title": "Community Kitchen", "description": "Cook and share meals with fellow travelers"}
  ]
}'::jsonb);

-- ============================================
-- ABOUT PAGE SECTIONS
-- ============================================

INSERT INTO page_sections (page_slug, section_key, sort_order, content) VALUES
('about', 'hero', 0, '{
  "title": "About Us",
  "subtitle": "The story of Heiwa House"
}'::jsonb),

('about', 'story', 1, '{
  "title": "Our Story",
  "description": "Heiwa House was founded with a simple vision: to create a space where travelers can connect with nature, community, and themselves. What started as a small guesthouse has grown into a vibrant community of surfers, yogis, and adventurers from around the world."
}'::jsonb),

('about', 'team', 2, '{
  "title": "Meet the Team",
  "members": [
    {"name": "Janis", "role": "Founder", "image": "/images/hosts/janis.jpg"},
    {"name": "Buka", "role": "Co-Founder", "image": "/images/hosts/buka.jpg"},
    {"name": "Edijs", "role": "Surf Instructor", "image": "/images/hosts/edijs.jpg"}
  ]
}'::jsonb);

-- ============================================
-- SURF-WEEKS PAGE SECTIONS
-- ============================================

INSERT INTO page_sections (page_slug, section_key, sort_order, content) VALUES
('surf-weeks', 'hero', 0, '{
  "title": "Surf Weeks",
  "subtitle": "All-inclusive surf camp experiences",
  "image_url": "/images/surf-camp-group.jpg"
}'::jsonb),

('surf-weeks', 'intro', 1, '{
  "title": "The Ultimate Surf Experience",
  "description": "Join us for an unforgettable week of surfing, yoga, and adventure. Our all-inclusive surf weeks include accommodation, meals, surf lessons, equipment, and activities."
}'::jsonb),

('surf-weeks', 'includes', 2, '{
  "title": "What is Included",
  "items": [
    "7 nights accommodation",
    "All meals (breakfast, lunch, dinner)",
    "Daily surf lessons with certified instructors",
    "Surf equipment (board and wetsuit)",
    "Daily yoga sessions",
    "Day trips and activities",
    "Airport transfers"
  ]
}'::jsonb),

('surf-weeks', 'schedule', 3, '{
  "title": "Sample Schedule",
  "days": [
    {"time": "07:30", "activity": "Morning yoga"},
    {"time": "08:30", "activity": "Breakfast"},
    {"time": "10:00", "activity": "Surf lesson"},
    {"time": "13:00", "activity": "Lunch"},
    {"time": "15:00", "activity": "Free time / Activities"},
    {"time": "17:00", "activity": "Sunset surf session"},
    {"time": "19:30", "activity": "Dinner"},
    {"time": "21:00", "activity": "Community time"}
  ]
}'::jsonb);

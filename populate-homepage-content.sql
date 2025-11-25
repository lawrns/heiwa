-- Populate homepage_content with default sections
-- This creates the main homepage sections that are currently missing

INSERT INTO homepage_content (section, title, subtitle, description, is_active, order_index, created_at, updated_at)
VALUES
  ('hero', 'Welcome to Heiwa House', 'Your surf and lifestyle destination in Santa Cruz, Portugal', 'Experience the perfect blend of surf, yoga, and coastal living', true, 1, NOW(), NOW()),
  ('surf-weeks', 'Heiwa Surf Weeks', 'Experience the ultimate surf camp with professional instructors, yoga, amazing food, day trips, and unforgettable memories', NULL, true, 2, NOW(), NOW()),
  ('about', 'What we are about', NULL, 'Discover Heiwa Play, Heiwa Surf, and Heiwa Flow', true, 3, NOW(), NOW()),
  ('rooms', 'Our Rooms', NULL, 'Choose from private rooms or shared accommodations', true, 4, NOW(), NOW()),
  ('hosts', 'Your Hosts', NULL, 'Meet Janis, Buka & Edijs', true, 5, NOW(), NOW()),
  ('reviews', 'What Our Customers Say', NULL, 'Read what our guests have to say about their experience', true, 6, NOW(), NOW()),
  ('facilities', 'Amazing Facilities', NULL, 'Discover all the facilities we have to offer', true, 7, NOW(), NOW())
ON CONFLICT DO NOTHING;

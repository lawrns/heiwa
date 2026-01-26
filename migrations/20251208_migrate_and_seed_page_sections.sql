-- Migration: Migrate existing page_content to page_sections and seed hardcoded content

-- First, migrate existing page_content data to page_sections
INSERT INTO page_sections (page_slug, section_type, content, order_index, is_active, created_at, updated_at)
SELECT
  page_slug,
  section as section_type,
  CASE
    -- Hero sections
    WHEN section = 'hero' THEN jsonb_build_object(
      'title', COALESCE(json_content->>'title', title),
      'description', COALESCE(json_content->>'description', content),
      'videoUrl', COALESCE(video_url, json_content->>'video_url', json_content->>'videoUrl'),
      'imageUrl', COALESCE(image_url, json_content->>'image_url', json_content->>'imageUrl')
    )
    -- Intro sections
    WHEN section = 'intro' THEN jsonb_build_object(
      'title', title,
      'content', COALESCE(content, json_content->>'text', json_content->>'html', json_content->>'description')
    )
    -- FAQ sections
    WHEN section = 'faq' THEN jsonb_build_object(
      'title', title,
      'items', COALESCE(json_content->'items', '[]'::jsonb)
    )
    -- Features sections
    WHEN section = 'features' THEN jsonb_build_object(
      'title', title,
      'items', COALESCE(json_content->'items', '[]'::jsonb)
    )
    -- SEO sections
    WHEN section = 'seo' THEN jsonb_build_object(
      'title', COALESCE(json_content->>'title', title),
      'description', json_content->>'description',
      'keywords', json_content->>'keywords'
    )
    -- Default: copy json_content
    ELSE COALESCE(json_content, '{}'::jsonb)
  END as content,
  order_index,
  is_active,
  created_at,
  updated_at
FROM page_content
WHERE NOT EXISTS (
  SELECT 1 FROM page_sections ps
  WHERE ps.page_slug = page_content.page_slug
  AND ps.section_type = page_content.section
);

-- Now seed the hardcoded ActivityHighlight sections for Flow page
INSERT INTO page_sections (page_slug, section_type, content, order_index, is_active) VALUES
-- Flow page ActivityHighlights
('flow', 'activity_highlight', '{
  "title": "Yoga Dome",
  "description": "Practice in our beautiful geodesic dome, surrounded by nature. The perfect space for morning flows and evening meditation.",
  "videoUrl": "/optimized/videos/video_004_location2.mp4",
  "videoPoster": "/images/yoga_dome1.jpg",
  "carouselImages": ["/images/yoga_dome1.jpg", "/images/yoga_dome2.jpg", "/images/yoga_dome3.jpg"],
  "reversed": false
}'::jsonb, 10, true),

('flow', 'activity_highlight', '{
  "title": "Sauna & Ice Tub",
  "description": "Recover and rejuvenate with our contrast therapy facilities. Boost your circulation, reduce inflammation, and feel invigorated.",
  "videoUrl": "/optimized/videos/video_005_location3.mp4",
  "videoPoster": "/images/pool333.jpg",
  "carouselImages": ["/images/pool333.jpg", "/images/pool4444.jpg", "/images/pool333.jpg"],
  "reversed": true
}'::jsonb, 11, true),

('flow', 'activity_highlight', '{
  "title": "Yoga Lessons",
  "description": "Join our expert instructors for guided sessions suitable for all levels. From dynamic Vinyasa to restorative Yin.",
  "videoUrl": "/optimized/videos/video_002_fin1.mp4",
  "videoPoster": "/images/yoga_dome1.jpg",
  "carouselImages": ["/images/yoga_dome1.jpg", "/images/yoga_dome2.jpg", "/images/yoga_dome3.jpg"],
  "reversed": false
}'::jsonb, 12, true),

('flow', 'activity_highlight', '{
  "title": "Massages",
  "description": "Treat yourself to a relaxing massage. Our therapists offer various styles to help you release tension and unwind.",
  "videoUrl": "/optimized/videos/video_003_fin2.mp4",
  "videoPoster": "/images/hh1.jpg",
  "carouselImages": ["/images/hh1.jpg", "/images/hh2.jpg", "/images/DSC03491.jpg"],
  "reversed": true
}'::jsonb, 13, true),

-- Flow page ActivityGrids
('flow', 'activity_grid', '{
  "title": "Core Flow Services",
  "description": "Included wellness experiences to enhance your stay",
  "category": "flow",
  "tier": "always",
  "showTierBadge": false
}'::jsonb, 20, true),

('flow', 'activity_grid', '{
  "title": "Available on Request",
  "description": "Specialized wellness services to deepen your experience",
  "category": "flow",
  "tier": "on-request",
  "showTierBadge": true
}'::jsonb, 21, true),

-- Flow page CTA
('flow', 'cta', '{
  "title": "Ready to Find Your Flow?",
  "description": "Enhance your Heiwa House experience with our wellness services. Whether you''re staying for a surf week or just visiting, we can customize the perfect flow experience for you.",
  "buttonText": "Enquire Now",
  "buttonUrl": "mailto:info@heiwahouse.com"
}'::jsonb, 30, true),

-- Play page ActivityHighlights
('play', 'activity_highlight', '{
  "title": "Skateboarding",
  "description": "Carve your own path in our custom-designed skatepark. Whether you''re dropping in for the first time or perfecting your tricks, our concrete waves are waiting for you.",
  "videoUrl": "/images/videos/sk81.mp4",
  "videoPoster": "/images/park4444.jpg",
  "carouselImages": ["/images/park4444.jpg", "/images/DSC03081-scaled.jpg", "/images/DSC08054-scaled.jpg"],
  "reversed": false
}'::jsonb, 10, true),

('play', 'activity_highlight', '{
  "title": "Music",
  "description": "Find your rhythm in our fully equipped jam room. Connect with fellow musicians, create something new, or just enjoy the vibes.",
  "videoUrl": "/images/videos/Timeline-1.mp4",
  "videoPoster": "/images/DSC08736-scaled.jpg",
  "carouselImages": ["/images/DSC08736-scaled.jpg", "/images/DSC01794.jpg", "/images/DSC08054-scaled.jpg"],
  "reversed": false
}'::jsonb, 11, true),

-- Play page ActivityGrids
('play', 'activity_grid', '{
  "title": "Activities On-Site",
  "description": "These fun experiences are included in your stay at Heiwa House",
  "category": "play",
  "tier": "always",
  "showTierBadge": false
}'::jsonb, 20, true),

('play', 'activity_grid', '{
  "title": "Activities Around",
  "description": "Special activities available upon request - contact us to arrange",
  "category": "play",
  "tier": "on-request",
  "showTierBadge": true
}'::jsonb, 21, true),

-- Play page CTA
('play', 'cta', '{
  "title": "Ready to Play?",
  "description": "Join our surf weeks and experience all the amazing activities Heiwa Play has to offer. From adventure to relaxation, we have it all!",
  "buttonText": "Book Your Adventure",
  "buttonUrl": "mailto:info@heiwahouse.com"
}'::jsonb, 30, true);

-- Verify the migration
SELECT page_slug, section_type, order_index, is_active,
       jsonb_pretty(content) as content_preview
FROM page_sections
ORDER BY page_slug, order_index;

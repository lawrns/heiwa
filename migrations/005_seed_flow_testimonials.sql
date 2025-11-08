-- Seed Flow page testimonials to match existing hardcoded content
-- This ensures seamless transition from hardcoded to dynamic content

INSERT INTO testimonials (author_name, author_title, content, rating, is_featured, is_active, created_by, updated_by)
VALUES 
  (
    'Maria S.',
    'Yoga Enthusiast',
    'The yoga sessions in the dome were absolutely magical. Waking up to practice with that view was the perfect start to each day.',
    5,
    true,
    true,
    'admin',
    'admin'
  ),
  (
    'Thomas K.',
    'Wellness Seeker',
    'The ice bath and sauna combination was incredible for recovery. I felt refreshed and energized after every session.',
    5,
    true,
    true,
    'admin',
    'admin'
  ),
  (
    'Lisa P.',
    'Surfer & Wellness',
    'The massage therapy was exactly what I needed after surfing. Professional, relaxing, and so beneficial for my muscles.',
    5,
    true,
    true,
    'admin',
    'admin'
  ),
  (
    'David R.',
    'Sound Healing Practitioner',
    'The sound healing session was transformative. I''d never experienced anything like it before - so deeply relaxing.',
    5,
    true,
    true,
    'admin',
    'admin'
  )
ON CONFLICT DO NOTHING;

-- Seed Flow page content sections
INSERT INTO page_content (page_slug, section_type, section_name, content, order_index, is_active, created_by, updated_by)
VALUES
  (
    'flow',
    'hero',
    'Flow Hero Section',
    jsonb_build_object(
      'title', 'Heiwa Flow',
      'description', 'Find your inner flow through yoga, wellness, and mindful practices. Balance your body, mind, and spirit in our peaceful Portuguese sanctuary.',
      'videoUrl', '/images/videos/flow-wellness.mp4',
      'imageUrl', '/images/yoga_dome3.jpg'
    ),
    0,
    true,
    'admin',
    'admin'
  ),
  (
    'flow',
    'intro',
    'Flow Introduction',
    jsonb_build_object(
      'paragraphs', jsonb_build_array(
        'Heiwa Flow is your gateway to deeper wellness and self-discovery. Through ancient practices and modern therapies, we help you find balance, reduce stress, and connect with your true self.',
        'Whether you''re seeking physical recovery, mental clarity, or spiritual growth, our flow services provide the perfect complement to your active surf lifestyle.'
      )
    ),
    1,
    true,
    'admin',
    'admin'
  ),
  (
    'flow',
    'text',
    'Core Flow Services Header',
    jsonb_build_object(
      'title', 'Core Flow Services',
      'subtitle', 'Included wellness experiences to enhance your stay'
    ),
    2,
    true,
    'admin',
    'admin'
  ),
  (
    'flow',
    'text',
    'Available on Request Header',
    jsonb_build_object(
      'title', 'Available on Request',
      'subtitle', 'Specialized wellness services to deepen your experience'
    ),
    3,
    true,
    'admin',
    'admin'
  ),
  (
    'flow',
    'text',
    'CTA Section',
    jsonb_build_object(
      'title', 'Ready to Find Your Flow?',
      'description', 'Enhance your Heiwa House experience with our wellness services. Whether you''re staying for a surf week or just visiting, we can customize the perfect flow experience for you.',
      'ctaText', 'Enquire Now',
      'ctaEmail', 'info@heiwahouse.com'
    ),
    4,
    true,
    'admin',
    'admin'
  )
ON CONFLICT DO NOTHING;

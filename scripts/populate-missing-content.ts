#!/usr/bin/env bun
/**
 * Populate Missing Content
 *
 * Creates production-ready content for sections that had no version history backup.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pguipwhrxdzzrndbluxb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const CONTENT_MAP = {
  // SURF PAGE SECTIONS
  'surf/features': {
    title: 'Why Surf with Heiwa House?',
    features: [
      {
        icon: 'Waves',
        title: 'World-Class Breaks',
        description: 'Access to Ericeira and Peniche surf spots within 30 minutes'
      },
      {
        icon: 'Users',
        title: 'Expert Instruction',
        description: 'Professional surf coaches with video analysis for all levels'
      },
      {
        icon: 'MapPin',
        title: 'Perfect Location',
        description: 'Just 5 minutes from local beaches, between two surf capitals'
      }
    ]
  },

  'surf/faq': {
    title: 'Surf FAQ',
    items: [
      {
        question: 'What is the best time of year to surf in Santa Cruz?',
        answer: 'Portugal offers year-round surfing! Summer (June-September) provides smaller waves perfect for beginners. Autumn and winter (October-March) bring bigger swells for experienced surfers. Spring (April-May) offers a great balance.'
      },
      {
        question: 'Do I need to bring my own surfboard?',
        answer: 'No! We offer surfboard rentals at 20€ per day and wetsuits at 5€ per day. Special weekly rates available. All surf lessons include equipment.'
      },
      {
        question: 'Are there surf spots suitable for beginners?',
        answer: 'Absolutely! Local beaches offer gentle, sandy-bottomed breaks perfect for beginners. Our instructors will help you find the best conditions for your level.'
      },
      {
        question: 'What surf lessons do you offer?',
        answer: 'One lesson costs 45€, or five lessons for 200€. All lessons include professional instructors, equipment, and daily video analysis.'
      }
    ]
  },

  'surf/surf_conditions': {
    title: 'Surf Conditions',
    subtitle: 'Experience the variety of Portuguese surf - from mellow longboard days to epic barrels',
    epicImageUrl: '/images/surf4.jpg',
    epicImageCaption: 'Epic day at the local break - when conditions align',
    videoUrl: 'https://www.youtube.com/embed/9nhQiKGsgHg',
    videoCaption: 'Typical surf conditions - fun, accessible waves for all levels'
  },

  'surf/world_class_surfing': {
    title: 'World-Class Surfing',
    subtitle: 'Located between Ericeira (World Surfing Reserve) and Peniche (Championship Tour stop), you have access to dozens of world-class breaks',
    locations: [
      {
        name: 'Ericeira',
        distance: '30 min north',
        imageUrl: '/images/ericeira-surf.jpg',
        description: 'Europe\'s 2nd World Surfing Reserve with 7 championship-quality breaks',
        highlights: [
          'Ribeira d\'Ilhas - Championship wave',
          'Coxos - World-class right point',
          'Pedra Branca - Heavy reef break'
        ]
      },
      {
        name: 'Peniche',
        distance: '30 min south',
        imageUrl: '/images/peniche-surf.jpg',
        description: 'Home to Supertubos, one of Europe\'s best beach breaks and WSL Championship Tour stop',
        highlights: [
          'Supertubos - World tour caliber barrels',
          'Baleal - Perfect for all levels',
          'Lagide - Sheltered bay for smaller days'
        ]
      }
    ],
    mapImageUrl: '/images/surf-map.jpg',
    footerText: 'Between these two world-renowned destinations, you can always find perfect waves for your level'
  },

  'surf/surf_lessons': {
    title: 'Surf Lessons',
    paragraphs: [
      'Learn to surf or improve your skills with our professional instructors. All lessons include equipment, video analysis, and personalized coaching.',
      'Whether you\'re a complete beginner or looking to advance your technique, we\'ll match you with the right instructor and surf spot for optimal progression.',
      'Daily video review sessions help you understand and improve your technique faster than traditional coaching alone.'
    ],
    carouselImages: [
      '/images/surf-lesson-1.jpg',
      '/images/surf-lesson-2.jpg',
      '/images/surf-lesson-3.jpg'
    ],
    buttonText: 'Book a Surf Lesson',
    buttonUrl: '/surf-weeks'
  },

  // FLOW PAGE SECTIONS
  'flow/features': {
    title: 'Flow Services',
    features: [
      {
        icon: 'Heart',
        title: 'Yoga & Meditation',
        description: 'Daily sessions in our beautiful yoga dome'
      },
      {
        icon: 'Sparkles',
        title: 'Wellness Therapies',
        description: 'Massage, breathwork, and holistic treatments'
      },
      {
        icon: 'Sunrise',
        title: 'Mindful Practices',
        description: 'Find balance and inner peace'
      }
    ]
  },

  'flow/faq': {
    title: 'Flow FAQ',
    items: [
      {
        question: 'Do I need experience with yoga or meditation?',
        answer: 'Not at all! Our flow sessions welcome all levels, from complete beginners to experienced practitioners. Teachers provide modifications for different abilities.'
      },
      {
        question: 'What should I bring to yoga sessions?',
        answer: 'We provide all yoga mats and props. Just bring comfortable clothing and an open mind!'
      },
      {
        question: 'Can I book flow services without staying at Heiwa House?',
        answer: 'Yes! Flow services are available to both guests and day visitors. Contact us to schedule your session.'
      }
    ]
  },
};

const ACTIVITY_HIGHLIGHTS = [
  {
    title: 'Yoga Dome Sessions',
    description: 'Practice in our beautiful geodesic dome, surrounded by nature. The perfect space for morning flows and evening meditation.',
    videoUrl: '/optimized/videos/video_004_location2.mp4',
    videoPoster: '/images/yoga_dome1.jpg',
    carouselImages: [
      '/images/yoga_dome1.jpg',
      '/images/yoga_dome2.jpg',
      '/images/yoga_dome3.jpg'
    ],
    reversed: false
  },
  {
    title: 'Massage & Bodywork',
    description: 'Professional massage therapy to complement your active lifestyle. Deep tissue, sports massage, and relaxation treatments available.',
    videoUrl: '',
    videoPoster: '/images/DSF8619-1.jpg',
    carouselImages: [
      '/images/yoga_dome3.jpg',
      '/images/yoga_dome4.jpg'
    ],
    reversed: true
  },
  {
    title: 'Breathwork & Meditation',
    description: 'Guided breathwork sessions and meditation practices to reduce stress, increase focus, and connect with your inner self.',
    videoUrl: null,
    videoPoster: '/images/yoga_dome2.jpg',
    carouselImages: [
      '/images/DSC03491.jpg',
      '/images/DSC04163.jpg',
      '/images/yoga_dome1.jpg'
    ],
    reversed: false
  },
  {
    title: 'Sound Healing',
    description: 'Experience the therapeutic power of sound with crystal bowls, gongs, and harmonic frequencies for deep relaxation.',
    videoUrl: null,
    videoPoster: '/images/yoga_dome1.jpg',
    carouselImages: [
      '/images/Freedomroutes-rooms-1.jpg',
      '/images/yoga_dome2.jpg'
    ],
    reversed: true
  }
];

const ACTIVITY_GRIDS = [
  {
    title: 'Core Flow Activities',
    description: 'Daily wellness practices included in your stay',
    category: 'flow',
    tier: 'always',
    showTierBadge: false
  },
  {
    title: 'On-Request Wellness',
    description: 'Additional treatments and specialized sessions',
    category: 'flow',
    tier: 'on-request',
    showTierBadge: true
  }
];

async function populateMissingContent() {
  console.log('🔧 Populating missing content...\n');

  let updated = 0;
  let failed = 0;

  // Get all sections that need content
  const { data: sections } = await supabase
    .from('page_sections')
    .select('id, page_slug, section_type')
    .in('page_slug', ['surf', 'flow']);

  if (!sections) {
    console.error('Failed to fetch sections');
    return;
  }

  for (const section of sections) {
    const key = `${section.page_slug}/${section.section_type}`;
    let content = null;

    // Check for direct mapping
    if (CONTENT_MAP[key as keyof typeof CONTENT_MAP]) {
      content = CONTENT_MAP[key as keyof typeof CONTENT_MAP];
    }
    // Handle activity_highlight sections
    else if (section.section_type === 'activity_highlight' && section.page_slug === 'flow') {
      const highlights = sections.filter(s => s.section_type === 'activity_highlight' && s.page_slug === 'flow');
      const index = highlights.findIndex(s => s.id === section.id);
      if (index >= 0 && index < ACTIVITY_HIGHLIGHTS.length) {
        content = ACTIVITY_HIGHLIGHTS[index];
      }
    }
    // Handle activity_grid sections
    else if (section.section_type === 'activity_grid' && section.page_slug === 'flow') {
      const grids = sections.filter(s => s.section_type === 'activity_grid' && s.page_slug === 'flow');
      const index = grids.findIndex(s => s.id === section.id);
      if (index >= 0 && index < ACTIVITY_GRIDS.length) {
        content = ACTIVITY_GRIDS[index];
      }
    }

    if (!content) continue;

    console.log(`📝 Updating ${key}...`);

    const { error } = await supabase
      .from('page_sections')
      .update({ content })
      .eq('id', section.id);

    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
      failed++;
    } else {
      console.log(`  ✅ Updated successfully`);
      updated++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 POPULATION SUMMARY:');
  console.log(`  Successfully updated: ${updated}`);
  console.log(`  Failed: ${failed}`);
  console.log('='.repeat(60));
}

populateMissingContent();

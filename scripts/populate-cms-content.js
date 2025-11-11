#!/usr/bin/env node

/**
 * Script to populate CMS database with existing homepage content
 * This extracts all hardcoded content and makes it CMS-managed
 */

const fetch = require('node-fetch');

const API_URL = 'https://heiwa-house-portugal.netlify.app/api/admin/homepage';

// Existing content extracted from homepage
const CMS_CONTENT = [
  {
    // Hero section - already exists, skip
    section: 'hero',
    skip: true
  },
  {
    // Surf Weeks section
    section: 'surf-weeks',
    title: 'Heiwa Surf Weeks',
    subtitle: 'Experience the ultimate surf camp with professional instructors, yoga, amazing food, day trips, and unforgettable memories',
    description: 'Join us for an unforgettable week of surfing, yoga, and coastal living.',
    videoId: '9nhQiKGsgHg',
    bookingData: [
      { dates: '01 Feb. - 12 Feb.', price: 'From €485', availableSpots: '5/18', totalSpots: 18 },
      { dates: '01 May - 12 May', price: 'From €485', availableSpots: '5/18', totalSpots: 18 },
      { dates: '01 May - 12 May', price: 'From €485', availableSpots: '5/18', totalSpots: 18 }
    ],
    order: 2,
    isActive: true
  },
  {
    // About section
    section: 'about',
    title: 'What we are about',
    subtitle: 'Discover what makes Heiwa House special',
    description: 'Three pillars of our experience: Play (activities), Surf (surfing), and Flow (wellness)',
    cards: [
      {
        title: 'Play',
        description: 'Explore activities and experiences around our location',
        image: '/images/skatepark-1.jpg',
        link: '/play'
      },
      {
        title: 'Surf',
        description: 'Discover the best surfing spots and conditions',
        image: '/images/surf4.jpg',
        link: '/surf'
      },
      {
        title: 'Flow',
        description: 'Wellness, yoga, and mindfulness experiences',
        image: '/images/yoga_dome1.jpg',
        link: '/flow'
      }
    ],
    order: 3,
    isActive: true
  },
  {
    // Rooms section
    section: 'rooms',
    title: 'Our Rooms',
    subtitle: 'Comfortable accommodations for every traveler',
    description: 'Choose between private rooms or shared dorm-style accommodations. All rooms are designed for comfort and community.',
    cards: [
      {
        title: 'Private Rooms',
        description: 'Step into the charm of our beautifully designed rooms, blending modern comfort with traditional Portuguese aesthetics. Perfect for couples or solo travelers seeking peace and style.',
        images: [
          '/images/rooms/room1.jpg',
          '/images/Freedomroutes-rooms-1.jpg',
          '/images/DSC03479.jpg'
        ],
        link: '/rooms/private'
      },
      {
        title: 'Shared Rooms',
        description: 'Join our vibrant community in spacious shared accommodations. Meet fellow travelers, share stories, and make lifelong friendships in our comfortable dorm-style rooms.',
        images: [
          '/images/rooms/dorm.webp',
          '/images/Freedomroutes-rooms-50.jpg',
          '/images/DSC03491.jpg'
        ],
        link: '/rooms/shared'
      }
    ],
    order: 4,
    isActive: true
  },
  {
    // Your Hosts section
    section: 'hosts',
    title: 'Your Hosts',
    subtitle: 'Meet the people behind Heiwa House',
    description: 'Our dedicated team is here to make your stay unforgettable',
    order: 5,
    isActive: true
  },
  {
    // Reviews section
    section: 'reviews',
    title: 'What Our Customers Say',
    subtitle: 'Real experiences from real people',
    description: 'Read about the transformative experiences our guests have had at Heiwa House. With a 4.7 star rating from thousands of reviews.',
    googleRating: {
      rating: 4.7,
      totalReviews: 16940,
      url: 'https://www.google.com/search?q=Heiwa+House+reviews'
    },
    testimonials: [
      {
        name: 'Jesús MR',
        rating: 5,
        text: 'Amazing experience at Heiwa House! The surf lessons were incredible and the yoga sessions were perfect for recovery.',
        timeAgo: '6 days ago',
        verified: true
      },
      {
        name: 'Ernesto Guevara',
        rating: 5,
        text: 'Best surf camp I\'ve ever been to. The instructors are professional and the atmosphere is amazing.',
        timeAgo: '1 week ago',
        verified: true
      },
      {
        name: 'John Z',
        rating: 5,
        text: 'Heiwa House exceeded all my expectations. The facilities are top-notch and the food is delicious.',
        timeAgo: '2 weeks ago',
        verified: true
      },
      {
        name: 'Paul Egan',
        rating: 5,
        text: 'Perfect place to learn surfing and meet like-minded people. Highly recommended!',
        timeAgo: '3 weeks ago',
        verified: true
      }
    ],
    order: 6,
    isActive: true
  },
  {
    // Facilities section
    section: 'facilities',
    title: 'Amazing Facilities',
    subtitle: 'Everything you need for an unforgettable stay',
    description: 'State-of-the-art amenities and comfortable spaces for relaxation, activities, and community building.',
    facilities: [
      {
        title: 'Skatepark',
        description: 'Professional ramps and obstacles for all levels',
        mediaType: 'video',
        mediaUrl: '/images/videos/sk81.mp4'
      },
      {
        title: 'Yoga Dome',
        description: 'Peaceful space for yoga and meditation sessions',
        mediaType: 'image',
        mediaUrl: '/images/yoga_dome1.jpg'
      },
      {
        title: 'Gym',
        description: 'Fully equipped fitness center for your workout needs',
        mediaType: 'image',
        mediaUrl: '/images/gym1.jpg'
      },
      {
        title: 'Coworking Space',
        description: 'Quiet area for remote work and digital nomads',
        mediaType: 'image',
        mediaUrl: '/images/coworking1.jpg'
      }
    ],
    order: 7,
    isActive: true
  }
];

async function populateCMS() {
  console.log('🔄 Starting CMS content population...\n');

  try {
    // Step 1: Fetch current sections
    console.log('📋 Fetching current CMS sections...');
    const response = await fetch(API_URL);
    const result = await response.json();
    const currentSections = result.data || [];

    console.log(`Found ${currentSections.length} current sections\n`);

    // Step 2: Update existing sections or create new ones
    console.log('✨ Populating CMS with existing content...');
    
    for (const content of CMS_CONTENT) {
      if (content.skip) {
        console.log(`  ⏭️  Skipping ${content.section} (already exists)`);
        continue;
      }

      const existingSection = currentSections.find(s => s.section === content.section);
      
      if (existingSection) {
        // Update existing section
        console.log(`  🔄 Updating: ${content.section} (${content.title})`);
        const updateResponse = await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existingSection.id,
            ...content
          })
        });
        
        const updateResult = await updateResponse.json();
        if (!updateResult.success) {
          console.error(`    ❌ Update failed: ${updateResult.error}`);
        } else {
          console.log(`    ✅ Updated successfully`);
        }
      } else {
        // Create new section
        console.log(`  ➕ Creating: ${content.section} (${content.title})`);
        const createResponse = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(content)
        });
        
        const createResult = await createResponse.json();
        if (!createResult.success) {
          console.error(`    ❌ Creation failed: ${createResult.error}`);
        } else {
          console.log(`    ✅ Created successfully`);
        }
      }
    }
    
    console.log('\n🎉 CMS population complete!');
    console.log('📝 All existing homepage content is now CMS-managed');
    
  } catch (error) {
    console.error('❌ CMS population failed:', error);
    process.exit(1);
  }
}

populateCMS();

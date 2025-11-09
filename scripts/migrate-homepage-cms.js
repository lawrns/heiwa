#!/usr/bin/env node

/**
 * Migration script to populate CMS with actual homepage sections
 * This script deletes unused sections and creates sections for all actual homepage content
 */

const fetch = require('node-fetch');

const API_URL = 'https://heiwa-house-portugal.netlify.app/api/admin/homepage';

// Sections to delete (unused CMS sections)
const SECTIONS_TO_DELETE = ['features', 'activities', 'testimonials', 'cta'];

// New sections to create based on actual homepage content
const NEW_SECTIONS = [
  {
    section: 'surf-weeks',
    title: 'Heiwa Surf Weeks',
    subtitle: 'Experience the ultimate surf camp with professional instructors, yoga, amazing food, day trips, and unforgettable memories',
    description: 'Join us for an unforgettable week of surfing, yoga, and coastal living.',
    order_index: 2,
    is_active: true
  },
  {
    section: 'about',
    title: 'What we are about',
    subtitle: 'Discover what makes Heiwa House special',
    description: 'Three pillars of our experience: Heiwa Play, Heiwa Surf, and Heiwa Flow',
    order_index: 3,
    is_active: true
  },
  {
    section: 'rooms',
    title: 'Our Rooms',
    subtitle: 'Comfortable accommodations for every traveler',
    description: 'Choose between private rooms or shared dorm-style accommodations',
    order_index: 4,
    is_active: true
  },
  {
    section: 'reviews',
    title: 'What Our Customers Say',
    subtitle: 'Real experiences from real people',
    description: 'Read about the transformative experiences our guests have had at Heiwa House',
    order_index: 5,
    is_active: true
  },
  {
    section: 'facilities',
    title: 'Amazing Facilities',
    subtitle: 'Everything you need for an unforgettable stay',
    description: 'State-of-the-art amenities and comfortable spaces for relaxation and activities',
    order_index: 6,
    is_active: true
  }
];

async function migrate() {
  console.log('🔄 Starting homepage CMS migration...\n');

  try {
    // Step 1: Fetch all current sections
    console.log('📋 Fetching current CMS sections...');
    const response = await fetch(API_URL);
    const result = await response.json();
    const currentSections = result.data || [];

    console.log(`Found ${currentSections.length} current sections\n`);

    // Step 2: Delete unused sections
    console.log('🗑️  Deleting unused sections...');
    for (const section of currentSections) {
      if (SECTIONS_TO_DELETE.includes(section.section)) {
        console.log(`  - Deleting: ${section.section} (${section.title})`);
        await fetch(`${API_URL}?id=${section.id}`, {
          method: 'DELETE'
        });
      }
    }
    console.log('✅ Unused sections deleted\n');

    // Step 3: Create new sections
    console.log('✨ Creating new CMS sections...');
    for (const section of NEW_SECTIONS) {
      console.log(`  - Creating: ${section.section} (${section.title})`);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section)
      });
      const result = await response.json();
      if (!result.success) {
        console.error(`    ❌ Error: ${result.error}`);
      }
    }
    console.log('✅ New sections created\n');

    console.log('🎉 Migration complete!');
    console.log('📝 The admin/homepage editor now shows the actual homepage sections.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();

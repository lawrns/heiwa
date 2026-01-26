#!/usr/bin/env node

/**
 * Script to update homepage about section cards with new titles and images
 */

const API_URL = 'https://heiwa-fr.netlify.app/api/admin/homepage';

async function updateAboutSection() {
  try {
    // First, get the current about section
    console.log('📥 Fetching current homepage content...');
    const getResponse = await fetch(API_URL);
    const getData = await getResponse.json();
    
    if (!getData.success) {
      throw new Error('Failed to fetch homepage content');
    }
    
    const aboutSection = getData.data.find((s) => s.section === 'about');
    
    if (!aboutSection) {
      console.log('❌ About section not found. Creating new section...');
      // Create new section
      const createResponse = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      });
      
      const createData = await createResponse.json();
      if (createData.success) {
        console.log('✅ Created new about section with updated cards');
      } else {
        throw new Error('Failed to create section: ' + createData.error);
      }
    } else {
      console.log('📝 Updating existing about section...');
      // Update existing section
      const updateResponse = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: aboutSection.id,
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
          order: aboutSection.order_index || 3,
          isActive: aboutSection.is_active !== false
        })
      });
      
      const updateData = await updateResponse.json();
      if (updateData.success) {
        console.log('✅ Updated about section with new card titles and images');
        console.log('📋 New cards:', JSON.stringify(updateData.data.cards, null, 2));
      } else {
        throw new Error('Failed to update section: ' + updateData.error);
      }
    }
  } catch (error) {
    console.error('❌ Error updating about section:', error);
    process.exit(1);
  }
}

updateAboutSection();


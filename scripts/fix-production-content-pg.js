#!/usr/bin/env node
/**
 * Fix Production Content Issues using direct PostgreSQL connection
 * Removes test text and fixes typos in database content
 */

const { Client } = require('pg');

const DB_CONNECTION_STRING = process.env.DATABASE_URL || 
  'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres';

async function fixContent() {
  console.log('🔧 Fixing production content issues...\n');

  const client = new Client({
    connectionString: DB_CONNECTION_STRING,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // 1. Fix Room 2 typo: "Double troom" → "Double room"
    console.log('1️⃣ Fixing Room 2 typo...');
    const roomsResult = await client.query(`
      SELECT id, name, description 
      FROM rooms 
      WHERE LOWER(name) LIKE '%room 2%' OR LOWER(name) LIKE '%double%'
    `);

    for (const room of roomsResult.rows) {
      if (room.description && room.description.includes('Double troom')) {
        const updatedDescription = room.description.replace(/Double troom/gi, 'Double room');
        await client.query(
          'UPDATE rooms SET description = $1 WHERE id = $2',
          [updatedDescription, room.id]
        );
        console.log(`✅ Fixed typo in room: ${room.name}`);
      }
    }

    // 2. Fix homepage hero section content
    console.log('\n2️⃣ Fixing homepage hero section...');
    const heroResult = await client.query(`
      SELECT id, content 
      FROM page_sections 
      WHERE page_slug = 'home' AND section_type = 'hero'
    `);

    for (const section of heroResult.rows) {
      const content = section.content || {};
      let updated = false;
      const updatedContent = { ...content };

      // Fix title: Remove "2" suffix
      if (content.title && typeof content.title === 'string') {
        const cleaned = content.title.replace(/\s*2\s*$/, '').trim();
        if (cleaned !== content.title) {
          updatedContent.title = cleaned;
          updated = true;
        }
      }

      // Fix primary_link_text: Remove "2" suffix
      if (content.primary_link_text && typeof content.primary_link_text === 'string') {
        const cleaned = content.primary_link_text.replace(/\s*2\s*$/, '').trim();
        if (cleaned !== content.primary_link_text) {
          updatedContent.primary_link_text = cleaned;
          updated = true;
        }
      }

      // Fix secondary_link_text: Remove "2" suffix
      if (content.secondary_link_text && typeof content.secondary_link_text === 'string') {
        const cleaned = content.secondary_link_text.replace(/\s*2\s*$/, '').trim();
        if (cleaned !== content.secondary_link_text) {
          updatedContent.secondary_link_text = cleaned;
          updated = true;
        }
      }

      if (updated) {
        await client.query(
          'UPDATE page_sections SET content = $1 WHERE id = $2',
          [updatedContent, section.id]
        );
        console.log('✅ Fixed homepage hero section');
      }
    }

    // 3. Fix surf weeks section content
    console.log('\n3️⃣ Fixing surf weeks section...');
    const surfWeeksResult = await client.query(`
      SELECT id, content 
      FROM page_sections 
      WHERE page_slug = 'home' AND section_type = 'surf-weeks'
    `);

    for (const section of surfWeeksResult.rows) {
      const content = section.content || {};
      let updated = false;
      const updatedContent = { ...content };

      // Fix title: Remove "2" suffix
      if (content.title && typeof content.title === 'string') {
        const cleaned = content.title.replace(/\s*2\s*$/, '').trim();
        if (cleaned !== content.title) {
          updatedContent.title = cleaned;
          updated = true;
        }
      }

      // Fix bullets: Remove "edit" suffix and "Test" prefix
      if (content.bullets && Array.isArray(content.bullets)) {
        const cleanedBullets = content.bullets.map((bullet) => {
          if (typeof bullet === 'string') {
            return bullet
              .replace(/\s*edit\s*$/gi, '')
              .replace(/^test\.?\s*/gi, '')
              .replace(/^Test\s*/g, '')
              .trim();
          }
          return bullet;
        });
        if (JSON.stringify(cleanedBullets) !== JSON.stringify(content.bullets)) {
          updatedContent.bullets = cleanedBullets;
          updated = true;
        }
      }

      // Fix features: Remove "edit" suffix
      if (content.features && Array.isArray(content.features)) {
        const cleanedFeatures = content.features.map((feature) => {
          if (typeof feature === 'string') {
            return feature.replace(/\s*edit\s*$/gi, '').trim();
          }
          return feature;
        });
        if (JSON.stringify(cleanedFeatures) !== JSON.stringify(content.features)) {
          updatedContent.features = cleanedFeatures;
          updated = true;
        }
      }

      if (updated) {
        await client.query(
          'UPDATE page_sections SET content = $1 WHERE id = $2',
          [updatedContent, section.id]
        );
        console.log('✅ Fixed surf weeks section');
      }
    }

    // 4. Fix "What we are about" section
    console.log('\n4️⃣ Fixing "What we are about" section...');
    const aboutResult = await client.query(`
      SELECT id, content 
      FROM page_sections 
      WHERE page_slug = 'home' AND section_type = 'what_we_are_about'
    `);

    for (const section of aboutResult.rows) {
      const content = section.content || {};
      let updated = false;
      const updatedContent = { ...content };

      // Fix description: Remove "Test" suffix
      if (content.description && typeof content.description === 'string') {
        const cleaned = content.description.replace(/\s*Test\s*$/gi, '').trim();
        if (cleaned !== content.description) {
          updatedContent.description = cleaned;
          updated = true;
        }
      }

      if (updated) {
        await client.query(
          'UPDATE page_sections SET content = $1 WHERE id = $2',
          [updatedContent, section.id]
        );
        console.log('✅ Fixed "What we are about" section');
      }
    }

    // 5. Fix activities section
    console.log('\n5️⃣ Fixing activities section...');
    const activityResult = await client.query(`
      SELECT id, content 
      FROM page_sections 
      WHERE page_slug = 'home' AND section_type IN ('activities', 'activities_around')
    `);

    for (const section of activityResult.rows) {
      const content = section.content || {};
      let updated = false;
      const updatedContent = { ...content };

      // Fix activities array
      if (content.activities && Array.isArray(content.activities)) {
        const cleanedActivities = content.activities.map((activity) => {
          if (typeof activity === 'object' && activity.title) {
            const cleanedTitle = activity.title
              .replace(/\s*Test\.?\s*$/gi, '')
              .replace(/\s*test\s*$/gi, '')
              .trim();
            return { ...activity, title: cleanedTitle };
          }
          return activity;
        });
        if (JSON.stringify(cleanedActivities) !== JSON.stringify(content.activities)) {
          updatedContent.activities = cleanedActivities;
          updated = true;
        }
      }

      if (updated) {
        await client.query(
          'UPDATE page_sections SET content = $1 WHERE id = $2',
          [updatedContent, section.id]
        );
        console.log('✅ Fixed activities section');
      }
    }

    // 6. Fix surf weeks page title and description
    console.log('\n6️⃣ Fixing surf weeks page content...');
    const surfWeeksPageResult = await client.query(`
      SELECT id, content 
      FROM page_sections 
      WHERE page_slug = 'surf-weeks'
    `);

    for (const section of surfWeeksPageResult.rows) {
      const content = section.content || {};
      let updated = false;
      const updatedContent = { ...content };

      // Fix title: Remove "test" suffix
      if (content.title && typeof content.title === 'string') {
        const cleaned = content.title.replace(/\s*test\s*$/gi, '').trim();
        if (cleaned !== content.title) {
          updatedContent.title = cleaned;
          updated = true;
        }
      }

      // Fix description: Remove "test." prefix
      if (content.description && typeof content.description === 'string') {
        const cleaned = content.description.replace(/^test\.?\s*/gi, '').trim();
        if (cleaned !== content.description) {
          updatedContent.description = cleaned;
          updated = true;
        }
      }

      if (updated) {
        await client.query(
          'UPDATE page_sections SET content = $1 WHERE id = $2',
          [updatedContent, section.id]
        );
        console.log('✅ Fixed surf weeks page content');
      }
    }

    // 7. Fix Room 1 description (remove "Updated via browser test")
    console.log('\n7️⃣ Fixing Room 1 description...');
    const room1Result = await client.query(`
      SELECT id, name, description 
      FROM rooms 
      WHERE LOWER(name) LIKE '%room 1%'
    `);

    for (const room of room1Result.rows) {
      if (room.description && room.description.includes('Updated via browser test')) {
        const updatedDescription = room.description.replace(/\s*-\s*Updated via browser test/gi, '').trim();
        await client.query(
          'UPDATE rooms SET description = $1 WHERE id = $2',
          [updatedDescription, room.id]
        );
        console.log(`✅ Fixed Room 1 description`);
      }
    }

    console.log('\n✅ All content fixes completed!');
    await client.end();
  } catch (error) {
    console.error('❌ Error fixing content:', error);
    await client.end();
    process.exit(1);
  }
}

fixContent();



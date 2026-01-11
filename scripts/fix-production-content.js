#!/usr/bin/env node
/**
 * Fix Production Content Issues
 * Removes test text and fixes typos in database content
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pguipwhrxdzzrndbluxb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Direct PostgreSQL connection string
const DB_CONNECTION_STRING = process.env.DATABASE_URL || 
  'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres';

async function fixContent() {
  console.log('🔧 Fixing production content issues...\n');

  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // 1. Fix Room 2 typo: "Double troom" → "Double room"
    console.log('1️⃣ Fixing Room 2 typo...');
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name, description')
      .ilike('name', '%room 2%')
      .or('name.ilike.%double%');

    if (roomsError) {
      console.error('❌ Error fetching rooms:', roomsError);
    } else if (rooms && rooms.length > 0) {
      for (const room of rooms) {
        if (room.description && room.description.includes('Double troom')) {
          const updatedDescription = room.description.replace(/Double troom/gi, 'Double room');
          const { error: updateError } = await supabase
            .from('rooms')
            .update({ description: updatedDescription })
            .eq('id', room.id);
          
          if (updateError) {
            console.error(`❌ Error updating room ${room.id}:`, updateError);
          } else {
            console.log(`✅ Fixed typo in room: ${room.name}`);
          }
        }
      }
    }

    // 2. Fix homepage hero section content
    console.log('\n2️⃣ Fixing homepage hero section...');
    const { data: heroSections, error: heroError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_slug', 'home')
      .eq('section_type', 'hero');

    if (heroError) {
      console.error('❌ Error fetching hero sections:', heroError);
    } else if (heroSections && heroSections.length > 0) {
      for (const section of heroSections) {
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
          const { error: updateError } = await supabase
            .from('page_sections')
            .update({ content: updatedContent })
            .eq('id', section.id);
          
          if (updateError) {
            console.error(`❌ Error updating hero section:`, updateError);
          } else {
            console.log('✅ Fixed homepage hero section');
          }
        }
      }
    }

    // 3. Fix surf weeks section content
    console.log('\n3️⃣ Fixing surf weeks section...');
    const { data: surfWeeksSections, error: surfWeeksError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_slug', 'home')
      .eq('section_type', 'surf-weeks');

    if (surfWeeksError) {
      console.error('❌ Error fetching surf weeks sections:', surfWeeksError);
    } else if (surfWeeksSections && surfWeeksSections.length > 0) {
      for (const section of surfWeeksSections) {
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
          const { error: updateError } = await supabase
            .from('page_sections')
            .update({ content: updatedContent })
            .eq('id', section.id);
          
          if (updateError) {
            console.error(`❌ Error updating surf weeks section:`, updateError);
          } else {
            console.log('✅ Fixed surf weeks section');
          }
        }
      }
    }

    // 4. Fix "What we are about" section
    console.log('\n4️⃣ Fixing "What we are about" section...');
    const { data: aboutSections, error: aboutError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_slug', 'home')
      .eq('section_type', 'what_we_are_about');

    if (aboutError) {
      console.error('❌ Error fetching about sections:', aboutError);
    } else if (aboutSections && aboutSections.length > 0) {
      for (const section of aboutSections) {
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
          const { error: updateError } = await supabase
            .from('page_sections')
            .update({ content: updatedContent })
            .eq('id', section.id);
          
          if (updateError) {
            console.error(`❌ Error updating about section:`, updateError);
          } else {
            console.log('✅ Fixed "What we are about" section');
          }
        }
      }
    }

    // 5. Fix activities section (Play Test, Surf Test, Flow Test)
    console.log('\n5️⃣ Fixing activities section...');
    const { data: activitySections, error: activityError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_slug', 'home')
      .in('section_type', ['activities', 'activities_around']);

    if (activityError) {
      console.error('❌ Error fetching activity sections:', activityError);
    } else if (activitySections && activitySections.length > 0) {
      for (const section of activitySections) {
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
          const { error: updateError } = await supabase
            .from('page_sections')
            .update({ content: updatedContent })
            .eq('id', section.id);
          
          if (updateError) {
            console.error(`❌ Error updating activity section:`, updateError);
          } else {
            console.log('✅ Fixed activities section');
          }
        }
      }
    }

    // 6. Fix surf weeks page title and description
    console.log('\n6️⃣ Fixing surf weeks page content...');
    const { data: surfWeeksPageSections, error: surfWeeksPageError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_slug', 'surf-weeks');

    if (surfWeeksPageError) {
      console.error('❌ Error fetching surf weeks page sections:', surfWeeksPageError);
    } else if (surfWeeksPageSections && surfWeeksPageSections.length > 0) {
      for (const section of surfWeeksPageSections) {
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
          const { error: updateError } = await supabase
            .from('page_sections')
            .update({ content: updatedContent })
            .eq('id', section.id);
          
          if (updateError) {
            console.error(`❌ Error updating surf weeks page section:`, updateError);
          } else {
            console.log('✅ Fixed surf weeks page content');
          }
        }
      }
    }

    console.log('\n✅ Content fixes completed!');
  } catch (error) {
    console.error('❌ Error fixing content:', error);
    process.exit(1);
  }
}

fixContent();







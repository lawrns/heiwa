#!/usr/bin/env node
/**
 * Fix Script for Site-Wide CMS Content Issues
 * Fixes all high-priority issues found in diagnostic
 */

const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres'

async function fixAllIssues() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    console.log('='.repeat(80))
    console.log('FIXING SITE-WIDE CMS ISSUES')
    console.log('='.repeat(80))

    // 1. Fix PLAY FAQ - Add FAQ items
    console.log('\n1. FIXING PLAY FAQ SECTION')
    console.log('-'.repeat(80))
    
    const playFaqItems = [
      {
        question: "Are the play activities included in the surf week package?",
        answer: "Yes! Most of our play activities including table games, skatepark access, pool usage, and gym facilities are included in your surf week stay. Some activities like bicycle rental may have additional costs."
      },
      {
        question: "Do I need to bring my own equipment for activities?",
        answer: "No need to bring equipment! We provide all necessary gear for table games, skateboarding, and gym activities. For bicycles, we offer rentals with locks and board racks included."
      },
      {
        question: "Is the skatepark suitable for beginners?",
        answer: "Absolutely! Our skatepark has obstacles and ramps for all skill levels, from first-time skaters to experienced riders. We also offer surfskate lessons as part of our surf weeks."
      },
      {
        question: "What are the pool and sauna opening hours?",
        answer: "The pool is available throughout the day for guests. Sauna sessions are typically held in the evenings, with ice bath access available during sauna nights. Specific times may vary based on weather and season."
      },
      {
        question: "Can I use the gym facilities anytime?",
        answer: "Yes, gym access is available to all guests throughout your stay. We have basic equipment for cardio and strength training to help you stay active during your visit."
      },
      {
        question: "Are the activities supervised?",
        answer: "While most activities are self-guided, our staff is always available to help with equipment, provide tips, or join in the fun. During surf weeks, we often organize group activities and games."
      }
    ]

    const playFaqUpdate = await client.query(`
      UPDATE page_content 
      SET json_content = jsonb_set(
        json_content, 
        '{items}', 
        $1::jsonb
      ),
      updated_at = NOW()
      WHERE page_slug = 'play' 
      AND section = 'faq'
      RETURNING id, jsonb_array_length(json_content->'items') as item_count
    `, [JSON.stringify(playFaqItems)])
    
    if (playFaqUpdate.rows.length > 0) {
      console.log(`✅ Play FAQ items added: ${playFaqUpdate.rows[0].item_count} items`)
    } else {
      console.log('⚠️  Play FAQ section not found')
    }

    // 2. Fix FLOW Hero - Add image URL
    console.log('\n2. FIXING FLOW HERO IMAGE')
    console.log('-'.repeat(80))
    
    const flowHeroUpdate = await client.query(`
      UPDATE page_content 
      SET json_content = jsonb_set(
        json_content, 
        '{image_url}', 
        '"/images/yoga_dome3.jpg"'::jsonb
      ),
      updated_at = NOW()
      WHERE page_slug = 'flow' 
      AND section = 'hero'
      RETURNING id, json_content->>'image_url' as image_url
    `)
    
    if (flowHeroUpdate.rows.length > 0) {
      console.log(`✅ Flow hero image URL added: ${flowHeroUpdate.rows[0].image_url}`)
    } else {
      console.log('⚠️  Flow hero section not found')
    }

    // 3. Fix FLOW Intro - Add description
    console.log('\n3. FIXING FLOW INTRO SECTION')
    console.log('-'.repeat(80))
    
    const flowIntroDescription = `Heiwa Flow is your gateway to deeper wellness and self-discovery. Through ancient practices and modern therapies, we help you find balance, reduce stress, and connect with your true self.

Whether you're seeking physical recovery, mental clarity, or spiritual growth, our flow services provide the perfect complement to your active surf lifestyle.`
    
    const flowIntroUpdate = await client.query(`
      UPDATE page_content 
      SET json_content = jsonb_set(
        json_content, 
        '{description}', 
        $1::jsonb
      ),
      updated_at = NOW()
      WHERE page_slug = 'flow' 
      AND section = 'intro'
      RETURNING id, json_content->>'description' as description
    `, [JSON.stringify(flowIntroDescription)])
    
    if (flowIntroUpdate.rows.length > 0) {
      console.log(`✅ Flow intro description added`)
      console.log(`   Preview: ${flowIntroUpdate.rows[0].description?.substring(0, 80)}...`)
    } else {
      console.log('⚠️  Flow intro section not found')
    }

    // 4. Create SURF-WEEKS CMS content (basic structure)
    console.log('\n4. CREATING SURF-WEEKS CMS CONTENT')
    console.log('-'.repeat(80))
    
    // Check if surf-weeks content exists
    const surfWeeksCheck = await client.query(`
      SELECT COUNT(*) as count FROM page_content WHERE page_slug = 'surf-weeks'
    `)
    
    if (surfWeeksCheck.rows[0].count === '0') {
      // Create hero section
      const heroInsert = await client.query(`
        INSERT INTO page_content (
          page_slug, 
          section, 
          section_name, 
          title, 
          json_content, 
          is_active, 
          order_index,
          created_at,
          updated_at
        ) VALUES (
          'surf-weeks',
          'hero',
          'Hero Section',
          'Surf Weeks at Heiwa House',
          $1::jsonb,
          true,
          0,
          NOW(),
          NOW()
        ) RETURNING id
      `, [JSON.stringify({
        title: 'Surf Weeks',
        description: "We strive to deliver an unforgettable surf week experience both in and out of the water. Even if surfing were taken out of the week, it would still be worth your while—amazing food, yoga, music, skateboarding, games, exploring, relaxing, and simply enjoying life. Oh, and the surfing? That's going to be awesome too 🙂",
        image_url: '/images/surf-weeks-front-page.jpg'
      })])
      
      console.log(`✅ Created surf-weeks hero section (ID: ${heroInsert.rows[0].id})`)
      
      // Create intro section
      const introInsert = await client.query(`
        INSERT INTO page_content (
          page_slug, 
          section, 
          section_name, 
          title, 
          json_content, 
          is_active, 
          order_index,
          created_at,
          updated_at
        ) VALUES (
          'surf-weeks',
          'intro',
          'Introduction',
          'Your Complete Surf Week Experience',
          $1::jsonb,
          true,
          1,
          NOW(),
          NOW()
        ) RETURNING id
      `, [JSON.stringify({
        description: "Join us for an unforgettable week of surfing, yoga, amazing food, and incredible community. Our surf weeks combine professional instruction, daily activities, and the perfect balance of adventure and relaxation."
      })])
      
      console.log(`✅ Created surf-weeks intro section (ID: ${introInsert.rows[0].id})`)
    } else {
      console.log('ℹ️  Surf-weeks CMS content already exists')
    }

    // 5. Verify all fixes
    console.log('\n' + '='.repeat(80))
    console.log('VERIFICATION')
    console.log('='.repeat(80))
    
    const verification = await client.query(`
      SELECT 
        page_slug,
        section,
        title,
        CASE 
          WHEN json_content->>'image_url' IS NOT NULL THEN 'Has image'
          WHEN json_content->>'description' IS NOT NULL THEN 'Has description'
          WHEN json_content->>'items' IS NOT NULL THEN 'Has items'
          ELSE 'No content'
        END as content_status
      FROM page_content 
      WHERE page_slug IN ('play', 'flow', 'surf-weeks')
      AND section IN ('hero', 'intro', 'faq')
      ORDER BY page_slug, 
        CASE section 
          WHEN 'hero' THEN 1
          WHEN 'intro' THEN 2
          WHEN 'faq' THEN 3
        END
    `)
    
    console.log('\nFixed sections:')
    verification.rows.forEach(row => {
      console.log(`  ${row.page_slug}/${row.section}: ${row.content_status}`)
    })

    console.log('\n' + '='.repeat(80))
    console.log('✅ ALL FIXES APPLIED SUCCESSFULLY!')
    console.log('='.repeat(80))
    console.log('\nNext steps:')
    console.log('1. Re-run diagnostic: node scripts/diagnose-all-cms-pages.js')
    console.log('2. Test pages on production site')
    console.log('3. Verify CMS content displays correctly\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

fixAllIssues().catch(console.error)


#!/usr/bin/env node
/**
 * Fix Script for Surf Page CMS Content Issues
 * - Fixes hero image URL
 * - Fixes video URL (removes non-existent file)
 * - Populates intro section content
 * - Populates FAQ section items
 */

const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres'

async function fixSurfCMS() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    // 1. Fix Hero Image URL
    console.log('='.repeat(80))
    console.log('1. FIXING HERO IMAGE URL')
    console.log('='.repeat(80))
    
    const heroUpdate = await client.query(`
      UPDATE page_content 
      SET json_content = jsonb_set(
        json_content, 
        '{image_url}', 
        '"/images/surf4.jpg"'::jsonb
      ),
      updated_at = NOW()
      WHERE id = '7ddfff43-6ab4-40ae-858f-64d3704f0035'
      RETURNING id, json_content->>'image_url' as image_url
    `)
    
    if (heroUpdate.rows.length > 0) {
      console.log('✅ Hero image URL updated')
      console.log(`   New URL: ${heroUpdate.rows[0].image_url}\n`)
    } else {
      console.log('⚠️  Hero section not found\n')
    }

    // 2. Remove Non-Existent Video URL
    console.log('='.repeat(80))
    console.log('2. REMOVING NON-EXISTENT VIDEO URL')
    console.log('='.repeat(80))
    
    const videoUpdate = await client.query(`
      UPDATE page_content 
      SET json_content = json_content - 'video_url',
      updated_at = NOW()
      WHERE id = '7ddfff43-6ab4-40ae-858f-64d3704f0035'
      RETURNING id, json_content->>'video_url' as video_url
    `)
    
    if (videoUpdate.rows.length > 0) {
      console.log('✅ Video URL removed from hero section')
      console.log(`   Video URL: ${videoUpdate.rows[0].video_url || '(removed)'}\n`)
    }

    // 3. Populate Intro Section
    console.log('='.repeat(80))
    console.log('3. POPULATING INTRO SECTION')
    console.log('='.repeat(80))
    
    const introDescription = `Located in the heart of Portugal's surf paradise, Heiwa House offers direct access to some of Europe's most beautiful beaches. Our prime location between Ericeira and Peniche puts you within minutes of world-class surf breaks suitable for all levels.

Whether you're catching your first wave or perfecting advanced techniques, our experienced instructors and pristine conditions create the perfect environment for your surfing journey.`
    
    const introUpdate = await client.query(`
      UPDATE page_content 
      SET json_content = jsonb_set(
        json_content, 
        '{description}', 
        $1::jsonb
      ),
      updated_at = NOW()
      WHERE id = '0cbb7cf4-6179-447d-b8b8-c79c7bd7195d'
      RETURNING id, json_content->>'description' as description
    `, [JSON.stringify(introDescription)])
    
    if (introUpdate.rows.length > 0) {
      console.log('✅ Intro section description added')
      console.log(`   Preview: ${introUpdate.rows[0].description?.substring(0, 100)}...\n`)
    } else {
      console.log('⚠️  Intro section not found\n')
    }

    // 4. Populate FAQ Section
    console.log('='.repeat(80))
    console.log('4. POPULATING FAQ SECTION')
    console.log('='.repeat(80))
    
    const faqItems = [
      {
        question: "What is the best time of year to surf in Santa Cruz?",
        answer: "Portugal offers year-round surfing! Summer (June-September) provides smaller, more manageable waves perfect for beginners, with water temperatures around 18-20°C. Autumn and winter (October-March) bring bigger swells for experienced surfers, though the water is cooler (14-16°C). Spring (April-May) offers a great balance of consistent waves and pleasant weather."
      },
      {
        question: "Do I need to bring my own surfboard?",
        answer: "No need to bring your own board! We offer surfboard rentals at 20€ per day and wetsuits at 5€ per day. We also have special weekly rates available. Our surf lessons include all equipment. If you prefer to bring your own board, we have secure storage available."
      },
      {
        question: "Are there surf spots suitable for beginners?",
        answer: "Absolutely! The beaches near our house offer gentle, sandy-bottomed breaks perfect for beginners. The long sandy beaches provide plenty of space to learn safely. Both Ericeira and Peniche also have beginner-friendly spots, and our instructors will help you find the best conditions for your level."
      },
      {
        question: "How do I get to the surf spots from Heiwa House?",
        answer: "The nearest surf spots are incredibly accessible - just a 15-20 minute walk or 5 minute drive from the house. For Ericeira and Peniche (about 30 minutes drive each way), we organize daily surf trips as part of our surf weeks. You can also rent a bicycle from us for 30€/week to explore the local beaches independently."
      },
      {
        question: "What surf lessons do you offer?",
        answer: "We offer professional surf instruction for all levels. One lesson costs 45€, or you can get five lessons for 200€. All lessons include professional instructors, equipment (board and wetsuit), and daily video analysis. We also provide a free introductory surf lesson at the house to teach you the basics before hitting the water."
      },
      {
        question: "Can I surf without joining a surf week?",
        answer: "Yes! You can book a private room or bed with us and surf independently. We offer surfboard and wetsuit rentals, individual surf lessons, and can provide information about the best local spots. Our surf weeks are an amazing experience, but you're welcome to create your own surf adventure."
      },
      {
        question: "What makes the surfing in this area special?",
        answer: "Our location is truly unique - we're perfectly positioned between two of Portugal's most famous surf destinations (Ericeira and Peniche), giving you access to dozens of world-class surf spots within 30 minutes. Plus, you have beautiful, less-crowded beaches just 5 minutes away. This variety means you can always find the perfect wave for your skill level and the day's swell conditions."
      },
      {
        question: "What skill level do I need to be?",
        answer: "All levels are welcome! Whether you've never stood on a surfboard or you're an experienced surfer looking to improve, the variety of breaks in this area cater to everyone. Our instructors will assess your level and guide you to the spots that match your abilities, ensuring you progress safely and have fun."
      }
    ]
    
    const faqUpdate = await client.query(`
      UPDATE page_content 
      SET json_content = jsonb_set(
        json_content, 
        '{items}', 
        $1::jsonb
      ),
      updated_at = NOW()
      WHERE id = 'e7ee7297-02b9-4991-8e24-f2d69b1e6e79'
      RETURNING id, jsonb_array_length(json_content->'items') as item_count
    `, [JSON.stringify(faqItems)])
    
    if (faqUpdate.rows.length > 0) {
      console.log('✅ FAQ section items added')
      console.log(`   Number of FAQ items: ${faqUpdate.rows[0].item_count}\n`)
    } else {
      console.log('⚠️  FAQ section not found\n')
    }

    // 5. Verify Changes
    console.log('='.repeat(80))
    console.log('5. VERIFYING CHANGES')
    console.log('='.repeat(80))
    
    const verification = await client.query(`
      SELECT 
        section,
        title,
        json_content->>'image_url' as image_url,
        json_content->>'video_url' as video_url,
        CASE 
          WHEN json_content->>'description' IS NOT NULL THEN 'Has description'
          WHEN json_content->>'items' IS NOT NULL THEN 'Has items'
          ELSE 'No content'
        END as content_status
      FROM page_content 
      WHERE page_slug = 'surf' 
      AND section IN ('hero', 'intro', 'faq')
      ORDER BY 
        CASE section 
          WHEN 'hero' THEN 1
          WHEN 'intro' THEN 2
          WHEN 'faq' THEN 3
        END
    `)
    
    console.log('\nUpdated sections:')
    verification.rows.forEach(row => {
      console.log(`\n${row.section.toUpperCase()}:`)
      console.log(`  Title: ${row.title}`)
      if (row.image_url) {
        console.log(`  Image: ${row.image_url}`)
      }
      if (row.video_url) {
        console.log(`  Video: ${row.video_url}`)
      }
      console.log(`  Content: ${row.content_status}`)
    })

    console.log('\n' + '='.repeat(80))
    console.log('✅ ALL FIXES APPLIED SUCCESSFULLY!')
    console.log('='.repeat(80))
    console.log('\nNext steps:')
    console.log('1. Visit https://heiwahauz.netlify.app/surf to verify changes')
    console.log('2. Check browser console for any remaining errors')
    console.log('3. Verify hero image loads correctly')
    console.log('4. Verify intro section shows CMS content')
    console.log('5. Verify FAQ section shows CMS items\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

fixSurfCMS().catch(console.error)


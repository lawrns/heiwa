#!/usr/bin/env node

/**
 * Find CMS Content Mismatches
 * Compares database CMS content with what's actually displayed on pages
 */

const { Client } = require('pg')

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres'

const client = new Client({
  connectionString: DB_URL,
})

const mismatches = []

async function checkSurfWeeksPage() {
  console.log('\n=== Checking surf-weeks page ===')
  
  const { rows } = await client.query(`
    SELECT section_type, content, is_active 
    FROM page_sections 
    WHERE page_slug = 'surf-weeks' 
    ORDER BY order_index
  `)
  
  console.log(`Found ${rows.length} CMS sections`)
  
  // Check hero section
  const heroSection = rows.find(r => r.section_type === 'hero')
  if (heroSection) {
    const cmsTitle = heroSection.content?.title
    const cmsDescription = heroSection.content?.description || heroSection.content?.content
    
    // From page.tsx line 348-352
    const displayedTitle = cmsTitle || "Surf Weeks"
    const displayedDescription = cmsDescription || "We strive to deliver an unforgettable surf week experience both in and out of the water. Even if surfing were taken out of the week, it would still be worth your while—amazing food, yoga, music, skateboarding, games, exploring, relaxing, and simply enjoying life. Oh, and the surfing? That's going to be awesome too 🙂"
    
    if (cmsTitle && displayedTitle !== cmsTitle) {
      mismatches.push({
        page: 'surf-weeks',
        section: 'hero',
        field: 'title',
        cms: cmsTitle,
        displayed: displayedTitle,
        issue: 'CMS title exists but fallback is used'
      })
    }
    
    if (cmsDescription && displayedDescription !== cmsDescription) {
      mismatches.push({
        page: 'surf-weeks',
        section: 'hero',
        field: 'description',
        cms: cmsDescription,
        displayed: displayedDescription,
        issue: 'CMS description exists but fallback is used'
      })
    }
    
    console.log(`Hero: title="${cmsTitle || 'NOT SET'}", description="${cmsDescription ? cmsDescription.substring(0, 50) + '...' : 'NOT SET'}"`)
  }
  
  // Check intro section
  const introSection = rows.find(r => r.section_type === 'intro')
  if (introSection) {
    const cmsTitle = introSection.content?.title
    const cmsContent = introSection.content?.content
    
    // From page.tsx - introContent is extracted but NOT USED in the rendered page!
    // Line 161: const introContent = introSection?.content as { title?: string; content?: string } | undefined
    // But it's never rendered!
    
    console.log(`Intro: title="${cmsTitle || 'NOT SET'}", content="${cmsContent ? cmsContent.substring(0, 50) + '...' : 'NOT SET'}"`)
    
    if (cmsTitle || cmsContent) {
      mismatches.push({
        page: 'surf-weeks',
        section: 'intro',
        field: 'content',
        cms: `Title: ${cmsTitle || 'N/A'}, Content: ${cmsContent || 'N/A'}`,
        displayed: 'NOT DISPLAYED',
        issue: 'CMS intro content exists but is never rendered on the page'
      })
    }
  }
  
  // Check FAQ section
  const faqSection = rows.find(r => r.section_type === 'faq')
  if (faqSection) {
    const cmsTitle = faqSection.content?.title
    const cmsItems = faqSection.content?.items
    
    console.log(`FAQ: title="${cmsTitle || 'NOT SET'}", items=${cmsItems?.length || 0}`)
    
    // Page uses faqContent but falls back to hardcoded FAQs
    if (cmsItems && Array.isArray(cmsItems) && cmsItems.length > 0) {
      // Check if displayed FAQs match
      const hardcodedFAQs = [
        'How much does Surf Week cost?',
        'Do I have to know how to surf or skateboard?',
        'How does a typical day during Surf Week look?',
        'How many people are in Surf Week groups?',
        'What is the age of people who sign up?'
      ]
      
      const cmsQuestions = cmsItems.map((item) => item.question || item.title).filter(Boolean)
      const questionsMatch = cmsQuestions.length === hardcodedFAQs.length && 
        cmsQuestions.every((q, i) => q === hardcodedFAQs[i])
      
      if (!questionsMatch) {
        mismatches.push({
          page: 'surf-weeks',
          section: 'faq',
          field: 'items',
          cms: `CMS has ${cmsItems.length} FAQs: ${cmsQuestions.join(', ')}`,
          displayed: `Hardcoded ${hardcodedFAQs.length} FAQs: ${hardcodedFAQs.join(', ')}`,
          issue: 'CMS FAQs exist but may not match displayed FAQs'
        })
      }
    }
  }
}

async function checkHomepage() {
  console.log('\n=== Checking homepage ===')
  
  const { rows } = await client.query(`
    SELECT section_type, content, is_active 
    FROM page_sections 
    WHERE page_slug = 'home' 
    ORDER BY order_index
  `)
  
  console.log(`Found ${rows.length} CMS sections`)
  
  rows.forEach(row => {
    const title = row.content?.title || 'N/A'
    const subtitle = row.content?.subtitle || 'N/A'
    console.log(`Section ${row.section_type}: title="${title.substring(0, 50)}", subtitle="${subtitle.substring(0, 50)}"`)
  })
  
  // Check if hero section has content but fallback is used
  const heroSection = rows.find(r => r.section_type === 'hero')
  if (heroSection) {
    const cmsTitle = heroSection.content?.title
    const cmsSubtitle = heroSection.content?.subtitle
    
    // From page.tsx - checks if CMS title/subtitle exist but fallbacks are used
    if (cmsTitle && cmsTitle !== 'Welcome to Heiwa House') {
      // Check if it matches what's displayed
      console.log(`Hero title in CMS: "${cmsTitle}"`)
    }
  }
}

async function checkFlowPage() {
  console.log('\n=== Checking flow page ===')
  
  const { rows } = await client.query(`
    SELECT section_type, content, is_active 
    FROM page_sections 
    WHERE page_slug = 'flow' 
    ORDER BY order_index
  `)
  
  console.log(`Found ${rows.length} CMS sections`)
  
  const heroSection = rows.find(r => r.section_type === 'hero')
  if (heroSection) {
    const cmsTitle = heroSection.content?.title
    const cmsDescription = heroSection.content?.description
    
    // From flow/page.tsx line 55-56 - uses fallback if CMS not available
    const displayedTitle = cmsTitle || "Heiwa Flow"
    const displayedDescription = cmsDescription || "Find your inner flow through yoga, wellness, and mindful practices. Balance your body, mind, and spirit in our peaceful Portuguese sanctuary."
    
    if (!cmsTitle || displayedTitle !== cmsTitle) {
      mismatches.push({
        page: 'flow',
        section: 'hero',
        field: 'title',
        cms: cmsTitle || 'NOT SET',
        displayed: displayedTitle,
        issue: cmsTitle ? 'CMS title exists but may not match displayed' : 'CMS title not set, using fallback'
      })
    }
    
    if (!cmsDescription || displayedDescription !== cmsDescription) {
      mismatches.push({
        page: 'flow',
        section: 'hero',
        field: 'description',
        cms: cmsDescription || 'NOT SET',
        displayed: displayedDescription,
        issue: cmsDescription ? 'CMS description exists but may not match displayed' : 'CMS description not set, using fallback'
      })
    }
    
    console.log(`Hero: title="${cmsTitle || 'NOT SET'}", description="${cmsDescription ? cmsDescription.substring(0, 50) + '...' : 'NOT SET'}"`)
  }
  
  const introSection = rows.find(r => r.section_type === 'intro')
  if (introSection) {
    const cmsTitle = introSection.content?.title
    const cmsContent = introSection.content?.content
    
    // From flow/page.tsx line 65-87 - uses CMS if available, otherwise fallback
    if (cmsTitle || cmsContent) {
      console.log(`Intro: title="${cmsTitle || 'NOT SET'}", content="${cmsContent ? cmsContent.substring(0, 50) + '...' : 'NOT SET'}"`)
    } else {
      mismatches.push({
        page: 'flow',
        section: 'intro',
        field: 'content',
        cms: 'NOT SET',
        displayed: 'Using hardcoded fallback content',
        issue: 'CMS intro content not set, using hardcoded fallback'
      })
    }
  }
}

async function checkSurfPage() {
  console.log('\n=== Checking surf page ===')
  
  const { rows } = await client.query(`
    SELECT section_type, content, is_active 
    FROM page_sections 
    WHERE page_slug = 'surf' 
    ORDER BY order_index
  `)
  
  console.log(`Found ${rows.length} CMS sections`)
  
  const heroSection = rows.find(r => r.section_type === 'hero')
  if (heroSection) {
    const cmsTitle = heroSection.content?.title
    const cmsDescription = heroSection.content?.description
    
    console.log(`Hero: title="${cmsTitle || 'NOT SET'}", description="${cmsDescription ? cmsDescription.substring(0, 50) + '...' : 'NOT SET'}"`)
    
    if (!cmsTitle || !cmsDescription) {
      mismatches.push({
        page: 'surf',
        section: 'hero',
        field: 'content',
        cms: `Title: ${cmsTitle || 'NOT SET'}, Description: ${cmsDescription || 'NOT SET'}`,
        displayed: 'Using fallback content',
        issue: 'CMS hero content incomplete, using fallbacks'
      })
    }
  }
  
  const introSection = rows.find(r => r.section_type === 'intro')
  if (introSection) {
    const cmsTitle = introSection.content?.title
    const cmsContent = introSection.content?.content
    
    console.log(`Intro: title="${cmsTitle || 'NOT SET'}", content="${cmsContent ? cmsContent.substring(0, 50) + '...' : 'NOT SET'}"`)
    
    if (!cmsTitle || !cmsContent) {
      mismatches.push({
        page: 'surf',
        section: 'intro',
        field: 'content',
        cms: `Title: ${cmsTitle || 'NOT SET'}, Content: ${cmsContent || 'NOT SET'}`,
        displayed: 'Using hardcoded fallback content',
        issue: 'CMS intro content incomplete, using hardcoded fallback'
      })
    }
  }
  
  const faqSection = rows.find(r => r.section_type === 'faq')
  if (faqSection) {
    const cmsItems = faqSection.content?.items
    
    if (!cmsItems || !Array.isArray(cmsItems) || cmsItems.length === 0) {
      mismatches.push({
        page: 'surf',
        section: 'faq',
        field: 'items',
        cms: 'NOT SET',
        displayed: 'Using hardcoded FAQ items',
        issue: 'CMS FAQ items not set, using hardcoded fallback FAQs'
      })
    } else {
      console.log(`FAQ: ${cmsItems.length} items`)
    }
  }
}

async function checkPlayPage() {
  console.log('\n=== Checking play page ===')
  
  const { rows } = await client.query(`
    SELECT section_type, content, is_active 
    FROM page_sections 
    WHERE page_slug = 'play' 
    ORDER BY order_index
  `)
  
  console.log(`Found ${rows.length} CMS sections`)
  
  const heroSection = rows.find(r => r.section_type === 'hero')
  if (heroSection) {
    const cmsTitle = heroSection.content?.title
    const cmsDescription = heroSection.content?.description
    
    console.log(`Hero: title="${cmsTitle || 'NOT SET'}", description="${cmsDescription ? cmsDescription.substring(0, 50) + '...' : 'NOT SET'}"`)
    
    if (!cmsTitle || !cmsDescription) {
      mismatches.push({
        page: 'play',
        section: 'hero',
        field: 'content',
        cms: `Title: ${cmsTitle || 'NOT SET'}, Description: ${cmsDescription || 'NOT SET'}`,
        displayed: 'Using fallback content',
        issue: 'CMS hero content incomplete, using fallbacks'
      })
    }
  }
  
  const introSection = rows.find(r => r.section_type === 'intro')
  if (introSection) {
    const cmsTitle = introSection.content?.title
    const cmsContent = introSection.content?.content
    
    console.log(`Intro: title="${cmsTitle || 'NOT SET'}", content="${cmsContent ? cmsContent.substring(0, 50) + '...' : 'NOT SET'}"`)
    
    if (!cmsTitle || !cmsContent) {
      mismatches.push({
        page: 'play',
        section: 'intro',
        field: 'content',
        cms: `Title: ${cmsTitle || 'NOT SET'}, Content: ${cmsContent || 'NOT SET'}`,
        displayed: 'Using hardcoded fallback content',
        issue: 'CMS intro content incomplete, using hardcoded fallback'
      })
    }
  }
}

async function checkTheSpotPage() {
  console.log('\n=== Checking the-spot page ===')
  
  const { rows } = await client.query(`
    SELECT section_type, content, is_active 
    FROM page_sections 
    WHERE page_slug = 'the-spot' 
    ORDER BY order_index
  `)
  
  console.log(`Found ${rows.length} CMS sections`)
  
  const heroSection = rows.find(r => r.section_type === 'hero')
  if (heroSection) {
    const cmsTitle = heroSection.content?.title
    const cmsDescription = heroSection.content?.description
    
    // From the-spot/page.tsx line 112-115
    const displayedTitle = cmsTitle || "The Spot"
    const displayedDescription = cmsDescription || "Your ultimate adult playground on Portugal's coast"
    
    if (!cmsTitle || displayedTitle !== cmsTitle) {
      mismatches.push({
        page: 'the-spot',
        section: 'hero',
        field: 'title',
        cms: cmsTitle || 'NOT SET',
        displayed: displayedTitle,
        issue: cmsTitle ? 'CMS title exists but may not match displayed' : 'CMS title not set, using fallback'
      })
    }
    
    if (!cmsDescription || displayedDescription !== cmsDescription) {
      mismatches.push({
        page: 'the-spot',
        section: 'hero',
        field: 'description',
        cms: cmsDescription || 'NOT SET',
        displayed: displayedDescription,
        issue: cmsDescription ? 'CMS description exists but may not match displayed' : 'CMS description not set, using fallback'
      })
    }
    
    console.log(`Hero: title="${cmsTitle || 'NOT SET'}", description="${cmsDescription ? cmsDescription.substring(0, 50) + '...' : 'NOT SET'}"`)
  }
  
  const introSection = rows.find(r => r.section_type === 'intro')
  if (introSection) {
    const cmsTitle = introSection.content?.title
    const cmsContent = introSection.content?.content
    
    // From the-spot/page.tsx line 126-143 - uses CMS if available, otherwise fallback
    if (cmsTitle || cmsContent) {
      console.log(`Intro: title="${cmsTitle || 'NOT SET'}", content="${cmsContent ? cmsContent.substring(0, 50) + '...' : 'NOT SET'}"`)
    } else {
      mismatches.push({
        page: 'the-spot',
        section: 'intro',
        field: 'content',
        cms: 'NOT SET',
        displayed: 'Using hardcoded fallback content ("Our Story" section)',
        issue: 'CMS intro content not set, using hardcoded fallback'
      })
    }
  }
}

async function checkAllPages() {
  console.log('\n=== Checking all pages ===')
  
  const { rows } = await client.query(`
    SELECT DISTINCT page_slug 
    FROM page_sections 
    ORDER BY page_slug
  `)
  
  console.log(`Pages with CMS content: ${rows.map(r => r.page_slug).join(', ')}`)
  
  for (const row of rows) {
    const pageSlug = row.page_slug
    const result = await client.query(`
      SELECT COUNT(*) as count 
      FROM page_sections 
      WHERE page_slug = $1 AND is_active = true
    `, [pageSlug])
    
    console.log(`  ${pageSlug}: ${result.rows[0].count} active sections`)
  }
}

async function main() {
  try {
    await client.connect()
    console.log('Connected to database')
    
    await checkAllPages()
    await checkSurfWeeksPage()
    await checkHomepage()
    await checkFlowPage()
    await checkSurfPage()
    await checkPlayPage()
    await checkTheSpotPage()
    
    console.log('\n=== MISMATCHES FOUND ===')
    if (mismatches.length === 0) {
      console.log('No mismatches found!')
    } else {
      console.log(`Found ${mismatches.length} mismatches:\n`)
      mismatches.forEach((m, i) => {
        console.log(`${i + 1}. ${m.page} > ${m.section} > ${m.field}`)
        console.log(`   Issue: ${m.issue}`)
        console.log(`   CMS: ${m.cms}`)
        console.log(`   Displayed: ${m.displayed}`)
        console.log('')
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.end()
  }
}

main()


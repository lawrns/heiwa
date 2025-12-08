#!/usr/bin/env node
/**
 * Site-Wide CMS Content Diagnostic Script
 * Checks all pages that use CMS content for mismatches
 * - surf, play, flow, the-spot, surf-weeks, contact
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres'

// Page configurations - what each page expects
const PAGE_CONFIGS = {
  'surf': {
    sections: ['hero', 'intro', 'faq'],
    hero: { needsImage: true, needsVideo: false, needsDescription: true },
    intro: { needsDescription: true },
    faq: { needsItems: true }
  },
  'play': {
    sections: ['hero', 'intro', 'faq'],
    hero: { needsImage: true, needsVideo: false, needsDescription: true },
    intro: { needsDescription: true },
    faq: { needsItems: true }
  },
  'flow': {
    sections: ['hero', 'intro'],
    hero: { needsImage: true, needsVideo: false, needsDescription: true },
    intro: { needsDescription: true }
  },
  'the-spot': {
    sections: ['hero', 'intro', 'story', 'features'],
    hero: { needsImage: true, needsVideo: false, needsDescription: true },
    intro: { needsDescription: true }
  },
  'surf-weeks': {
    sections: ['hero', 'intro', 'faq', 'features', 'included', 'steps', 'process'],
    hero: { needsImage: true, needsVideo: false, needsDescription: true },
    intro: { needsDescription: true },
    faq: { needsItems: true }
  },
  'contact': {
    sections: ['hero', 'intro', 'contact'],
    hero: { needsImage: false, needsVideo: false, needsDescription: false },
    intro: { needsDescription: true }
  }
}

async function checkImageExists(imageUrl) {
  if (!imageUrl || imageUrl.startsWith('http')) {
    return { exists: true, reason: 'external_url' }
  }
  
  if (imageUrl.startsWith('/')) {
    const filePath = path.join(process.cwd(), 'public', imageUrl)
    const exists = fs.existsSync(filePath)
    return { exists, path: filePath }
  }
  
  return { exists: false, reason: 'invalid_path' }
}

async function checkVideoExists(videoUrl) {
  if (!videoUrl || videoUrl.startsWith('http')) {
    return { exists: true, reason: 'external_url' }
  }
  
  if (videoUrl.startsWith('/')) {
    const filePath = path.join(process.cwd(), 'public', videoUrl)
    const exists = fs.existsSync(filePath)
    return { exists, path: filePath }
  }
  
  return { exists: false, reason: 'invalid_path' }
}

function getImageUrl(section) {
  return section.image_url || 
         section.json_content?.image_url || 
         section.json_content?.imageUrl
}

function getVideoUrl(section) {
  return section.video_url || 
         section.json_content?.video_url || 
         section.json_content?.videoUrl
}

function getDescription(section) {
  return section.json_content?.description || 
         section.json_content?.text || 
         section.content
}

function getTitle(section) {
  return section.json_content?.title || section.title
}

async function diagnosePage(client, pageSlug, config) {
  const issues = []
  const warnings = []
  
  console.log(`\n${'='.repeat(80)}`)
  console.log(`PAGE: ${pageSlug.toUpperCase()}`)
  console.log('='.repeat(80))
  
  // Fetch CMS content
  const result = await client.query(`
    SELECT 
      id,
      section,
      section_name,
      title,
      content,
      image_url,
      video_url,
      json_content,
      is_active,
      order_index
    FROM page_content 
    WHERE page_slug = $1
    ORDER BY order_index ASC, created_at ASC
  `, [pageSlug])
  
  const cmsSections = result.rows
  console.log(`Found ${cmsSections.length} CMS sections\n`)
  
  if (cmsSections.length === 0) {
    issues.push({
      type: 'missing_content',
      severity: 'high',
      message: `No CMS content found for page "${pageSlug}"`,
      recommendation: `Create CMS content entries for this page`
    })
    console.log('⚠️  No CMS content found - page will use hardcoded fallbacks\n')
    return { pageSlug, issues, warnings, sections: [] }
  }
  
  // Check each expected section
  for (const expectedSection of config.sections) {
    const section = cmsSections.find(s => s.section === expectedSection)
    
    if (!section) {
      warnings.push({
        type: 'missing_section',
        severity: 'medium',
        section: expectedSection,
        message: `Section "${expectedSection}" not found in CMS`,
        recommendation: `Create a "${expectedSection}" section for page "${pageSlug}"`
      })
      continue
    }
    
    console.log(`\n[${expectedSection.toUpperCase()}]`)
    console.log(`  ID: ${section.id}`)
    console.log(`  Title: ${getTitle(section) || '(none)'}`)
    console.log(`  Active: ${section.is_active}`)
    
    // Check hero section requirements
    if (expectedSection === 'hero') {
      const imageUrl = getImageUrl(section)
      const videoUrl = getVideoUrl(section)
      const description = getDescription(section)
      const title = getTitle(section)
      
      if (config.hero.needsImage) {
        if (!imageUrl) {
          issues.push({
            type: 'missing_image',
            severity: 'high',
            section: 'hero',
            message: 'Hero section has no image URL',
            recommendation: 'Add image_url to hero section'
          })
          console.log(`  ⚠️  Image URL: (missing)`)
        } else {
          const imageCheck = await checkImageExists(imageUrl)
          console.log(`  Image URL: ${imageUrl}`)
          if (!imageCheck.exists && imageCheck.reason !== 'external_url') {
            issues.push({
              type: 'missing_image_file',
              severity: 'high',
              section: 'hero',
              message: `Hero image file not found: ${imageUrl}`,
              filePath: imageCheck.path,
              recommendation: `Upload image to ${imageUrl} or update URL in CMS`
            })
            console.log(`  ❌ Image file not found: ${imageCheck.path}`)
          } else {
            console.log(`  ✅ Image: ${imageCheck.exists ? 'exists' : 'external URL'}`)
          }
        }
      }
      
      if (config.hero.needsVideo && videoUrl) {
        const videoCheck = await checkVideoExists(videoUrl)
        if (!videoCheck.exists && videoCheck.reason !== 'external_url') {
          warnings.push({
            type: 'missing_video_file',
            severity: 'medium',
            section: 'hero',
            message: `Hero video file not found: ${videoUrl}`,
            filePath: videoCheck.path,
            recommendation: `Upload video to ${videoUrl} or remove video URL`
          })
        }
      }
      
      if (config.hero.needsDescription && !description) {
        warnings.push({
          type: 'missing_description',
          severity: 'medium',
          section: 'hero',
          message: 'Hero section has no description',
          recommendation: 'Add description to hero section json_content'
        })
        console.log(`  ⚠️  Description: (missing)`)
      } else if (description) {
        console.log(`  ✅ Description: ${description.substring(0, 60)}...`)
      }
      
      if (!title) {
        warnings.push({
          type: 'missing_title',
          severity: 'low',
          section: 'hero',
          message: 'Hero section has no title',
          recommendation: 'Add title to hero section'
        })
      }
    }
    
    // Check intro section requirements
    if (expectedSection === 'intro') {
      const description = getDescription(section)
      
      if (config.intro.needsDescription && !description) {
        issues.push({
          type: 'missing_description',
          severity: 'high',
          section: 'intro',
          message: 'Intro section has no description/text content',
          recommendation: 'Add description or text to intro section json_content'
        })
        console.log(`  ⚠️  Description: (missing) - Frontend will use hardcoded fallback`)
      } else if (description) {
        console.log(`  ✅ Description: ${description.substring(0, 60)}...`)
      }
    }
    
    // Check FAQ section requirements
    if (expectedSection === 'faq') {
      const items = section.json_content?.items
      
      if (config.faq?.needsItems) {
        if (!items || !Array.isArray(items) || items.length === 0) {
          issues.push({
            type: 'missing_faq_items',
            severity: 'high',
            section: 'faq',
            message: 'FAQ section has no items array',
            recommendation: 'Add items array to FAQ section json_content'
          })
          console.log(`  ⚠️  FAQ Items: (missing) - Frontend will use hardcoded fallback`)
        } else {
          const validItems = items.filter(item => 
            (item.question || item.title) && (item.answer || item.description || item.text)
          )
          console.log(`  ✅ FAQ Items: ${validItems.length} valid items`)
          if (validItems.length < items.length) {
            warnings.push({
              type: 'invalid_faq_items',
              severity: 'medium',
              section: 'faq',
              message: `Some FAQ items are missing question or answer (${validItems.length}/${items.length} valid)`,
              recommendation: 'Ensure all FAQ items have both question and answer fields'
            })
          }
        }
      }
    }
  }
  
  // Check for unused sections
  const expectedSectionNames = config.sections
  const unusedSections = cmsSections.filter(s => !expectedSectionNames.includes(s.section))
  
  if (unusedSections.length > 0) {
    console.log(`\n⚠️  Unused sections found:`)
    unusedSections.forEach(s => {
      warnings.push({
        type: 'unused_section',
        severity: 'low',
        section: s.section,
        message: `Section "${s.section}" exists in CMS but frontend doesn't use it`,
        recommendation: `Either remove this section or update frontend to use it`
      })
      console.log(`  - ${s.section} (${s.section_name || 'unnamed'})`)
    })
  }
  
  return { pageSlug, issues, warnings, sections: cmsSections }
}

async function diagnoseAllPages() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    const results = []
    
    // Diagnose each page
    for (const [pageSlug, config] of Object.entries(PAGE_CONFIGS)) {
      const result = await diagnosePage(client, pageSlug, config)
      results.push(result)
    }
    
    // Summary
    console.log('\n' + '='.repeat(80))
    console.log('SITE-WIDE DIAGNOSTIC SUMMARY')
    console.log('='.repeat(80))
    
    const allIssues = []
    const allWarnings = []
    
    results.forEach(result => {
      allIssues.push(...result.issues.map(i => ({ ...i, page: result.pageSlug })))
      allWarnings.push(...result.warnings.map(w => ({ ...w, page: result.pageSlug })))
    })
    
    console.log(`\n📊 Statistics:`)
    console.log(`  Total pages checked: ${results.length}`)
    console.log(`  Total issues found: ${allIssues.length}`)
    console.log(`  Total warnings found: ${allWarnings.length}`)
    
    // Group issues by severity
    const highIssues = allIssues.filter(i => i.severity === 'high')
    const mediumIssues = allIssues.filter(i => i.severity === 'medium')
    const lowIssues = allIssues.filter(i => i.severity === 'low')
    
    if (highIssues.length > 0) {
      console.log(`\n❌ HIGH PRIORITY ISSUES (${highIssues.length}):`)
      highIssues.forEach((issue, idx) => {
        console.log(`\n  ${idx + 1}. [${issue.page}/${issue.section || 'general'}] ${issue.type}`)
        console.log(`     Message: ${issue.message}`)
        console.log(`     Recommendation: ${issue.recommendation}`)
        if (issue.filePath) {
          console.log(`     File Path: ${issue.filePath}`)
        }
      })
    }
    
    if (mediumIssues.length > 0 || allWarnings.filter(w => w.severity === 'medium').length > 0) {
      const mediumWarnings = allWarnings.filter(w => w.severity === 'medium')
      console.log(`\n⚠️  MEDIUM PRIORITY ISSUES (${mediumIssues.length + mediumWarnings.length}):`)
      const combined = [...mediumIssues, ...mediumWarnings]
      combined.forEach((item, idx) => {
        console.log(`\n  ${idx + 1}. [${item.page}/${item.section || 'general'}] ${item.type}`)
        console.log(`     Message: ${item.message}`)
        console.log(`     Recommendation: ${item.recommendation}`)
      })
    }
    
    if (lowIssues.length > 0 || allWarnings.filter(w => w.severity === 'low').length > 0) {
      const lowWarnings = allWarnings.filter(w => w.severity === 'low')
      console.log(`\n💡 LOW PRIORITY / INFORMATIONAL (${lowIssues.length + lowWarnings.length}):`)
      const combined = [...lowIssues, ...lowWarnings]
      combined.forEach((item, idx) => {
        console.log(`\n  ${idx + 1}. [${item.page}/${item.section || 'general'}] ${item.type}`)
        console.log(`     Message: ${item.message}`)
      })
    }
    
    // Per-page summary
    console.log(`\n📋 PER-PAGE SUMMARY:`)
    results.forEach(result => {
      const pageIssues = result.issues.length
      const pageWarnings = result.warnings.length
      const status = pageIssues === 0 && pageWarnings === 0 ? '✅' : 
                     pageIssues === 0 ? '⚠️' : '❌'
      console.log(`  ${status} ${result.pageSlug}: ${pageIssues} issues, ${pageWarnings} warnings`)
    })
    
    if (allIssues.length === 0 && allWarnings.length === 0) {
      console.log(`\n✅ No issues found! All pages are properly configured.`)
    } else {
      console.log(`\n💡 Next Steps:`)
      console.log(`  1. Review high priority issues first`)
      console.log(`  2. Fix missing images/files`)
      console.log(`  3. Populate missing CMS content`)
      console.log(`  4. Remove or utilize unused sections`)
      console.log(`  5. Re-run this diagnostic to verify fixes`)
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      pages: results.map(r => ({
        pageSlug: r.pageSlug,
        sectionsFound: r.sections.length,
        issues: r.issues,
        warnings: r.warnings
      })),
      summary: {
        totalPages: results.length,
        totalIssues: allIssues.length,
        totalWarnings: allWarnings.length,
        highPriorityIssues: highIssues.length,
        mediumPriorityIssues: mediumIssues.length + allWarnings.filter(w => w.severity === 'medium').length,
        lowPriorityItems: lowIssues.length + allWarnings.filter(w => w.severity === 'low').length
      }
    }
    
    const reportPath = path.join(process.cwd(), 'CMS_DIAGNOSTIC_REPORT.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Detailed report saved to: ${reportPath}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

diagnoseAllPages().catch(console.error)


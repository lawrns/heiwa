#!/usr/bin/env node
/**
 * Diagnostic Script for Surf Page CMS Issues
 * - Checks database CMS content for surf page
 * - Verifies hero image URLs
 * - Compares CMS content with frontend expectations
 */

const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres'

async function diagnoseSurfCMS() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    // 1. Check all CMS content for surf page
    console.log('='.repeat(80))
    console.log('1. CMS CONTENT FOR SURF PAGE')
    console.log('='.repeat(80))
    
    const surfContent = await client.query(`
      SELECT 
        id,
        page_slug,
        section,
        section_name,
        title,
        content,
        image_url,
        video_url,
        json_content,
        is_active,
        order_index,
        created_at,
        updated_at
      FROM page_content 
      WHERE page_slug = 'surf'
      ORDER BY order_index ASC, created_at ASC
    `)

    console.log(`Found ${surfContent.rows.length} CMS sections for surf page:\n`)

    if (surfContent.rows.length === 0) {
      console.log('⚠️  WARNING: No CMS content found for surf page!')
      console.log('   The page will use hardcoded fallback content.\n')
    } else {
      surfContent.rows.forEach((row, index) => {
        console.log(`\n[${index + 1}] Section: ${row.section}${row.section_name ? ` (${row.section_name})` : ''}`)
        console.log(`    ID: ${row.id}`)
        console.log(`    Title: ${row.title || '(none)'}`)
        console.log(`    Image URL: ${row.image_url || '(none)'}`)
        console.log(`    Video URL: ${row.video_url || '(none)'}`)
        console.log(`    Is Active: ${row.is_active}`)
        console.log(`    Order Index: ${row.order_index}`)
        
        if (row.json_content) {
          const json = typeof row.json_content === 'string' 
            ? JSON.parse(row.json_content) 
            : row.json_content
          console.log(`    JSON Content:`)
          console.log(`      - Title: ${json.title || '(none)'}`)
          console.log(`      - Description: ${json.description ? json.description.substring(0, 100) + '...' : '(none)'}`)
          console.log(`      - Image URL: ${json.image_url || json.imageUrl || '(none)'}`)
          console.log(`      - Video URL: ${json.video_url || json.videoUrl || '(none)'}`)
        }
      })
    }

    // 2. Check hero section specifically
    console.log('\n' + '='.repeat(80))
    console.log('2. HERO SECTION ANALYSIS')
    console.log('='.repeat(80))
    
    const heroSection = surfContent.rows.find(r => r.section === 'hero')
    
    if (!heroSection) {
      console.log('❌ No hero section found in CMS!')
      console.log('   Frontend will use fallback: "/images/surf4.jpg"')
    } else {
      console.log('✅ Hero section found:')
      console.log(`   ID: ${heroSection.id}`)
      console.log(`   Title: ${heroSection.title || '(none)'}`)
      
      // Check all possible image URL sources
      const imageUrls = [
        heroSection.image_url,
        heroSection.json_content?.image_url,
        heroSection.json_content?.imageUrl,
      ].filter(Boolean)
      
      console.log(`\n   Image URL Sources:`)
      if (imageUrls.length === 0) {
        console.log('   ⚠️  No image URL found in CMS!')
        console.log('   Frontend will use fallback: "/images/surf4.jpg"')
      } else {
        imageUrls.forEach((url, idx) => {
          console.log(`   [${idx + 1}] ${url}`)
          
          // Check if URL is valid
          if (url.startsWith('http')) {
            console.log(`       ✓ External URL (should work if domain is allowed)`)
          } else if (url.startsWith('/')) {
            console.log(`       ✓ Local path (should work if file exists)`)
          } else {
            console.log(`       ⚠️  Relative path (may cause issues)`)
          }
        })
      }
      
      // Check video URL
      const videoUrls = [
        heroSection.video_url,
        heroSection.json_content?.video_url,
        heroSection.json_content?.videoUrl,
      ].filter(Boolean)
      
      if (videoUrls.length > 0) {
        console.log(`\n   Video URL Sources:`)
        videoUrls.forEach((url, idx) => {
          console.log(`   [${idx + 1}] ${url}`)
        })
      }
    }

    // 3. Check what the frontend expects
    console.log('\n' + '='.repeat(80))
    console.log('3. FRONTEND EXPECTATIONS')
    console.log('='.repeat(80))
    
    console.log('Frontend code checks for image in this order:')
    console.log('  1. heroSection?.image_url')
    console.log('  2. heroSection?.json_content?.image_url')
    console.log('  3. heroSection?.json_content?.imageUrl')
    console.log('  4. Fallback: "/images/surf4.jpg"')
    console.log('\nFrontend code checks for video in this order:')
    console.log('  1. heroSection?.video_url')
    console.log('  2. heroSection?.json_content?.video_url')
    console.log('  3. heroSection?.json_content?.videoUrl')
    console.log('  4. Fallback: undefined')

    // 4. Check for other sections
    console.log('\n' + '='.repeat(80))
    console.log('4. OTHER SECTIONS')
    console.log('='.repeat(80))
    
    const sections = ['intro', 'faq', 'text']
    sections.forEach(sectionType => {
      const sectionRows = surfContent.rows.filter(r => r.section === sectionType)
      console.log(`\n${sectionType.toUpperCase()}: ${sectionRows.length} section(s)`)
      sectionRows.forEach((row, idx) => {
        console.log(`  [${idx + 1}] ${row.section_name || '(unnamed)'} - Active: ${row.is_active}`)
      })
    })

    // 5. Check for image file existence (if local path)
    console.log('\n' + '='.repeat(80))
    console.log('5. IMAGE FILE VERIFICATION')
    console.log('='.repeat(80))
    
    const fs = require('fs')
    const path = require('path')
    
    if (heroSection) {
      const imageUrls = [
        heroSection.image_url,
        heroSection.json_content?.image_url,
        heroSection.json_content?.imageUrl,
      ].filter(Boolean)
      
      imageUrls.forEach(url => {
        if (url && url.startsWith('/')) {
          const filePath = path.join(process.cwd(), 'public', url)
          const exists = fs.existsSync(filePath)
          console.log(`\n${url}:`)
          console.log(`  Path: ${filePath}`)
          console.log(`  Exists: ${exists ? '✅' : '❌'}`)
          
          if (!exists) {
            console.log(`  ⚠️  FILE NOT FOUND - This will cause image loading errors!`)
          }
        }
      })
      
      // Check fallback image
      const fallbackPath = path.join(process.cwd(), 'public', '/images/surf4.jpg')
      const fallbackExists = fs.existsSync(fallbackPath)
      console.log(`\nFallback (/images/surf4.jpg):`)
      console.log(`  Path: ${fallbackPath}`)
      console.log(`  Exists: ${fallbackExists ? '✅' : '❌'}`)
    }

    // 6. Summary and recommendations
    console.log('\n' + '='.repeat(80))
    console.log('6. DIAGNOSTIC SUMMARY')
    console.log('='.repeat(80))
    
    const issues = []
    const recommendations = []
    
    if (surfContent.rows.length === 0) {
      issues.push('No CMS content found for surf page')
      recommendations.push('Create CMS content entries for surf page in the admin panel')
    }
    
    if (!heroSection) {
      issues.push('No hero section found')
      recommendations.push('Create a hero section with page_slug="surf" and section="hero"')
    } else {
      const hasImageUrl = heroSection.image_url || 
                        heroSection.json_content?.image_url || 
                        heroSection.json_content?.imageUrl
      
      if (!hasImageUrl) {
        issues.push('Hero section has no image URL')
        recommendations.push('Add image_url to hero section (either direct field or in json_content)')
      } else {
        const imageUrl = heroSection.image_url || 
                        heroSection.json_content?.image_url || 
                        heroSection.json_content?.imageUrl
        
        if (imageUrl.startsWith('/')) {
          const filePath = path.join(process.cwd(), 'public', imageUrl)
          if (!fs.existsSync(filePath)) {
            issues.push(`Hero image file not found: ${imageUrl}`)
            recommendations.push(`Upload the image file to ${imageUrl} or update the URL in CMS`)
          }
        }
      }
    }
    
    if (issues.length === 0) {
      console.log('✅ No critical issues found!')
    } else {
      console.log('❌ Issues found:')
      issues.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue}`)
      })
    }
    
    if (recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      recommendations.forEach((rec, idx) => {
        console.log(`   ${idx + 1}. ${rec}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

diagnoseSurfCMS().catch(console.error)


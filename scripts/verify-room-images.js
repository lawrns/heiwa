/**
 * Room Image Verification Script
 * Verifies all room images exist in Supabase Storage and are correctly mapped
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
try {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })
  }
} catch (error) {
  console.warn('Could not load .env.local:', error.message)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyRoomImages() {
  console.log('🖼️  Starting Room Image Verification...\n')
  
  try {
    // Fetch all rooms from database
    console.log('📊 Fetching rooms from database...')
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name, images')
      .order('name')
    
    if (roomsError) {
      throw new Error(`Database error: ${roomsError.message}`)
    }
    
    console.log(`✅ Found ${rooms.length} rooms\n`)
    
    const verification = {
      timestamp: new Date().toISOString(),
      totalRooms: rooms.length,
      roomsWithImages: 0,
      roomsWithoutImages: 0,
      totalImages: 0,
      validImages: 0,
      invalidImages: 0,
      brokenImages: 0,
      imageMapping: {},
      issues: []
    }
    
    // Check each room's images
    for (const room of rooms) {
      const roomImages = room.images || []
      const roomImageStatus = {
        roomId: room.id,
        roomName: room.name,
        imageCount: roomImages.length,
        images: [],
        validCount: 0,
        invalidCount: 0,
        brokenCount: 0
      }
      
      if (roomImages.length === 0) {
        verification.roomsWithoutImages++
        verification.issues.push({
          roomId: room.id,
          roomName: room.name,
          issue: 'No images assigned'
        })
      } else {
        verification.roomsWithImages++
        verification.totalImages += roomImages.length
        
        // Check each image
        for (const imageUrl of roomImages) {
          const imageStatus = {
            url: imageUrl,
            isValid: false,
            exists: false,
            error: null
          }
          
          // Validate URL format
          if (!imageUrl || typeof imageUrl !== 'string') {
            imageStatus.error = 'Invalid image URL format'
            roomImageStatus.invalidCount++
            verification.invalidImages++
          } else if (imageUrl.startsWith('http')) {
            // Check if it's a Supabase Storage URL
            if (imageUrl.includes('supabase.co/storage')) {
              // Extract bucket and path from URL
              const urlMatch = imageUrl.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/)
              if (urlMatch) {
                const bucket = urlMatch[1]
                const filePath = urlMatch[2]
                
                // Check if file exists in storage
                try {
                  const { data, error } = await supabase.storage
                    .from(bucket)
                    .list(filePath.split('/').slice(0, -1).join('/'), {
                      search: filePath.split('/').pop()
                    })
                  
                  if (error) {
                    imageStatus.error = `Storage error: ${error.message}`
                    roomImageStatus.brokenCount++
                    verification.brokenImages++
                  } else if (data && data.length > 0) {
                    imageStatus.isValid = true
                    imageStatus.exists = true
                    roomImageStatus.validCount++
                    verification.validImages++
                  } else {
                    imageStatus.error = 'File not found in storage'
                    roomImageStatus.brokenCount++
                    verification.brokenImages++
                  }
                } catch (error) {
                  imageStatus.error = `Error checking storage: ${error.message}`
                  roomImageStatus.brokenCount++
                  verification.brokenImages++
                }
              } else {
                imageStatus.error = 'Invalid Supabase Storage URL format'
                roomImageStatus.invalidCount++
                verification.invalidImages++
              }
            } else {
              // External URL - just check if it's a valid URL format
              try {
                new URL(imageUrl)
                imageStatus.isValid = true
                roomImageStatus.validCount++
                verification.validImages++
              } catch {
                imageStatus.error = 'Invalid URL format'
                roomImageStatus.invalidCount++
                verification.invalidImages++
              }
            }
          } else if (imageUrl.startsWith('/')) {
            // Local path - might be valid for Next.js
            imageStatus.isValid = true
            roomImageStatus.validCount++
            verification.validImages++
          } else {
            imageStatus.error = 'Unknown URL format'
            roomImageStatus.invalidCount++
            verification.invalidImages++
          }
          
          roomImageStatus.images.push(imageStatus)
        }
      }
      
      verification.imageMapping[room.id] = roomImageStatus
      
      // Add to issues if there are problems
      if (roomImageStatus.brokenCount > 0 || roomImageStatus.invalidCount > 0) {
        verification.issues.push({
          roomId: room.id,
          roomName: room.name,
          brokenImages: roomImageStatus.brokenCount,
          invalidImages: roomImageStatus.invalidCount
        })
      }
    }
    
    // Generate mapping file
    const mapping = {}
    Object.values(verification.imageMapping).forEach(roomStatus => {
      mapping[roomStatus.roomId] = {
        roomName: roomStatus.roomName,
        images: roomStatus.images
          .filter(img => img.isValid && img.exists)
          .map(img => img.url)
      }
    })
    
    // Save results
    const mappingPath = path.join(__dirname, '..', 'room-image-mapping.json')
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2))
    console.log(`✅ Image mapping saved to: ${mappingPath}`)
    
    const jsonPath = path.join(__dirname, '..', 'room-image-verification.json')
    fs.writeFileSync(jsonPath, JSON.stringify(verification, null, 2))
    console.log(`✅ Verification data saved to: ${jsonPath}`)
    
    // Generate markdown report
    const report = generateMarkdownReport(verification)
    const reportPath = path.join(__dirname, '..', 'ROOM_IMAGE_VERIFICATION.md')
    fs.writeFileSync(reportPath, report)
    console.log(`✅ Verification report saved to: ${reportPath}`)
    
    // Print summary
    console.log('\n📊 Image Verification Summary:')
    console.log(`   Total Rooms: ${verification.totalRooms}`)
    console.log(`   Rooms with Images: ${verification.roomsWithImages}`)
    console.log(`   Rooms without Images: ${verification.roomsWithoutImages}`)
    console.log(`   Total Images: ${verification.totalImages}`)
    console.log(`   Valid Images: ${verification.validImages}`)
    console.log(`   Invalid Images: ${verification.invalidImages}`)
    console.log(`   Broken Images: ${verification.brokenImages}`)
    
    if (verification.issues.length > 0) {
      console.log('\n⚠️  Issues Found:')
      verification.issues.forEach(issue => {
        if (issue.issue) {
          console.log(`   - ${issue.roomName}: ${issue.issue}`)
        } else {
          console.log(`   - ${issue.roomName}: ${issue.brokenImages || 0} broken, ${issue.invalidImages || 0} invalid`)
        }
      })
    }
    
    return verification
    
  } catch (error) {
    console.error('❌ Verification failed:', error)
    throw error
  }
}

function generateMarkdownReport(verification) {
  let report = `# Room Image Verification Report\n\n`
  report += `**Generated:** ${new Date(verification.timestamp).toLocaleString()}\n\n`
  
  report += `## Summary\n\n`
  report += `- **Total Rooms:** ${verification.totalRooms}\n`
  report += `- **Rooms with Images:** ${verification.roomsWithImages}\n`
  report += `- **Rooms without Images:** ${verification.roomsWithoutImages}\n`
  report += `- **Total Images:** ${verification.totalImages}\n`
  report += `- **Valid Images:** ${verification.validImages}\n`
  report += `- **Invalid Images:** ${verification.invalidImages}\n`
  report += `- **Broken Images:** ${verification.brokenImages}\n\n`
  
  if (verification.issues.length > 0) {
    report += `## Issues\n\n`
    verification.issues.forEach(issue => {
      report += `### ${issue.roomName} (${issue.roomId})\n\n`
      if (issue.issue) {
        report += `- ❌ ${issue.issue}\n`
      } else {
        if (issue.brokenImages > 0) {
          report += `- ❌ ${issue.brokenImages} broken image(s)\n`
        }
        if (issue.invalidImages > 0) {
          report += `- ⚠️  ${issue.invalidImages} invalid image URL(s)\n`
        }
      }
      report += `\n`
    })
  }
  
  report += `## Room Image Details\n\n`
  report += `| Room Name | Image Count | Valid | Invalid | Broken |\n`
  report += `|-----------|-------------|-------|---------|--------|\n`
  
  Object.values(verification.imageMapping).forEach(room => {
    report += `| ${room.roomName} | ${room.imageCount} | ${room.validCount} | ${room.invalidCount} | ${room.brokenCount} |\n`
  })
  
  report += `\n## Recommendations\n\n`
  
  if (verification.roomsWithoutImages > 0) {
    report += `1. **Add Images:** ${verification.roomsWithoutImages} rooms are missing images. Upload images to Supabase Storage.\n`
  }
  
  if (verification.brokenImages > 0) {
    report += `2. **Fix Broken Images:** ${verification.brokenImages} images are referenced but don't exist in storage. Update room records.\n`
  }
  
  if (verification.invalidImages > 0) {
    report += `3. **Fix Invalid URLs:** ${verification.invalidImages} images have invalid URL formats. Update to correct Supabase Storage URLs.\n`
  }
  
  return report
}

// Run verification
if (require.main === module) {
  verifyRoomImages()
    .then(() => {
      console.log('\n✅ Image verification completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n❌ Image verification failed:', error)
      process.exit(1)
    })
}

module.exports = { verifyRoomImages }


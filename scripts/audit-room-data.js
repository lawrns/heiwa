/**
 * Room Data Audit Script
 * Compares database rooms with admin panel reference and identifies discrepancies
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local if it exists
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

async function auditRoomData() {
  console.log('🔍 Starting Room Data Audit...\n')
  
  try {
    // Fetch all rooms from database
    console.log('📊 Fetching rooms from database...')
    const { data: dbRooms, error: dbError } = await supabase
      .from('rooms')
      .select('*')
      .order('name')
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }
    
    console.log(`✅ Found ${dbRooms.length} rooms in database\n`)
    
    // Try to fetch rooms from admin API (optional - skip if not available)
    let apiRooms = []
    try {
      console.log('📊 Fetching rooms from booking widget API...')
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const apiResponse = await fetch(`${baseUrl}/api/rooms`, {
        headers: { 'Accept': 'application/json' }
      })
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        apiRooms = apiData.success ? apiData.data.rooms : []
        console.log(`✅ Found ${apiRooms.length} rooms in API\n`)
      } else {
        console.log(`⚠️  API not available (status ${apiResponse.status}), skipping API comparison\n`)
      }
    } catch (error) {
      console.log(`⚠️  Could not fetch from API (${error.message}), skipping API comparison\n`)
    }
    
    // Analyze rooms
    const audit = {
      timestamp: new Date().toISOString(),
      totalRooms: dbRooms.length,
      activeRooms: dbRooms.filter(r => r.is_active !== false).length,
      inactiveRooms: dbRooms.filter(r => r.is_active === false).length,
      discrepancies: [],
      issues: [],
      roomDetails: []
    }
    
    // Check each room for issues
    dbRooms.forEach((room, index) => {
      const roomIssues = []
      const roomWarnings = []
      
      // Check required fields
      if (!room.name || room.name.trim() === '') {
        roomIssues.push('Missing or empty room name')
      }
      
      if (!room.capacity || room.capacity < 1) {
        roomIssues.push(`Invalid capacity: ${room.capacity}`)
      }
      
      if (!room.pricing) {
        roomIssues.push('Missing pricing object')
      } else {
        if (!room.pricing.standard && !room.pricing.offSeason) {
          roomIssues.push('Pricing object missing both standard and offSeason rates')
        }
        if (room.pricing.standard && room.pricing.standard <= 0) {
          roomIssues.push(`Invalid standard price: ${room.pricing.standard}`)
        }
        if (room.pricing.offSeason && room.pricing.offSeason <= 0) {
          roomIssues.push(`Invalid offSeason price: ${room.pricing.offSeason}`)
        }
      }
      
      if (!room.booking_type || !['whole', 'perBed'].includes(room.booking_type)) {
        roomWarnings.push(`Invalid or missing booking_type: ${room.booking_type}`)
      }
      
      // Check images
      if (!room.images || !Array.isArray(room.images) || room.images.length === 0) {
        roomWarnings.push('No images assigned to room')
      } else {
        // Check for invalid image URLs
        const invalidImages = room.images.filter(img => {
          if (!img || typeof img !== 'string') return true
          // Check if it's a valid URL or path
          return !img.startsWith('http') && !img.startsWith('/')
        })
        if (invalidImages.length > 0) {
          roomWarnings.push(`${invalidImages.length} invalid image URL(s)`)
        }
      }
      
      // Check for test/placeholder data
      const testPatterns = ['test', 'example', 'placeholder', 'new room', 'room nr', 'dorm room']
      const nameLower = (room.name || '').toLowerCase()
      if (testPatterns.some(pattern => nameLower.includes(pattern))) {
        roomWarnings.push('Room name contains test/placeholder patterns')
      }
      
      // Check capacity vs pricing logic
      if (room.booking_type === 'perBed' && room.capacity > 1) {
        // Per-bed rooms should typically have camp pricing
        if (!room.pricing?.camp) {
          roomWarnings.push('Per-bed room missing camp pricing structure')
        }
      }
      
      // Find matching API room
      const apiRoom = apiRooms.find(r => r.id === room.id)
      if (apiRoom) {
        // Compare fields
        if (apiRoom.name !== room.name) {
          roomIssues.push(`Name mismatch: DB="${room.name}" vs API="${apiRoom.name}"`)
        }
        if (apiRoom.capacity !== room.capacity) {
          roomIssues.push(`Capacity mismatch: DB=${room.capacity} vs API=${apiRoom.capacity}`)
        }
        const dbPricePerNight = room.pricing?.standard || room.pricing?.offSeason || 80
        if (apiRoom.price_per_night !== dbPricePerNight) {
          roomIssues.push(`Price mismatch: DB=${dbPricePerNight} vs API=${apiRoom.price_per_night}`)
        }
      } else {
        roomWarnings.push('Room not found in API response (may be inactive)')
      }
      
      // Record room details
      audit.roomDetails.push({
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        bookingType: room.booking_type,
        pricing: room.pricing,
        isActive: room.is_active !== false,
        imageCount: room.images?.length || 0,
        hasImages: (room.images?.length || 0) > 0,
        issues: roomIssues,
        warnings: roomWarnings
      })
      
      if (roomIssues.length > 0) {
        audit.discrepancies.push({
          roomId: room.id,
          roomName: room.name,
          issues: roomIssues
        })
      }
      
      if (roomWarnings.length > 0) {
        audit.issues.push({
          roomId: room.id,
          roomName: room.name,
          warnings: roomWarnings
        })
      }
    })
    
    // Summary statistics
    const roomsWithIssues = audit.discrepancies.length
    const roomsWithWarnings = audit.issues.length
    const roomsWithoutImages = audit.roomDetails.filter(r => !r.hasImages).length
    const roomsWithInvalidPricing = audit.roomDetails.filter(r => 
      !r.pricing || (!r.pricing.standard && !r.pricing.offSeason)
    ).length
    
    audit.summary = {
      totalRooms: audit.totalRooms,
      activeRooms: audit.activeRooms,
      inactiveRooms: audit.inactiveRooms,
      roomsWithCriticalIssues: roomsWithIssues,
      roomsWithWarnings: roomsWithWarnings,
      roomsWithoutImages: roomsWithoutImages,
      roomsWithInvalidPricing: roomsWithInvalidPricing,
      roomsNeedingAttention: roomsWithIssues + roomsWithWarnings
    }
    
    // Generate markdown report
    const report = generateMarkdownReport(audit)
    
    // Save report
    const reportPath = path.join(__dirname, '..', 'ROOM_DATA_AUDIT.md')
    fs.writeFileSync(reportPath, report)
    console.log(`\n✅ Audit report saved to: ${reportPath}`)
    
    // Save JSON data
    const jsonPath = path.join(__dirname, '..', 'room-audit-data.json')
    fs.writeFileSync(jsonPath, JSON.stringify(audit, null, 2))
    console.log(`✅ Audit data saved to: ${jsonPath}`)
    
    // Print summary
    console.log('\n📊 Audit Summary:')
    console.log(`   Total Rooms: ${audit.summary.totalRooms}`)
    console.log(`   Active Rooms: ${audit.summary.activeRooms}`)
    console.log(`   Rooms with Critical Issues: ${audit.summary.roomsWithCriticalIssues}`)
    console.log(`   Rooms with Warnings: ${audit.summary.roomsWithWarnings}`)
    console.log(`   Rooms without Images: ${audit.summary.roomsWithoutImages}`)
    console.log(`   Rooms with Invalid Pricing: ${audit.summary.roomsWithInvalidPricing}`)
    console.log(`   Rooms Needing Attention: ${audit.summary.roomsNeedingAttention}`)
    
    if (audit.discrepancies.length > 0) {
      console.log('\n⚠️  Critical Issues Found:')
      audit.discrepancies.forEach(d => {
        console.log(`   - ${d.roomName} (${d.roomId}):`)
        d.issues.forEach(issue => console.log(`     • ${issue}`))
      })
    }
    
    return audit
    
  } catch (error) {
    console.error('❌ Audit failed:', error)
    throw error
  }
}

function generateMarkdownReport(audit) {
  let report = `# Room Data Audit Report\n\n`
  report += `**Generated:** ${new Date(audit.timestamp).toLocaleString()}\n\n`
  
  report += `## Summary\n\n`
  report += `- **Total Rooms:** ${audit.summary.totalRooms}\n`
  report += `- **Active Rooms:** ${audit.summary.activeRooms}\n`
  report += `- **Inactive Rooms:** ${audit.summary.inactiveRooms}\n`
  report += `- **Rooms with Critical Issues:** ${audit.summary.roomsWithCriticalIssues}\n`
  report += `- **Rooms with Warnings:** ${audit.summary.roomsWithWarnings}\n`
  report += `- **Rooms without Images:** ${audit.summary.roomsWithoutImages}\n`
  report += `- **Rooms with Invalid Pricing:** ${audit.summary.roomsWithInvalidPricing}\n`
  report += `- **Rooms Needing Attention:** ${audit.summary.roomsNeedingAttention}\n\n`
  
  if (audit.discrepancies.length > 0) {
    report += `## Critical Issues\n\n`
    audit.discrepancies.forEach(d => {
      report += `### ${d.roomName} (${d.roomId})\n\n`
      d.issues.forEach(issue => {
        report += `- ❌ ${issue}\n`
      })
      report += `\n`
    })
  }
  
  if (audit.issues.length > 0) {
    report += `## Warnings\n\n`
    audit.issues.forEach(i => {
      report += `### ${i.roomName} (${i.roomId})\n\n`
      i.warnings.forEach(warning => {
        report += `- ⚠️  ${warning}\n`
      })
      report += `\n`
    })
  }
  
  report += `## Room Details\n\n`
  report += `| Room Name | Capacity | Booking Type | Standard Price | Off-Season Price | Images | Status |\n`
  report += `|-----------|----------|---------------|----------------|------------------|--------|--------|\n`
  
  audit.roomDetails.forEach(room => {
    const standardPrice = room.pricing?.standard || 'N/A'
    const offSeasonPrice = room.pricing?.offSeason || 'N/A'
    const imageStatus = room.hasImages ? `✅ ${room.imageCount}` : '❌ 0'
    const status = room.isActive ? '✅ Active' : '❌ Inactive'
    
    report += `| ${room.name} | ${room.capacity} | ${room.bookingType || 'N/A'} | ${standardPrice} | ${offSeasonPrice} | ${imageStatus} | ${status} |\n`
  })
  
  report += `\n## Recommendations\n\n`
  
  if (audit.summary.roomsWithCriticalIssues > 0) {
    report += `1. **Fix Critical Issues:** ${audit.summary.roomsWithCriticalIssues} rooms have critical issues that need immediate attention.\n`
  }
  
  if (audit.summary.roomsWithoutImages > 0) {
    report += `2. **Add Images:** ${audit.summary.roomsWithoutImages} rooms are missing images. Upload images to Supabase Storage and update room records.\n`
  }
  
  if (audit.summary.roomsWithInvalidPricing > 0) {
    report += `3. **Fix Pricing:** ${audit.summary.roomsWithInvalidPricing} rooms have invalid or missing pricing. Update pricing JSONB to include standard and offSeason rates.\n`
  }
  
  report += `\n## Next Steps\n\n`
  report += `1. Review critical issues and fix room data\n`
  report += `2. Verify room images are correctly mapped\n`
  report += `3. Update pricing to use correct seasonal rates\n`
  report += `4. Run verification script to confirm fixes\n`
  
  return report
}

// Run audit
if (require.main === module) {
  auditRoomData()
    .then(() => {
      console.log('\n✅ Audit completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n❌ Audit failed:', error)
      process.exit(1)
    })
}

module.exports = { auditRoomData }


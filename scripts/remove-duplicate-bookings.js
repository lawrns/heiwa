#!/usr/bin/env node
/**
 * Remove Duplicate Bookings
 * Removes duplicate bookings, keeping only the oldest one in each group
 * USE WITH CAUTION - This will delete bookings!
 */

const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres'

const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('-n')
const FORCE = process.argv.includes('--force')

async function removeDuplicates() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    if (DRY_RUN) {
      console.log('🔍 DRY RUN MODE - No bookings will be deleted\n')
    } else if (!FORCE) {
      console.log('⚠️  WARNING: This will DELETE duplicate bookings!')
      console.log('   Use --dry-run to preview changes first')
      console.log('   Use --force to proceed with deletion\n')
      process.exit(1)
    }

    // Find duplicate groups
    const duplicateGroups = await client.query(`
      WITH booking_groups AS (
        SELECT 
          client_ids,
          check_in,
          check_out,
          COUNT(*) as duplicate_count,
          array_agg(id ORDER BY created_at) as booking_ids,
          array_agg(created_at ORDER BY created_at) as created_dates
        FROM bookings
        WHERE room_type IS NULL
          AND status != 'cancelled'
        GROUP BY client_ids, check_in, check_out
        HAVING COUNT(*) > 1
      )
      SELECT * FROM booking_groups
      ORDER BY duplicate_count DESC
    `)

    if (duplicateGroups.rows.length === 0) {
      console.log('✅ No duplicate bookings found!')
      await client.end()
      return
    }

    console.log(`Found ${duplicateGroups.rows.length} groups of duplicates\n`)

    let totalRemoved = 0
    const bookingsToRemove = []

    for (const group of duplicateGroups.rows) {
      const bookingIds = group.booking_ids
      const createdDates = group.created_dates
      
      // Keep the oldest (last in array since we ordered by created_at ASC)
      const oldestId = bookingIds[bookingIds.length - 1]
      const duplicates = bookingIds.slice(0, -1) // All except the oldest
      
      console.log(`\nGroup: ${group.duplicate_count} bookings`)
      console.log(`  Keeping (oldest): ${oldestId} - Created: ${createdDates[createdDates.length - 1]}`)
      console.log(`  Removing:`)
      
      duplicates.forEach((dupId, idx) => {
        const dupIndex = bookingIds.indexOf(dupId)
        console.log(`    ${idx + 1}. ${dupId} - Created: ${createdDates[dupIndex]}`)
        bookingsToRemove.push(dupId)
      })
      
      totalRemoved += duplicates.length
    }

    console.log(`\n${'='.repeat(80)}`)
    console.log(`SUMMARY`)
    console.log('='.repeat(80))
    console.log(`Total bookings to remove: ${totalRemoved}`)
    console.log(`Total groups affected: ${duplicateGroups.rows.length}`)

    if (DRY_RUN) {
      console.log('\n🔍 DRY RUN - No bookings were deleted')
      console.log('Run with --force to actually remove duplicates')
    } else {
      console.log('\n⚠️  Removing duplicate bookings...')
      
      // Remove duplicates one by one (for safety and logging)
      for (const bookingId of bookingsToRemove) {
        const result = await client.query(`
          DELETE FROM bookings
          WHERE id = $1
          RETURNING id, created_at
        `, [bookingId])
        
        if (result.rows.length > 0) {
          console.log(`✅ Removed booking: ${bookingId} (created: ${result.rows[0].created_at})`)
        } else {
          console.log(`⚠️  Booking not found: ${bookingId}`)
        }
      }
      
      console.log(`\n✅ Removed ${totalRemoved} duplicate bookings`)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

removeDuplicates().catch(console.error)


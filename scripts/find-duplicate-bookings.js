#!/usr/bin/env node
/**
 * Find and Remove Duplicate Bookings
 * Identifies duplicate bookings (same client, dates, camp) and helps remove them
 */

const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres'

async function findDuplicates() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    // Find bookings with same client_ids, check_in, check_out, and null room_type (surf camps)
    const result = await client.query(`
      WITH booking_groups AS (
        SELECT 
          client_ids,
          check_in,
          check_out,
          COUNT(*) as duplicate_count,
          array_agg(id ORDER BY created_at) as booking_ids,
          array_agg(created_at ORDER BY created_at) as created_dates,
          array_agg(status ORDER BY created_at) as statuses
        FROM bookings
        WHERE room_type IS NULL
          AND status != 'cancelled'
        GROUP BY client_ids, check_in, check_out
        HAVING COUNT(*) > 1
      )
      SELECT * FROM booking_groups
      ORDER BY duplicate_count DESC, check_in DESC
    `)

    if (result.rows.length === 0) {
      console.log('✅ No duplicate bookings found!')
      await client.end()
      return
    }

    console.log(`Found ${result.rows.length} groups of duplicate bookings:\n`)

    for (const group of result.rows) {
      console.log('='.repeat(80))
      console.log(`Duplicate Group: ${group.duplicate_count} bookings`)
      console.log(`Client IDs: ${JSON.stringify(group.client_ids)}`)
      console.log(`Check-in: ${group.check_in}`)
      console.log(`Check-out: ${group.check_out}`)
      console.log(`\nBooking IDs:`)
      
      const bookingIds = group.booking_ids
      const createdDates = group.created_dates
      const statuses = group.statuses
      
      for (let i = 0; i < bookingIds.length; i++) {
        const bookingId = bookingIds[i]
        const createdDate = createdDates[i]
        const status = statuses[i]
        
        // Get booking details
        const bookingDetails = await client.query(`
          SELECT id, total_amount, source, notes
          FROM bookings
          WHERE id = $1
        `, [bookingId])
        
        const booking = bookingDetails.rows[0]
        const isOldest = i === bookingIds.length - 1
        const isNewest = i === 0
        
        console.log(`\n  [${i + 1}] ID: ${bookingId}`)
        console.log(`      Created: ${createdDate}`)
        console.log(`      Status: ${status}`)
        console.log(`      Amount: €${booking.total_amount || 0}`)
        console.log(`      Source: ${booking.source || 'unknown'}`)
        console.log(`      ${isOldest ? '👈 OLDEST (keep this one)' : ''}`)
        console.log(`      ${isNewest ? '👈 NEWEST (duplicate)' : ''}`)
      }
      
      console.log(`\n💡 Recommendation: Keep the OLDEST booking, remove the others`)
    }

    // Check for the specific booking mentioned
    console.log('\n' + '='.repeat(80))
    console.log('CHECKING SPECIFIC BOOKING: d13eace0-f183-4e0b-8d24-0180701f6361')
    console.log('='.repeat(80))
    
    const specificBooking = await client.query(`
      SELECT 
        id,
        client_ids,
        check_in,
        check_out,
        room_type,
        total_amount,
        status,
        created_at,
        source
      FROM bookings
      WHERE id = 'd13eace0-f183-4e0b-8d24-0180701f6361'
    `)
    
    if (specificBooking.rows.length > 0) {
      const booking = specificBooking.rows[0]
      console.log('\nBooking found:')
      console.log(`  ID: ${booking.id}`)
      console.log(`  Room Type: ${booking.room_type || '(NULL - Surf Camp)'}`)
      console.log(`  Client IDs: ${JSON.stringify(booking.client_ids)}`)
      console.log(`  Dates: ${booking.check_in} to ${booking.check_out}`)
      console.log(`  Amount: €${booking.total_amount}`)
      console.log(`  Status: ${booking.status}`)
      console.log(`  Created: ${booking.created_at}`)
      
      // Find duplicates of this specific booking
      const duplicates = await client.query(`
        SELECT id, created_at, status, total_amount
        FROM bookings
        WHERE client_ids = $1::uuid[]
          AND check_in = $2
          AND check_out = $3
          AND room_type IS NULL
          AND status != 'cancelled'
        ORDER BY created_at ASC
      `, [booking.client_ids, booking.check_in, booking.check_out])
      
      if (duplicates.rows.length > 1) {
        console.log(`\n⚠️  Found ${duplicates.rows.length} duplicate bookings:`)
        duplicates.rows.forEach((dup, idx) => {
          const isTarget = dup.id === booking.id
          console.log(`  ${idx + 1}. ${dup.id} - Created: ${dup.created_at} - Status: ${dup.status} - Amount: €${dup.total_amount} ${isTarget ? '👈 THIS ONE' : ''}`)
        })
      }
    }

    console.log('\n' + '='.repeat(80))
    console.log('SUMMARY')
    console.log('='.repeat(80))
    console.log(`Total duplicate groups: ${result.rows.length}`)
    console.log(`Total duplicate bookings: ${result.rows.reduce((sum, r) => sum + parseInt(r.duplicate_count) - 1, 0)}`)
    console.log('\nTo remove duplicates, run: node scripts/remove-duplicate-bookings.js')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

findDuplicates().catch(console.error)


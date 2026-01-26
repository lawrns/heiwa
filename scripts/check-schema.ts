// Script to check the actual database schema
import { supabaseAdmin } from '../lib/supabase'

async function checkSchema() {
  console.log('🔍 Checking database schema...\n')

  // Check room_assignments table
  console.log('📋 room_assignments table:')
  const { data: assignments, error: assignError } = await supabaseAdmin
    .from('room_assignments')
    .select('*')
    .limit(1)

  if (assignError) {
    console.log('   ❌ Error:', assignError.message)
  } else if (assignments && assignments.length > 0) {
    console.log('   Columns:', Object.keys(assignments[0]))
  } else {
    console.log('   No data found')
  }

  // Check surf_week_assignments table
  console.log('\n📋 surf_week_assignments table:')
  const { data: surfAssign, error: surfError } = await supabaseAdmin
    .from('surf_week_assignments')
    .select('*')
    .limit(1)

  if (surfError) {
    console.log('   ❌ Error:', surfError.message)
  } else if (surfAssign && surfAssign.length > 0) {
    console.log('   Columns:', Object.keys(surfAssign[0]))
  } else {
    console.log('   No data found')
  }
}

checkSchema().catch(console.error)
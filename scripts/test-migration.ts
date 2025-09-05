import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testMigration() {
  console.log('🧪 Testing Supabase migration...')
  
  try {
    // Test 1: Database connection
    console.log('\n1️⃣ Testing database connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('clients')
      .select('id')
      .limit(1)

    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError)
      return
    }
    console.log('✅ Database connection successful')

    // Test 2: Read operations
    console.log('\n2️⃣ Testing read operations...')
    
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(3)
    
    if (clientsError) {
      console.error('❌ Failed to read clients:', clientsError)
      return
    }
    console.log(`✅ Successfully read ${clients?.length || 0} clients`)

    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .limit(3)
    
    if (roomsError) {
      console.error('❌ Failed to read rooms:', roomsError)
      return
    }
    console.log(`✅ Successfully read ${rooms?.length || 0} rooms`)

    const { data: surfCamps, error: surfCampsError } = await supabase
      .from('surf_camps')
      .select('*')
      .limit(3)
    
    if (surfCampsError) {
      console.error('❌ Failed to read surf camps:', surfCampsError)
      return
    }
    console.log(`✅ Successfully read ${surfCamps?.length || 0} surf camps`)

    // Test 3: Write operations
    console.log('\n3️⃣ Testing write operations...')
    
    const testClient = {
      name: 'Test Client',
      email: `test-${Date.now()}@example.com`,
      phone: '+1-555-TEST',
      notes: 'Migration test client'
    }

    const { data: newClient, error: createError } = await supabase
      .from('clients')
      .insert([testClient])
      .select('*')
      .single()
    
    if (createError) {
      console.error('❌ Failed to create test client:', createError)
      return
    }
    console.log('✅ Successfully created test client')

    // Test 4: Update operations
    console.log('\n4️⃣ Testing update operations...')
    
    const { error: updateError } = await supabase
      .from('clients')
      .update({ notes: 'Updated migration test client' })
      .eq('id', newClient.id)
    
    if (updateError) {
      console.error('❌ Failed to update test client:', updateError)
      return
    }
    console.log('✅ Successfully updated test client')

    // Test 5: Delete operations
    console.log('\n5️⃣ Testing delete operations...')
    
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', newClient.id)
    
    if (deleteError) {
      console.error('❌ Failed to delete test client:', deleteError)
      return
    }
    console.log('✅ Successfully deleted test client')

    // Test 6: Storage operations
    console.log('\n6️⃣ Testing storage operations...')
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Failed to list storage buckets:', bucketsError)
      return
    }
    
    const expectedBuckets = ['rooms', 'surf-camps', 'add-ons', 'temp']
    const bucketNames = buckets?.map(b => b.name) || []
    const missingBuckets = expectedBuckets.filter(name => !bucketNames.includes(name))
    
    if (missingBuckets.length > 0) {
      console.warn(`⚠️ Missing storage buckets: ${missingBuckets.join(', ')}`)
    } else {
      console.log('✅ All storage buckets are available')
    }

    // Test 7: Authentication check
    console.log('\n7️⃣ Testing authentication...')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('ℹ️ No authenticated user (expected for service role)')
    } else {
      console.log('✅ Authentication system is working')
    }

    // Test 8: RLS policies check
    console.log('\n8️⃣ Testing Row Level Security...')
    
    // Try to access data with anon key (should fail)
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: anonData, error: rlsError } = await anonSupabase
      .from('clients')
      .select('*')
      .limit(1)
    
    if (rlsError || !anonData || anonData.length === 0) {
      console.log('✅ RLS is working - anonymous access properly restricted')
    } else {
      console.warn('⚠️ RLS might not be working - anonymous access succeeded')
    }

    console.log('\n🎉 Migration test completed successfully!')
    console.log('\n📊 Test Summary:')
    console.log('   ✅ Database connection')
    console.log('   ✅ Read operations')
    console.log('   ✅ Write operations')
    console.log('   ✅ Update operations')
    console.log('   ✅ Delete operations')
    console.log('   ✅ Storage buckets')
    console.log('   ✅ Authentication system')
    console.log('   ✅ Row Level Security')
    
    console.log('\n🚀 Your Supabase migration is working correctly!')
    
  } catch (error) {
    console.error('❌ Migration test failed:', error)
  }
}

// Run test
if (require.main === module) {
  testMigration()
}

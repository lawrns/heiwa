import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('📦 Setting up Supabase Storage...')
  
  try {
    // Create storage buckets
    const buckets = [
      { name: 'rooms', public: true },
      { name: 'surf-camps', public: true },
      { name: 'add-ons', public: true },
      { name: 'temp', public: false }
    ]

    for (const bucket of buckets) {
      console.log(`📁 Creating bucket: ${bucket.name}`)
      
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })

      if (error && !error.message.includes('already exists')) {
        console.error(`❌ Failed to create bucket ${bucket.name}:`, error)
      } else {
        console.log(`✅ Bucket ${bucket.name} created successfully`)
      }
    }

    // Set up storage policies
    console.log('🛡️ Setting up storage policies...')
    
    // Public read access for public buckets
    const publicBuckets = ['rooms', 'surf-camps', 'add-ons']
    
    for (const bucketName of publicBuckets) {
      // Allow public read access
      const { error: readError } = await supabase.rpc('create_storage_policy', {
        bucket_name: bucketName,
        policy_name: `Public read access for ${bucketName}`,
        definition: `(bucket_id = '${bucketName}')`,
        operation: 'SELECT'
      })

      if (readError && !readError.message.includes('already exists')) {
        console.log(`Note: Could not create read policy for ${bucketName} (may need manual setup)`)
      }

      // Allow admin write access
      const { error: writeError } = await supabase.rpc('create_storage_policy', {
        bucket_name: bucketName,
        policy_name: `Admin write access for ${bucketName}`,
        definition: `(bucket_id = '${bucketName}' AND auth.jwt() ->> 'email' IN ('julian@fyves.com', 'julianmjavierm@gmail.com', 'admin@heiwa.house', 'manager@heiwa.house', 'laurence@fyves.com'))`,
        operation: 'INSERT'
      })

      if (writeError && !writeError.message.includes('already exists')) {
        console.log(`Note: Could not create write policy for ${bucketName} (may need manual setup)`)
      }
    }

    console.log('🎉 Storage setup completed successfully!')
    console.log('📋 Storage buckets created:')
    console.log('  • rooms (public) - for room images')
    console.log('  • surf-camps (public) - for surf camp images')
    console.log('  • add-ons (public) - for add-on images')
    console.log('  • temp (private) - for temporary uploads')
    
  } catch (error) {
    console.error('❌ Storage setup failed:', error)
  }
}

// Run storage setup
if (require.main === module) {
  setupStorage()
}

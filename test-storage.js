// Test script to verify Supabase storage bucket configuration
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testStorageBuckets() {
  console.log('🧪 Testing Supabase Storage Buckets...\n');

  try {
    // List all buckets
    console.log('📋 Listing all storage buckets:');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    if (!buckets || buckets.length === 0) {
      console.log('⚠️ No storage buckets found');
      return;
    }

    buckets.forEach(bucket => {
      console.log(`  ✅ ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

    // Test each expected bucket
    const expectedBuckets = ['rooms', 'surf-camps', 'add-ons', 'temp'];
    console.log('\n🔍 Testing expected buckets:');

    for (const bucketName of expectedBuckets) {
      const bucketExists = buckets.some(b => b.name === bucketName);
      if (bucketExists) {
        console.log(`  ✅ ${bucketName} - exists`);
        
        // Test listing files in bucket
        const { data: files, error: filesError } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 5 });
          
        if (filesError) {
          console.log(`    ⚠️ Error listing files: ${filesError.message}`);
        } else {
          console.log(`    📁 Contains ${files?.length || 0} items`);
        }
      } else {
        console.log(`  ❌ ${bucketName} - missing`);
      }
    }

    // Test creating a simple test file
    console.log('\n🧪 Testing file upload to rooms bucket:');
    const testContent = 'This is a test file for storage verification';
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('rooms')
      .upload(testFileName, new Blob([testContent], { type: 'text/plain' }));

    if (uploadError) {
      console.log(`  ❌ Upload failed: ${uploadError.message}`);
    } else {
      console.log(`  ✅ Upload successful: ${uploadData.path}`);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('rooms')
        .remove([testFileName]);
        
      if (deleteError) {
        console.log(`  ⚠️ Cleanup failed: ${deleteError.message}`);
      } else {
        console.log(`  🧹 Test file cleaned up`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testStorageBuckets().then(() => {
  console.log('\n🎉 Storage bucket test completed!');
}).catch(error => {
  console.error('💥 Test crashed:', error);
});

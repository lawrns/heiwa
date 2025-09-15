// Test script to verify client-side image upload with admin authentication
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create client-side Supabase client (same as used in the app)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testClientSideUpload() {
  console.log('🖼️ Testing Client-Side Image Upload with Admin Authentication...\n');

  try {
    // First, authenticate as admin
    console.log('🔐 Authenticating as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@heiwa.house',
      password: 'admin123' // You might need to adjust this password
    });

    if (authError) {
      console.log(`❌ Authentication failed: ${authError.message}`);
      console.log('ℹ️ This might be expected if the admin password is different');
      console.log('ℹ️ The admin user might need to be created or have a different password');
      return;
    }

    console.log(`✅ Authenticated as: ${authData.user.email}`);

    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log(`❌ Failed to get current user: ${userError?.message || 'No user'}`);
      return;
    }

    console.log(`👤 Current user: ${user.email} (ID: ${user.id})`);

    // Test image upload
    const testImagePath = path.join(__dirname, 'wordpress-plugin/heiwa-booking-widget/assets/images/room1-1.jpg');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️ Test image not found, skipping upload test');
      return;
    }

    const imageBuffer = fs.readFileSync(testImagePath);
    const fileName = `test-client-${Date.now()}.jpg`;
    
    console.log(`📤 Uploading image to 'rooms' bucket as authenticated user...`);
    console.log(`   File: ${path.basename(testImagePath)}`);
    console.log(`   Size: ${imageBuffer.length} bytes`);
    console.log(`   Target: ${fileName}`);

    // Upload to rooms bucket using client-side auth
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('rooms')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.log(`❌ Upload failed: ${uploadError.message}`);
      console.log(`   Error details:`, uploadError);
      return;
    }

    console.log(`✅ Upload successful!`);
    console.log(`   Path: ${uploadData.path}`);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('rooms')
      .getPublicUrl(fileName);

    console.log(`🔗 Public URL: ${publicUrl}`);

    // Test if the URL is accessible
    console.log(`🌐 Testing public URL accessibility...`);
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        console.log(`✅ Image is publicly accessible (${response.status})`);
      } else {
        console.log(`⚠️ Image URL returned status: ${response.status}`);
      }
    } catch (fetchError) {
      console.log(`❌ Failed to fetch image: ${fetchError.message}`);
    }

    // Clean up test file
    console.log(`🧹 Cleaning up test file...`);
    const { error: deleteError } = await supabase.storage
      .from('rooms')
      .remove([fileName]);
      
    if (deleteError) {
      console.log(`⚠️ Cleanup failed: ${deleteError.message}`);
    } else {
      console.log(`✅ Test file cleaned up successfully`);
    }

    // Sign out
    await supabase.auth.signOut();
    console.log(`🚪 Signed out`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testClientSideUpload().then(() => {
  console.log('\n🎉 Client-side upload test completed!');
}).catch(error => {
  console.error('💥 Test crashed:', error);
});

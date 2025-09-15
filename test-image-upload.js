// Test script to verify image upload to Supabase storage
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testImageUpload() {
  console.log('🖼️ Testing Image Upload to Supabase Storage...\n');

  try {
    // Check if test image exists
    const testImagePath = path.join(__dirname, 'wordpress-plugin/heiwa-booking-widget/assets/images/room1-1.jpg');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️ Test image not found, creating a minimal test image...');
      
      // Create a minimal JPEG header for testing
      const minimalJpeg = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
        0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
        0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
        0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
        0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
        0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xB2, 0xC0,
        0x07, 0xFF, 0xD9
      ]);
      
      fs.writeFileSync('test-image.jpg', minimalJpeg);
      console.log('✅ Created minimal test JPEG image');
    }

    // Read the image file
    const imagePath = fs.existsSync(testImagePath) ? testImagePath : 'test-image.jpg';
    const imageBuffer = fs.readFileSync(imagePath);
    const fileName = `test-room-${Date.now()}.jpg`;
    
    console.log(`📤 Uploading image to 'rooms' bucket...`);
    console.log(`   File: ${path.basename(imagePath)}`);
    console.log(`   Size: ${imageBuffer.length} bytes`);
    console.log(`   Target: ${fileName}`);

    // Upload to rooms bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('rooms')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.log(`❌ Upload failed: ${uploadError.message}`);
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

    // Clean up local test file if created
    if (fs.existsSync('test-image.jpg') && !fs.existsSync(testImagePath)) {
      fs.unlinkSync('test-image.jpg');
      console.log(`🧹 Local test image cleaned up`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testImageUpload().then(() => {
  console.log('\n🎉 Image upload test completed!');
}).catch(error => {
  console.error('💥 Test crashed:', error);
});

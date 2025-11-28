/**
 * CMS Content Synchronization Audit Script
 * Phase 1.2: Verify all CMS content is properly stored and retrievable
 */

const { Client } = require('pg');

const DB_CONNECTION_STRING = process.env.DATABASE_URL || 
  'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres';

const REQUIRED_SECTIONS = [
  'hero',
  'surf-weeks',
  'about',
  'rooms',
  'reviews',
  'facilities'
];

async function auditCMSContent() {
  const client = new Client({
    connectionString: DB_CONNECTION_STRING,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // 1. Check homepage_content sections
    console.log('📋 Phase 1.2.1: Checking homepage_content sections...');
    const sectionsResult = await client.query(`
      SELECT 
        section,
        title,
        subtitle,
        is_active,
        cards IS NOT NULL as has_cards,
        booking_data IS NOT NULL as has_booking_data,
        testimonials IS NOT NULL as has_testimonials,
        facilities IS NOT NULL as has_facilities,
        google_rating IS NOT NULL as has_google_rating,
        video_id IS NOT NULL as has_video_id
      FROM homepage_content
      ORDER BY order_index, section;
    `);

    console.log(`Found ${sectionsResult.rows.length} sections in homepage_content:\n`);
    
    const existingSections = sectionsResult.rows.map(r => r.section);
    const missingSections = REQUIRED_SECTIONS.filter(s => !existingSections.includes(s));
    
    sectionsResult.rows.forEach(section => {
      const status = section.is_active ? '✅' : '⚠️';
      console.log(`${status} ${section.section}:`);
      console.log(`   Title: ${section.title || 'N/A'}`);
      console.log(`   Subtitle: ${section.subtitle || 'N/A'}`);
      console.log(`   Cards: ${section.has_cards ? '✅' : '❌'}`);
      console.log(`   Booking Data: ${section.has_booking_data ? '✅' : '❌'}`);
      console.log(`   Testimonials: ${section.has_testimonials ? '✅' : '❌'}`);
      console.log(`   Facilities: ${section.has_facilities ? '✅' : '❌'}`);
      console.log(`   Google Rating: ${section.has_google_rating ? '✅' : '❌'}`);
      console.log(`   Video ID: ${section.has_video_id ? '✅' : '❌'}`);
      console.log('');
    });

    if (missingSections.length > 0) {
      console.log(`⚠️  Missing sections: ${missingSections.join(', ')}\n`);
    } else {
      console.log('✅ All required sections exist\n');
    }

    // 2. Validate JSONB columns contain valid JSON
    console.log('📋 Phase 1.2.2: Validating JSONB columns...');
    const jsonbCheckResult = await client.query(`
      SELECT 
        section,
        jsonb_typeof(cards) as cards_type,
        jsonb_typeof(booking_data) as booking_data_type,
        jsonb_typeof(testimonials) as testimonials_type,
        jsonb_typeof(facilities) as facilities_type,
        jsonb_typeof(google_rating) as google_rating_type
      FROM homepage_content
      WHERE cards IS NOT NULL 
         OR booking_data IS NOT NULL 
         OR testimonials IS NOT NULL 
         OR facilities IS NOT NULL 
         OR google_rating IS NOT NULL;
    `);

    let jsonbIssues = 0;
    jsonbCheckResult.rows.forEach(row => {
      const issues = [];
      if (row.cards_type && row.cards_type !== 'array' && row.cards_type !== 'object') {
        issues.push(`cards is ${row.cards_type} (expected array/object)`);
      }
      if (row.booking_data_type && row.booking_data_type !== 'array' && row.booking_data_type !== 'object') {
        issues.push(`booking_data is ${row.booking_data_type} (expected array/object)`);
      }
      if (row.testimonials_type && row.testimonials_type !== 'array' && row.testimonials_type !== 'object') {
        issues.push(`testimonials is ${row.testimonials_type} (expected array/object)`);
      }
      if (row.facilities_type && row.facilities_type !== 'array' && row.facilities_type !== 'object') {
        issues.push(`facilities is ${row.facilities_type} (expected array/object)`);
      }
      if (row.google_rating_type && row.google_rating_type !== 'object') {
        issues.push(`google_rating is ${row.google_rating_type} (expected object)`);
      }
      
      if (issues.length > 0) {
        console.log(`⚠️  ${row.section}: ${issues.join(', ')}`);
        jsonbIssues++;
      }
    });

    if (jsonbIssues === 0) {
      console.log('✅ All JSONB columns contain valid JSON\n');
    }

    // 3. Check image URLs point to valid storage paths
    console.log('📋 Phase 1.2.3: Checking image URLs...');
    const imageUrlsResult = await client.query(`
      SELECT 
        section,
        image_url,
        video_url,
        video_id
      FROM homepage_content
      WHERE image_url IS NOT NULL 
         OR video_url IS NOT NULL 
         OR video_id IS NOT NULL;
    `);

    console.log(`Found ${imageUrlsResult.rows.length} sections with media:\n`);
    imageUrlsResult.rows.forEach(row => {
      console.log(`${row.section}:`);
      if (row.image_url) {
        const isSupabaseStorage = row.image_url.includes('supabase.co/storage') || row.image_url.includes('supabase.storage');
        console.log(`  Image: ${isSupabaseStorage ? '✅' : '⚠️'} ${row.image_url.substring(0, 80)}...`);
      }
      if (row.video_url) {
        const isSupabaseStorage = row.video_url.includes('supabase.co/storage') || row.video_url.includes('supabase.storage');
        console.log(`  Video URL: ${isSupabaseStorage ? '✅' : '⚠️'} ${row.video_url.substring(0, 80)}...`);
      }
      if (row.video_id) {
        console.log(`  Video ID: ✅ ${row.video_id}`);
      }
      console.log('');
    });

    // 4. Sample data from key sections
    console.log('📋 Phase 1.2.4: Sampling section data...');
    for (const section of REQUIRED_SECTIONS) {
      const sectionData = await client.query(`
        SELECT * FROM homepage_content WHERE section = $1 LIMIT 1;
      `, [section]);

      if (sectionData.rows.length > 0) {
        const data = sectionData.rows[0];
        console.log(`\n📄 ${section} section sample:`);
        console.log(`   ID: ${data.id}`);
        console.log(`   Title: ${data.title || 'N/A'}`);
        if (data.cards) {
          const cards = typeof data.cards === 'string' ? JSON.parse(data.cards) : data.cards;
          console.log(`   Cards: ${Array.isArray(cards) ? cards.length : 'N/A'} items`);
        }
        if (data.booking_data) {
          const bookingData = typeof data.booking_data === 'string' ? JSON.parse(data.booking_data) : data.booking_data;
          console.log(`   Booking Data: ${Array.isArray(bookingData) ? bookingData.length : 'N/A'} items`);
        }
        if (data.testimonials) {
          const testimonials = typeof data.testimonials === 'string' ? JSON.parse(data.testimonials) : data.testimonials;
          console.log(`   Testimonials: ${Array.isArray(testimonials) ? testimonials.length : 'N/A'} items`);
        }
        if (data.facilities) {
          const facilities = typeof data.facilities === 'string' ? JSON.parse(data.facilities) : data.facilities;
          console.log(`   Facilities: ${Array.isArray(facilities) ? facilities.length : 'N/A'} items`);
        }
      } else {
        console.log(`\n⚠️  ${section} section not found`);
      }
    }

    console.log('\n\n✅ CMS content audit complete!');

  } catch (error) {
    console.error('❌ Error auditing CMS content:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run audit
auditCMSContent()
  .then(() => {
    console.log('\n✅ CMS audit completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ CMS audit failed:', error);
    process.exit(1);
  });


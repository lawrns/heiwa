#!/usr/bin/env bun
/**
 * Restore Page Sections from Version History
 *
 * The cleanup script accidentally corrupted content by converting JSONB objects to "[object Object]" strings.
 * This script restores the most recent valid version for each section from page_section_versions table.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pguipwhrxdzzrndbluxb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function restoreFromVersions() {
  console.log('🔄 Restoring page sections from version history...\n');

  try {
    // Get all corrupted sections (content = "[object Object]")
    const { data: corruptedSections, error: fetchError } = await supabase
      .from('page_sections')
      .select('id, page_slug, section_type, content')
      .in('page_slug', ['surf', 'flow']);

    if (fetchError) {
      console.error('Error fetching sections:', fetchError);
      return;
    }

    const corrupted = corruptedSections?.filter(s => {
      const contentStr = typeof s.content === 'string' ? s.content : JSON.stringify(s.content);
      return contentStr.includes('[object Object]');
    }) || [];

    console.log(`Found ${corrupted.length} corrupted sections:\n`);
    corrupted.forEach(s => {
      console.log(`  - ${s.page_slug}/${s.section_type}`);
    });

    let restored = 0;
    let failed = 0;

    for (const section of corrupted) {
      console.log(`\n📦 Restoring ${section.page_slug}/${section.section_type}...`);

      // Get the most recent version for this section
      const { data: versions, error: versionError } = await supabase
        .from('page_section_versions')
        .select('content, created_at')
        .eq('section_id', section.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (versionError || !versions || versions.length === 0) {
        console.log(`  ❌ No version history found`);
        failed++;
        continue;
      }

      const latestVersion = versions[0];
      console.log(`  ✓ Found version from ${latestVersion.created_at}`);

      // Restore the content
      const { error: updateError } = await supabase
        .from('page_sections')
        .update({ content: latestVersion.content })
        .eq('id', section.id);

      if (updateError) {
        console.log(`  ❌ Error restoring: ${updateError.message}`);
        failed++;
      } else {
        console.log(`  ✅ Restored successfully`);
        restored++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 RESTORATION SUMMARY:');
    console.log(`  Total corrupted: ${corrupted.length}`);
    console.log(`  Successfully restored: ${restored}`);
    console.log(`  Failed: ${failed}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

restoreFromVersions();

#!/usr/bin/env bun
/**
 * Cleanup Test Content Script
 *
 * Removes all test content (EDIJS, TEST, Testing, WTF, etc.) from the CMS database.
 * Based on QA audit findings from Surf, Flow, and Play pages.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pguipwhrxdzzrndbluxb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DATABASE_URL = 'postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres';

// Test content patterns to remove
const TEST_PATTERNS = [
  /\bEDIJS\b/gi,
  /\bEdijs\b/gi,
  /\bTEST\./gi,
  /\bTEST\s/gi,
  /\bTesting\./gi,
  /\bTesting\s/gi,
  /\bTJESTJING\b/gi,
  /\bWTF\s/gi,
  /\bWTF\./gi,
  /^Edijs Test\.\s*/gi,
  /^EDIJS TEST\s*/gi,
  /^Test\.\s*/gi,
  /\s*EDIJS$/gi,
  /\s*TEST$/gi,
  /\s*Testing$/gi,
  /\s*sdfsdf$/gi,
  /^How would this work with a longer title\?$/gi,
  /^EDIJS EDIJS\s*/gi,
  /^EDIIIIIJS\s*/gi,
  /\s*asffdsvdfv\s*/gi,
  /\s*davsvdsv\s*/gi,
];

interface PageMeta {
  id: string;
  slug: string;
  title: string | null;
  meta_description: string | null;
}

interface PageSection {
  id: string;
  page_slug: string;
  section_type: string;
  title: string | null;
  content: string | null;
  subtitle: string | null;
  description: string | null;
  button_text: string | null;
  primary_link_text: string | null;
  secondary_link_text: string | null;
  items: any;
}

function cleanText(text: string | null, fieldName?: string): string | null {
  if (!text) return text;

  let cleaned = String(text); // Ensure it's a string

  // Apply all test patterns
  for (const pattern of TEST_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // For required fields like title, provide a default if empty
  if (!cleaned && fieldName === 'title') {
    return null; // Will be handled by caller
  }

  // Return null if empty after cleaning
  return cleaned || null;
}

function cleanItems(items: any): any {
  if (!items) return items;
  if (Array.isArray(items)) {
    return items.map(item => {
      if (typeof item === 'string') {
        return cleanText(item);
      }
      if (typeof item === 'object') {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(item)) {
          if (typeof value === 'string') {
            cleaned[key] = cleanText(value);
          } else {
            cleaned[key] = value;
          }
        }
        return cleaned;
      }
      return item;
    }).filter(item => item !== null && item !== '');
  }
  return items;
}

async function main() {
  console.log('🧹 Starting test content cleanup...\n');

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. Clean up pages_meta
  console.log('📄 Cleaning pages_meta table...');

  const { data: pagesMetaData, error: pagesMetaError } = await supabase
    .from('pages_meta')
    .select('*')
    .in('slug', ['surf', 'flow', 'play']);

  if (pagesMetaError) {
    console.error('❌ Error fetching pages_meta:', pagesMetaError);
    process.exit(1);
  }

  let metaUpdated = 0;
  for (const page of pagesMetaData as PageMeta[]) {
    const cleanedTitle = cleanText(page.title, 'title');
    const cleanedDescription = cleanText(page.meta_description);

    // Provide sensible defaults for required fields
    const titleDefaults: Record<string, string> = {
      surf: 'Surf',
      flow: 'Flow',
      play: 'Play',
    };

    const finalTitle = cleanedTitle || titleDefaults[page.slug] || page.slug;

    const hasChanges = finalTitle !== page.title || cleanedDescription !== page.meta_description;

    if (hasChanges) {
      console.log(`  Cleaning page: ${page.slug}`);
      console.log(`    Old title: "${page.title}"`);
      console.log(`    New title: "${finalTitle}"`);
      if (page.meta_description) {
        console.log(`    Old description: "${page.meta_description.substring(0, 60)}..."`);
        console.log(`    New description: "${cleanedDescription?.substring(0, 60)}..."`);
      }

      const { error: updateError } = await supabase
        .from('pages_meta')
        .update({
          title: finalTitle,
          meta_description: cleanedDescription,
        })
        .eq('id', page.id);

      if (updateError) {
        console.error(`  ❌ Error updating ${page.slug}:`, updateError);
      } else {
        metaUpdated++;
        console.log(`  ✅ Updated ${page.slug}`);
      }
    }
  }

  console.log(`\n✅ Updated ${metaUpdated} page meta records\n`);

  // 2. Clean up page_sections
  console.log('📝 Cleaning page_sections table...');

  const { data: sectionsData, error: sectionsError } = await supabase
    .from('page_sections')
    .select('*')
    .in('page_slug', ['surf', 'flow', 'play']);

  if (sectionsError) {
    console.error('❌ Error fetching page_sections:', sectionsError);
    process.exit(1);
  }

  let sectionsUpdated = 0;
  for (const section of sectionsData as PageSection[]) {
    const updates: Partial<PageSection> = {};
    let hasChanges = false;

    // Clean all text fields
    const fields = [
      'title',
      'content',
      'subtitle',
      'description',
      'button_text',
      'primary_link_text',
      'secondary_link_text'
    ] as const;

    for (const field of fields) {
      const original = section[field];
      const cleaned = cleanText(original);
      if (cleaned !== original) {
        updates[field] = cleaned;
        hasChanges = true;
      }
    }

    // Clean items field
    if (section.items) {
      const cleanedItems = cleanItems(section.items);
      if (JSON.stringify(cleanedItems) !== JSON.stringify(section.items)) {
        updates.items = cleanedItems;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      console.log(`  Cleaning section: ${section.page_slug} / ${section.section_type}`);
      console.log(`    Section ID: ${section.id}`);
      if (updates.title) console.log(`    Title: "${section.title}" → "${updates.title}"`);
      if (updates.content) console.log(`    Content: Changed`);
      if (updates.description) console.log(`    Description: Changed`);

      const { error: updateError } = await supabase
        .from('page_sections')
        .update(updates)
        .eq('id', section.id);

      if (updateError) {
        console.error(`  ❌ Error updating section ${section.id}:`, updateError);
      } else {
        sectionsUpdated++;
        console.log(`  ✅ Updated section`);
      }
    }
  }

  console.log(`\n✅ Updated ${sectionsUpdated} section records\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 CLEANUP COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Total pages cleaned: ${metaUpdated}`);
  console.log(`📊 Total sections cleaned: ${sectionsUpdated}`);
  console.log(`📊 Total updates: ${metaUpdated + sectionsUpdated}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

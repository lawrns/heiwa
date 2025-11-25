/**
 * Generate TypeScript image URL mapping from JSON
 * This creates a complete mapping file for use in the application
 */

const fs = require('fs');
const path = require('path');

const MAPPING_FILE = path.join(__dirname, 'image-url-mapping.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'lib', 'image-url-mapper.ts');

const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));

const mapEntries = Object.entries(mapping)
  .map(([local, data]: [string, any]) => `  '${local}': '${data.supabaseUrl}',`)
  .join('\n');

const output = `/**
 * Image URL Mapper
 * Maps local image paths to Supabase storage URLs
 * Auto-generated from image migration process
 * 
 * Last updated: ${new Date().toISOString()}
 */

const IMAGE_URL_MAP: Record<string, string> = {
${mapEntries}
};

/**
 * Get Supabase URL for a local image path
 * Returns the Supabase URL if mapped, otherwise returns the original path
 */
export function getImageUrl(localPath: string | null | undefined): string {
  if (!localPath) return '';
  
  // If it's already a full URL, return as-is
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
    return localPath;
  }
  
  // Check if we have a mapping
  if (IMAGE_URL_MAP[localPath]) {
    return IMAGE_URL_MAP[localPath];
  }
  
  // Return original path if no mapping found
  // This allows for fallback behavior
  return localPath;
}

/**
 * Get Supabase URLs for an array of local image paths
 */
export function getImageUrls(localPaths: (string | null | undefined)[] | null | undefined): string[] {
  if (!localPaths || !Array.isArray(localPaths) || localPaths.length === 0) {
    return [];
  }
  
  return localPaths
    .map(path => getImageUrl(path))
    .filter(url => url !== '');
}
`;

fs.writeFileSync(OUTPUT_FILE, output);
console.log(`✅ Generated image URL mapper with ${Object.keys(mapping).length} mappings`);


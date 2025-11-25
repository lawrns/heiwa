#!/usr/bin/env node
/**
 * Image Inventory Script
 * Scans public/images folder and catalogs all images for migration
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const OUTPUT_FILE = path.join(__dirname, 'image-inventory.json');

// Image categories and their patterns
const CATEGORIES = {
  rooms: {
    patterns: ['rooms/'],
    bucket: 'room-images',
    description: 'Room images'
  },
  surfCamps: {
    patterns: ['surf-weeks', 'posters/surfweeks'],
    bucket: 'surf-camp-images',
    description: 'Surf camp images'
  },
  homepage: {
    patterns: ['hero/', 'hh', 'surf-weeks-front-page'],
    bucket: 'page-images',
    subfolder: 'homepage',
    description: 'Homepage images'
  },
  pageContent: {
    patterns: ['play.jpg', 'surf', 'yoga_dome', 'skatepark', 'pool', 'park'],
    bucket: 'page-images',
    description: 'Page content images'
  },
  videos: {
    patterns: ['.mp4'],
    bucket: 'cms-media',
    subfolder: 'videos',
    description: 'Video files'
  },
  general: {
    patterns: [], // Catch-all
    bucket: 'cms-media',
    subfolder: 'general',
    description: 'General/gallery images'
  }
};

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi'];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext) || VIDEO_EXTENSIONS.includes(ext)) {
        fileList.push({
          path: filePath,
          relativePath: path.relative(PUBLIC_IMAGES_DIR, filePath).replace(/\\/g, '/'),
          name: file,
          extension: ext,
          size: stat.size,
          modified: stat.mtime.toISOString()
        });
      }
    }
  });
  
  return fileList;
}

function categorizeImage(file) {
  const relativePath = file.relativePath.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  // Check each category
  for (const [categoryName, category] of Object.entries(CATEGORIES)) {
    if (categoryName === 'general') continue; // Skip general, it's catch-all
    
    for (const pattern of category.patterns) {
      if (relativePath.includes(pattern.toLowerCase()) || fileName.includes(pattern.toLowerCase())) {
        return {
          category: categoryName,
          bucket: category.bucket,
          subfolder: category.subfolder || categoryName,
          description: category.description
        };
      }
    }
  }
  
  // Default to general
  return {
    category: 'general',
    bucket: CATEGORIES.general.bucket,
    subfolder: CATEGORIES.general.subfolder,
    description: CATEGORIES.general.description
  };
}

function generateInventory() {
  console.log('🔍 Scanning public/images folder...\n');
  
  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    console.error(`❌ Error: Directory not found: ${PUBLIC_IMAGES_DIR}`);
    process.exit(1);
  }
  
  const allFiles = getAllFiles(PUBLIC_IMAGES_DIR);
  console.log(`📁 Found ${allFiles.length} image/video files\n`);
  
  const inventory = {
    scanDate: new Date().toISOString(),
    totalFiles: allFiles.length,
    categories: {},
    files: []
  };
  
  // Categorize each file
  allFiles.forEach(file => {
    const categoryInfo = categorizeImage(file);
    
    // Initialize category if needed
    if (!inventory.categories[categoryInfo.category]) {
      inventory.categories[categoryInfo.category] = {
        count: 0,
        totalSize: 0,
        bucket: categoryInfo.bucket,
        description: categoryInfo.description
      };
    }
    
    inventory.categories[categoryInfo.category].count++;
    inventory.categories[categoryInfo.category].totalSize += file.size;
    
    // Add file to inventory
    inventory.files.push({
      ...file,
      category: categoryInfo.category,
      bucket: categoryInfo.bucket,
      subfolder: categoryInfo.subfolder,
      localPath: `/images/${file.relativePath}`,
      publicPath: `/images/${file.relativePath}`
    });
  });
  
  // Summary
  console.log('📊 Inventory Summary:\n');
  console.log('Categories:');
  Object.entries(inventory.categories).forEach(([name, info]) => {
    const sizeMB = (info.totalSize / 1024 / 1024).toFixed(2);
    console.log(`  ${name}: ${info.count} files (${sizeMB} MB) → ${info.bucket}`);
  });
  
  console.log(`\n✅ Total: ${inventory.totalFiles} files\n`);
  
  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(inventory, null, 2));
  console.log(`💾 Inventory saved to: ${OUTPUT_FILE}\n`);
  
  return inventory;
}

// Run inventory
if (require.main === module) {
  try {
    generateInventory();
    console.log('✨ Inventory generation complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = { generateInventory, categorizeImage };


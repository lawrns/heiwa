#!/usr/bin/env node

/**
 * WordPress Integration Verification Script
 * Comprehensive verification of all WordPress integration components
 */

const fs = require('fs');
const path = require('path');

/**
 * Check if file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Check if directory exists
 */
function dirExists(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Read file content
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

/**
 * Verify WordPress plugin structure
 */
function verifyWordPressPlugin() {
  console.log('🔍 Verifying WordPress Plugin Structure...\n');
  
  const pluginBase = 'wordpress-plugin/heiwa-booking-widget';
  const requiredFiles = [
    'heiwa-booking-widget.php',
    'includes/class-api-connector.php',
    'includes/class-widget.php',
    'includes/class-shortcode.php',
    'admin/class-settings.php',
    'assets/css/widget.css'
  ];

  let allFilesExist = true;

  requiredFiles.forEach(file => {
    const fullPath = path.join(pluginBase, file);
    if (fileExists(fullPath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      allFilesExist = false;
    }
  });

  // Check main plugin file content
  const mainPluginFile = path.join(pluginBase, 'heiwa-booking-widget.php');
  if (fileExists(mainPluginFile)) {
    const content = readFile(mainPluginFile);
    if (content && content.includes('Plugin Name: Heiwa Booking Widget')) {
      console.log('✅ Main plugin file has correct header');
    } else {
      console.log('❌ Main plugin file missing proper header');
      allFilesExist = false;
    }
  }

  console.log('');
  return allFilesExist;
}

/**
 * Verify API endpoints
 */
function verifyAPIEndpoints() {
  console.log('🔍 Verifying WordPress API Endpoints...\n');
  
  const apiBase = 'src/app/api/wordpress';
  const requiredEndpoints = [
    'test/route.ts',
    'surf-camps/route.ts',
    'availability/route.ts',
    'bookings/route.ts'
  ];

  let allEndpointsExist = true;

  requiredEndpoints.forEach(endpoint => {
    const fullPath = path.join(apiBase, endpoint);
    if (fileExists(fullPath)) {
      console.log(`✅ ${endpoint}`);
      
      // Check if endpoint has proper authentication
      const content = readFile(fullPath);
      if (content && content.includes('X-Heiwa-API-Key')) {
        console.log(`   ✅ Has API key authentication`);
      } else {
        console.log(`   ❌ Missing API key authentication`);
        allEndpointsExist = false;
      }
    } else {
      console.log(`❌ ${endpoint} - MISSING`);
      allEndpointsExist = false;
    }
  });

  console.log('');
  return allEndpointsExist;
}

/**
 * Verify database migration
 */
function verifyDatabaseMigration() {
  console.log('🔍 Verifying Database Migration...\n');
  
  const migrationFile = 'supabase/migrations/004_add_booking_source_tracking.sql';
  
  if (fileExists(migrationFile)) {
    console.log('✅ Database migration file exists');
    
    const content = readFile(migrationFile);
    if (content && content.includes('source TEXT') && content.includes('wordpress')) {
      console.log('✅ Migration includes source tracking for WordPress');
    } else {
      console.log('❌ Migration missing proper source tracking');
      return false;
    }
  } else {
    console.log('❌ Database migration file missing');
    return false;
  }

  console.log('');
  return true;
}

/**
 * Verify schema updates
 */
function verifySchemaUpdates() {
  console.log('🔍 Verifying Schema Updates...\n');
  
  const schemaFile = 'src/lib/schemas.ts';
  
  if (fileExists(schemaFile)) {
    console.log('✅ Schema file exists');
    
    const content = readFile(schemaFile);
    if (content && content.includes("source: z.enum(['dashboard', 'wordpress', 'api'])")) {
      console.log('✅ Booking schema includes source field');
    } else {
      console.log('❌ Booking schema missing source field');
      return false;
    }

    if (content && content.includes('CreateBookingFormSchema')) {
      console.log('✅ Form schema includes WordPress support');
    } else {
      console.log('❌ Form schema missing WordPress support');
      return false;
    }
  } else {
    console.log('❌ Schema file missing');
    return false;
  }

  console.log('');
  return true;
}

/**
 * Verify documentation
 */
function verifyDocumentation() {
  console.log('🔍 Verifying Documentation...\n');
  
  const docFile = 'WORDPRESS_INTEGRATION.md';
  
  if (fileExists(docFile)) {
    console.log('✅ WordPress integration documentation exists');
    
    const content = readFile(docFile);
    if (content && content.includes('API Endpoints') && content.includes('WordPress Plugin')) {
      console.log('✅ Documentation includes API and plugin information');
    } else {
      console.log('❌ Documentation incomplete');
      return false;
    }
  } else {
    console.log('❌ WordPress integration documentation missing');
    return false;
  }

  console.log('');
  return true;
}

/**
 * Main verification function
 */
async function verifyWordPressIntegration() {
  console.log('🚀 WordPress Integration Verification\n');
  console.log('=====================================\n');

  const results = {
    plugin: verifyWordPressPlugin(),
    api: verifyAPIEndpoints(),
    database: verifyDatabaseMigration(),
    schema: verifySchemaUpdates(),
    documentation: verifyDocumentation()
  };

  console.log('📊 Verification Summary:');
  console.log('========================\n');

  Object.entries(results).forEach(([component, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const name = component.charAt(0).toUpperCase() + component.slice(1);
    console.log(`${status} ${name}`);
  });

  const allPassed = Object.values(results).every(result => result);
  
  console.log('\n' + '='.repeat(40));
  
  if (allPassed) {
    console.log('🎉 ALL VERIFICATIONS PASSED!');
    console.log('WordPress integration is ready for production deployment.');
  } else {
    console.log('⚠️  SOME VERIFICATIONS FAILED!');
    console.log('Please address the issues above before deployment.');
  }

  return allPassed;
}

// Run verification if this script is executed directly
if (require.main === module) {
  verifyWordPressIntegration()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Verification error:', error);
      process.exit(1);
    });
}

module.exports = { verifyWordPressIntegration };

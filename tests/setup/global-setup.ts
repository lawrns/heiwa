/**
 * Global Test Setup
 * Prepares the testing environment for comprehensive testing
 */

import { chromium, FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');

  try {
    // 1. Ensure test environment variables are set
    validateEnvironmentVariables();

    // 2. Setup test database
    await setupTestDatabase();

    // 3. Prepare WordPress environment
    await prepareWordPressEnvironment();

    // 4. Create admin authentication state
    await createAdminAuthState();

    // 5. Seed test data
    await seedTestData();

    console.log('✅ Global test setup completed successfully');
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    throw error;
  }
}

function validateEnvironmentVariables() {
  console.log('🔍 Validating environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('✅ Environment variables validated');
}

async function setupTestDatabase() {
  console.log('🗄️ Setting up test database...');
  
  try {
    // Run database migrations
    execSync('npm run db:migrate', { stdio: 'inherit' });
    
    // Reset database to clean state
    execSync('npm run db:reset', { stdio: 'inherit' });
    
    console.log('✅ Test database setup completed');
  } catch (error) {
    console.log('⚠️ Database setup skipped (migrations may not exist)');
  }
}

async function prepareWordPressEnvironment() {
  console.log('🌐 Preparing WordPress environment...');
  
  try {
    // Check if WordPress is already running
    const response = await fetch('http://localhost:8080/wp-admin/admin-ajax.php');
    if (response.ok) {
      console.log('✅ WordPress is already running');
      return;
    }
  } catch (error) {
    // WordPress not running, start it
  }

  try {
    // Start WordPress with Docker Compose
    execSync('docker-compose up -d wordpress', { stdio: 'inherit' });
    
    // Wait for WordPress to be ready
    await waitForWordPress();
    
    // Install WordPress if needed
    await installWordPress();
    
    console.log('✅ WordPress environment prepared');
  } catch (error) {
    console.log('⚠️ WordPress setup skipped:', error.message);
  }
}

async function waitForWordPress(maxAttempts = 30) {
  console.log('⏳ Waiting for WordPress to be ready...');
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch('http://localhost:8080');
      if (response.ok) {
        console.log('✅ WordPress is ready');
        return;
      }
    } catch (error) {
      // Continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('WordPress failed to start within timeout');
}

async function installWordPress() {
  console.log('📦 Installing WordPress...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:8080');
    
    // Check if WordPress is already installed
    const isInstalled = await page.locator('#wp-submit').count() > 0;
    
    if (!isInstalled) {
      // Run WordPress installation
      await page.goto('http://localhost:8080/wp-admin/install.php');
      
      await page.fill('#weblog_title', 'Heiwa House Test Site');
      await page.fill('#user_name', 'admin');
      await page.fill('#pass1', 'admin123');
      await page.fill('#pass2', 'admin123');
      await page.fill('#admin_email', 'admin@heiwa.test');
      await page.click('#submit');
      
      await page.waitForSelector('.step');
      console.log('✅ WordPress installed successfully');
    } else {
      console.log('✅ WordPress already installed');
    }
  } finally {
    await browser.close();
  }
}

async function createAdminAuthState() {
  console.log('🔐 Creating admin authentication state...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Login to React admin dashboard
    await page.goto('http://localhost:3005/login');
    
    await page.fill('[data-testid="email-input"]', 'admin@heiwa.house');
    await page.fill('[data-testid="password-input"]', 'admin123456');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('**/admin');
    
    // Save authentication state
    await page.context().storageState({ path: 'tests/auth/admin-auth.json' });
    
    console.log('✅ Admin authentication state saved');
  } catch (error) {
    console.log('⚠️ Admin auth state creation skipped:', error.message);
  } finally {
    await browser.close();
  }
}

async function seedTestData() {
  console.log('🌱 Seeding test data...');
  
  try {
    // Run seeding script
    execSync('npm run seed:test', { stdio: 'inherit' });
    console.log('✅ Test data seeded successfully');
  } catch (error) {
    console.log('⚠️ Test data seeding skipped:', error.message);
  }
}

export default globalSetup;

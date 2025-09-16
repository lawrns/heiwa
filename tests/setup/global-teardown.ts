/**
 * Global Test Teardown
 * Cleans up the testing environment after all tests complete
 */

import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...');

  try {
    // 1. Clean up test data
    await cleanupTestData();

    // 2. Stop WordPress environment
    await stopWordPressEnvironment();

    // 3. Clean up authentication states
    cleanupAuthStates();

    // 4. Archive test results
    await archiveTestResults();

    // 5. Generate test summary
    generateTestSummary();

    console.log('✅ Global test teardown completed successfully');
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

async function cleanupTestData() {
  console.log('🗑️ Cleaning up test data...');
  
  try {
    // Clean up test database
    execSync('npm run db:cleanup', { stdio: 'inherit' });
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.log('⚠️ Test data cleanup skipped:', error.message);
  }
}

async function stopWordPressEnvironment() {
  console.log('🛑 Stopping WordPress environment...');
  
  try {
    // Stop WordPress Docker containers
    execSync('docker-compose down', { stdio: 'inherit' });
    console.log('✅ WordPress environment stopped');
  } catch (error) {
    console.log('⚠️ WordPress environment stop skipped:', error.message);
  }
}

function cleanupAuthStates() {
  console.log('🔐 Cleaning up authentication states...');
  
  try {
    const authDir = path.join(__dirname, '../auth');
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true, force: true });
    }
    console.log('✅ Authentication states cleaned up');
  } catch (error) {
    console.log('⚠️ Auth state cleanup skipped:', error.message);
  }
}

async function archiveTestResults() {
  console.log('📦 Archiving test results...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = `test-results/archive/${timestamp}`;
    
    // Create archive directory
    fs.mkdirSync(archiveDir, { recursive: true });
    
    // Copy test results
    const resultsDir = 'test-results';
    if (fs.existsSync(resultsDir)) {
      execSync(`cp -r ${resultsDir}/* ${archiveDir}/`, { stdio: 'inherit' });
    }
    
    // Copy Playwright report
    const reportDir = 'playwright-report';
    if (fs.existsSync(reportDir)) {
      execSync(`cp -r ${reportDir} ${archiveDir}/playwright-report`, { stdio: 'inherit' });
    }
    
    console.log(`✅ Test results archived to ${archiveDir}`);
  } catch (error) {
    console.log('⚠️ Test results archiving skipped:', error.message);
  }
}

function generateTestSummary() {
  console.log('📊 Generating test summary...');
  
  try {
    const resultsFile = 'test-results/results.json';
    
    if (!fs.existsSync(resultsFile)) {
      console.log('⚠️ No test results file found');
      return;
    }
    
    const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    
    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: results.stats?.total || 0,
      passed: results.stats?.passed || 0,
      failed: results.stats?.failed || 0,
      skipped: results.stats?.skipped || 0,
      duration: results.stats?.duration || 0,
      projects: results.suites?.map(suite => ({
        name: suite.title,
        tests: suite.specs?.length || 0,
        passed: suite.specs?.filter(spec => spec.ok).length || 0,
        failed: suite.specs?.filter(spec => !spec.ok).length || 0,
      })) || [],
    };
    
    // Write summary to file
    fs.writeFileSync(
      'test-results/summary.json',
      JSON.stringify(summary, null, 2)
    );
    
    // Log summary to console
    console.log('\n📊 Test Summary:');
    console.log(`   Total Tests: ${summary.totalTests}`);
    console.log(`   Passed: ${summary.passed}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Skipped: ${summary.skipped}`);
    console.log(`   Duration: ${Math.round(summary.duration / 1000)}s`);
    
    if (summary.projects.length > 0) {
      console.log('\n📋 Project Results:');
      summary.projects.forEach(project => {
        console.log(`   ${project.name}: ${project.passed}/${project.tests} passed`);
      });
    }
    
    console.log('✅ Test summary generated');
  } catch (error) {
    console.log('⚠️ Test summary generation skipped:', error.message);
  }
}

export default globalTeardown;

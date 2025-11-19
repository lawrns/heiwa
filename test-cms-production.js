#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const BASE_URL = 'https://heiwahauz.netlify.app';
const ROUTES_TO_TEST = [
  '/api/cms/page-content?page_slug=home',
  '/api/cms/page-content?page_slug=play',
  '/api/cms/page-content?page_slug=flow',
  '/api/admin/cms/settings',
  '/api/admin/testimonials',
  '/api/surf-camps',
  '/api/rooms'
];

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function verifyCMSProduction() {
  console.log('🧪 Starting CMS Production Verification...');
  console.log(`Target: ${BASE_URL}\n`);
  
  let successCount = 0;
  let failureCount = 0;

  for (const route of ROUTES_TO_TEST) {
    const url = `${BASE_URL}${route}`;
    console.log(`Testing ${route}...`);
    
    try {
      const result = await makeRequest(url);
      
      if (result.status >= 200 && result.status < 300) {
        console.log(`✅ Success (${result.status})`);
        if (result.data) {
          const itemCount = Array.isArray(result.data.data) ? result.data.data.length : (Array.isArray(result.data) ? result.data.length : 'N/A');
          console.log(`   Items returned: ${itemCount}`);
        }
        successCount++;
      } else {
        console.log(`❌ Failed (${result.status})`);
        console.log(`   Response: ${result.raw.substring(0, 100)}...`);
        failureCount++;
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      failureCount++;
    }
    console.log('---');
  }

  console.log('\n📊 Verification Summary');
  console.log(`Total Tests: ${ROUTES_TO_TEST.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
  
  if (failureCount === 0) {
    console.log('\n✅ CMS is fully operational in production!');
  } else {
    console.log('\n⚠️ Some CMS endpoints are failing. Check logs above.');
  }
}

verifyCMSProduction();


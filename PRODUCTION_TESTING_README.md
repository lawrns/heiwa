# Production Verification Testing

This document describes the automated production verification test suite that runs after deployment.

## Overview

The production verification test suite automatically validates all critical functionality after deployment to ensure:

- ✅ API availability (200 responses, correct payload structure)
- ✅ Authentication and session flow
- ✅ All booking flow steps
- ✅ Payment gateway interactions
- ✅ Database write/read consistency
- ✅ Error handling paths

## Test Scripts

### Node.js Version (Recommended)
```bash
npm run test:production
# or
node scripts/production-verification-test.js [PRODUCTION_URL]
```

### Bash Version
```bash
npm run test:production:bash
# or
bash scripts/production-verification-test.sh [PRODUCTION_URL]
```

## Default Production URL

If no URL is provided, the script defaults to: `https://heiwahauz.netlify.app`

## Test Coverage

### 1. API Availability Tests
- Rooms API
- Surf Camps API
- Add-ons API
- Activities API
- Rooms Availability API
- Dates Availability API
- Bookings API
- Payments API
- Invoices API
- Calendar Events API

### 2. Authentication & Session Flow
- Admin login endpoint
- Protected route access
- Session management

### 3. Booking Flow Tests
- Surf week booking creation
- Room availability checks
- Booking validation

### 4. Payment Gateway Tests
- Payment listing
- Payment intent creation
- Payment processing endpoints

### 5. Database Consistency Tests
- Read operations
- Data integrity checks
- Query performance

### 6. Error Handling Tests
- Invalid endpoint handling (404)
- Invalid payload handling (400)
- Invalid date format handling

### 7. Frontend Pages Tests
- Homepage load
- Rooms page
- Surf weeks page

## Test Results

Test results are saved to `test-results-production/` directory:

- **JSON Report**: `verification_report_[timestamp].json`
  - Machine-readable test results
  - Includes all test details and responses
  
- **Diagnostic Report**: `diagnostics_[timestamp].md`
  - Human-readable diagnostic information
  - Includes recommended fixes for failed tests

## Automated Execution

### After Manual Deployment

Run the test suite manually after deploying:
```bash
npm run test:production
```

### Netlify Post-Deploy Hook

To automatically run tests after Netlify deployments:

1. **Via Netlify UI**:
   - Go to Site Settings → Build & Deploy → Post Processing
   - Add command: `npm run test:production`

2. **Via netlify.toml** (if supported):
   ```toml
   [build]
     command = "npm run build && npm run test:production"
   ```

3. **Via GitHub Actions** (recommended):
   Create `.github/workflows/post-deploy-test.yml`:
   ```yaml
   name: Post-Deploy Verification
   on:
     deployment_status:
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm install
         - run: npm run test:production ${{ github.event.deployment_status.target_url }}
   ```

## Interpreting Results

### Success
```
✅ All tests passed!
```
All critical endpoints are functioning correctly.

### Failures
```
❌ Some tests failed. Please review the diagnostic report.
```

Check the diagnostic report for:
- Which endpoints failed
- Expected vs actual responses
- Recommended fixes

### Common Issues

1. **404 Errors**: Endpoint not found
   - Check API route files exist
   - Verify route paths match

2. **500 Errors**: Server errors
   - Check server logs
   - Verify database connectivity
   - Check environment variables

3. **400 Errors**: Bad requests
   - Verify request payload format
   - Check required fields

4. **Timeout Errors**: Slow responses
   - Check database query performance
   - Verify network connectivity
   - Review server resources

## Continuous Integration

For CI/CD pipelines, the test script:
- Exits with code 0 on success
- Exits with code 1 on failure
- Generates reports for analysis

Example CI integration:
```yaml
- name: Run Production Tests
  run: npm run test:production
  continue-on-error: true  # Don't fail build, just report
```

## Maintenance

### Adding New Tests

Edit `scripts/production-verification-test.js`:

```javascript
await testApiEndpoint('New Test Name', '/api/new-endpoint', 'GET', 200);
```

### Updating Production URL

Update the default URL in the script or pass as argument:
```bash
node scripts/production-verification-test.js https://your-production-url.com
```

## Troubleshooting

### Tests Fail Locally but Pass in Production
- Check network connectivity
- Verify firewall rules
- Ensure production URL is accessible

### Tests Timeout
- Increase timeout in script (default: 10 seconds)
- Check production server performance
- Verify DNS resolution

### JSON Parse Errors
- Check API response format
- Verify Content-Type headers
- Review API route handlers

## Support

For issues with the test suite:
1. Check diagnostic report for details
2. Review test script logs
3. Verify production environment configuration
4. Check API endpoint documentation


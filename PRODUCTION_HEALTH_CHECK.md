# Production Health Check Guide

## Overview
This document outlines comprehensive checks to ensure all areas of the production site are working correctly.

## Quick Health Check

Run the automated health check script:
```bash
npm run health-check
# or
node scripts/production-health-check.js
```

## Manual Verification Checklist

### 🔴 Critical (Must Work)

#### 1. Homepage & Core Pages
- [ ] Homepage loads (`/`)
- [ ] Navigation works
- [ ] Footer loads
- [ ] All main pages accessible:
  - [ ] `/surf-weeks`
  - [ ] `/rooms`
  - [ ] `/the-spot`
  - [ ] `/about`
  - [ ] `/flow`
  - [ ] `/play`
  - [ ] `/surf`

#### 2. Booking System
- [ ] Booking widget opens from header "BOOK" button
- [ ] Room booking flow works:
  - [ ] Date selection
  - [ ] Guest count selection
  - [ ] Room selection
  - [ ] Guest details form
  - [ ] Payment method selection
  - [ ] Booking submission
- [ ] Surf week booking flow works:
  - [ ] Surf week selection
  - [ ] Room selection for surf week
  - [ ] Guest details
  - [ ] Booking submission
- [ ] Booking confirmation displays correctly
- [ ] Email notifications sent (check logs)

#### 3. API Endpoints
- [ ] `/api/bookings` - Returns bookings list
- [ ] `/api/rooms` - Returns available rooms
- [ ] `/api/surf-camps` - Returns surf camps
- [ ] `/api/availability` - Returns availability data
- [ ] `/api/dates/availability` - Returns date availability
- [ ] `/api/add-ons` - Returns add-ons

#### 4. Database Connection
- [ ] Supabase connection working
- [ ] No "Multiple GoTrueClient" warnings
- [ ] Database queries return data
- [ ] No connection timeouts

### 🟡 Important (Should Work)

#### 5. CMS Functionality
- [ ] Homepage sections editable
- [ ] Page content editable
- [ ] Media library accessible
- [ ] CMS API endpoints working:
  - [ ] `/api/cms/homepage`
  - [ ] `/api/cms/page-content`
  - [ ] `/api/cms/media`

#### 6. Admin Panel
- [ ] Admin login works
- [ ] Dashboard loads
- [ ] Bookings management works
- [ ] Clients management works
- [ ] Analytics display correctly

#### 7. Images & Media
- [ ] Room images load
- [ ] Surf camp images load
- [ ] Homepage images load
- [ ] Gallery images load
- [ ] Image optimization working (WebP/AVIF)

#### 8. Forms & Contact
- [ ] Contact form submits
- [ ] Email sending works
- [ ] Form validation works
- [ ] Error messages display correctly

### 🟢 Optional (Nice to Have)

#### 9. SEO & Metadata
- [ ] Meta tags present
- [ ] Open Graph tags correct
- [ ] Twitter cards working
- [ ] Sitemap accessible (`/sitemap.xml`)
- [ ] Robots.txt present (`/robots.txt`)

#### 10. Performance
- [ ] Page load times < 3 seconds
- [ ] API response times < 1 second
- [ ] Images optimized
- [ ] No console errors
- [ ] No network errors

#### 11. Mobile Responsiveness
- [ ] Mobile navigation works
- [ ] Booking widget mobile-friendly
- [ ] Forms work on mobile
- [ ] Images display correctly
- [ ] Touch interactions work

#### 12. Browser Compatibility
- [ ] Chrome/Edge works
- [ ] Firefox works
- [ ] Safari works
- [ ] Mobile browsers work

## Automated Checks

### Environment Variables
Verify all required environment variables are set:
```bash
# Check Netlify environment variables
netlify env:list

# Required variables:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - STRIPE_SECRET_KEY (if using Stripe)
# - GOOGLE_PLACES_API_KEY (if using Google Reviews)
```

### Database Schema
Verify database schema is up to date:
```bash
# Check migrations
npm run db:migrate:status

# Apply any pending migrations
npm run db:migrate
```

### Build Status
Check Netlify deployment status:
```bash
netlify status
netlify deploy:list
```

## Common Issues & Solutions

### Issue: Multiple GoTrueClient Instances
**Solution**: Ensure singleton pattern in `lib/supabase.ts` is working correctly.

### Issue: API Timeouts
**Solution**: Check Supabase connection, verify environment variables, check database status.

### Issue: Images Not Loading
**Solution**: Verify Supabase storage buckets are configured, check image URLs, verify CORS settings.

### Issue: Booking Submission Fails
**Solution**: Check API logs, verify database schema, check form validation, verify email service.

### Issue: Admin Panel Not Loading
**Solution**: Check authentication, verify admin routes, check API endpoints.

## Monitoring

### Set Up Monitoring
1. **Uptime Monitoring**: Use Netlify Analytics or external service
2. **Error Tracking**: Set up Sentry or similar
3. **Performance Monitoring**: Use Lighthouse CI
4. **API Monitoring**: Monitor critical endpoints

### Regular Checks
- Daily: Check error logs
- Weekly: Review performance metrics
- Monthly: Full health check
- Quarterly: Security audit

## Emergency Contacts

If critical issues are found:
1. Check Netlify deployment logs
2. Check Supabase dashboard for database issues
3. Review recent code changes
4. Check environment variables
5. Verify database migrations

## Health Check Script Usage

```bash
# Run health check against production
PRODUCTION_URL=https://heiwahauz.netlify.app node scripts/production-health-check.js

# Run against staging (if available)
PRODUCTION_URL=https://staging.heiwahauz.netlify.app node scripts/production-health-check.js

# Run against local
PRODUCTION_URL=http://localhost:3000 node scripts/production-health-check.js
```

## Next Steps

After running health checks:
1. Document any failures
2. Prioritize fixes
3. Test fixes in staging
4. Deploy fixes to production
5. Re-run health checks
6. Monitor for 24-48 hours


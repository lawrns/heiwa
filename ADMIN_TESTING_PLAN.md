# Admin Panel Testing Plan

## User Journey Overview

### Phase 1: Authentication & Login
- Navigate to admin panel
- Enter password: `heiwa_admin_2024`
- Verify successful authentication
- Check for any auth-related errors

### Phase 2: Dashboard Access
- Verify dashboard loads after login
- Check all dashboard sections are visible
- Verify no hydration or initialization errors
- Monitor console for Multiple GoTrueClient warnings

### Phase 3: Room Management
- Access rooms section
- Verify room list displays (4 rooms expected)
- Check room data (names, pricing, capacity, images)
- Test room detail view
- Verify image loading

### Phase 4: Bookings & Calendar
- Access bookings section (if available)
- Access calendar/events section
- Verify data display
- Check for any API errors

### Phase 5: CMS & Content
- Access CMS sections if available
- Verify content management features
- Check page content, blog, etc.

### Phase 6: Settings & Admin Features
- Access admin settings
- Verify all admin functions accessible
- Check for any permission errors

### Phase 7: Error Investigation
- Document all console errors found
- Identify patterns in errors
- Note which features are affected
- Determine severity of issues

## Success Criteria
- ✅ Admin login successful
- ✅ Dashboard fully loads
- ✅ All sections accessible
- ✅ Data displays correctly
- ✅ No blocking errors
- ✅ Multiple GoTrueClient warning identified and documented

## Expected Errors to Investigate
1. Multiple GoTrueClient instances in same browser context
2. React Error #310 (likely related to hooks/state)
3. Any 401/403 authentication errors
4. Any data fetching errors

## Testing Environment
- **URL**: https://heiwahauz.netlify.app/admin
- **Password**: heiwa_admin_2024
- **Browser**: Playwright-based testing


# Booking System Architecture Analysis

## 🚨 CRITICAL FINDING

The **heiwa-page** and **wavecampdashboard** are currently **NOT CONNECTED**.

## Current Setup

### 1. Heiwa Page (Customer-Facing Website)
- **Location**: `/Users/lukatenbosch/Downloads/heiwahouse/heiwa-page`
- **Deployed**: ✅ https://heiwa-house-portugal.netlify.app
- **Port**: 3000 (dev)
- **Purpose**: Customer-facing website with booking widget
- **Database**: Supabase (same as wavecampdashboard)

### 2. Wave Camp Dashboard (Admin Dashboard)
- **Location**: `/Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard`
- **Deployed**: ❌ **NOT DEPLOYED**
- **Port**: 3006 (dev only)
- **Purpose**: Admin dashboard for managing bookings, rooms, surf camps
- **Database**: Supabase (same as heiwa-page)

## Problem: Disconnected Systems

### Current Booking Flow (INCORRECT)
```
Customer (heiwa-page)
  → Booking Widget
  → /api/bookings (heiwa-page's OWN API)
  → Supabase Database

Admin Dashboard (wavecampdashboard)
  → Runs SEPARATELY on port 3006
  → NOT accessible from deployed site
  → Can view Supabase data but NOT integrated
```

### Expected Booking Flow (CORRECT)
```
Customer (heiwa-page)
  → Booking Widget
  → EITHER:
    A) wavecampdashboard API (if deployed)
    B) Shared Supabase (current - works but limited)

Admin Dashboard (wavecampdashboard)
  → Should be deployed and accessible
  → Manages all bookings from Supabase
  → Provides admin interface
```

## What's Working

✅ **Shared Database**: Both apps use the same Supabase instance
- URL: `https://zejrhceuuujzgyukdwnb.supabase.co`
- Tables: `bookings`, `rooms`, `clients`, `surf_camps`, `navigation_items`, `experiences`

✅ **Booking Widget**: Functional on heiwa-page
- Creates bookings in Supabase via local API routes
- `/app/api/bookings/route.ts` handles booking creation

✅ **Admin Dashboard**: Functional locally
- Can view/manage bookings from Supabase
- Runs on `localhost:3006`

## What's NOT Working

❌ **Wave Camp Dashboard Deployment**: Not deployed to production
- Admins cannot access booking management online
- Must run locally to view bookings

❌ **Unified API**: Booking widget doesn't use wavecampdashboard API
- Each app has its own API routes
- Duplication of booking logic

## Database Schema Status

### Existing Tables in Supabase:
- ✅ `bookings` - Customer bookings
- ✅ `clients` - Customer information
- ✅ `rooms` - Room inventory
- ✅ `navigation_items` - Navigation menu
- ✅ `experiences` - Activities/experiences
- ✅ `pages` - CMS pages
- ✅ `room_assignments` - Room booking assignments
- ✅ `surf_week_assignments` - Surf camp assignments

### Missing/Incomplete:
- ⚠️ `surf_camps` - May exist but not fully utilized
- ⚠️ `add_ons` - Referenced but may not exist
- ⚠️ Room pricing not in database (hardcoded)

## Recommendation: Two Options

### Option A: Keep Separate (Current Approach)
**Pros:**
- Both apps share same Supabase database
- Data is synced automatically
- Simpler deployment (one less app to deploy)

**Cons:**
- Duplicate API logic
- Admin dashboard not accessible online
- Admins must run locally or use Supabase UI

**Required Actions:**
1. Deploy wavecampdashboard separately
2. Give admins access to dashboard URL
3. Both apps continue using shared Supabase

### Option B: Unified API (Better Architecture)
**Pros:**
- Single source of truth for booking logic
- Centralized API validation
- Better maintainability

**Cons:**
- Requires refactoring booking widget
- More complex deployment
- Need to handle CORS

**Required Actions:**
1. Deploy wavecampdashboard with public API
2. Update booking widget to call wavecampdashboard API
3. Configure CORS and API keys properly

## Current CMS Situation

The **heiwa-page has its OWN CMS** at `/admin` (password: heiwa2024):
- Navigation Management
- Rooms Management (partial)
- Experiences Management
- Pages Management

The **wavecampdashboard ALSO has a CMS** with MORE features:
- Full Bookings Management
- Complete Rooms Management
- Surf Camps Management
- Clients Management
- Add-ons Management

### 🚨 This means TWO separate admin interfaces exist!

## Immediate Actions Required

### 1. Decide on Architecture
- [ ] Choose Option A (separate + shared DB) OR Option B (unified API)

### 2. If Option A (Recommended for now):
- [ ] Deploy wavecampdashboard to Netlify/Vercel
- [ ] Give admin team access to dashboard URL
- [ ] Continue using shared Supabase
- [ ] Document that heiwa-page CMS is for content only
- [ ] Document that wavecampdashboard is for booking management

### 3. If Option B (Better long-term):
- [ ] Deploy wavecampdashboard with public API endpoints
- [ ] Update booking widget API calls to point to wavecampdashboard
- [ ] Set up CORS properly
- [ ] Add API key authentication
- [ ] Test end-to-end booking flow

### 4. Content Management Strategy:
- [ ] Decide which CMS to use for what
- [ ] Option 1: Use heiwa-page CMS for website content, wavecampdashboard for bookings
- [ ] Option 2: Migrate everything to wavecampdashboard and remove heiwa-page CMS
- [ ] Option 3: Keep both but document clear separation of concerns

## Testing Required

1. **Test Local Setup**:
   ```bash
   # Terminal 1: Run heiwa-page
   cd /Users/lukatenbosch/Downloads/heiwahouse/heiwa-page
   npm run dev

   # Terminal 2: Run wavecampdashboard
   cd /Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard
   npm run dev

   # Visit:
   # http://localhost:3000 - Customer site
   # http://localhost:3006 - Admin dashboard
   ```

2. **Test Booking Flow**:
   - Make a test booking on heiwa-page
   - Check if it appears in Supabase
   - Check if wavecampdashboard can see the booking

3. **Verify Database Connection**:
   - Both apps should show same data
   - Changes in one should reflect in the other

## Deployment Plan

### Phase 1: Deploy wavecampdashboard (URGENT)
1. Check if it has deployment config (netlify.toml or vercel.json)
2. Deploy to Netlify or Vercel
3. Set environment variables
4. Test admin access

### Phase 2: Connect Systems
1. If keeping separate: Document the workflow
2. If unifying: Update booking widget API calls

### Phase 3: Production Testing
1. Test booking flow end-to-end
2. Verify admin can manage bookings
3. Test all CMS features

## Current Status Summary

| Component | Status | URL | Notes |
|-----------|--------|-----|-------|
| Heiwa Page | ✅ Deployed | https://heiwa-house-portugal.netlify.app | Customer-facing |
| Booking Widget | ✅ Working | Embedded in heiwa-page | Creates bookings |
| Heiwa CMS | ✅ Working | /admin (password: heiwa2024) | Content management |
| Wavecampdashboard | ❌ Not Deployed | localhost:3006 only | Admin dashboard |
| Supabase Database | ✅ Working | Shared by both apps | Central data store |
| Booking API | ⚠️ Duplicated | Both apps have own routes | Needs consolidation |

## Next Steps

**IMMEDIATE (High Priority)**:
1. Deploy wavecampdashboard
2. Test if bookings from heiwa-page appear in dashboard
3. Document admin access workflow

**SHORT TERM (Medium Priority)**:
4. Decide on unified vs separate architecture
5. Document CMS responsibilities clearly
6. Add missing database tables (surf_camps, add_ons)

**LONG TERM (Low Priority)**:
7. Consider consolidating CMSes
8. Implement unified API if needed
9. Add automated testing for booking flow

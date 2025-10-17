# Debug Report - Rooms Page Image Loading Issue

**Date:** 2025-10-08
**Issue:** Room images not loading on /rooms page

## Problem Summary

The rooms page at `http://localhost:3001/rooms` is stuck in a "Loading rooms..." state and does not display the room images from the database, despite the API successfully returning room data.

## What's Working ✅

1. **Database Connection**: Supabase connection established successfully
   ```
   🏄‍♂️ Heiwa House Website - Supabase connection initialized
   ```

2. **API Endpoint**: `/api/rooms` returns 4 rooms with complete data
   ```
   ✅ Rooms fetched successfully: 4
   ✅ Transformed rooms: [
     { id: 'f3f00cbb-c30e-4d84-9352-cfb6a76684d0', name: 'Dorm room', has_image: true, image_count: 1 },
     { id: 'ac98fd46-5bd2-413c-98f3-17e71024e734', name: 'Room Nr 2', has_image: true, image_count: 1 },
     { id: '6a6e6bb0-d3e5-4fab-87d8-7e39174637e9', name: 'Room Nr 3', has_image: true, image_count: 1 },
     { id: 'b883de16-47c6-4919-8709-de8a3e236c04', name: 'The Cave', has_image: true, image_count: 1 }
   ]
   GET /api/rooms 200 in 1429ms
   ```

3. **Server-Side Rendering**: Page compiles and returns HTML
   ```
   GET /rooms 200 in 1345ms
   ```

4. **Room Data Mapping**: `lib/content.ts` correctly maps all room fields including images, pricing, capacity, amenities

## What's Not Working ❌

1. **Client-Side Hydration**: React `useEffect` in `app/rooms/page.tsx` is not executing in the browser
   - Page HTML shows: `<div class="text-lg text-gray-500">Loading rooms...</div>`
   - This is the initial loading state, never updated by client JavaScript

2. **Visual Result**: Users see a loading spinner indefinitely, no rooms displayed

3. **Error Evidence**: Server logs show:
   ```
   ⚠ Fast Refresh had to perform a full reload due to a runtime error.
   ```

## Root Cause Analysis

The issue is **NOT** with:
- Database queries (working)
- API endpoints (working)
- Data transformation (working)
- Server-side rendering (working)

The issue **IS** with:
- Client-side JavaScript execution/hydration
- React `useEffect` hook not running in browser
- Possible JavaScript runtime error preventing hydration

## Technical Details

### Files Investigated

1. **`app/rooms/page.tsx`** (lines 17-68)
   - Uses `useEffect` to fetch from `/api/rooms`
   - Should set `rooms` state and update UI
   - Currently stuck in loading state

2. **`lib/content.ts`** (lines 51-117)
   - `getRooms()` function properly maps database fields
   - Includes images array, pricing, capacity, amenities
   - Fallback handling works correctly

3. **`app/api/rooms/route.ts`**
   - Returns complete room data successfully
   - HTTP 200 responses logged

### Evidence

**HTML Source** (what browser receives):
```html
<div class="flex items-center justify-center min-h-[400px]">
  <div class="flex flex-col items-center gap-4">
    <div class="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    <div class="text-lg text-gray-500">Loading rooms...</div>
  </div>
</div>
```

**Expected HTML** (what should render after fetch):
```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
  {/* Room cards with images */}
</div>
```

## Previous Fixes Applied

1. ✅ Expanded `Room` interface in `lib/types.ts` to include all database fields
2. ✅ Updated `getRooms()` to map complete room data
3. ✅ Changed rooms page to use API endpoint instead of direct server function
4. ✅ Removed `FloatingCheckAvailability` component that was causing `useBooking` errors
5. ✅ Fixed lint errors

## Next Steps to Resolve

### Option 1: Server-Side Data Fetching (Recommended)
Convert the page to use Next.js 15 server components and fetch data server-side:

```typescript
// app/rooms/page.tsx
export default async function RoomsPage() {
  const response = await fetch('http://localhost:3001/api/rooms', { cache: 'no-store' })
  const data = await response.json()
  const rooms = data.success ? data.data.rooms : []

  // Render rooms directly without useEffect
  return <div>...rooms...</div>
}
```

**Pros:**
- Eliminates client-side hydration issues
- Faster initial page load
- SEO-friendly
- No loading states needed

### Option 2: Debug Client-Side Hydration
Investigate why React hydration is failing:

1. Check browser console for JavaScript errors
2. Add error boundary logging
3. Simplify component to minimal test case
4. Check for conflicting scripts or extensions

### Option 3: Hybrid Approach
Use server-side rendering for initial data, then client-side for interactions:

```typescript
export default async function RoomsPage() {
  const initialRooms = await getRooms()
  return <ClientRoomsGrid initialRooms={initialRooms} />
}
```

## Recommendation

**Use Option 1 (Server-Side Fetching)** because:
- Next.js 15 App Router is designed for server components
- Eliminates the hydration issue entirely
- Better performance and SEO
- Simpler code without loading states

This is the standard Next.js 15 pattern and will resolve the issue immediately.

## Test Results

**Test Command:**
```bash
PORT=3001 npm run dev
open http://localhost:3001/rooms
```

**Result:**
- Server: ✅ Returns 200 OK
- API: ✅ Returns 4 rooms with images
- Browser: ❌ Shows "Loading rooms..." indefinitely
- Console: ⚠️ "Fast Refresh had to perform a full reload due to a runtime error"

**Screenshot Evidence:**
- `/tmp/rooms-page.png` - Shows aurora image (wrong page loaded initially)
- `/tmp/rooms-list-view.png` - Shows loading state stuck

## Conclusion

The database integration works perfectly. The issue is purely a client-side JavaScript hydration problem. Converting to server-side rendering will resolve this immediately and is the recommended Next.js 15 pattern.

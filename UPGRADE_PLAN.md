# Heiwa House Website Upgrade Plan
**Generated:** January 2025  
**Based on:** Google Docs feedback review + Live site comparison (heiwahauz.netlify.app)

---

## 🔴 CRITICAL ISSUES (Must Fix Immediately)

### 1. **THE SPOT Still Appears in Navigation**
**Status:** ❌ NOT FIXED  
**Location:** Navigation on `/surf`, `/rooms`, `/surf-weeks` pages  
**Issue:** "THE SPOT" link still visible in navigation menu  
**Fix Required:**
- Remove from navigation items fetched from database
- Ensure it's filtered out in `getNavigationItems()` 
- Check all navigation components (desktop, mobile, footer)
- Verify database doesn't have it as active navigation item

**Files to Update:**
- `components/navigation.tsx` - Filter out `/the-spot` from all navigation
- `lib/content.ts` - Ensure `getNavigationItems()` filters it out
- Database: Check `navigation_items` table and deactivate/remove THE SPOT entry

---

### 2. **YouTube Video Controls Still Visible**
**Status:** ❌ PARTIALLY FIXED  
**Location:** Multiple pages (homepage, surf page, surf-weeks page)  
**Issue:** YouTube videos still show play button, title links, and other controls despite `controls=0` parameter  
**Fix Required:**
- YouTube's iframe API ignores some parameters - need to use `nocookie` domain or custom player
- Add `iv_load_policy=3` to hide annotations
- Consider using YouTube's `nocookie` domain: `youtube-nocookie.com`
- May need to wrap in custom overlay to hide remaining UI elements

**Files to Update:**
- `components/ui/youtube-video.tsx` - Update embed URL with all parameters
- `components/video-embed.tsx` - Add all control-disabling parameters
- `app/surf/page.tsx` - Update direct iframe embeds
- `app/page.tsx` - Check homepage YouTube embeds

**Parameters to Add:**
```
?controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1
```

---

### 3. **Room Images Not Loading on Individual Room Pages**
**Status:** ❌ NOT VERIFIED  
**Location:** `/rooms/[id]` pages  
**Issue:** Feedback shows placeholder icons instead of room images  
**Fix Required:**
- Verify image URLs in database are correct
- Check if images are properly uploaded to Supabase storage
- Ensure `ImageCarousel` component handles missing images gracefully
- Add proper error handling and fallback images

**Files to Update:**
- `app/rooms/[id]/page.tsx` - Verify image fetching logic
- `components/ui/image-carousel.tsx` - Add error handling
- Database: Verify `rooms` table has correct image URLs

---

## 🟡 HIGH PRIORITY (Important UX Issues)

### 4. **Surf Levels Chart Missing/Incorrect**
**Status:** ⚠️ NEEDS VERIFICATION  
**Location:** `/surf` page  
**Issue:** Feedback says "Surf levels have completely gone missing"  
**Current State:** Chart exists but may not be styled correctly or positioned properly  
**Fix Required:**
- Verify `SeasonalSurfLevelChart` component is rendering
- Check if it's positioned correctly (should be after "Your Local Break" section)
- Ensure styling matches feedback requirements
- May need to replace map with this chart (see #5)

**Files to Update:**
- `app/surf/page.tsx` - Verify chart placement and styling
- `components/surf/SeasonalSurfLevelChart.tsx` - Check component implementation

---

### 5. **Replace Map with Custom Image**
**Status:** ❌ NOT DONE  
**Location:** `/surf` page - "World-Class Surfing Nearby" section  
**Issue:** Map takes 5 minutes to load, should be replaced with custom image  
**Image URL:** `https://drive.google.com/file/d/1H66hWrsMge7DJiK0_7WAf-JurEqdTpyo/view?usp=sharing`  
**Fix Required:**
- Download image from Google Drive
- Upload to `/public/images/` directory
- Replace Google Maps iframe with `<Image>` component
- Ensure image is optimized and responsive

**Files to Update:**
- `app/surf/page.tsx` - Replace map iframe with image

---

### 6. **Homepage Surf Weeks Section - Expand/Collapse Not Working**
**Status:** ⚠️ PARTIALLY FIXED  
**Location:** Homepage - "Upcoming Surf Weeks" section  
**Issue:** Should show 4 items initially with fade effect, expandable to show all  
**Current State:** Logic exists but fade effect may not be working correctly  
**Fix Required:**
- Verify `showAllSurfWeeks` state is working
- Ensure fade gradient appears when collapsed
- Make sure "Show More" button is visible and functional
- Test that expanding removes fade and shows all items

**Files to Update:**
- `app/page.tsx` - Verify expand/collapse logic and fade effect

---

### 7. **Add Surf Lessons Section**
**Status:** ❌ NOT DONE  
**Location:** `/surf` page - Should be at the top  
**Issue:** Need to add section with information about surf lessons  
**Fix Required:**
- Create new section component for surf lessons
- Include: lesson types, pricing, what's included
- Position at top of surf page (after hero, before other sections)
- Style consistently with rest of page

**Files to Update:**
- `app/surf/page.tsx` - Add surf lessons section
- Create `components/surf/SurfLessonsSection.tsx` (new component)

---

### 8. **Gallery Should Be 2 Rows, Horizontally Scrollable**
**Status:** ❌ NOT DONE  
**Location:** Multiple pages (surf-weeks, homepage, etc.)  
**Issue:** Feedback says "Reduce to two lines and make it scrollable sideways"  
**Current State:** Gallery may be showing too many rows or not scrollable  
**Fix Required:**
- Limit gallery to 2 rows (8 images total)
- Make it horizontally scrollable
- Add swipe functionality for mobile
- Show navigation arrows/indicators

**Files to Update:**
- `app/surf-weeks/page.tsx` - Update photo gallery section
- `app/page.tsx` - Check if any galleries need updating
- Create reusable `HorizontalScrollGallery` component

---

## 🟢 MEDIUM PRIORITY (Enhancements)

### 9. **SurfWeekPromoCard Styling Updates**
**Status:** ⚠️ PARTIALLY DONE  
**Location:** `/surf` page  
**Issue:** Styling should match promotional image design better  
**Fix Required:**
- Verify current styling matches feedback
- Ensure date header is prominent
- Check bullet points are italic and properly sized
- Verify "Book Now" button styling
- Ensure Google reviews display correctly

**Files to Update:**
- `components/surf/SurfWeekPromoCard.tsx` - Final styling adjustments

---

### 10. **Activities Error on Surf Page**
**Status:** ❌ NOT FIXED  
**Location:** `/surf` page - "Surf Programs & Services" section  
**Issue:** Shows "Error loading activities: Failed to fetch activities"  
**Fix Required:**
- Check API endpoint `/api/activities`
- Verify database connection
- Add proper error handling
- Show fallback content if activities fail to load

**Files to Update:**
- `app/surf/page.tsx` - Fix activities fetching
- `app/api/activities/route.ts` - Verify endpoint works
- Check database `activities` table

---

### 11. **Similar Rooms Section on Room Detail Pages**
**Status:** ❌ NOT VERIFIED  
**Location:** `/rooms/[id]` pages  
**Issue:** Feedback shows "Similar Rooms" section with broken images  
**Fix Required:**
- Verify similar rooms are being fetched correctly
- Ensure room images load properly
- Add error handling for missing images
- Style consistently with main room listing

**Files to Update:**
- `app/rooms/[id]/page.tsx` - Check similar rooms section

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Critical Fixes (Do First)
- [ ] Remove THE SPOT from all navigation
- [ ] Fix YouTube video controls completely
- [ ] Fix room images loading on detail pages
- [ ] Verify surf levels chart is visible and styled correctly

### Phase 2: High Priority
- [ ] Replace map with custom image on surf page
- [ ] Fix homepage surf weeks expand/collapse with fade
- [ ] Add surf lessons section to surf page
- [ ] Update galleries to 2 rows, horizontally scrollable

### Phase 3: Medium Priority
- [ ] Finalize SurfWeekPromoCard styling
- [ ] Fix activities error on surf page
- [ ] Verify similar rooms section works correctly

---

## 🔍 VERIFICATION STEPS

After implementing fixes, verify:
1. ✅ THE SPOT does not appear anywhere in navigation
2. ✅ YouTube videos have no visible controls
3. ✅ Room images load correctly on detail pages
4. ✅ Surf levels chart is visible and styled correctly
5. ✅ Map replaced with custom image
6. ✅ Homepage surf weeks section expands/collapses with fade
7. ✅ Surf lessons section appears at top of surf page
8. ✅ All galleries are 2 rows, horizontally scrollable
9. ✅ No console errors on any page
10. ✅ All pages load quickly (< 3 seconds)

---

## 📝 NOTES

- **Database Changes:** Some fixes may require database updates (navigation items, room images)
- **Image Assets:** Need to download and optimize custom map image
- **Testing:** Test all changes on mobile and desktop
- **Performance:** Ensure image optimizations don't slow down page loads

---

**Next Steps:**
1. Review this plan
2. Prioritize which items to tackle first
3. Begin implementation starting with Critical Issues
4. Test each fix before moving to next item


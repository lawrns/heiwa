# CMS Drift Audit - Homepage Content Synchronization

## Objective
Verify that the CMS accurately represents all editable content on the homepage and identify any drift between what's in the CMS vs. what's displayed on the live site.

## Audit Methodology
1. Fetch all CMS sections from the database
2. Inspect the homepage code to identify all rendered content
3. Compare CMS data with actual homepage rendering
4. Identify missing sections, hardcoded content, and fallback data
5. Document any drift and recommendations

---

## CMS Sections (Current State)

### Retrieved from `/api/admin/homepage`:
```
1. Hero (Order: 1)
   - Title: "Welcome to Heiwa House"
   - Subtitle: "Edjizz. Your surf and lifestyle destination in Santa Cruz, Portugal"
   - Status: ✅ In CMS

2. Surf Weeks (Order: 2)
   - Title: "Heiwa Surf Weeks"
   - Subtitle: "Experience the ultimate surf camp..."
   - Status: ✅ In CMS

3. About (Order: 3)
   - Title: "What we are about"
   - Subtitle: "Discover what makes Heiwa House special"
   - Status: ✅ In CMS

4. Rooms (Order: 4)
   - Title: "Our Rooms"
   - Subtitle: "Comfortable accommodations for every traveler"
   - Status: ✅ In CMS

5. Reviews (Order: 5)
   - Title: "What Our Customers Say"
   - Subtitle: "Real experiences from real people"
   - Status: ✅ In CMS

6. Facilities (Order: 6)
   - Title: "Amazing Facilities"
   - Subtitle: "Everything you need for an unforgettable stay"
   - Status: ✅ In CMS
```

---

## Homepage Sections (Actual Rendering)

### Sections Found in `/app/page.tsx`:

1. **Hero Section** ✅
   - Uses CMS data: YES
   - Title from CMS: `heroSection?.title`
   - Subtitle from CMS: `heroSection?.subtitle`
   - Fallback: "Welcome to Heiwa House"
   - Status: SYNCED

2. **Heiwa Surf Weeks Section** ✅
   - Uses CMS data: YES (partially)
   - Title from CMS: `surfWeeksSection?.title`
   - Subtitle from CMS: `surfWeeksSection?.subtitle`
   - Fallback: "Heiwa Surf Weeks" / "Experience the ultimate surf camp..."
   - Hardcoded content: YouTube video ID, booking table, bullet points
   - Status: PARTIALLY SYNCED (title/subtitle only)

3. **What We Are About Section** ✅
   - Uses CMS data: YES (partially)
   - Title from CMS: `aboutSection?.title`
   - Subtitle from CMS: `aboutSection?.subtitle`
   - Hardcoded content: 3 cards (Heiwa Play, Heiwa Surf, Heiwa Flow)
   - Status: PARTIALLY SYNCED (title/subtitle only)

4. **Our Rooms Section** ✅
   - Uses CMS data: YES (partially)
   - Title from CMS: `roomsSection?.title`
   - Subtitle from CMS: `roomsSection?.subtitle`
   - Hardcoded content: Private rooms card, Shared rooms card
   - Status: PARTIALLY SYNCED (title/subtitle only)

5. **Your Hosts Section** ❌
   - Uses CMS data: NO
   - Component: `<HostSection />`
   - Status: NOT IN CMS (component-based)

6. **What Our Customers Say Section** ✅
   - Uses CMS data: YES (partially)
   - Title from CMS: `reviewsSection?.title`
   - Subtitle from CMS: `reviewsSection?.subtitle`
   - Hardcoded content: Google reviews, default reviews array
   - Status: PARTIALLY SYNCED (title/subtitle only)

7. **Amazing Facilities Section** ✅
   - Uses CMS data: YES (partially)
   - Title from CMS: `facilitiesSection?.title`
   - Subtitle from CMS: `facilitiesSection?.subtitle`
   - Hardcoded content: Skatepark, Yoga Dome, Gym, Coworking videos/images
   - Status: PARTIALLY SYNCED (title/subtitle only)

---

## Drift Analysis

### ✅ SYNCED SECTIONS
- **Hero**: Title and subtitle fully editable via CMS

### ⚠️ PARTIALLY SYNCED SECTIONS
All other sections have:
- ✅ Editable titles and subtitles
- ❌ Hardcoded content (descriptions, images, videos, cards, etc.)

### ❌ NOT IN CMS
- **Your Hosts Section**: Component-based, no CMS entry

---

## Detailed Drift Report

### 1. Surf Weeks Section
**What's in CMS:**
- Title
- Subtitle
- Description

**What's on Homepage:**
- Title (from CMS) ✅
- Subtitle (from CMS) ✅
- YouTube video ID: Hardcoded `9nhQiKGsgHg`
- Booking table: Hardcoded data from `defaultSurfWeeks`
- Bullet points: Hardcoded list

**Missing from CMS:**
- Video URL
- Booking data
- Bullet point content

---

### 2. About Section
**What's in CMS:**
- Title
- Subtitle
- Description

**What's on Homepage:**
- Title (from CMS) ✅
- Subtitle (from CMS) ✅
- 3 Cards: Hardcoded (Heiwa Play, Heiwa Surf, Heiwa Flow)
  - Images: Hardcoded paths
  - Links: Hardcoded URLs (/play, /surf, /flow)

**Missing from CMS:**
- Card titles and descriptions
- Card images
- Card links

---

### 3. Rooms Section
**What's in CMS:**
- Title
- Subtitle
- Description

**What's on Homepage:**
- Title (from CMS) ✅
- Subtitle (from CMS) ✅
- Private Rooms Card: Hardcoded
  - Images: Hardcoded carousel
  - Description: Hardcoded text
- Shared Rooms Card: Hardcoded
  - Images: Hardcoded carousel
  - Description: Hardcoded text

**Missing from CMS:**
- Room type descriptions
- Room images
- Room details

---

### 4. Reviews Section
**What's in CMS:**
- Title
- Subtitle
- Description

**What's on Homepage:**
- Title (from CMS) ✅
- Subtitle (from CMS) ✅
- Google Rating: Hardcoded `4.7` and `(16,940)`
- Review Cards: Hardcoded `defaultReviews` array

**Missing from CMS:**
- Google rating data
- Individual review content
- Review author information

---

### 5. Facilities Section
**What's in CMS:**
- Title
- Subtitle
- Description

**What's on Homepage:**
- Title (from CMS) ✅
- Subtitle (from CMS) ✅
- Facility Cards: Hardcoded
  - Skatepark: Video hardcoded
  - Yoga Dome: Image hardcoded
  - Gym: Image hardcoded
  - Coworking: Image hardcoded

**Missing from CMS:**
- Facility names
- Facility descriptions
- Facility media (videos/images)

---

### 6. Your Hosts Section
**What's in CMS:**
- NOT IN CMS

**What's on Homepage:**
- Component: `<HostSection />`
- Completely component-based

**Missing from CMS:**
- Entire section not in CMS

---

## Summary of Drift

| Section | Title/Subtitle | Content | Images | Data | Status |
|---------|---|---|---|---|---|
| Hero | ✅ CMS | ✅ CMS | ✅ CMS | ✅ CMS | FULLY SYNCED |
| Surf Weeks | ✅ CMS | ❌ Hardcoded | ❌ Hardcoded | ❌ Hardcoded | PARTIALLY SYNCED |
| About | ✅ CMS | ❌ Hardcoded | ❌ Hardcoded | ❌ Hardcoded | PARTIALLY SYNCED |
| Rooms | ✅ CMS | ❌ Hardcoded | ❌ Hardcoded | ❌ Hardcoded | PARTIALLY SYNCED |
| Reviews | ✅ CMS | ❌ Hardcoded | ❌ Hardcoded | ❌ Hardcoded | PARTIALLY SYNCED |
| Facilities | ✅ CMS | ❌ Hardcoded | ❌ Hardcoded | ❌ Hardcoded | PARTIALLY SYNCED |
| Your Hosts | ❌ NOT IN CMS | ❌ Component | ❌ Component | ❌ Component | NOT SYNCED |

---

## Recommendations

### Priority 1: Extend CMS for Partial Sections
Make the following fully editable:
1. **Surf Weeks**: Add video URL, booking data fields
2. **About**: Add card data (titles, descriptions, images, links)
3. **Rooms**: Add room descriptions and images
4. **Reviews**: Add review data or integrate with Google Reviews API
5. **Facilities**: Add facility cards data

### Priority 2: Add Missing Sections
1. **Your Hosts**: Create CMS entry for hosts section

### Priority 3: Remove Hardcoded Fallbacks
Once CMS is complete, remove all hardcoded data and use only CMS data.

---

## Conclusion

**Current State:** 🟡 PARTIAL SYNC
- Only titles and subtitles are editable via CMS
- All content, images, and data remain hardcoded
- The CMS is only ~10% functional for homepage content management

**Expected State:** 🟢 FULL SYNC
- All content should be editable via CMS
- No hardcoded content except for fallback defaults
- CMS should be the single source of truth for all homepage content

---

**Audit Date:** November 9, 2025
**Status:** DRIFT IDENTIFIED - ACTION REQUIRED

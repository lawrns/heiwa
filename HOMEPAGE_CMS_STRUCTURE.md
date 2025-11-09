# Homepage CMS Structure - Actual Sections

## Current Issue
The admin editor shows CMS sections that don't match the actual homepage content being displayed.

## Solution
Populate the CMS database with sections that correspond to ACTUAL homepage content.

## Actual Homepage Sections (in order of appearance)

### 1. Hero Section (Order: 1)
- **Section ID:** `hero`
- **Currently Used:** ✅ YES
- **Title:** "Welcome to Heiwa House"
- **Subtitle:** "Your surf and lifestyle destination in Santa Cruz, Portugal"
- **Content Type:** Hero banner with video background

### 2. Heiwa Surf Weeks (Order: 2)
- **Section ID:** `surf-weeks`
- **Currently Used:** ❌ NO (hardcoded)
- **Title:** "Heiwa Surf Weeks"
- **Subtitle:** "Experience the ultimate surf camp..."
- **Content Type:** Section with YouTube video + booking table
- **Editable Fields:** Title, subtitle, description

### 3. What We Are About (Order: 3)
- **Section ID:** `about`
- **Currently Used:** ❌ NO (hardcoded)
- **Title:** "What we are about"
- **Content:** 3 cards (Heiwa Play, Heiwa Surf, Heiwa Flow)
- **Editable Fields:** Title, subtitle, description

### 4. Our Rooms (Order: 4)
- **Section ID:** `rooms`
- **Currently Used:** ❌ NO (hardcoded)
- **Title:** "Our Rooms"
- **Content:** Private rooms + Shared rooms cards
- **Editable Fields:** Title, subtitle, description

### 5. Your Hosts (Order: 5)
- **Section ID:** `hosts`
- **Currently Used:** ❌ NO (component-based)
- **Title:** "Your Hosts"
- **Content:** Host information component
- **Editable Fields:** Title, subtitle, description

### 6. What Our Customers Say (Order: 6)
- **Section ID:** `reviews`
- **Currently Used:** ❌ NO (hardcoded)
- **Title:** "What Our Customers Say"
- **Content:** Google reviews + testimonials
- **Editable Fields:** Title, subtitle, description

### 7. Amazing Facilities (Order: 7)
- **Section ID:** `facilities`
- **Currently Used:** ❌ NO (hardcoded)
- **Title:** "Amazing Facilities"
- **Content:** Facilities grid
- **Editable Fields:** Title, subtitle, description

## Action Items

1. ✅ Delete unused CMS sections: features, activities, testimonials, cta
2. ✅ Create CMS entries for: surf-weeks, about, rooms, hosts, reviews, facilities
3. Update `/app/page.tsx` to use CMS data for these sections
4. Verify admin editor displays correct sections
5. Deploy and test

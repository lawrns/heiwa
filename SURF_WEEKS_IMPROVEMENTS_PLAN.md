# Surf Weeks Page - Comprehensive Improvements Plan

**Date**: November 8, 2025  
**Status**: 🔄 **IN PROGRESS**

---

## ✅ Completed Tasks

### 1. Text Color Fix ✅
**Issue**: "This activity requires advance booking" text was gray-500  
**Solution**: Changed to white color  
**File**: `components/ui/availability-badge.tsx`  
**Status**: ✅ DEPLOYED

### 2. Navigation Naming ✅
**Issue**: "SURF CAMP" should be "SURF WEEK"  
**Solution**: Updated in both desktop and mobile navigation  
**Files**: `components/Navigation.tsx`  
**Status**: ✅ DEPLOYED

---

## 🔄 In Progress Tasks

### 3. Add Book Now Button with Google Reviews
**Location**: Top of surf-weeks page (after hero section)  
**Requirements**:
- Book Now button that opens booking widget
- Google reviews widget/link to: https://maps.app.goo.gl/PacVHHFxPnAcGxcbA
- Display rating and review count
- Professional, prominent placement

**Implementation Plan**:
```tsx
// Add after hero section, before "Next Surf Week" section
<section className="py-12 bg-white border-b border-gray-200">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Google Reviews */}
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          {/* 5 stars */}
          <span className="text-2xl font-bold">5.0</span>
        </div>
        <div>
          <div className="flex">
            {/* Star icons */}
          </div>
          <a href="https://maps.app.goo.gl/PacVHHFxPnAcGxcbA" 
             target="_blank" 
             className="text-sm text-gray-600 hover:text-blue-600">
            Based on 70 reviews on Google
          </a>
        </div>
      </div>
      
      {/* Book Now Button */}
      <button onClick={openBooking} className="...">
        Book Your Surf Week
      </button>
    </div>
  </div>
</section>
```

---

### 4. Week-Specific Booking Functionality
**Challenge**: Book buttons in the table should open booking widget with that specific week pre-selected

**Current State**:
- Booking widget exists
- Week table has hardcoded dates
- Book buttons link to email

**Required Changes**:

#### A. Database Schema (surf_camps table)
```sql
-- Check if surf_camps table exists and has proper structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'surf_camps';

-- Expected columns:
-- id, name, start_date, end_date, price, available_spots, total_spots, description, is_active
```

#### B. Fetch Real Surf Weeks from Database
```tsx
// app/surf-weeks/page.tsx
async function getSurfWeeks() {
  const { data, error } = await supabase
    .from('surf_camps')
    .select('*')
    .eq('is_active', true)
    .gte('end_date', new Date().toISOString())
    .order('start_date', { ascending: true })
  
  return data || []
}
```

#### C. Update Booking Widget to Accept Surf Week Parameter
```tsx
// lib/booking-context.tsx
interface BookingContextType {
  openBooking: (surfWeekId?: string) => void
  // ... other properties
}

// When opening with surf week:
openBooking('surf-week-id-123')
```

#### D. Update Book Buttons
```tsx
// Instead of mailto link:
<button
  onClick={() => openBooking(week.id)}
  className="..."
>
  Book
</button>
```

---

### 5. Replace Numbers with Reference Images
**Section**: "How a surf week works"  
**Current**: Numbered circles (1-8)  
**Desired**: Relevant images on the left side

**Image Requirements**:
- 8 images needed (one per step)
- Images should represent each activity
- Consistent aspect ratio
- Professional quality

**Suggested Images**:
1. **Choose a week & book** - Calendar/booking interface
2. **Transfer, Arrival & Check-in** - Heiwa House exterior/entrance
3. **Welcome Tour** - Property overview/skatepark
4. **Surf Theory & Go Surfing** - Surf lesson/beach
5. **Feast Twice a Day** - Food/dining area
6. **Video Analysis** - Surfing action shot
7. **Yoga** - Yoga dome/session
8. **Activities** - Pool/sauna/games

**Implementation**:
```tsx
const surfWeekSteps = [
  {
    title: 'Choose a week & book',
    description: '...',
    image: '/images/surf-weeks/step-1-booking.jpg'
  },
  // ... 7 more steps
]

// Render with image on left:
<div className="flex gap-6">
  <div className="w-1/3">
    <Image src={step.image} alt={step.title} />
  </div>
  <div className="w-2/3">
    <h3>{step.title}</h3>
    <p>{step.description}</p>
  </div>
</div>
```

---

### 6. Real Google Reviews Integration
**Section**: "What Our Customers Say"  
**Current**: Placeholder reviews (Griffith Observatory reviews!)  
**Desired**: Real Heiwa House reviews from Google

**Options**:

#### Option A: Google Places API (Recommended)
```tsx
// Fetch reviews from Google Places API
const PLACE_ID = 'ChIJ...' // Heiwa House place ID
const API_KEY = process.env.GOOGLE_PLACES_API_KEY

async function getGoogleReviews() {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews,rating,user_ratings_total&key=${API_KEY}`
  )
  const data = await response.json()
  return data.result.reviews
}
```

#### Option B: Manual Entry (Faster, No API Key Needed)
- Visit https://maps.app.goo.gl/PacVHHFxPnAcGxcbA
- Copy 4-6 recent 5-star reviews
- Add to page as static data
- Update periodically

**Review Data Structure**:
```tsx
interface Review {
  author_name: string
  author_photo?: string
  rating: number
  text: string
  time: string
  relative_time_description: string
}
```

---

### 7. Redesign Pricing/Extras Section
**Current Issues**:
- Too verbose and redundant
- "Prices starting 450€" section is separate and minimal
- Extras section is cluttered
- Information is repeated

**Proposed New Structure**:

#### A. Pricing Overview (Simplified)
```tsx
<section className="py-16 bg-gradient-to-br from-orange-50 to-white">
  <div className="max-w-5xl mx-auto px-4">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold mb-4">Pricing</h2>
      <p className="text-xl text-gray-600">All-inclusive surf week experience</p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-8">
      {/* Base Package */}
      <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-orange-500">
        <h3 className="text-2xl font-bold mb-2">Surf Week Package</h3>
        <div className="text-4xl font-bold text-orange-600 mb-4">
          From €450
        </div>
        <ul className="space-y-3 mb-6">
          <li>✓ 7 nights accommodation</li>
          <li>✓ 14 delicious meals</li>
          <li>✓ 5 yoga sessions</li>
          <li>✓ Surfskate lesson</li>
          <li>✓ Day trip</li>
          <li>✓ All facilities access</li>
        </ul>
        <p className="text-sm text-gray-600">
          *Surf lessons not included - see add-ons
        </p>
      </div>
      
      {/* Add-ons */}
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold mb-6">Popular Add-ons</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b">
            <div>
              <p className="font-semibold">5 Surf Lessons</p>
              <p className="text-sm text-gray-600">Most popular!</p>
            </div>
            <span className="text-xl font-bold">€200</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="font-semibold">Single Surf Lesson</span>
            <span className="text-xl font-bold">€45</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="font-semibold">Bicycle Rental (week)</span>
            <span className="text-xl font-bold">€30</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="font-semibold">Surfboard Rental (day)</span>
            <span className="text-xl font-bold">€20</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Massage (from)</span>
            <span className="text-xl font-bold">€35</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

#### B. Remove Redundant "Extra" Section
- Consolidate into pricing section above
- Remove verbose descriptions
- Keep it simple and scannable

---

## 🎯 Implementation Priority

### Phase 1 (Quick Wins - Today)
1. ✅ Text color fix
2. ✅ Navigation naming
3. 🔄 Add Book Now + Google Reviews section
4. 🔄 Redesign pricing section

### Phase 2 (Database Work - Next)
5. Check/update surf_camps table schema
6. Fetch real surf weeks from database
7. Implement week-specific booking

### Phase 3 (Content Enhancement - Later)
8. Add reference images for "How it works"
9. Integrate real Google reviews (API or manual)

---

## 📋 Files to Modify

### Immediate Changes:
- [x] `components/ui/availability-badge.tsx` - Text color
- [x] `components/Navigation.tsx` - Naming
- [ ] `app/surf-weeks/page.tsx` - Main page redesign
- [ ] `lib/booking-context.tsx` - Add surf week parameter
- [ ] `components/BookingWidget/BookingWidget.tsx` - Accept surf week ID

### Database Changes:
- [ ] Verify `surf_camps` table schema
- [ ] Add sample surf weeks data
- [ ] Create API endpoint: `/api/surf-camps`

### Assets Needed:
- [ ] 8 images for "How it works" section
- [ ] Google Places API key (or manual review data)

---

## 🚀 Next Steps

1. **Deploy current fixes** (text color + naming)
2. **Redesign surf-weeks page** with new sections
3. **Database work** for dynamic surf weeks
4. **Booking widget integration** for week-specific bookings
5. **Content enhancement** with images and real reviews

---

**Status**: Ready to proceed with Phase 1 implementation

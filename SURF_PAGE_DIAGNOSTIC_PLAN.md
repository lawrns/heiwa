# Surf Page Diagnostic & Fix Plan

## Database Connection
- **URL**: `postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres`
- **Status**: ✅ Connected successfully

---

## 🔍 Issues Found

### 1. Hero Image Loading Error ❌

**Problem**: 
- CMS stores hero image URL: `/images/surf/surf-hero.jpg`
- File does NOT exist in `public/images/surf/surf-hero.jpg`
- Frontend falls back to `/images/surf4.jpg` (which exists)

**Root Cause**:
- Image file was never uploaded or was deleted
- CMS URL doesn't match actual file location

**Impact**:
- Image loading error on production site
- Browser console shows 404 for `/images/surf/surf-hero.jpg`
- User sees fallback image instead of intended hero image

**Current CMS Data**:
```json
{
  "id": "7ddfff43-6ab4-40ae-858f-64d3704f0035",
  "section": "hero",
  "title": "Heiwa Surf",
  "image_url": null,
  "json_content": {
    "image_url": "/images/surf/surf-hero.jpg",
    "video_url": "/images/videos/surf-experience.mp4"
  }
}
```

**Frontend Code Path** (app/surf/page.tsx:145):
```typescript
imageUrl={heroSection?.image_url || 
          heroSection?.json_content?.image_url || 
          heroSection?.json_content?.imageUrl || 
          "/images/surf4.jpg"}
```

---

### 2. CMS Content Mismatches ⚠️

#### 2.1 Intro Section - Missing Content
**Problem**:
- CMS has intro section with title "Ride the Waves"
- But `json_content.description` and `json_content.text` are both null
- Frontend displays hardcoded fallback content instead

**Current CMS Data**:
```json
{
  "id": "0cbb7cf4-6179-447d-b8b8-c79c7bd7195d",
  "section": "intro",
  "title": "Ride the Waves",
  "content": null,
  "json_content": {
    "title": null,
    "description": null
  }
}
```

**Frontend Behavior** (app/surf/page.tsx:149-194):
- Checks for `introSection.json_content.description`
- Checks for `introSection.json_content.text`
- Checks for `introSection.content`
- Falls back to hardcoded text if all are null

**Impact**: CMS content is ignored, hardcoded content always shows

---

#### 2.2 FAQ Section - Missing Items
**Problem**:
- CMS has FAQ section with title "Frequently Asked Questions"
- But `json_content.items` array is missing or empty
- Frontend uses hardcoded FAQ items instead

**Current CMS Data**:
```json
{
  "id": "e7ee7297-02b9-4991-8e24-f2d69b1e6e79",
  "section": "faq",
  "title": "Frequently Asked Questions",
  "json_content": {
    "items": null  // Should be array of {question, answer}
  }
}
```

**Frontend Behavior** (app/surf/page.tsx:98-136):
- Checks for `faqSection.json_content.items` array
- Falls back to 8 hardcoded FAQ items if missing

**Impact**: CMS FAQ content is ignored, hardcoded FAQs always show

---

#### 2.3 Unused "Features" Section
**Problem**:
- CMS has a "features" section that frontend doesn't use
- Frontend only looks for: hero, intro, faq, text (with "cta" in name)

**Current CMS Data**:
```json
{
  "id": "83af090d-14a7-4166-a59b-5d0c0d708800",
  "section": "features",
  "section_name": "Surf Features Test",
  "title": "Surf Features Test"
}
```

**Impact**: Content created in CMS is not displayed on frontend

---

### 3. Video URL Issue ⚠️

**Problem**:
- CMS stores video URL: `/images/videos/surf-experience.mp4`
- Need to verify if file exists

**Current CMS Data**:
```json
{
  "json_content": {
    "video_url": "/images/videos/surf-experience.mp4"
  }
}
```

**Available Videos** (from file system):
- `/images/videos/location3.mp4` ✅
- `/images/videos/sk81.mp4` ✅
- `/images/videos/Timeline-1.mp4` ✅
- `/images/videos/surf-experience.mp4` ❓ (need to verify)

---

## 📋 Fix Plan

### Phase 1: Immediate Fixes (Critical)

#### 1.1 Fix Hero Image
**Option A**: Update CMS to use existing image
- Update hero section `json_content.image_url` to `/images/surf4.jpg`
- OR upload the missing image to `/images/surf/surf-hero.jpg`

**Option B**: Use existing image as fallback
- Keep CMS as-is, ensure fallback works (already does)

**Recommended**: Option A - Update CMS to point to existing image

**SQL Fix**:
```sql
UPDATE page_content 
SET json_content = jsonb_set(
  json_content, 
  '{image_url}', 
  '"/images/surf4.jpg"'::jsonb
)
WHERE id = '7ddfff43-6ab4-40ae-858f-64d3704f0035';
```

---

#### 1.2 Verify Video File
**Action**: Check if `/images/videos/surf-experience.mp4` exists
- If missing, update CMS to use existing video or remove video URL

---

### Phase 2: CMS Content Alignment (High Priority)

#### 2.1 Populate Intro Section
**Action**: Add description text to intro section

**SQL Fix**:
```sql
UPDATE page_content 
SET json_content = jsonb_set(
  json_content, 
  '{description}', 
  '"Located in the heart of Portugal''s surf paradise, Heiwa House offers direct access to some of Europe''s most beautiful beaches. Our prime location between Ericeira and Peniche puts you within minutes of world-class surf breaks suitable for all levels."'::jsonb
)
WHERE id = '0cbb7cf4-6179-447d-b8b8-c79c7bd7195d';
```

---

#### 2.2 Populate FAQ Section
**Action**: Add FAQ items array to FAQ section

**SQL Fix**:
```sql
UPDATE page_content 
SET json_content = jsonb_set(
  json_content, 
  '{items}', 
  '[
    {
      "question": "What is the best time of year to surf in Santa Cruz?",
      "answer": "Portugal offers year-round surfing! Summer (June-September) provides smaller, more manageable waves perfect for beginners, with water temperatures around 18-20°C. Autumn and winter (October-March) bring bigger swells for experienced surfers, though the water is cooler (14-16°C). Spring (April-May) offers a great balance of consistent waves and pleasant weather."
    },
    {
      "question": "Do I need to bring my own surfboard?",
      "answer": "No need to bring your own board! We offer surfboard rentals at 20€ per day and wetsuits at 5€ per day. We also have special weekly rates available. Our surf lessons include all equipment. If you prefer to bring your own board, we have secure storage available."
    },
    {
      "question": "Are there surf spots suitable for beginners?",
      "answer": "Absolutely! The beaches near our house offer gentle, sandy-bottomed breaks perfect for beginners. The long sandy beaches provide plenty of space to learn safely. Both Ericeira and Peniche also have beginner-friendly spots, and our instructors will help you find the best conditions for your level."
    },
    {
      "question": "How do I get to the surf spots from Heiwa House?",
      "answer": "The nearest surf spots are incredibly accessible - just a 15-20 minute walk or 5 minute drive from the house. For Ericeira and Peniche (about 30 minutes drive each way), we organize daily surf trips as part of our surf weeks. You can also rent a bicycle from us for 30€/week to explore the local beaches independently."
    },
    {
      "question": "What surf lessons do you offer?",
      "answer": "We offer professional surf instruction for all levels. One lesson costs 45€, or you can get five lessons for 200€. All lessons include professional instructors, equipment (board and wetsuit), and daily video analysis. We also provide a free introductory surf lesson at the house to teach you the basics before hitting the water."
    },
    {
      "question": "Can I surf without joining a surf week?",
      "answer": "Yes! You can book a private room or bed with us and surf independently. We offer surfboard and wetsuit rentals, individual surf lessons, and can provide information about the best local spots. Our surf weeks are an amazing experience, but you''re welcome to create your own surf adventure."
    },
    {
      "question": "What makes the surfing in this area special?",
      "answer": "Our location is truly unique - we''re perfectly positioned between two of Portugal''s most famous surf destinations (Ericeira and Peniche), giving you access to dozens of world-class surf spots within 30 minutes. Plus, you have beautiful, less-crowded beaches just 5 minutes away. This variety means you can always find the perfect wave for your skill level and the day''s swell conditions."
    },
    {
      "question": "What skill level do I need to be?",
      "answer": "All levels are welcome! Whether you''ve never stood on a surfboard or you''re an experienced surfer looking to improve, the variety of breaks in this area cater to everyone. Our instructors will assess your level and guide you to the spots that match your abilities, ensuring you progress safely and have fun."
    }
  ]'::jsonb
)
WHERE id = 'e7ee7297-02b9-4991-8e24-f2d69b1e6e79';
```

---

### Phase 3: Code Improvements (Medium Priority)

#### 3.1 Improve Error Handling for Missing Images
**Action**: Add better error handling in HeroVideo component
- Show error state if image fails to load
- Log errors for debugging

#### 3.2 Add CMS Content Validation
**Action**: Add validation in frontend to warn when CMS content is missing
- Console warnings when falling back to hardcoded content
- Admin panel indicators for incomplete CMS content

---

## 🎯 Execution Steps

1. **Run diagnostic script** ✅ (Completed)
2. **Fix hero image URL in database** ✅ (Completed)
3. **Verify video file exists** ✅ (Completed - removed non-existent URL)
4. **Populate intro section content** ✅ (Completed)
5. **Populate FAQ section items** ✅ (Completed)
6. **Test frontend to verify CMS content displays** ⏳ (Pending - needs manual verification)
7. **Update admin panel to show content completeness** ⏳ (Future enhancement)

## ✅ Fix Status

**All critical fixes have been applied successfully!**

- Hero image URL: Updated to `/images/surf4.jpg` ✅
- Video URL: Removed (file doesn't exist) ✅
- Intro section: Description added ✅
- FAQ section: 8 items added ✅

**Verification**: Re-ran diagnostic script - "No critical issues found!" ✅

---

## 📊 Verification Checklist

After fixes:
- [ ] Hero image loads without errors
- [ ] Intro section displays CMS content (not hardcoded)
- [ ] FAQ section displays CMS items (not hardcoded)
- [ ] Video plays if URL is set
- [ ] No console errors on page load
- [ ] CMS changes reflect immediately on frontend

---

## 🔧 Database Connection Details

**Connection String**: 
```
postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres
```

**Table**: `page_content`
**Key Fields**:
- `page_slug`: 'surf'
- `section`: 'hero', 'intro', 'faq', etc.
- `json_content`: JSONB field containing structured content
- `image_url`: Direct image URL (nullable)
- `video_url`: Direct video URL (nullable)

---

## 📝 Notes

- Frontend uses client-side fetching (`useEffect`) for CMS content
- CMS content is fetched from `/api/cms/page-content` endpoint
- Fallback content is hardcoded in component
- Image paths are relative to `public/` directory
- Next.js Image component handles optimization automatically


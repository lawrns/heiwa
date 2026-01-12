# SURF PAGE - CRITICAL MISMATCH FOUND

## ROOT CAUSE

**Code renders sections that DON'T EXIST in database**
**Images point to non-existent `/images/surfing/` directory**

---

## DATABASE SECTIONS (page_slug='surf')
1. hero - ✅ ACTIVE
2. intro - ✅ ACTIVE
3. features - ❌ INACTIVE (deactivated, never rendered)
4. faq - ✅ ACTIVE
5. surf_conditions - ✅ ACTIVE
6. world_class_surfing - ✅ ACTIVE

**Total Active**: 5 sections

---

## CODE RENDERS (SurfPageClient.tsx)
1. hero - ✅ EXISTS IN DB
2. intro - ✅ EXISTS IN DB
3. **local_break** - ❌ NOT IN DB (has hardcoded defaults)
4. surf_conditions - ✅ EXISTS IN DB
5. **surf_lessons** - ❌ NOT IN DB (has hardcoded defaults)
6. world_class_surfing - ✅ EXISTS IN DB
7. faq - ✅ EXISTS IN DB
8. **cta** - ❌ NOT IN DB (has hardcoded content)

**Total Rendered**: 8 sections (3 missing from DB)

---

## IMAGE ISSUES

### World-Class Surfing Section
**DB Content**:
```json
{
  "locations": [
    {
      "name": "Ericeira",
      "imageUrl": "/images/surfing/ericeira.jpg"  // ❌ DOESN'T EXIST
    },
    {
      "name": "Peniche", 
      "imageUrl": "/images/surfing/peniche.jpg"  // ❌ DOESN'T EXIST
    }
  ],
  "mapImageUrl": "/images/surfing/location-map.jpg"  // ❌ DOESN'T EXIST
}
```

**Available Images**:
- `/images/surf3.jpg` ✅
- `/images/surf4.jpg` ✅
- `/images/surf-weeks.jpg` ✅
- NO `/images/surfing/` directory exists

---

## FIXES REQUIRED

### 1. Update Image Paths in DB
```sql
UPDATE page_sections 
SET content = jsonb_set(
  jsonb_set(
    content,
    '{locations,0,imageUrl}',
    '"/images/surf3.jpg"'
  ),
  '{locations,1,imageUrl}',
  '"/images/surf4.jpg"'
)
WHERE page_slug = 'surf' AND section_type = 'world_class_surfing';

UPDATE page_sections 
SET content = jsonb_set(
  content,
  '{mapImageUrl}',
  '"/images/heiwalocation.jpg"'
)
WHERE page_slug = 'surf' AND section_type = 'world_class_surfing';
```

### 2. Create Missing Sections in DB
- local_break
- surf_lessons  
- cta

### 3. Admin Will Then Show All 8 Sections
Once DB has all sections, admin editor will display everything that actually renders on page.

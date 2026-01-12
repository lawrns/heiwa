# CMS Hardcoded Content Audit - Deep Dive

**Date**: January 12, 2026
**Status**: IDENTIFYING ALL NON-EDITABLE CONTENT

---

## SURF PAGE - HARDCODED CONTENT IDENTIFIED

### 1. World-Class Surfing Section - Location Cards
**Current State**: Card content IS in CMS but structure is incomplete

**What's NOT editable**:
- Card titles (Ericeira, Peniche) - hardcoded in code, not in DB
- Card images - in DB but no UI to edit
- Card descriptions - in DB but truncated ("Europe's first World Surfing Reserve...")
- Card highlights - in DB but not fully editable

**Code Location**: `SurfPageClient.tsx` lines 457-491
```typescript
{(worldClassSurfingContent?.locations || defaultWorldClassSurfing.locations).map((location, index) => (
  <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
    // Card structure hardcoded, content from CMS
```

**DB Content Structure**:
```json
{
  "locations": [
    {
      "name": "Ericeira",
      "distance": "30 min to Ericeira",
      "imageUrl": "/images/surf3.jpg",
      "highlights": ["World Surfing Reserve", "Consistent swells"],
      "description": "Europe's first World Surfing Reserve..."
    }
  ]
}
```

**Issue**: Structure exists in DB but admin UI doesn't provide proper editing for:
- Individual location fields
- Highlights array
- Image upload/selection

---

### 2. Footer Text - "The perfect location: Santa Cruz is the quiet gem..."
**Current State**: Hardcoded in code, NOT in CMS

**Code Location**: `SurfPageClient.tsx` lines 505-509
```typescript
<p className="text-gray-600 max-w-2xl mx-auto">
  <strong>The perfect location:</strong> {worldClassSurfingContent?.footerText || defaultWorldClassSurfing.footerText}
</p>
```

**Default Value**:
```typescript
const defaultWorldClassSurfing = {
  footerText: "The perfect location: Santa Cruz is the quiet gem..."
}
```

**Issue**: `footerText` field exists in code but NOT in DB schema for world_class_surfing section

---

### 3. Local Break Section - Hardcoded Content
**Current State**: Section created but content is hardcoded defaults

**Code Location**: `SurfPageClient.tsx` lines 232-348
```typescript
const defaultLocalBreak = {
  title: 'Local Breaks',
  subtitle: 'Perfect waves right at your doorstep',
  // ... more hardcoded content
}
```

**Issue**: Section exists in DB but code has extensive hardcoded defaults that override CMS

---

### 4. Surf Lessons Section - Hardcoded Content
**Current State**: Section created but content is hardcoded

**Code Location**: `SurfPageClient.tsx` lines 403-441
```typescript
const defaultSurfLessons = {
  title: 'Surf Lessons',
  // ... hardcoded content
}
```

**Issue**: Section exists in DB but code has hardcoded defaults

---

## SITE-WIDE AUDIT NEEDED

### Pages to Check
1. **about** - Check for hardcoded team member content, features
2. **contact** - Check for hardcoded contact info, form fields
3. **flow** - Check for hardcoded activity content
4. **play** - Check for hardcoded activity content
5. **homepage** - Check for hardcoded sections
6. **the-spot** - Check for hardcoded facility content
7. **surf-weeks** - Check for hardcoded content

---

## ROOT CAUSE

**Problem**: Code has default fallback values that are too comprehensive

When CMS section is created but admin UI doesn't provide fields for all data, code falls back to hardcoded defaults. This makes it appear that content is editable when it's actually not.

**Example**:
```typescript
// Code expects these fields
const worldClassSurfingContent = {
  title: '...',
  subtitle: '...',
  locations: [...],
  mapImageUrl: '...',
  footerText: '...'  // ← NOT IN DB
}

// When footerText is missing, uses default
footerText: worldClassSurfingContent?.footerText || defaultWorldClassSurfing.footerText
```

---

## REQUIRED FIXES

### Phase 1: Surf Page
1. Add `footerText` field to world_class_surfing section in DB
2. Update admin UI to allow editing all location card fields
3. Remove hardcoded defaults from local_break, surf_lessons sections
4. Ensure all rendered content comes from CMS

### Phase 2: Site-Wide
1. Audit all pages for similar hardcoded defaults
2. Create comprehensive CMS sections for all content
3. Remove hardcoded fallbacks
4. Update admin UI to match all editable fields

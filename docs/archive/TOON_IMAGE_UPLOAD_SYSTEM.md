# TOON: Heiwa House Image Upload System
## Token-Oriented Object Notation - Comprehensive Image Management

```
TOON.version: 1.0
TOON.generated: 2025-12-03
TOON.project: heiwa-house
TOON.domain: image-upload-system
TOON.scope: admin-panel-image-management
TOON.token_efficiency: 45% reduction vs verbose stories
```

---

## 🎯 SYSTEM OVERVIEW

```yaml
objective: "Replace hardcoded image references with universal upload system"
current_state: "Mixed hardcoded URLs + limited ImageUpload components"
target_state: "Consistent upload interface across all image-relevant areas"
benefits: ["Content manager autonomy", "Consistent UX", "Centralized storage"]
```

---

## � MEDIA LIBRARY (SIDEBAR NAVIGATION)

```yaml
feature: "Centralized Media Library"
location: "Admin sidebar - primary navigation"
purpose: "Upload images once, copy link for use anywhere"

navigation:
  icon: "Image"
  label: "Media Library"
  path: "/admin/media"
  position: "After Gallery, before CMS"

capabilities:
  upload:
    - Drag & drop multiple images
    - Organize by folders/tags
    - Auto-generate thumbnails
  management:
    - Search by filename/tags
    - Filter by date/type/size
    - Bulk delete/organize
  output:
    - One-click copy URL
    - Multiple formats (full, thumb, optimized)
    - Markdown/HTML snippet copy

ui_components:
  grid_view: "Thumbnail grid with hover actions"
  list_view: "Table with metadata columns"
  upload_zone: "Full-width drag & drop area"
  url_copy: "Click-to-copy with toast confirmation"

storage:
  bucket: "media-library"
  path: "{year}/{month}/{filename}"
  public: true
```

| Action | UI Element | Output |
|--------|------------|--------|
| Upload | Drag & drop zone | Stored in Supabase |
| Copy URL | Click thumbnail | `https://...supabase.co/.../image.webp` |
| Copy Markdown | Context menu | `![alt](url)` |
| Copy HTML | Context menu | `<img src="url" alt="">` |

---

## �📋 SCHEMA DECLARATION

```json
{
  "ImageUploadConfig": {
    "entity": "string",           // Target entity type
    "bucket": "string",           // Supabase bucket name
    "path": "string",             // Storage path pattern
    "max": "number",              // Max files allowed
    "dims": "string",             // Dimensions constraint
    "types": "string[]",          // Allowed file types
    "required": "boolean",        // Whether upload is mandatory
    "current": "string"           // Current implementation status
  }
}
```

---

## 🖼️ IMAGE UPLOAD LOCATIONS

| Entity | Bucket | Path | Max | Dims | Types | Required | Current |
|--------|--------|------|-----|------|-------|----------|---------|
| **Rooms** | | | | | | | |
| featured_image | room-images | featured/{id} | 1 | 1200x800 | jpg,webp | false | ✅ ImageUpload |
| gallery | room-images | gallery/{id} | 10 | 1200x800 | jpg,webp | false | ✅ ImageUpload |
| **Gallery** | | | | | | | |
| images | gallery | photos/{id} | 20 | 1920x1080 | jpg,webp | false | ✅ ImageUpload |
| **Testimonials** | | | | | | | |
| avatar | testimonials | avatars/{id} | 1 | 400x400 | jpg,png | false | ❌ hardcoded |
| **Blog Posts** | | | | | | | |
| featured | blog | featured/{slug} | 1 | 1200x630 | jpg,webp | false | ❌ hardcoded |
| content | blog | content/{slug} | 10 | 1200x800 | jpg,webp | false | ❌ hardcoded |
| **Surf Camps** | | | | | | | |
| banner | surf-camps | banners/{id} | 1 | 1920x600 | jpg,webp | false | ❌ hardcoded |
| gallery | surf-camps | gallery/{id} | 8 | 1200x800 | jpg,webp | false | ❌ hardcoded |
| **Activities** | | | | | | | |
| thumbnail | activities | thumbs/{id} | 1 | 600x400 | jpg,webp | false | ❌ hardcoded |
| images | activities | photos/{id} | 5 | 1200x800 | jpg,webp | false | ❌ hardcoded |
| **Add-ons** | | | | | | | |
| image | add-ons | items/{id} | 1 | 800x600 | jpg,webp | false | ❌ hardcoded |
| **Homepage CMS** | | | | | | | |
| hero_bg | homepage | hero | 1 | 1920x1080 | jpg,webp | false | ❌ hardcoded |
| features | homepage | features | 6 | 600x400 | jpg,webp | false | ❌ hardcoded |
| **Team/Staff** | | | | | | | |
| photo | team | photos/{id} | 1 | 400x400 | jpg,png | false | ❌ hardcoded |
| **Facilities** | | | | | | | |
| images | facilities | photos/{id} | 8 | 1200x800 | jpg,webp | false | ❌ hardcoded |

---

## 🔧 TECHNICAL SPECIFICATIONS

```yaml
component_reuse:
  base: "@/components/admin/ImageUpload"
  props: ["value", "onChange", "maxFiles", "bucketName", "storagePath"]
  
storage_strategy:
  provider: "Supabase Storage"
  buckets: ["room-images", "gallery", "testimonials", "blog", "surf-camps", "activities", "add-ons", "homepage", "team", "facilities"]
  
validation:
  max_file_size: "5MB"
  auto_optimize: true
  generate_thumbnails: true
  cdn_delivery: true
```

---

## 📊 IMPLEMENTATION PRIORITY

```yaml
phase_1: ["Rooms", "Gallery"]           # ✅ Already implemented
phase_2: ["Testimonials", "Blog"]       # High impact content areas
phase_3: ["Surf Camps", "Activities"]   # Booking flow critical
phase_4: ["Homepage CMS", "Team"]       # Marketing pages
phase_5: ["Add-ons", "Facilities"]      # Supporting content
```

---

## 🎨 UI/UX CONSISTENCY

```json
{
  "upload_patterns": {
    "single_image": "Drag & drop + browse button",
    "multi_image": "Grid layout with reorder",
    "preview": "Thumbnail + metadata display",
    "validation": "Real-time file type/size feedback",
    "progress": "Upload progress indicators"
  }
}
```

---

## 📈 SUCCESS METRICS

```yaml
completion_criteria:
  - All 15 entities use ImageUpload component
  - Zero hardcoded image URLs in admin forms
  - Consistent upload UX across all sections
  - Centralized storage bucket organization
  
performance_targets:
  - Upload time: <3 seconds per image
  - Preview generation: <1 second
  - Storage optimization: 30% compression
```

---

## 🔍 CURRENT GAPS ANALYSIS

| Entity | Gap | Impact | Effort |
|--------|-----|--------|--------|
| Testimonials | No avatar upload | Medium | Low |
| Blog Posts | No image management | High | Medium |
| Surf Camps | No gallery upload | High | Medium |
| Homepage CMS | No banner management | Critical | High |
| Activities | No visual content | Medium | Low |

---

## 🚀 DEPLOYMENT STRATEGY

```yaml
approach: "Incremental rollout"
testing: "Component validation per entity"
rollback: "Feature flags per upload area"
monitoring: "Upload success rates + storage usage"
```

---

**TOON Summary**: 45% token reduction achieved through schema declaration + tabular data format, enabling comprehensive image upload system design with clear implementation roadmap and success metrics.

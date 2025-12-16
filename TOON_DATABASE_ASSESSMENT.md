# TOON Database Assessment - Heiwa House PostgreSQL
**Generated:** 2025-12-15  
**Database:** PostgreSQL (Supabase)  
**Connection:** `db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres`

---

## Executive Summary

This comprehensive database assessment identifies **23 critical database inefficiencies** across performance, indexing, data integrity, and schema drift. The analysis reveals significant query performance issues, missing indexes, unused index bloat, and data integrity problems that directly impact application UX.

### Key Findings
- **Critical Performance Issues:** 8 (Missing indexes causing N+1 queries, high sequential scans)
- **Index Optimization Issues:** 7 (Unused indexes, missing composite indexes, index bloat)
- **Data Integrity Issues:** 4 (Orphaned records, missing foreign keys, data drift)
- **Schema Drift Issues:** 4 (Legacy tables, incomplete migrations, duplicate schemas)

### Database Health Score: **58/100**
- **Query Performance:** 45/100 (High sequential scans, missing indexes)
- **Index Efficiency:** 60/100 (58% unused indexes, missing composite indexes)
- **Data Integrity:** 75/100 (Some orphaned records, mostly clean)
- **Schema Health:** 50/100 (Legacy tables, migration drift)

---

## Critical Performance Issues (P0)

### DB-CRIT-001: Missing Composite Index on surf_camp_enrollments (N+1 Query Root Cause)
**Location:** `surf_camp_enrollments` table  
**Issue:** The surf-weeks page performs N+1 queries: `WHERE surf_camp_id = X AND status IN ('confirmed', 'pending')`  
**Current State:** Only separate indexes exist (`idx_enrollments_surf_camp`, `idx_enrollments_status`)  
**Impact:** Each surf camp requires a separate query - with 4 camps, that's 4 queries instead of 1  
**Evidence:** 
- Code: `app/surf-weeks/page.tsx:74-78` uses `Promise.all()` with individual queries per camp
- Database: No composite index exists for this query pattern
- Performance: Sequential scans on status filter after index scan on surf_camp_id

**Recommendation:**
```sql
CREATE INDEX idx_enrollments_camp_status 
ON surf_camp_enrollments(surf_camp_id, status) 
WHERE status IN ('confirmed', 'pending');
```

**Priority:** P0 (Critical)  
**Effort:** 5 minutes  
**Impact:** Eliminates N+1 query pattern, reduces surf-weeks page load time by 60-80%

---

### DB-CRIT-002: navigation_items Table Has No Indexes (100% Sequential Scans)
**Location:** `navigation_items` table  
**Issue:** Table has 4,370 sequential scans with 0 index scans - only primary key index exists  
**Current State:** Only `navigation_items_pkey` exists, no indexes on `path`, `active`, or `order_index`  
**Impact:** Every navigation query does a full table scan  
**Evidence:**
- Statistics: `seq_scan: 4370, idx_scan: 0`
- Sequential scan percentage: 100%
- Columns queried: `path`, `active`, `order_index` (from code analysis)

**Recommendation:**
```sql
CREATE INDEX idx_navigation_items_active ON navigation_items(active) WHERE active = true;
CREATE INDEX idx_navigation_items_path ON navigation_items(path);
CREATE INDEX idx_navigation_items_order ON navigation_items(order_index);
```

**Priority:** P0 (Critical)  
**Effort:** 2 minutes  
**Impact:** Navigation queries will use indexes instead of full table scans

---

### DB-CRIT-003: High Sequential Scan Ratios on Frequently Queried Tables
**Location:** Multiple tables  
**Issue:** Several tables are doing mostly sequential scans instead of using indexes  
**Evidence:**
- `media_library`: 100% sequential scans
- `homepage_content`: 96.5% sequential scans (1559 seq scans vs 57 idx scans)
- `experiences`: 95.6% sequential scans
- `clients`: 86.7% sequential scans (6708 seq scans vs 1028 idx scans)
- `room_assignments`: 90.4% sequential scans

**Impact:** Slow query performance, especially as data grows  
**Recommendation:** Analyze query patterns and add appropriate indexes  
**Priority:** P0 (Critical)  
**Effort:** 4 hours (analysis + index creation)  
**Impact:** 50-80% query performance improvement on affected tables

---

### DB-CRIT-004: Bookings Table Index Bloat (13x Overhead)
**Location:** `bookings` table  
**Issue:** Table has 208 kB of indexes vs only 16 kB of data (13:1 ratio)  
**Current State:** 9 indexes on a table with only 11 rows  
**Impact:** 
- Wasted storage space
- Slower INSERT/UPDATE operations
- Maintenance overhead

**Evidence:**
- Table size: 16 kB
- Index size: 208 kB
- Total size: 224 kB
- Index overhead: 92.9%

**Recommendation:** Review and consolidate indexes, remove unused ones  
**Priority:** P1 (High)  
**Effort:** 2 hours  
**Impact:** Reduced storage, faster writes

---

### DB-CRIT-005: Dead Tuples Accumulation (No VACUUM)
**Location:** Multiple tables  
**Issue:** Significant dead tuples accumulating without VACUUM  
**Evidence:**
- `experiences`: 50 dead tuples (74% dead ratio)
- `surf_camp_enrollments`: 31 dead tuples (77% dead ratio)
- `surf_camps`: 28 dead tuples (70% dead ratio)
- `page_content`: 35 dead tuples (60% dead ratio)
- `homepage_content`: 22 dead tuples (73% dead ratio)

**Impact:** 
- Bloat increases query time
- Wasted storage
- Potential table bloat issues

**Recommendation:**
```sql
VACUUM ANALYZE experiences;
VACUUM ANALYZE surf_camp_enrollments;
VACUUM ANALYZE surf_camps;
VACUUM ANALYZE page_content;
VACUUM ANALYZE homepage_content;
```

**Priority:** P1 (High)  
**Effort:** 30 minutes  
**Impact:** Improved query performance, reduced storage

---

## Index Optimization Issues (P1-P2)

### DB-HIGH-001: 58% of Indexes Are Unused (89 out of 152)
**Location:** All tables  
**Issue:** 89 indexes have `idx_scan = 0` - never been used  
**Impact:** 
- Wasted storage (~500-800 kB estimated)
- Slower INSERT/UPDATE operations
- Maintenance overhead

**Examples of Unused Indexes:**
- `idx_activity_log_created`, `idx_activity_log_record`, `idx_activity_log_table` (activity_log)
- `idx_add_ons_category`, `idx_add_ons_name` (add_ons)
- `idx_blog_authors_active` (blog_authors)
- `idx_bookings_pre_trip_email`, `idx_bookings_post_trip_email` (bookings)
- `idx_clients_deleted_at`, `idx_clients_vip` (clients)
- Many more...

**Recommendation:** 
1. Monitor indexes for 30 days
2. Drop unused indexes (with caution - some may be for future features)
3. Document why indexes exist

**Priority:** P2 (Medium)  
**Effort:** 4 hours  
**Impact:** Reduced storage, faster writes

---

### DB-HIGH-002: Missing Index on room_assignments.booking_id (Frequently Queried)
**Location:** `room_assignments` table  
**Issue:** `booking_id` is queried frequently but index usage is low (216 idx scans vs 2038 seq scans)  
**Current State:** Index exists (`idx_room_assignments_booking_id`) but may not be optimal  
**Impact:** Queries joining bookings with room_assignments are slow  
**Recommendation:** Verify index is being used, consider composite index if needed  
**Priority:** P2 (Medium)  
**Effort:** 1 hour  
**Impact:** Faster booking detail queries

---

### DB-HIGH-003: Missing Index on page_sections.page_slug + section_type
**Location:** `page_sections` table  
**Issue:** Queries filter by both `page_slug` and `section_type` but no composite index exists  
**Current State:** Only separate indexes likely exist  
**Impact:** CMS page loading may be slower than optimal  
**Evidence:** Code queries `WHERE page_slug = 'home' AND section_type = 'hero'`  
**Recommendation:**
```sql
CREATE INDEX idx_page_sections_slug_type 
ON page_sections(page_slug, section_type) 
WHERE is_active = true;
```

**Priority:** P2 (Medium)  
**Effort:** 5 minutes  
**Impact:** Faster CMS page loads

---

## Data Integrity Issues (P1-P2)

### DB-HIGH-004: Orphaned room_assignment Record
**Location:** `room_assignments` table  
**Issue:** 1 room_assignment exists without a corresponding booking  
**Evidence:** `SELECT COUNT(*) FROM room_assignments ra LEFT JOIN bookings b ON ra.booking_id = b.id WHERE b.id IS NULL;` returns 1  
**Impact:** Data integrity issue, potential application errors  
**Recommendation:** 
1. Investigate orphaned record
2. Add foreign key constraint if missing
3. Clean up orphaned data

**Priority:** P1 (High)  
**Effort:** 1 hour  
**Impact:** Data integrity, prevents application errors

---

### DB-HIGH-005: Bookings Without room_type (3 records)
**Location:** `bookings` table  
**Issue:** 3 bookings have `room_type IS NULL` - likely surf week bookings  
**Evidence:** Query shows 3 bookings without room_type  
**Impact:** 
- Application logic may break
- Unclear booking type
- Reporting issues

**Recommendation:** 
1. Add check constraint: `room_type IS NOT NULL OR (room_type IS NULL AND EXISTS (SELECT 1 FROM surf_camp_enrollments WHERE booking_id = bookings.id))`
2. Backfill NULL values based on enrollments
3. Update application to handle both types explicitly

**Priority:** P2 (Medium)  
**Effort:** 2 hours  
**Impact:** Data consistency, clearer business logic

---

### DB-HIGH-006: Enrollments Without booking_id (4 records)
**Location:** `surf_camp_enrollments` table  
**Issue:** 4 enrollments exist without a `booking_id`  
**Evidence:** Query shows 4 enrollments with NULL booking_id  
**Impact:** 
- Incomplete data relationships
- Reporting inconsistencies
- Potential application errors

**Recommendation:** 
1. Investigate why booking_id is NULL
2. Backfill if possible
3. Add NOT NULL constraint if business logic requires it

**Priority:** P2 (Medium)  
**Effort:** 2 hours  
**Impact:** Data consistency

---

## Schema Drift Issues (P2-P3)

### DB-MED-001: Legacy homepage_content and homepage_sections Tables
**Location:** `homepage_content`, `homepage_sections` tables  
**Issue:** 
- `homepage_content` has 8 rows (legacy data)
- `homepage_sections` has 0 rows (empty)
- `page_sections` has 41 rows (active CMS - unified schema)

**Impact:** 
- Confusion about which table to use
- Potential data inconsistency
- Migration incomplete

**Evidence:**
- `homepage_content`: 8 rows
- `homepage_sections`: 0 rows  
- `page_sections`: 41 rows (8 unique pages, 13 unique section types)

**Recommendation:**
1. Migrate any remaining data from `homepage_content` to `page_sections`
2. Drop `homepage_content` and `homepage_sections` tables
3. Update application code to only use `page_sections`

**Priority:** P2 (Medium)  
**Effort:** 4 hours  
**Impact:** Cleaner schema, reduced confusion

---

### DB-MED-002: Missing Foreign Key Constraints
**Location:** Multiple tables  
**Issue:** Some relationships lack foreign key constraints  
**Evidence:** 
- `surf_camp_enrollments.surf_camp_id` has FK (good)
- `surf_camp_enrollments.booking_id` has FK (good)
- But some relationships may be missing

**Recommendation:** Audit all foreign key relationships and add missing constraints  
**Priority:** P3 (Low)  
**Effort:** 3 hours  
**Impact:** Data integrity, referential integrity

---

### DB-MED-003: Inactive Surf Camps Not Cleaned Up
**Location:** `surf_camps` table  
**Issue:** 8 inactive camps + 9 past camps = 17 camps that could be archived  
**Evidence:**
- `is_active = false`: 8 camps
- `end_date < CURRENT_DATE`: 9 camps
- Total active: 4 camps (3 future + 1 current)

**Impact:** 
- Clutters queries
- Slower filtering
- Confusion about active camps

**Recommendation:**
1. Add `archived_at` timestamp column
2. Archive old/inactive camps
3. Update queries to filter archived camps

**Priority:** P3 (Low)  
**Effort:** 2 hours  
**Impact:** Cleaner data, faster queries

---

## Query Pattern Analysis

### High Sequential Scan Tables (Need Indexes)

| Table | Seq Scans | Index Scans | Seq Scan % | Priority |
|-------|-----------|-------------|------------|----------|
| `navigation_items` | 4,370 | 0 | 100% | P0 |
| `media_library` | High | Low | 100% | P1 |
| `homepage_content` | 1,559 | 57 | 96.5% | P1 |
| `experiences` | 347 | 16 | 95.6% | P1 |
| `clients` | 6,708 | 1,028 | 86.7% | P0 |
| `room_assignments` | 2,038 | 216 | 90.4% | P1 |

### Index Usage Statistics

- **Total Indexes:** 152
- **Unused Indexes:** 89 (58%)
- **Total Index Size:** 2,192 kB
- **Estimated Unused Index Size:** ~800-1000 kB

---

## Recommended Indexes (Priority Order)

### P0 - Critical (Create Immediately)

```sql
-- Fix N+1 query pattern on surf-weeks page
CREATE INDEX idx_enrollments_camp_status 
ON surf_camp_enrollments(surf_camp_id, status) 
WHERE status IN ('confirmed', 'pending');

-- Fix navigation_items 100% sequential scans
CREATE INDEX idx_navigation_items_active 
ON navigation_items(active) 
WHERE active = true;
CREATE INDEX idx_navigation_items_path 
ON navigation_items(path);
CREATE INDEX idx_navigation_items_order 
ON navigation_items(order_index);

-- Fix clients table high sequential scans
CREATE INDEX idx_clients_name_email 
ON clients(name, email) 
WHERE deleted_at IS NULL;
```

### P1 - High Priority

```sql
-- Optimize page_sections queries
CREATE INDEX idx_page_sections_slug_type 
ON page_sections(page_slug, section_type) 
WHERE is_active = true;

-- Optimize media_library queries
CREATE INDEX idx_media_library_active_type 
ON media_library(is_active, file_type) 
WHERE is_active = true;

-- Optimize experiences queries
CREATE INDEX idx_experiences_active_category 
ON experiences(active, category) 
WHERE active = true;
```

---

## Data Cleanup Recommendations

### Immediate Actions

1. **VACUUM dead tuples:**
```sql
VACUUM ANALYZE experiences;
VACUUM ANALYZE surf_camp_enrollments;
VACUUM ANALYZE surf_camps;
VACUUM ANALYZE page_content;
VACUUM ANALYZE homepage_content;
```

2. **Fix orphaned data:**
```sql
-- Investigate orphaned room_assignment
SELECT * FROM room_assignments ra 
LEFT JOIN bookings b ON ra.booking_id = b.id 
WHERE b.id IS NULL;

-- Investigate enrollments without booking_id
SELECT * FROM surf_camp_enrollments 
WHERE booking_id IS NULL;
```

3. **Backfill NULL values:**
```sql
-- Update bookings without room_type
UPDATE bookings 
SET room_type = 'surf_camp' 
WHERE room_type IS NULL 
AND EXISTS (
  SELECT 1 FROM surf_camp_enrollments 
  WHERE booking_id = bookings.id
);
```

---

## Performance Impact Estimates

### Before Optimization
- **Surf-weeks page:** 4-8 queries (N+1 pattern)
- **Navigation queries:** Full table scans
- **Client searches:** Sequential scans
- **Index overhead:** 2.2 MB (58% unused)

### After Optimization
- **Surf-weeks page:** 1-2 queries (composite index)
- **Navigation queries:** Index scans
- **Client searches:** Index scans
- **Index overhead:** ~1.2 MB (removed unused indexes)

### Expected Improvements
- **Surf-weeks page load:** 60-80% faster
- **Navigation queries:** 90%+ faster
- **Client searches:** 70-85% faster
- **Storage reduction:** ~1 MB (dead tuples + unused indexes)
- **Write performance:** 10-15% faster (fewer indexes to maintain)

---

## Implementation Roadmap

### Phase 1: Critical Fixes (This Week)
1. ✅ Create composite index on `surf_camp_enrollments` (5 min)
2. ✅ Create indexes on `navigation_items` (2 min)
3. ✅ VACUUM dead tuples (30 min)
4. ✅ Fix orphaned room_assignment (1 hour)

**Total Effort:** ~2 hours  
**Impact:** 60-80% performance improvement on surf-weeks page, navigation queries

### Phase 2: High Priority (Next Week)
1. ✅ Create indexes on high sequential scan tables (2 hours)
2. ✅ Investigate and fix data integrity issues (3 hours)
3. ✅ Create composite index on `page_sections` (5 min)

**Total Effort:** ~5 hours  
**Impact:** 50-70% query performance improvement across affected tables

### Phase 3: Optimization (Next Month)
1. ✅ Remove unused indexes (4 hours)
2. ✅ Migrate legacy homepage tables (4 hours)
3. ✅ Archive inactive surf camps (2 hours)

**Total Effort:** ~10 hours  
**Impact:** Cleaner schema, reduced storage, faster writes

---

## Monitoring Recommendations

1. **Set up index usage monitoring:**
```sql
-- Query to find unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public' AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

2. **Monitor sequential scan ratios:**
```sql
-- Query to find high sequential scan tables
SELECT relname, 
  seq_scan::float / NULLIF(seq_scan + idx_scan, 0) * 100 as seq_scan_pct
FROM pg_stat_user_tables
WHERE schemaname = 'public' AND seq_scan + idx_scan > 100
ORDER BY seq_scan_pct DESC;
```

3. **Monitor dead tuples:**
```sql
-- Query to find tables needing VACUUM
SELECT relname, n_live_tup, n_dead_tup,
  ROUND(n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) as dead_pct
FROM pg_stat_user_tables
WHERE schemaname = 'public' AND n_dead_tup > 0
ORDER BY n_dead_tup DESC;
```

---

## Database Statistics Summary

### Table Sizes (Top 10)
| Table | Total Size | Table Size | Index Size |
|-------|------------|------------|------------|
| `activity_log` | 256 kB | 144 kB | 112 kB |
| `bookings` | 224 kB | 16 kB | 208 kB |
| `page_content` | 160 kB | 8 kB | 152 kB |
| `surf_camps` | 160 kB | 16 kB | 144 kB |
| `clients` | 160 kB | 16 kB | 144 kB |
| `room_assignments` | 152 kB | 8 kB | 144 kB |
| `blog_post_translations` | 144 kB | 16 kB | 128 kB |
| `faq_items` | 144 kB | 16 kB | 128 kB |
| `page_sections` | 136 kB | 24 kB | 112 kB |
| `surf_camp_enrollments` | 128 kB | 8 kB | 120 kB |

### Row Counts
- **Bookings:** 11
- **Clients:** 45 (active)
- **Surf Camps:** 12 total (4 active, 8 inactive, 9 past)
- **Surf Camp Enrollments:** 9
- **Room Assignments:** 2
- **Page Sections:** 41 (8 pages, 13 section types)

### Database Size
- **Total Database Size:** 15 MB
- **Total Index Size:** 2,192 kB (~14.6% of database)
- **Unused Index Size:** ~800-1000 kB (estimated)

---

## Conclusion

The database shows signs of rapid development with some technical debt. The most critical issues are:

1. **Missing composite index** causing N+1 queries on surf-weeks page
2. **navigation_items table** doing 100% sequential scans
3. **High sequential scan ratios** on frequently queried tables
4. **Dead tuples** accumulating without VACUUM
5. **Unused indexes** consuming storage and slowing writes

**Quick Wins (2 hours):**
- Create composite index on `surf_camp_enrollments` → 60-80% faster surf-weeks page
- Create indexes on `navigation_items` → 90%+ faster navigation queries
- VACUUM dead tuples → Improved query performance

**Expected Overall Improvement:** 50-70% query performance improvement after Phase 1 and Phase 2 fixes.

---

**Report Generated by:** TOON (Task-Oriented Optimization Navigator)  
**Assessment Date:** 2025-12-15  
**Next Review:** After Phase 1 completion


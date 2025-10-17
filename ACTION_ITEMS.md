# ACTION ITEMS - Fix Room Images from wavecampdashboard

## Problem Confirmed

**The database contains placeholder local file paths instead of Supabase storage URLs.**

### Evidence
```
Dorm room:  "/images/rooms/dorm.webp"     ← LOCAL FILE (wrong)
Room Nr 2:  "/images/rooms/room2.webp"     ← LOCAL FILE (wrong)
Room Nr 3:  "/images/rooms/room3.webp"     ← LOCAL FILE (wrong)
The Cave:   "https://zejrhceuuujzgyukdwnb.supabase.co/storage/v1/object/public/rooms/..." ← SUPABASE URL (correct!)
```

## Root Cause

One of these scenarios:
1. **Images were never uploaded** through wavecampdashboard admin
2. **Wrong bucket name** in ImageUpload component (`images` instead of `rooms`)
3. **Database was manually seeded** with placeholder paths

## Immediate Actions Required

### ACTION 1: Check Supabase Storage Buckets

```bash
# Check what buckets exist
cd /Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard
cat .env.local | grep SUPABASE
```

Then go to Supabase dashboard → Storage → Check if both `images` and `rooms` buckets exist.

### ACTION 2: Fix Bucket Name Issue

The ImageUpload component uses `bucketName = 'images'` (line 34) but "The Cave" URL shows `/rooms/` bucket.

**Check rooms page to see which bucket it's configured to use:**

```bash
grep -n "ImageUpload" /Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard/src/app/admin/rooms/page.tsx | head -5
```

**Expected configuration:**
```typescript
<ImageUpload
  storagePath="rooms"
  bucketName="rooms"  ← Should be "rooms" not "images"
  ...
/>
```

### ACTION 3: Verify Room Edit Form

Check how the rooms admin page uses ImageUpload:

1. Start wavecampdashboard: `cd /Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard && npm run dev`
2. Open admin: `http://localhost:3006/admin/rooms` (or whatever port)
3. Try editing "Dorm room"
4. Try uploading an image
5. Check if it saves to Supabase storage
6. Check what URL gets saved to database

### ACTION 4: Manual Fix (If Needed)

If images exist in Supabase but database has wrong paths:

1. Go to Supabase dashboard → Storage → rooms bucket
2. Check if room images exist
3. If yes, copy the public URLs
4. Update database manually:

```sql
-- Example for Dorm room
UPDATE rooms
SET images = ARRAY['https://zejrhceuuujzgyukdwnb.supabase.co/storage/v1/object/public/rooms/YOUR_IMAGE_PATH.jpg']
WHERE name = 'Dorm room';
```

### ACTION 5: Upload Images if Missing

If no images exist in Supabase storage:

1. Get actual room photos
2. Use wavecampdashboard admin to upload them
3. OR upload directly to Supabase storage
4. Update database with correct URLs

## How to Verify Fix

After fixing, check:

```bash
# Test API
curl -s http://localhost:3001/api/rooms | jq '.data.rooms[] | {name: .name, image: .images[0]}'
```

**Expected output** (ALL with Supabase URLs):
```json
{
  "name": "Dorm room",
  "image": "https://zejrhceuuujzgyukdwnb.supabase.co/storage/v1/object/public/rooms/..."
}
{
  "name": "Room Nr 2",
  "image": "https://zejrhceuuujzgyukdwnb.supabase.co/storage/v1/object/public/rooms/..."
}
```

## Next Steps

1. **FIRST**: Check wavecampdashboard admin - does it have image upload working?
2. **SECOND**: Check Supabase storage - do room images exist?
3. **THIRD**: Fix bucket name if wrong
4. **FOURTH**: Upload missing images
5. **FIFTH**: Verify heiwa-page displays them correctly

## Files to Check

1. `/Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard/src/app/admin/rooms/page.tsx` - Room admin page
2. `/Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard/src/components/ui/image-upload.tsx` - Upload component
3. `/Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard/src/lib/supabase-storage.ts` - Storage helper functions

## Important Notes

- **heiwa-page code is working correctly** - it displays whatever URLs are in the database
- The problem is in wavecampdashboard admin OR the database data itself
- "The Cave" room proves the system works when proper URLs are used
- Focus on wavecampdashboard, not heiwa-page

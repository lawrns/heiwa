# Production Issues Fixed

## Summary

After analyzing the production site (`heiwahouse.netlify.app`) using curl/grep testing, the following issues were identified and fixed:

---

## Issues Found

### 1. API Routes Returning 401 "Authentication failed"
**Endpoints affected:** `/api/rooms`, `/api/add-ons`, `/api/surf-camps`

**Root Cause:** The `SUPABASE_SERVICE_ROLE_KEY` is likely not set in Netlify environment variables. Without this key, the admin client falls back to using the anon key, which is subject to Row Level Security (RLS) policies. Since the tables require authentication for access, the requests fail.

**Fix Applied:**
- Updated API routes to consistently use `supabaseAdmin` client
- Enhanced error logging in `lib/supabase.ts` to clearly indicate when service role key is missing
- Changed availability endpoint from `supabase` to `supabaseAdmin`
- Changed add-ons endpoint to always use `supabaseAdmin` for public read operations

**Action Required:**
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add `SUPABASE_SERVICE_ROLE_KEY` with your Supabase service role key
3. Redeploy the site

### 2. API Routes Returning 404 HTML Pages
**Endpoints affected:** `/api/availability`, `/api/contact`, `/api/debug`, `/api/google-reviews`, `/api/blog/posts`, `/api/rooms/availability`

**Root Cause:** The build ID was hardcoded to a static value (`'2025-11-09-16-24-critical-fixes'`), causing Netlify to potentially serve cached builds. New deployments weren't creating fresh builds.

**Fix Applied:**
- Changed `generateBuildId` in `next.config.js` to use dynamic timestamps: `build-${Date.now()}`
- This ensures each deployment creates a unique build

**Action Required:**
1. Push these code changes to trigger a fresh deployment
2. The new deployment will include all API routes

### 3. Missing Rate Limiter
**Issue:** Documentation mentioned rate limiting but `lib/rate-limiter.ts` didn't exist.

**Fix Applied:**
Created `lib/rate-limiter.ts` with:
- In-memory rate limiting (suitable for serverless)
- Preset limiters for common use cases:
  - `api`: 100 requests/minute (general API)
  - `auth`: 5 attempts/15 minutes (login)
  - `form`: 3 submissions/hour (contact forms)
  - `booking`: 10 requests/hour (booking creation)
  - `search`: 30 requests/minute (availability checks)
- Helper functions: `getClientIP()`, `createRateLimitHeaders()`

### 4. Brute Force Protection
**Issue:** Admin login endpoint had no rate limiting.

**Fix Applied:**
- Added rate limiting to `/api/admin/login` (5 attempts per 15 minutes)
- Added rate limiting to `/api/contact` (3 submissions per hour)
- Returns 429 status with `Retry-After` header when limit exceeded

---

## Files Changed

1. `app/api/availability/route.ts` - Use `supabaseAdmin`, add CORS headers
2. `app/api/add-ons/route.ts` - Use `supabaseAdmin` for all requests
3. `app/api/admin/login/route.ts` - Add rate limiting
4. `app/api/contact/route.ts` - Add rate limiting
5. `lib/supabase.ts` - Improved error messages for missing service role key
6. `lib/rate-limiter.ts` - NEW: Rate limiting implementation
7. `next.config.js` - Dynamic build ID generation

---

## Verification Steps

After deploying these fixes:

```bash
# Test rooms endpoint (should return JSON with room data)
curl -s https://heiwahouse.netlify.app/api/rooms | jq .

# Test availability endpoint (should return JSON, not 404)
curl -s "https://heiwahouse.netlify.app/api/availability?roomId=123&checkIn=2025-02-01&checkOut=2025-02-05"

# Test admin login rate limiting
curl -s -X POST https://heiwahouse.netlify.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"wrong"}' | jq .
# After 5 attempts, should return 429 Too Many Requests

# Test contact form
curl -s -X POST https://heiwahouse.netlify.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","subject":"Test","message":"Hello"}'
```

---

## Required Netlify Environment Variables

Ensure these are set in Netlify:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) | **CRITICAL** |
| `ADMIN_PASSWORD` | Admin panel password | Yes |
| `GOOGLE_PLACES_API_KEY` | Google reviews API key | Optional |

---

## Notes

- The rate limiter uses in-memory storage which resets on serverless function cold starts
- For production-grade rate limiting, consider using Redis or Upstash
- The 401 errors will persist until `SUPABASE_SERVICE_ROLE_KEY` is properly configured in Netlify


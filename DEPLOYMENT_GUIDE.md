# Heiwa House Deployment & Architecture Guide

## 🏗️ Current Architecture

### Two Separate Applications:
1. **heiwa-page** (Main Website) - Port 3005
   - Public-facing website with rooms, surf weeks, booking widget
   - Built with Next.js 15
   - Fetches data directly from Supabase

2. **wavecampdashboard** (Admin System) - Port 3002
   - Admin dashboard for managing rooms, bookings, pricing
   - Built with Next.js
   - Protected with authentication
   - Stores data in Supabase

### Shared Database:
Both applications connect to the **SAME Supabase instance**:
- URL: `https://zejrhceuuujzgyukdwnb.supabase.co`
- Tables: `rooms`, `bookings`, `surf_weeks`, etc.

## 📊 How Data Flows

```
┌──────────────────────────────────────────────────────────────┐
│                     SUPABASE DATABASE                         │
│  (zejrhceuuujzgyukdwnb.supabase.co)                         │
│                                                               │
│  Tables: rooms, bookings, surf_weeks, add_ons, etc.          │
└───────────────────┬─────────────────┬────────────────────────┘
                    │                 │
                    │                 │
         ┌──────────▼─────────┐  ┌───▼──────────────────┐
         │  wavecampdashboard │  │     heiwa-page       │
         │  (Admin - 3002)    │  │  (Public - 3005)     │
         │                    │  │                      │
         │  • Manage Rooms    │  │  • Display Rooms     │
         │  • Set Prices      │  │  • Booking Widget    │
         │  • View Bookings   │  │  • Show Availability │
         │  • Upload Photos   │  │                      │
         └────────────────────┘  └──────────────────────┘
```

## 🚀 Vercel Deployment Plan

### Option 1: Two Separate Vercel Projects (Recommended)

#### Project 1: heiwa-page (Public Website)
```bash
# Deploy to Vercel
vercel --prod

# Environment Variables in Vercel Dashboard:
NEXT_PUBLIC_SUPABASE_URL=https://zejrhceuuujzgyukdwnb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Custom Domain:** `heiwahouse.com`

#### Project 2: wavecampdashboard (Admin)
```bash
# Deploy to Vercel from wavecampdashboard directory
vercel --prod

# Environment Variables in Vercel Dashboard:
NEXT_PUBLIC_SUPABASE_URL=https://zejrhceuuujzgyukdwnb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXTAUTH_URL=https://admin.heiwahouse.com
NEXTAUTH_SECRET=<generate-secure-secret>
```

**Custom Domain:** `admin.heiwahouse.com` or `dashboard.heiwahouse.com`

### How Bookings Flow:

```
User fills booking widget on heiwahouse.com
           ↓
Booking widget calls /api/bookings (heiwa-page)
           ↓
Next.js API route writes to Supabase `bookings` table
           ↓
Admin opens admin.heiwahouse.com
           ↓
Dashboard fetches bookings from Supabase
           ↓
Admin can view/manage/confirm bookings
```

## 🔧 Current Issues & Fixes

### Issue 1: Room Images Not Showing
**Problem:** The booking widget expects `featured_image` field but Supabase stores `images` array

**Root Cause:**
- Admin dashboard stores images as: `images: ["url1", "url2", "url3"]`
- Booking widget expects: `featured_image: "url"`

**Solution:** Update the API transformation in heiwa-page

### Issue 2: API Response Format Mismatch
**Problem:** The admin API requires authentication, but the public widget doesn't have auth

**Solution:** Create a public API endpoint in heiwa-page that fetches from Supabase

## 🎯 Critical Files That Need Updates

1. `/app/api/rooms/route.ts` - Already correct, fetches from Supabase
2. `/components/BookingWidget/hooks/useRooms.ts` - Needs to handle image arrays
3. `/lib/content.ts` - Already handles fallback images correctly

## 🔐 Security Considerations

### Public Website (heiwa-page):
- ✅ Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Limited permissions
- ✅ Can only READ rooms and WRITE bookings
- ✅ Cannot modify rooms or pricing

### Admin Dashboard (wavecampdashboard):
- ✅ Requires authentication (NextAuth)
- ✅ Uses `SUPABASE_SERVICE_ROLE_KEY` - Full permissions
- ✅ Can create/update/delete rooms
- ✅ Can manage all bookings

## 📋 Deployment Checklist

- [ ] Set up environment variables in Vercel for both projects
- [ ] Configure custom domains
- [ ] Set up Vercel environment variables
- [ ] Test booking widget on production
- [ ] Verify bookings appear in admin dashboard
- [ ] Set up monitoring/error tracking (e.g., Sentry)
- [ ] Configure CORS if needed
- [ ] Set up automatic deployments from git branches

## 🧪 Testing the Flow

1. **Test Booking Creation:**
   - Go to heiwahouse.com
   - Open booking widget
   - Fill in dates, guests, room
   - Submit booking
   - Check Supabase database for new booking

2. **Test Admin View:**
   - Go to admin.heiwahouse.com
   - Login
   - Navigate to bookings
   - Verify new booking appears

## 💡 Future Improvements

1. **Webhooks:** Add Supabase webhooks to notify admin of new bookings
2. **Email Notifications:** Send confirmation emails via SendGrid/Resend
3. **Payment Integration:** Add Stripe/Mollie for online payments
4. **Availability Caching:** Cache availability checks for better performance
5. **Image CDN:** Use Supabase Storage or Cloudinary for images

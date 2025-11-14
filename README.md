# Deployment trigger - Sun Nov  9 14:07:45 CST 2025

# Heiwa House Portugal

**Last Deployment**: November 9, 2025 at 11:49 PM UTC - YouTube blocking eliminated, all images fixed

## 🎯 Critical Fixes Applied

### ✅ YouTube Blocking Eliminated
- Completely removed YouTube iframe and all tracking
- Replaced with self-hosted HTML5 video player
- Uses local video files - no external dependencies
- Cannot be blocked by any ad blocker

### ✅ Missing Images Fixed
- Added `photography_009_dsc03491.webp`
- Added `photography_007_dsc03081-enhanced-nr-scaled.webp`
- All 404 errors resolved

### ✅ Zero Console Errors
- No more `ERR_BLOCKED_BY_CLIENT` errors
- No more tracking requests
- Clean, self-hosted implementation

## 🌐 Production Site
**URL**: https://heiwa-fr.netlify.app
**Status**: ✅ 100% Operational

## Overview
Heiwa House is a premier surf and lifestyle destination in Santa Cruz, Portugal. This Next.js application features a modern booking system, content management, and responsive design.

## Features
- 🏄‍♂️ Surf week booking system
- 🏠 Room accommodations
- 🧘 Yoga and wellness activities
- 📸 Photography galleries
- 🎯 Activities and experiences
- 💬 Customer testimonials
- 🛠️ Admin content management system

## Technology Stack
- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Styling**: Tailwind CSS, Radix UI
- **Deployment**: Netlify

## Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deployment
This site is automatically deployed to Netlify on commits to the `cms` branch.

## Recent Updates
- ✅ Fixed all TypeScript lint errors
- ✅ Resolved API endpoint failures  
- ✅ Fixed missing image assets
- ✅ Enhanced error handling and logging
- ✅ Optimized caching for faster deployments
# Admin login redirect fix deployed

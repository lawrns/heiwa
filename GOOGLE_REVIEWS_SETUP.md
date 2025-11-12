# Google Reviews Integration Setup

## Overview
The site has been updated to fetch and display real Google reviews from your Google Maps listing. The system is configured to use the Google Places API.

## Current Status
- ✅ All Google Maps links updated to: `https://maps.app.goo.gl/Vy9kZ3K7NcvcyTdB9`
- ✅ Google Reviews API route created at `/api/google-reviews`
- ✅ GoogleReviews component updated to fetch and display real reviews
- ✅ Fallback data configured (shows 5.0 rating with 73 reviews when API is not configured)
- ✅ Review count updated to 73 (from Google Maps)

## Required Configuration

### 1. Get Google Place ID
The Place ID from your Google Maps link needs to be extracted. From the URL `https://maps.app.goo.gl/Vy9kZ3K7NcvcyTdB9`, the Place ID appears to be in the format `0xd1f31962ec5f443:0x51e72f92caccf388`, but we need the standard Place ID format (`ChIJ...`).

**To get the Place ID:**
1. Visit: https://developers.google.com/maps/documentation/places/web-service/place-id
2. Use the Place ID Finder tool: https://developers.google.com/maps/documentation/places/web-service/place-id-finder
3. Enter your business name "Heiwa House" and location
4. Copy the Place ID (format: `ChIJ...`)

### 2. Get Google Places API Key
1. Go to: https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Enable the "Places API" (not "Places API (New)")
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key
6. (Optional but recommended) Restrict the API key to only the Places API

### 3. Set Environment Variables
Add these to your Netlify environment variables (and `.env.local` for local development):

```
GOOGLE_PLACES_API_KEY=your_api_key_here
GOOGLE_PLACE_ID=ChIJ...your_place_id_here
```

### 4. Deploy
After setting the environment variables in Netlify:
1. The site will automatically redeploy
2. Google reviews will start fetching from the API
3. Review count and individual reviews will update automatically

## Current Fallback Behavior
- If API key is not configured: Shows fallback data (5.0 rating, 73 reviews)
- If API fails: Shows fallback data with a message
- If reviews are empty: Shows rating summary with link to Google Maps

## Files Modified
- `app/api/google-reviews/route.ts` - API route for fetching reviews
- `components/ui/google-reviews.tsx` - Component for displaying reviews
- `app/surf-weeks/page.tsx` - Updated to use GoogleReviews component
- `app/page.tsx` - Updated Google Maps links
- All Google Maps links updated to use the correct short link

## Testing
Once configured, the reviews will:
- Display the current rating (currently 5.0)
- Show the current review count (currently 73)
- Display up to 4 individual reviews on the surf weeks page
- Update automatically as new reviews are added

## Notes
- The Google Places API returns up to 5 reviews per request
- Reviews are cached client-side to reduce API calls
- The API has rate limits (check Google Cloud Console for your quota)


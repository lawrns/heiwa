# Google Places API Setup Guide

## ✅ Environment Variables Set

I've set the following environment variables in Netlify:

- `GOOGLE_PLACES_API_KEY`: AIzaSyDwGcJTQyksscr05_iz7JfXCRK_RBF75t8
- `GOOGLE_PLACE_ID`: ChIJQ_TFLpYxHw0RiPPMypIv51E

## ⚠️ Important: Enable Places API

**You have a Google Maps API key, but you need to enable the Places API separately.**

### Steps to Enable Places API:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Navigate to **APIs & Services** → **Library**
4. Search for **"Places API"** (not "Places API (New)")
5. Click **Enable**
6. Make sure your API key has access to Places API

### Verify API Key Permissions:

1. Go to **APIs & Services** → **Credentials**
2. Click on your API key: `AIzaSyDwGcJTQyksscr05_iz7JfXCRK_RBF75t8`
3. Under **API restrictions**, ensure **Places API** is enabled
4. Or set to **Don't restrict key** (less secure but easier for testing)

### Test the API:

After enabling Places API, test it:

```bash
curl "https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJQ_TFLpYxHw0RiPPMypIv51E&fields=rating,user_ratings_total,reviews&key=AIzaSyDwGcJTQyksscr05_iz7JfXCRK_RBF75t8"
```

You should get a response with reviews data.

## 📝 Notes

- **Maps API** and **Places API** are separate services
- Your API key can access multiple APIs
- You need to enable each API you want to use
- The Places API is what fetches reviews from Google Maps

## 🔍 Current Status

- ✅ Environment variables set in Netlify
- ⚠️ Need to enable Places API in Google Cloud Console
- ⚠️ Need to verify Place ID is correct for Heiwa House


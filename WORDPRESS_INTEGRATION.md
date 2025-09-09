# WordPress Integration Setup Guide

## Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
# WordPress Integration API Key
WORDPRESS_API_KEY=heiwa_wp_your_secure_api_key_here
```

### Generating a Secure API Key

You can generate a secure API key using Node.js:

```javascript
// Generate a secure API key
const crypto = require('crypto');
const apiKey = `heiwa_wp_${crypto.randomBytes(32).toString('hex')}`;
console.log('WordPress API Key:', apiKey);
```

Or use an online generator and prefix with `heiwa_wp_` for identification.

## WordPress API Endpoints

The following endpoints have been created for WordPress integration:

### 1. Test Connection
- **Endpoint:** `GET /api/wordpress/test`
- **Purpose:** Test connectivity and API key validation
- **Headers:** `X-Heiwa-API-Key: your_api_key`

### 2. Get Surf Camps
- **Endpoint:** `GET /api/wordpress/surf-camps`
- **Purpose:** Retrieve active surf camps for widget display
- **Headers:** `X-Heiwa-API-Key: your_api_key`
- **Query Params:**
  - `location` (optional): Filter by location
  - `level` (optional): Filter by skill level

### 3. Check Availability
- **Endpoint:** `GET /api/wordpress/availability`
- **Purpose:** Check real-time availability and pricing
- **Headers:** `X-Heiwa-API-Key: your_api_key`
- **Query Params:**
  - `camp_id` (required): Surf camp ID
  - `start_date` (required): Check-in date (ISO format)
  - `end_date` (required): Check-out date (ISO format)
  - `participants` (optional): Number of participants (default: 1)

### 4. Create Booking
- **Endpoint:** `POST /api/wordpress/bookings`
- **Purpose:** Create new booking from WordPress widget
- **Headers:** `X-Heiwa-API-Key: your_api_key`
- **Body:** JSON with booking data

## API Authentication

All WordPress API endpoints require the `X-Heiwa-API-Key` header with a valid API key.

### Security Features:
- API key validation against environment variable
- CORS headers for cross-origin requests
- Rate limiting (to be implemented)
- Request logging for monitoring

## Booking Data Structure

WordPress bookings will include a `source: 'wordpress'` field for tracking and filtering in the admin dashboard.

### Example WordPress Booking Payload:
```json
{
  "camp_id": "uuid-of-surf-camp",
  "participants": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "surf_level": "beginner"
    }
  ],
  "special_requests": "Vegetarian meals",
  "source_url": "https://client-website.com/booking-page",
  "utm_source": "google",
  "utm_campaign": "summer_2024"
}
```

## Testing the API

### Using curl:

```bash
# Test connection
curl -H "X-Heiwa-API-Key: your_api_key" \
  https://your-heiwa-app.vercel.app/api/wordpress/test

# Get surf camps
curl -H "X-Heiwa-API-Key: your_api_key" \
  https://your-heiwa-app.vercel.app/api/wordpress/surf-camps

# Check availability
curl -H "X-Heiwa-API-Key: your_api_key" \
  "https://your-heiwa-app.vercel.app/api/wordpress/availability?camp_id=uuid&start_date=2024-06-01&end_date=2024-06-07&participants=2"
```

## Next Steps

1. Add the `WORDPRESS_API_KEY` to your environment variables
2. Deploy the updated backend with the new API endpoints
3. Test the API endpoints using the examples above
4. Create the WordPress plugin to consume these endpoints

## Admin Dashboard Integration

WordPress bookings will appear in your existing Heiwa admin dashboard with:
- Source field showing "wordpress"
- Notes indicating the WordPress site URL
- Participant information from the widget form
- Payment status tracking

You can filter bookings by source to see only WordPress-generated bookings.

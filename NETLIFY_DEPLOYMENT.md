# Netlify Deployment Configuration

## 🚨 CRITICAL: Environment Variables Setup

The WordPress surf-camps API endpoint requires specific environment variables to be configured in Netlify for production deployment.

### Required Environment Variables

Configure these in **Netlify Site Settings > Environment Variables**:

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://zejrhceuuujzgyukdwnb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNDgwOSwiZXhwIjoyMDcyNjgwODA5fQ.RbzOLzCaOAsgaMixdACMLdPvLZjU9MPfXn8Y90gsxcc

# WordPress Integration (REQUIRED)
WORDPRESS_API_KEY=heiwa_wp_test_key_2024_secure_deployment

# Optional but Recommended
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDQ4MDksImV4cCI6MjA3MjY4MDgwOX0.yIqpTz-OTqcaL5h7GIzoBmRezoJD-MC2yPTpxvo-aNA
NEXT_PUBLIC_APP_URL=https://heiwahouse.netlify.app
```

## 🔧 Netlify Configuration Steps

### 1. Access Environment Variables
1. Go to your Netlify dashboard
2. Select your site (heiwahouse)
3. Navigate to **Site Settings**
4. Click **Environment Variables** in the left sidebar

### 2. Add Required Variables
For each environment variable above:
1. Click **Add a variable**
2. Enter the **Key** (e.g., `SUPABASE_SERVICE_ROLE_KEY`)
3. Enter the **Value** (the actual key/URL)
4. Select **All scopes** (or specific deploy contexts if needed)
5. Click **Create variable**

### 3. Redeploy Site
After adding all environment variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** > **Deploy site**
3. Wait for deployment to complete

## 🧪 Testing Production Deployment

### Debug Endpoint
Test the debug endpoint to verify environment variables:
```bash
curl -H "X-Heiwa-API-Key: heiwa_wp_test_key_2024_secure_deployment" \
  https://heiwahouse.netlify.app/api/debug/surf-camps
```

Expected response should show:
```json
{
  "success": true,
  "debug": {
    "environment": {
      "NEXT_PUBLIC_SUPABASE_URL": true,
      "SUPABASE_SERVICE_ROLE_KEY": true,
      "WORDPRESS_API_KEY": true
    },
    "supabase": {
      "canCreate": true,
      "querySuccess": true
    }
  }
}
```

### WordPress API Endpoint
Test the actual WordPress API:
```bash
curl -H "X-Heiwa-API-Key: heiwa_wp_test_key_2024_secure_deployment" \
  https://heiwahouse.netlify.app/api/wordpress/surf-camps
```

Expected response:
```json
{
  "success": true,
  "data": {
    "surf_camps": [...],
    "total_count": 3
  }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check environment variables are set correctly
   - Verify Supabase keys are valid
   - Check debug endpoint for detailed error info

2. **Missing Environment Variables**
   - Ensure all required variables are added to Netlify
   - Redeploy after adding variables
   - Check variable names match exactly (case-sensitive)

3. **Supabase Connection Issues**
   - Verify SUPABASE_SERVICE_ROLE_KEY is the service role key, not anon key
   - Check Supabase project is active and accessible
   - Ensure database has required tables (surf_camps, bookings, rooms)

### Debug Commands
```bash
# Check environment variables
curl https://heiwahouse.netlify.app/api/debug/surf-camps

# Test with API key
curl -H "X-Heiwa-API-Key: heiwa_wp_test_key_2024_secure_deployment" \
  https://heiwahouse.netlify.app/api/debug/surf-camps

# Test WordPress API
curl -H "X-Heiwa-API-Key: heiwa_wp_test_key_2024_secure_deployment" \
  https://heiwahouse.netlify.app/api/wordpress/surf-camps
```

## 📋 Deployment Checklist

- [ ] Environment variables added to Netlify
- [ ] Site redeployed after adding variables
- [ ] Debug endpoint returns success
- [ ] WordPress API endpoint returns surf camps data
- [ ] CORS headers working for cross-origin requests
- [ ] API key authentication working

## 🔗 Related Files

- `/src/app/api/wordpress/surf-camps/route.ts` - Main WordPress API endpoint
- `/src/app/api/debug/surf-camps/route.ts` - Debug endpoint for troubleshooting
- `/.env.local` - Local environment variables (not deployed)

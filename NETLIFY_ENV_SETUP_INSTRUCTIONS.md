# Netlify Environment Variables Setup

## Required Environment Variables

The following environment variables need to be set in Netlify for the site to work correctly:

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://zejrhceuuujzgyukdwnb.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDQ4MDksImV4cCI6MjA3MjY4MDgwOX0.yIqpTz-OTqcaL5h7GIzoBmRezoJD-MC2yPTpxvo-aNA
```

### 3. SUPABASE_SERVICE_ROLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNDgwOSwiZXhwIjoyMDcyNjgwODA5fQ.RbzOLzCaOAsgaMixdACMLdPvLZjU9MPfXn8Y90gsxcc
```

## How to Set via Netlify Dashboard

1. Go to: https://app.netlify.com/projects/heiwahouse
2. Navigate to: **Site configuration** → **Environment variables**
3. Click **Add a variable** for each variable above
4. Set the **Scope** to **Production** (or **All scopes**)
5. After adding all variables, trigger a new deployment:
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Deploy site**

## Alternative: Use Netlify API

If you have a Netlify access token, you can use the API:

```bash
# Get your access token from: https://app.netlify.com/user/applications
export NETLIFY_AUTH_TOKEN="your-token-here"
export SITE_ID="8cc7d7cd-e32d-4aa4-af5a-7694c0f4d7ad"

# Set NEXT_PUBLIC_SUPABASE_URL
curl -X POST "https://api.netlify.com/api/v1/sites/$SITE_ID/env" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "NEXT_PUBLIC_SUPABASE_URL",
    "values": [{
      "value": "https://zejrhceuuujzgyukdwnb.supabase.co",
      "context": "production"
    }]
  }'

# Set NEXT_PUBLIC_SUPABASE_ANON_KEY
curl -X POST "https://api.netlify.com/api/v1/sites/$SITE_ID/env" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "values": [{
      "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDQ4MDksImV4cCI6MjA3MjY4MDgwOX0.yIqpTz-OTqcaL5h7GIzoBmRezoJD-MC2yPTpxvo-aNA",
      "context": "production"
    }]
  }'

# Set SUPABASE_SERVICE_ROLE_KEY
curl -X POST "https://api.netlify.com/api/v1/sites/$SITE_ID/env" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "SUPABASE_SERVICE_ROLE_KEY",
    "values": [{
      "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNDgwOSwiZXhwIjoyMDcyNjgwODA5fQ.RbzOLzCaOAsgaMixdACMLdPvLZjU9MPfXn8Y90gsxcc",
      "context": "production"
    }]
  }'
```

## Verification

After setting the variables and deploying:
1. Check browser console - should NOT see "supabaseKey is required" errors
2. Verify site loads correctly
3. Test admin panel functionality
4. Check that database connections work


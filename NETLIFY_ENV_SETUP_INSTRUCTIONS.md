# Netlify Environment Variables Setup

## Required Environment Variables

The following environment variables need to be set in Netlify for the site to work correctly:

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://pguipwhrxdzzrndbluxb.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjU4ODUsImV4cCI6MjA3ODQ0MTg4NX0.9Kq4rka92XmoJj_BWu4eEYvbhaasljZX6yTp8FMof7o
```

### 3. SUPABASE_SERVICE_ROLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA
```

### 4. DATABASE_URL
```
postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres
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
      "value": "https://pguipwhrxdzzrndbluxb.supabase.co",
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
      "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjU4ODUsImV4cCI6MjA3ODQ0MTg4NX0.9Kq4rka92XmoJj_BWu4eEYvbhaasljZX6yTp8FMof7o",
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
      "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA",
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


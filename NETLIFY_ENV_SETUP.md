# Netlify Environment Variables Setup

## 🔧 Required Environment Variables

Go to **Netlify Dashboard** → **Site Settings** → **Environment Variables** and ensure these are set:

### Supabase Configuration

```
NEXT_PUBLIC_SUPABASE_URL=https://pguipwhrxdzzrndbluxb.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjU4ODUsImV4cCI6MjA3ODQ0MTg4NX0.9Kq4rka92XmoJj_BWu4eEYvbhaasljZX6yTp8FMof7o
```

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA
```

### ⚠️ CRITICAL: Verify Supabase URL

**The URL MUST be `pguipwhrxdzzrndbluxb` (NOT `zejrhceuuujzgyukdwnb`)**

If it's set to the old project, images will break. The code now handles URL conversion, but it's better to use the correct project.

## 📋 Setup Steps

1. **Go to Netlify Dashboard**: https://app.netlify.com/
2. **Select your site**: `heiwahauz`
3. **Go to**: Site Settings → Environment Variables
4. **Verify/Update** each variable above
5. **Save** changes
6. **Trigger Redeploy**: Deploys → Trigger deploy → Deploy site

## ✅ Verification

After deployment, check:
- [ ] Site loads without errors
- [ ] Room images display correctly
- [ ] No GoTrueClient warnings in console
- [ ] APIs return 200 (not 500/400)

## 🔍 Troubleshooting

**If images still broken**:
- Check browser console for 400 errors
- Verify image URLs in database point to correct Supabase project
- Check Netlify build logs for environment variable issues

**If APIs still failing**:
- Check Netlify build logs
- Verify service role key is correct
- Check database RLS policies


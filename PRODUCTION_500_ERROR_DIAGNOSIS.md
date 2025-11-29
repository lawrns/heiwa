# 🔴 Production 500 Error Diagnosis - Rooms API

## Issue
**Error**: `HTTP error! status: 500` when loading rooms in booking widget  
**Location**: Production site (innovation branch deployment)  
**API Endpoint**: `/api/rooms`

---

## Root Cause Analysis

The `/api/rooms` endpoint uses `supabaseAdmin` which requires:
1. ✅ `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
2. ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key (admin access)

**Most Likely Cause**: Missing or incorrect environment variables in Netlify production environment.

---

## ✅ Quick Fix Checklist

### Step 1: Verify Netlify Environment Variables

Go to: **Netlify Dashboard** → **Site Settings** → **Environment Variables**

**Required Variables** (must be set for **Production** scope):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://pguipwhrxdzzrndbluxb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA
DATABASE_URL=postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres
```

### Step 2: Check Branch-Specific Variables

If Netlify is deploying from `innovation` branch:
- Ensure variables are set for **"Production"** scope (not just "Branch deploys")
- OR set variables specifically for `innovation` branch

### Step 3: Trigger Redeploy

After updating environment variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete (2-5 minutes)

---

## 🔍 Diagnostic Steps

### 1. Check Netlify Build Logs

Go to: **Netlify Dashboard** → **Deploys** → **Latest deploy** → **Build log**

**Look for**:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` is set
- ✅ `SUPABASE_SERVICE_ROLE_KEY` is set
- ❌ Any errors about missing environment variables
- ❌ Any Supabase connection errors

### 2. Test API Endpoint Directly

After deployment, test the endpoint:

```bash
# Test production API
curl https://your-site.netlify.app/api/rooms

# Should return:
# {"success":true,"data":{"rooms":[...]}}
# NOT: {"success":false,"error":"..."}
```

### 3. Check Browser Console

In production site, open browser DevTools → Console:
- Look for Supabase connection errors
- Look for API fetch errors
- Check Network tab for `/api/rooms` request details

---

## 🛠️ Code Improvements Made

### Enhanced Error Handling

Updated `/api/rooms/route.ts` to provide better error messages:

```typescript
// Now catches and logs specific Supabase errors
if (roomsError) {
  console.error('Error fetching rooms:', roomsError)
  return NextResponse.json({
    success: false,
    error: 'Failed to fetch rooms',
    details: process.env.NODE_ENV === 'development' ? roomsError.message : undefined
  }, { status: 500 })
}
```

### Better Error Messages in Frontend

The booking widget now shows:
- Clear error message: "Error loading rooms: HTTP error! status: 500"
- "Try Again" button to retry
- Error state properly handled

---

## 📋 Common Issues & Solutions

### Issue 1: Variables Not Set for Production Scope

**Symptom**: Works locally but fails in production  
**Solution**: Set variables with "Production" scope in Netlify

### Issue 2: Wrong Supabase Project URL

**Symptom**: 500 error, but variables are set  
**Solution**: Verify URL is `pguipwhrxdzzrndbluxb.supabase.co` (not `zejrhceuuujzgyukdwnb`)

### Issue 3: Service Role Key Expired or Invalid

**Symptom**: 500 error with authentication errors  
**Solution**: Regenerate service role key in Supabase Dashboard

### Issue 4: Database RLS Policies Blocking

**Symptom**: 500 error, but Supabase connection works  
**Solution**: Check RLS policies allow service role access

---

## ✅ Verification After Fix

After updating environment variables and redeploying:

1. **Test API Endpoint**:
   ```bash
   curl https://your-site.netlify.app/api/rooms
   ```
   Should return 200 OK with rooms data

2. **Test Booking Widget**:
   - Open booking widget on production site
   - Navigate to "Choose Your Room" step
   - Should load rooms without error

3. **Check Browser Console**:
   - No 500 errors
   - No Supabase connection errors
   - Rooms load successfully

---

## 🚨 If Still Failing

If the error persists after fixing environment variables:

1. **Check Netlify Function Logs**:
   - Go to Netlify Dashboard → Functions
   - Check for runtime errors

2. **Check Supabase Dashboard**:
   - Verify project is active
   - Check API logs for connection attempts
   - Verify service role key is valid

3. **Test Database Connection**:
   ```bash
   npm run test:db
   ```
   Should connect successfully

4. **Contact Support**:
   - Share Netlify build logs
   - Share browser console errors
   - Share API response details

---

## 📝 Notes

- **Branch Context**: If deploying from `innovation` branch, ensure variables are set for that branch context
- **Variable Scope**: Production variables apply to all production deploys regardless of branch
- **Redeploy Required**: Environment variable changes require a new deployment to take effect

---

**Last Updated**: 2025-01-XX  
**Status**: Diagnostic guide - Follow steps above to resolve


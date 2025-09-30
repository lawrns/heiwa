# Vercel Deployment Guide for Heiwa House

## 🎯 Deployment Strategy

You have **two separate applications** that need to be deployed:

1. **heiwa-page** (Main Public Website) → `heiwahouse.com`
2. **wavecampdashboard** (Admin Dashboard) → `admin.heiwahouse.com`

Both applications share the **same Supabase database**.

---

## 📦 Project 1: Main Website (heiwa-page)

### Step 1: Push to GitHub

```bash
cd /Users/lukatenbosch/Downloads/heiwahouse/heiwa-page

# Make sure you're on the correct branch
git branch

# Push your changes
git push origin 002-implement-hybrid-data

# Or if you want to deploy from main:
git checkout main
git merge 002-implement-hybrid-data
git push origin main
```

### Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New Project"**
3. **Import Git Repository**:
   - Select your GitHub repository for `heiwa-page`
   - Click "Import"

4. **Configure Project**:
   - **Project Name**: `heiwa-house` (or whatever you prefer)
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. **Environment Variables** (CRITICAL):
   Click "Environment Variables" and add these:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://zejrhceuuujzgyukdwnb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplamJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NzY3NzAsImV4cCI6MjA1MTE1Mjc3MH0.Ql8vYxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQ
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplamJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTU3Njc3MCwiZXhwIjoyMDUxMTUyNzcwfQ.SERVICE_ROLE_KEY_HERE
   ```

   **Note**: Get the actual keys from your `.env.local` file or Supabase dashboard.

6. **Click "Deploy"**

### Step 3: Configure Custom Domain

1. After deployment, go to **Project Settings** → **Domains**
2. **Add Domain**: `heiwahouse.com`
3. **Add Domain**: `www.heiwahouse.com` (optional, will redirect to main)
4. **Follow Vercel's DNS instructions**:
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add the DNS records Vercel provides:
     - **A Record**: `@` → Vercel's IP (e.g., `76.76.21.21`)
     - **CNAME**: `www` → `cname.vercel-dns.com`

5. **Wait for DNS propagation** (can take 5-60 minutes)

---

## 📦 Project 2: Admin Dashboard (wavecampdashboard)

### Step 1: Prepare the Repository

```bash
cd /Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard

# Make sure it's a git repository
git init  # if not already initialized
git add -A
git commit -m "Initial commit for admin dashboard"

# Create a GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/wavecampdashboard.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New Project"**
3. **Import Git Repository**:
   - Select your GitHub repository for `wavecampdashboard`
   - Click "Import"

4. **Configure Project**:
   - **Project Name**: `heiwa-admin` (or `wavecampdashboard`)
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. **Environment Variables**:
   Add the same Supabase credentials PLUS authentication secrets:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://zejrhceuuujzgyukdwnb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

   # NextAuth (if using authentication)
   NEXTAUTH_URL=https://admin.heiwahouse.com
   NEXTAUTH_SECRET=generate-a-secure-random-string-here

   # Generate NEXTAUTH_SECRET with:
   # openssl rand -base64 32
   ```

6. **Click "Deploy"**

### Step 3: Configure Custom Domain for Admin

1. After deployment, go to **Project Settings** → **Domains**
2. **Add Domain**: `admin.heiwahouse.com`
3. **Follow Vercel's DNS instructions**:
   - Go to your domain registrar
   - Add a **CNAME Record**:
     - **Name**: `admin`
     - **Value**: `cname.vercel-dns.com`

4. **Wait for DNS propagation**

---

## 🔐 Security Checklist

### For Main Website (heiwa-page):
- ✅ Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe for client-side)
- ✅ Use `SUPABASE_SERVICE_ROLE_KEY` only in API routes (server-side)
- ✅ Enable Row Level Security (RLS) on Supabase tables
- ✅ Never expose service role key in client-side code

### For Admin Dashboard (wavecampdashboard):
- ✅ Implement authentication (NextAuth, Supabase Auth, etc.)
- ✅ Protect all admin routes with middleware
- ✅ Use strong `NEXTAUTH_SECRET`
- ✅ Enable RLS policies that check user roles
- ✅ Consider IP whitelisting for extra security

---

## 🗄️ Database Configuration

Both apps use the **same Supabase instance**:
- **URL**: `https://zejrhceuuujzgyukdwnb.supabase.co`
- **Project**: `heiwa`

### Enable Row Level Security (RLS)

Go to Supabase Dashboard → Authentication → Policies

**Example RLS Policy for `rooms` table**:
```sql
-- Allow public read access
CREATE POLICY "Public can view rooms"
ON rooms FOR SELECT
TO public
USING (true);

-- Only authenticated users can modify
CREATE POLICY "Authenticated users can modify rooms"
ON rooms FOR ALL
TO authenticated
USING (auth.role() = 'authenticated');
```

---

## 🚀 Deployment Workflow

### For Future Updates:

**Main Website**:
```bash
cd heiwa-page
git add -A
git commit -m "Your changes"
git push origin main
# Vercel auto-deploys on push
```

**Admin Dashboard**:
```bash
cd wavecampdashboard
git add -A
git commit -m "Your changes"
git push origin main
# Vercel auto-deploys on push
```

---

## 📊 Final Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  USERS / BROWSERS                        │
└────────────┬────────────────────────┬────────────────────┘
             │                        │
             │                        │
    ┌────────▼────────┐      ┌───────▼──────────┐
    │ heiwahouse.com  │      │ admin.heiwahouse │
    │  (Public Site)  │      │   .com (Admin)   │
    │                 │      │                  │
    │  Vercel Deploy  │      │  Vercel Deploy   │
    │  heiwa-page     │      │  wavecampdash    │
    └────────┬────────┘      └───────┬──────────┘
             │                       │
             │                       │
             └───────────┬───────────┘
                         │
                ┌────────▼─────────┐
                │   SUPABASE DB    │
                │  zejrhceuuujz... │
                │                  │
                │  Tables:         │
                │  - rooms         │
                │  - bookings      │
                │  - surf_weeks    │
                │  - add_ons       │
                └──────────────────┘
```

---

## 🔧 Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly
- Try building locally: `npm run build`

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check Supabase project is active (not paused)
- Ensure RLS policies allow the operations you need

### Domain Not Working
- DNS can take up to 48 hours (usually 5-60 minutes)
- Use `dig heiwahouse.com` to check DNS propagation
- Verify DNS records match Vercel's requirements

### Admin Dashboard Not Secure
- Implement authentication middleware
- Check NEXTAUTH_SECRET is set
- Verify protected routes are actually protected

---

## 📝 Next Steps After Deployment

1. **Test the main site**: Visit `heiwahouse.com`
2. **Test the admin**: Visit `admin.heiwahouse.com`
3. **Test booking flow**: Make a test booking
4. **Verify admin can see bookings**: Check admin dashboard
5. **Set up monitoring**: Use Vercel Analytics
6. **Configure error tracking**: Consider Sentry integration
7. **Set up backups**: Supabase has automatic backups, but verify

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

Good luck with your deployment! 🚀
# Netlify Deployment Guide for Heiwa House

## 🎯 Deployment Strategy

You have **two separate applications** that need to be deployed:

1. **heiwa-page** (Main Public Website) → `heiwahouse.netlify.app`
2. **wavecampdashboard** (Admin Dashboard) → `heiwahouse.netlify.app/admin`

Both applications share the **same Supabase database**.

---

## 📦 Project 1: Main Website (heiwa-page)

### Step 1: Create netlify.toml Configuration

Create a `netlify.toml` file in the root of your `heiwa-page` project:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"

# Redirect all requests to Next.js
[[redirects]]
  from = "/*"
  to = "/.netlify/functions/___netlify-handler"
  status = 200
```

### Step 2: Push to GitHub

```bash
cd /Users/lukatenbosch/Downloads/heiwahouse/heiwa-page

# Add netlify.toml
git add netlify.toml
git commit -m "feat: add Netlify configuration"

# Push your changes
git push origin 002-implement-hybrid-data

# Or if deploying from main:
git checkout main
git merge 002-implement-hybrid-data
git push origin main
```

### Step 3: Deploy to Netlify

1. **Go to Netlify Dashboard**: https://app.netlify.com/
2. **Click "Add new site" → "Import an existing project"**
3. **Connect to Git Provider**:
   - Select GitHub
   - Authorize Netlify to access your repositories
   - Select your `heiwa-page` repository

4. **Configure Build Settings**:
   - **Branch to deploy**: `main` (or `002-implement-hybrid-data`)
   - **Build command**: `npm run build` (should auto-detect)
   - **Publish directory**: `.next` (should auto-detect)
   - **Functions directory**: `.netlify/functions` (auto-detect)

5. **Environment Variables** (CRITICAL):
   Click "Show advanced" → "New variable" and add these:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://zejrhceuuujzgyukdwnb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDQ4MDksImV4cCI6MjA3MjY4MDgwOX0.yIqpTz-OTqcaL5h7GIzoBmRezoJD-MC2yPTpxvo-aNA
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNDgwOSwiZXhwIjoyMDcyNjgwODA5fQ.RbzOLzCaOAsgaMixdACMLdPvLZjU9MPfXn8Y90gsxcc
   DATABASE_URL=postgresql://postgres:Hennie@@12Hennie@@12@db.zejrhceuuujzgyukdwnb.supabase.co:5432/postgres
   ```

6. **Click "Deploy site"**

### Step 4: Configure Custom Domain (Optional)

1. After deployment, go to **Site settings** → **Domain management**
2. **Add custom domain**: `heiwahouse.com`
3. **Follow Netlify's DNS instructions**:
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Update nameservers to Netlify's:
     - `dns1.p01.nsone.net`
     - `dns2.p01.nsone.net`
     - `dns3.p01.nsone.net`
     - `dns4.p01.nsone.net`
   
   OR add DNS records:
   - **A Record**: `@` → Netlify's load balancer IP
   - **CNAME**: `www` → `your-site.netlify.app`

4. **Enable HTTPS**: Netlify auto-provisions SSL certificates

---

## 📦 Project 2: Admin Dashboard (wavecampdashboard)

### Option A: Deploy as Separate Site (Recommended)

This gives you `admin.heiwahouse.com` or a separate Netlify URL.

#### Step 1: Create netlify.toml

Create `netlify.toml` in `wavecampdashboard` root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/___netlify-handler"
  status = 200
```

#### Step 2: Push to GitHub

```bash
cd /Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard

# Initialize git if needed
git init
git add -A
git commit -m "Initial commit for admin dashboard"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/wavecampdashboard.git
git branch -M main
git push -u origin main
```

#### Step 3: Deploy to Netlify

1. **Go to Netlify Dashboard**: https://app.netlify.com/
2. **Click "Add new site" → "Import an existing project"**
3. **Import `wavecampdashboard` repository**

4. **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://zejrhceuuujzgyukdwnb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDQ4MDksImV4cCI6MjA3MjY4MDgwOX0.yIqpTz-OTqcaL5h7GIzoBmRezoJD-MC2yPTpxvo-aNA
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNDgwOSwiZXhwIjoyMDcyNjgwODA5fQ.RbzOLzCaOAsgaMixdACMLdPvLZjU9MPfXn8Y90gsxcc
   DATABASE_URL=postgresql://postgres:Hennie@@12Hennie@@12@db.zejrhceuuujzgyukdwnb.supabase.co:5432/postgres
   
   # NextAuth Configuration
   NEXTAUTH_URL=https://heiwahouse.netlify.app/admin
   NEXTAUTH_SECRET=8f3d9e2a7b1c4f6e9d8a7b6c5e4f3d2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5
   ```

   **Note**: The `NEXTAUTH_SECRET` above is generated. Keep it secure!

5. **Click "Deploy site"**

#### Step 4: Configure Custom Domain for Admin

1. **Site settings** → **Domain management**
2. **Add domain**: `admin.heiwahouse.com`
3. **Add CNAME record** at your domain registrar:
   - **Name**: `admin`
   - **Value**: `your-admin-site.netlify.app`

---

### Option B: Deploy Admin at /admin Path (Current Setup)

If you want `heiwahouse.netlify.app/admin` to serve the admin dashboard:

#### Step 1: Modify Main Site's netlify.toml

Add proxy rules to redirect `/admin/*` to the admin site:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"

# Proxy /admin to admin dashboard
[[redirects]]
  from = "/admin/*"
  to = "https://your-admin-site.netlify.app/admin/:splat"
  status = 200
  force = true

# Main site handler
[[redirects]]
  from = "/*"
  to = "/.netlify/functions/___netlify-handler"
  status = 200
```

This requires deploying the admin dashboard as a separate Netlify site first, then proxying to it.

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
- ✅ Use strong `NEXTAUTH_SECRET` (generated above)
- ✅ Enable RLS policies that check user roles
- ✅ Consider IP whitelisting in Netlify settings

---

## 🗄️ Database Configuration

Both apps use the **same Supabase instance**:
- **URL**: `https://zejrhceuuujzgyukdwnb.supabase.co`
- **Database URL**: `postgresql://postgres:Hennie@@12Hennie@@12@db.zejrhceuuujzgyukdwnb.supabase.co:5432/postgres`
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
# Netlify auto-deploys on push
```

**Admin Dashboard**:
```bash
cd wavecampdashboard
git add -A
git commit -m "Your changes"
git push origin main
# Netlify auto-deploys on push
```

---

## 📊 Final Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  USERS / BROWSERS                        │
└────────────┬────────────────────────┬────────────────────┘
             │                        │
             │                        │
    ┌────────▼────────┐      ┌───────▼──────────────┐
    │ heiwahouse.com  │      │ admin.heiwahouse.com │
    │  (Public Site)  │      │   or /admin path     │
    │                 │      │                      │
    │ Netlify Deploy  │      │  Netlify Deploy      │
    │  heiwa-page     │      │  wavecampdashboard   │
    └────────┬────────┘      └───────┬──────────────┘
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

### Build Fails on Netlify
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly
- Try building locally: `npm run build`
- Check Node version matches (18+)

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check Supabase project is active (not paused)
- Ensure RLS policies allow the operations you need
- Test connection with `DATABASE_URL` in local environment

### Domain Not Working
- DNS can take up to 48 hours (usually 5-60 minutes)
- Use `dig heiwahouse.com` to check DNS propagation
- Verify DNS records match Netlify's requirements
- Check SSL certificate is provisioned (automatic on Netlify)

### Admin Dashboard Not Secure
- Implement authentication middleware
- Check `NEXTAUTH_SECRET` is set and secure
- Verify protected routes are actually protected
- Test authentication flow thoroughly

### Next.js Plugin Issues
- Ensure `@netlify/plugin-nextjs` is installed
- Check Netlify build logs for plugin errors
- Verify `netlify.toml` configuration is correct

---

## 📝 Quick Commands Reference

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Test Build Locally
```bash
npm run build
npm start
```

### Check Environment Variables
```bash
# In Netlify CLI
netlify env:list
```

### Deploy from CLI (Optional)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

## 🆘 Need Help?

- **Netlify Docs**: https://docs.netlify.com/
- **Netlify Next.js Plugin**: https://github.com/netlify/netlify-plugin-nextjs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## ✅ Deployment Checklist

### Before Deploying:
- [ ] Code is committed and pushed to GitHub
- [ ] `netlify.toml` is created and configured
- [ ] All environment variables are documented
- [ ] Build succeeds locally (`npm run build`)
- [ ] Database connection tested

### During Deployment:
- [ ] Repository connected to Netlify
- [ ] Build settings configured correctly
- [ ] Environment variables added to Netlify
- [ ] Build completes successfully
- [ ] Site preview works

### After Deployment:
- [ ] Test main site functionality
- [ ] Test admin dashboard access
- [ ] Verify booking flow works
- [ ] Check database operations
- [ ] Configure custom domain (if applicable)
- [ ] Enable HTTPS
- [ ] Set up monitoring/analytics

---

Good luck with your deployment! 🚀


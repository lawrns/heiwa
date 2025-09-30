# 🚀 Quick Deploy to Netlify

## ⚡ 5-Minute Setup

### 1. Push to GitHub
```bash
git push origin 002-implement-hybrid-data
# or
git checkout main
git merge 002-implement-hybrid-data
git push origin main
```

### 2. Deploy on Netlify

1. Go to https://app.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** and choose your `heiwa-page` repository
4. Netlify will auto-detect Next.js settings ✅

### 3. Add Environment Variables

In Netlify dashboard, go to **Site settings** → **Environment variables** → **Add a variable**

Copy and paste these **EXACTLY**:

```
NEXT_PUBLIC_SUPABASE_URL
https://zejrhceuuujzgyukdwnb.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDQ4MDksImV4cCI6MjA3MjY4MDgwOX0.yIqpTz-OTqcaL5h7GIzoBmRezoJD-MC2yPTpxvo-aNA

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNDgwOSwiZXhwIjoyMDcyNjgwODA5fQ.RbzOLzCaOAsgaMixdACMLdPvLZjU9MPfXn8Y90gsxcc

DATABASE_URL
postgresql://postgres:Hennie@@12Hennie@@12@db.zejrhceuuujzgyukdwnb.supabase.co:5432/postgres
```

### 4. Deploy!

Click **"Deploy site"** and wait ~2-3 minutes.

Your site will be live at: `https://your-site-name.netlify.app`

---

## 🔧 Admin Dashboard Setup

### For wavecampdashboard:

1. **Create `netlify.toml`** in wavecampdashboard root:
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

2. **Push to GitHub**:
   ```bash
   cd /path/to/wavecampdashboard
   git add netlify.toml
   git commit -m "Add Netlify config"
   git push origin main
   ```

3. **Deploy on Netlify** (same process as main site)

4. **Add Environment Variables**:
   - Same Supabase variables as above
   - **PLUS** these:
   ```
   NEXTAUTH_URL
   https://heiwahouse.netlify.app/admin
   
   NEXTAUTH_SECRET
   8f3d9e2a7b1c4f6e9d8a7b6c5e4f3d2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5
   ```

---

## 🎯 Custom Domain Setup (Optional)

### For heiwahouse.com:

1. In Netlify: **Site settings** → **Domain management** → **Add custom domain**
2. Enter: `heiwahouse.com`
3. In your domain registrar (GoDaddy, Namecheap, etc.):
   - **Option A**: Change nameservers to Netlify's:
     - `dns1.p01.nsone.net`
     - `dns2.p01.nsone.net`
     - `dns3.p01.nsone.net`
     - `dns4.p01.nsone.net`
   
   - **Option B**: Add DNS records:
     - **A Record**: `@` → Netlify's IP (shown in dashboard)
     - **CNAME**: `www` → `your-site.netlify.app`

4. Wait 5-60 minutes for DNS propagation
5. Netlify auto-provisions SSL certificate ✅

### For admin.heiwahouse.com:

1. Deploy admin dashboard as separate Netlify site
2. Add custom domain: `admin.heiwahouse.com`
3. Add **CNAME record** in domain registrar:
   - **Name**: `admin`
   - **Value**: `your-admin-site.netlify.app`

---

## ✅ Verification Checklist

After deployment, test these:

- [ ] Main site loads: `https://your-site.netlify.app`
- [ ] Rooms page works: `/rooms`
- [ ] Individual room pages load: `/rooms/[id]`
- [ ] Booking widget opens
- [ ] Surf weeks page loads: `/surf-weeks`
- [ ] Images load correctly
- [ ] No console errors
- [ ] Database connection works (rooms load from Supabase)

---

## 🆘 Common Issues

### Build Fails
- Check build logs in Netlify dashboard
- Verify all dependencies are in `package.json`
- Test locally: `npm run build`

### Environment Variables Not Working
- Make sure variable names are EXACT (case-sensitive)
- No quotes around values in Netlify UI
- Redeploy after adding variables

### Images Not Loading
- Check image paths are correct
- Verify images are in `/public` directory
- Check Next.js Image component configuration

### Database Connection Fails
- Verify Supabase URL and keys are correct
- Check Supabase project is not paused
- Test connection in local environment first

---

## 📚 Full Documentation

For detailed information, see:
- **NETLIFY_DEPLOYMENT_GUIDE.md** - Complete deployment guide
- **DEPLOYMENT_GUIDE.md** - Original Vercel guide (for reference)
- **.env.example** - Environment variable template

---

## 🎉 You're Done!

Your site should now be live on Netlify! 

**Next steps:**
1. Test all functionality
2. Set up custom domain (optional)
3. Configure admin dashboard
4. Set up monitoring/analytics
5. Celebrate! 🎊


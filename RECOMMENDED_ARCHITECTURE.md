# Recommended Architecture & Deployment Strategy

## 🎯 My Professional Recommendation: OPTION A (Separate Deployments)

After analyzing both systems, here's what I recommend:

## Proposed Setup

### 1. Customer-Facing Website (heiwa-page)
- **URL**: `https://heiwahouse.com` (main domain)
- **Netlify Site**: `heiwa-house-portugal.netlify.app` (current)
- **Purpose**: Customer website + booking widget
- **Content CMS**: Keep the lightweight `/admin` for content management only
- **What it manages**:
  - Navigation items
  - Room descriptions & images
  - Experiences/activities content
  - Static page content (About, The Spot, etc.)

### 2. Admin Dashboard (wavecampdashboard)
- **URL**: `https://admin.heiwahouse.com` (subdomain - RECOMMENDED)
  - OR: `https://dashboard.heiwahouse.com`
  - OR: `https://manage.heiwahouse.com`
- **Netlify Site**: `heiwahouse.netlify.app` (already deployed!)
- **Purpose**: Complete booking & operations management
- **Admin Path**: Keep as `/admin` (but on different domain)
- **What it manages**:
  - ALL bookings (rooms + surf weeks)
  - Customer/client database
  - Room inventory & pricing
  - Surf camp scheduling
  - Add-ons management
  - Financial reporting

### 3. Shared Infrastructure
- **Database**: Single Supabase instance (current setup)
- **Storage**: Shared Supabase storage for images
- **Authentication**: Supabase Auth (already configured)

## Why This Is The Best Approach

### ✅ Clear Separation of Concerns
- **Website team** manages content (navigation, descriptions, images)
- **Operations team** manages bookings, customers, scheduling
- No confusion about which system to use for what

### ✅ Better Security
- Admin dashboard on separate subdomain
- Can add extra security layers (IP restrictions, VPN, etc.)
- Compromised website doesn't expose booking system

### ✅ Independent Scaling
- Website can handle high traffic without affecting admin
- Admin can be resource-intensive without slowing customer site
- Deploy updates independently

### ✅ Simpler Than Unified API
- No need to refactor booking widget
- No CORS complications
- Both apps already working via shared database

### ✅ Future-Proof
- Easy to add more microservices later
- Can add mobile apps that connect to same database
- Can migrate to unified API later if needed

## Implementation Plan

### Phase 1: Deploy & Configure (IMMEDIATE)
```bash
# 1. Update wavecampdashboard deployment
cd /Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard
netlify link --name heiwahouse  # Link to existing deployment
netlify deploy --prod --build

# 2. Configure custom domain
# In Netlify dashboard for heiwahouse.netlify.app:
# - Domain settings → Add custom domain
# - Add: admin.heiwahouse.com
# - Configure DNS: CNAME admin → heiwahouse.netlify.app
```

### Phase 2: Update Documentation
- Update CMS documentation to clarify responsibilities
- Create admin onboarding guide
- Document the architecture clearly

### Phase 3: Remove Confusion
**Option A - Remove heiwa-page /admin** (RECOMMENDED)
- Remove the `/admin` CMS from heiwa-page entirely
- Direct all admin users to admin.heiwahouse.com
- Cleaner, less confusing

**Option B - Rename heiwa-page /admin**
- Rename to `/content-cms` or `/editor`
- Make it clear it's for content only, not bookings
- Keep for non-technical content editors

### Phase 4: Optimize Booking Flow
Since both use shared Supabase, the flow is already working:
```
Customer → Booking Widget → heiwa-page API → Supabase ← wavecampdashboard
```

Future enhancement (optional):
```
Customer → Booking Widget → wavecampdashboard API → Supabase
```

## Domain Configuration

### DNS Setup Needed:
```
# At your domain registrar (e.g., Cloudflare, Namecheap):

# Main website
heiwahouse.com           → CNAME → heiwa-house-portugal.netlify.app
www.heiwahouse.com       → CNAME → heiwa-house-portugal.netlify.app

# Admin dashboard
admin.heiwahouse.com     → CNAME → heiwahouse.netlify.app
```

### In Netlify:
1. **heiwa-house-portugal** site:
   - Add custom domain: `heiwahouse.com`
   - Add custom domain: `www.heiwahouse.com`

2. **heiwahouse** site (wavecampdashboard):
   - Add custom domain: `admin.heiwahouse.com`

## URL Structure (Final)

### Customer-Facing
- `heiwahouse.com` - Homepage
- `heiwahouse.com/rooms` - Room listings
- `heiwahouse.com/surf-weeks` - Surf camps
- `heiwahouse.com/booking` - Booking widget
- `heiwahouse.com/the-spot` - Experiences

### Admin Dashboard
- `admin.heiwahouse.com` - Dashboard login
- `admin.heiwahouse.com/admin` - Main dashboard
- `admin.heiwahouse.com/admin/bookings` - Bookings management
- `admin.heiwahouse.com/admin/rooms` - Rooms management
- `admin.heiwahouse.com/admin/clients` - Client database
- `admin.heiwahouse.com/admin/surf-camps` - Surf camps scheduling

### Optional Content CMS (if kept)
- `heiwahouse.com/content-editor` - Content management
  OR
- Just use wavecampdashboard for everything

## My Strong Recommendation

### DO THIS:
1. ✅ Deploy wavecampdashboard to `admin.heiwahouse.com`
2. ✅ REMOVE the `/admin` CMS from heiwa-page completely
3. ✅ Use wavecampdashboard for ALL admin operations
4. ✅ Keep heiwa-page as pure customer-facing website

### WHY:
- **Single source of truth** for admin operations
- **No confusion** about which admin to use
- **Wavecampdashboard is more complete** anyway
- **Cleaner architecture** - website vs admin
- **Easier to maintain** - one admin system

## Alternative (If You Need Content CMS)

If non-technical staff need to edit website content without full admin access:

### Keep Lightweight Content CMS:
- Rename heiwa-page `/admin` to `/editor` or `/content`
- Only manages: Navigation, Room descriptions, Experiences
- Remove any booking-related features
- Add role-based access (editor vs admin)

### Full Admin:
- Use `admin.heiwahouse.com` for operations team
- Manages: Bookings, clients, pricing, scheduling
- Full access to all systems

## Summary: Recommended Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  HEIWAHOUSE.COM                         │
│             (Customer-Facing Website)                   │
│                                                         │
│  • Homepage, Rooms, Surf Weeks                         │
│  • Booking Widget                                      │
│  • Content pages                                       │
│  • NO admin access (removed)                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Booking submissions
                 ↓
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE DATABASE                      │
│              (Single Source of Truth)                   │
│                                                         │
│  • Bookings      • Rooms        • Clients              │
│  • Surf Camps    • Add-ons      • Navigation           │
│  • Experiences   • Pages                               │
└────────────────┬────────────────────────────────────────┘
                 ↑
                 │ Full read/write access
                 │
┌─────────────────────────────────────────────────────────┐
│           ADMIN.HEIWAHOUSE.COM                          │
│          (Operations Dashboard)                         │
│                                                         │
│  • Booking management                                  │
│  • Client database                                     │
│  • Room pricing & inventory                            │
│  • Surf camp scheduling                                │
│  • Financial reporting                                 │
│  • Content management (optional)                       │
└─────────────────────────────────────────────────────────┘
```

## Next Steps

**IMMEDIATE:**
1. Deploy wavecampdashboard to admin.heiwahouse.com
2. Test that it can see current bookings
3. Remove heiwa-page /admin CMS

**SHORT TERM:**
4. Configure custom domains
5. Train admin staff on new dashboard
6. Document the system clearly

**FUTURE:**
7. Consider unified API if traffic grows
8. Add automated testing
9. Implement advanced features

## Cost Implications

- **Netlify Free Tier**: Covers both deployments
- **Supabase Free Tier**: Sufficient for current scale
- **Custom Domains**: Free (just DNS configuration)
- **Total Additional Cost**: $0/month

## My Vote: RECOMMENDED ✅

This architecture is:
- ✅ Clean and maintainable
- ✅ Secure and scalable
- ✅ Easy to understand
- ✅ No additional costs
- ✅ Works with existing code
- ✅ Future-proof

**Let's deploy wavecampdashboard to admin.heiwahouse.com and remove the heiwa-page /admin!**

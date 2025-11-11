# Admin Mock Data Inventory

**Date:** January 20, 2025  
**Status:** 🔴 **CRITICAL** - Mock data found in production admin section

## Executive Summary

Multiple admin pages are using hardcoded mock data instead of fetching from the database. This means:
- Admin users see fake/demo data instead of real data
- Changes made through admin interface may not persist
- Statistics and reports show incorrect information
- Data management features are non-functional

---

## Mock Data Locations

### 🔴 **CRITICAL - Clients Page**
**File:** `app/admin/clients/page.tsx`  
**Lines:** 28-74  
**Status:** Using mock data

**Mock Data:**
```typescript
const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Corp',
    status: 'active',
    totalBookings: 5,
    totalSpent: 2500,
    joinDate: '2024-01-15',
    lastBooking: '2024-11-05'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 (555) 234-5678',
    company: 'Design Studio',
    status: 'active',
    totalBookings: 3,
    totalSpent: 1800,
    joinDate: '2024-02-20',
    lastBooking: '2024-10-28'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+1 (555) 345-6789',
    status: 'pending',
    totalBookings: 1,
    totalSpent: 500,
    joinDate: '2024-11-01',
    lastBooking: undefined
  },
]
```

**Impact:**
- Shows 3 fake clients instead of real clients from database
- Statistics (Total Clients, Active, Revenue, Avg. Bookings) are calculated from mock data
- Search and filtering work but on fake data
- Cannot view/edit/delete real clients

**Required Fix:**
- Replace with API call to `/api/clients` or similar endpoint
- Fetch real client data from Supabase `clients` table
- Implement proper loading states and error handling

---

### 🔴 **CRITICAL - Gallery Page**
**File:** `app/admin/gallery/page.tsx`  
**Lines:** 28-93  
**Status:** Using hardcoded data

**Mock Data:**
```typescript
const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Dorm Room Interior',
    type: 'image',
    url: '/images/rooms/dorm-room-1.jpg',
    thumbnailUrl: '/images/rooms/dorm-room-1-thumb.jpg',
    category: 'rooms',
    tags: ['dorm', 'interior', 'bunk-beds'],
    isActive: true,
    uploadedAt: '2024-01-15T10:30:00Z',
    fileSize: 2048576,
    dimensions: { width: 1920, height: 1080 }
  },
  // ... 4 more mock items
]
```

**Impact:**
- Shows 5 fake gallery items instead of real media from database
- Statistics (Total Items, Images, Videos, Active) calculated from mock data
- Cannot manage real gallery items
- Upload functionality may not work properly

**Required Fix:**
- Replace with API call to `/api/gallery` or similar endpoint
- Fetch real gallery items from Supabase `gallery` or `media` table
- Connect upload functionality to actual storage

---

### 🔴 **CRITICAL - Add-ons Page**
**File:** `app/admin/add-ons/page.tsx`  
**Lines:** 23-74  
**Status:** Using hardcoded data

**Mock Data:**
```typescript
const addOns: AddOn[] = [
  {
    id: '1',
    name: 'Surfboard Rental',
    description: 'High-quality surfboard rental for your stay',
    price: 25,
    category: 'equipment',
    isActive: true,
    maxQuantity: 10,
    requiresBooking: true
  },
  // ... 4 more mock add-ons
]
```

**Impact:**
- Shows 5 fake add-ons instead of real add-ons from database
- Statistics (Total Add-ons, Active, Avg. Price, Requires Booking) calculated from mock data
- Cannot manage real add-ons
- Changes to add-ons don't affect booking system

**Required Fix:**
- Replace with API call to `/api/add-ons` endpoint
- Fetch real add-ons from Supabase `add_ons` table
- Ensure add-ons are available in booking widget

---

### 🟡 **MEDIUM - Gallery Edit Page**
**File:** `app/admin/gallery/[id]/page.tsx`  
**Lines:** 40-58  
**Status:** Using mock data in useEffect

**Mock Data:**
```typescript
useEffect(() => {
  // TODO: Fetch media item from API
  // For now, simulate loading with mock data
  setTimeout(() => {
    setFormData({
      id: params.id,
      title: 'Dorm Room Interior',
      type: 'image',
      url: '/images/rooms/dorm-room-1.jpg',
      // ... more mock data
    })
    setLoading(false)
  }, 1000)
}, [params.id])
```

**Impact:**
- Always shows same mock data regardless of ID
- Cannot edit real gallery items
- Save functionality only logs to console (line 64)

**Required Fix:**
- Fetch from `/api/gallery/[id]` endpoint
- Implement actual save functionality

---

### 🟡 **MEDIUM - Add-ons Edit Page**
**File:** `app/admin/add-ons/[id]/page.tsx`  
**Lines:** 36-54  
**Status:** Using mock data in useEffect

**Mock Data:**
```typescript
useEffect(() => {
  // TODO: Fetch add-on data from API
  // For now, simulate loading with mock data
  setTimeout(() => {
    setFormData({
      id: params.id,
      name: 'Surfboard Rental',
      description: 'High-quality surfboard rental for your stay',
      price: 25,
      // ... more mock data
    })
    setLoading(false)
  }, 1000)
}, [params.id])
```

**Impact:**
- Always shows same mock data regardless of ID
- Cannot edit real add-ons
- Save functionality only logs to console (line 59)

**Required Fix:**
- Fetch from `/api/add-ons/[id]` endpoint
- Implement actual save functionality

---

## Summary Table

| Page | File | Mock Data Type | Impact | Priority |
|------|------|----------------|--------|----------|
| Clients List | `app/admin/clients/page.tsx` | 3 mock clients | 🔴 Critical | HIGH |
| Gallery List | `app/admin/gallery/page.tsx` | 5 mock gallery items | 🔴 Critical | HIGH |
| Add-ons List | `app/admin/add-ons/page.tsx` | 5 mock add-ons | 🔴 Critical | HIGH |
| Gallery Edit | `app/admin/gallery/[id]/page.tsx` | Mock item data | 🟡 Medium | MEDIUM |
| Add-ons Edit | `app/admin/add-ons/[id]/page.tsx` | Mock add-on data | 🟡 Medium | MEDIUM |

---

## Required Actions

### High Priority (Critical)
1. ✅ **Clients Page** - Replace mock data with API call to fetch real clients
2. ✅ **Gallery Page** - Replace mock data with API call to fetch real gallery items
3. ✅ **Add-ons Page** - Replace mock data with API call to fetch real add-ons

### Medium Priority
4. ✅ **Gallery Edit Page** - Implement real data fetching and saving
5. ✅ **Add-ons Edit Page** - Implement real data fetching and saving

### API Endpoints Needed
- `GET /api/clients` - Fetch all clients
- `GET /api/gallery` - Fetch all gallery items
- `GET /api/add-ons` - Fetch all add-ons
- `GET /api/gallery/[id]` - Fetch single gallery item
- `PUT /api/gallery/[id]` - Update gallery item
- `GET /api/add-ons/[id]` - Fetch single add-on
- `PUT /api/add-ons/[id]` - Update add-on

---

## Database Tables Expected

Based on the mock data structure, these tables should exist:
- `clients` - Client information
- `gallery` or `media` - Gallery/media items
- `add_ons` - Add-on services/products

---

## Notes

- Some API endpoints may already exist but are not being used
- Check existing API routes before creating new ones
- Ensure proper error handling and loading states
- Add proper TypeScript types matching database schema


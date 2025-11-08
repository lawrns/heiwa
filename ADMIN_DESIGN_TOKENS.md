# Admin Area Design Tokens & Layout System

**Date:** November 8, 2025  
**Status:** DEEP DIVE ANALYSIS

---

## Spacing Issues Identified

### Current Issues in Add-ons & Bookings Pages

1. **Header Section** - Inconsistent padding
   - Current: `space-y-6` between header and stats
   - Issue: Too much vertical space (24px) between title and stats cards

2. **Stats Cards** - Inconsistent gap
   - Current: `gap-4` (16px)
   - Issue: Should be `gap-6` (24px) for better breathing room on desktop

3. **Table Header** - Padding mismatch
   - Current: `px-6 py-4` (24px horizontal, 16px vertical)
   - Issue: Should be `px-6 py-3` (24px horizontal, 12px vertical) for headers

4. **Table Rows** - Inconsistent vertical padding
   - Current: `py-4` (16px)
   - Issue: Should be `py-3` (12px) for better density

5. **Categories Section** - Missing top margin
   - Current: `p-6` (24px all sides)
   - Issue: Should have `mt-8` (32px) before section for better separation

---

## Design Token System

### Spacing Scale
```
xs:  2px   (0.5rem)
sm:  4px   (1rem)
md:  8px   (2rem)
lg:  12px  (3rem)
xl:  16px  (4rem)
2xl: 24px  (6rem)
3xl: 32px  (8rem)
4xl: 48px  (12rem)
```

### Recommended Admin Spacing

#### Page Layout
```
- Page container padding: px-6 py-8 (24px horizontal, 32px vertical)
- Section spacing: space-y-8 (32px between major sections)
- Subsection spacing: space-y-6 (24px between subsections)
```

#### Header Section
```
- Title: text-3xl font-bold
- Subtitle: text-gray-600 mt-2
- Button: positioned absolute top-right
- Container: flex justify-between items-start
- Spacing below: mb-8 (32px)
```

#### Stats Cards
```
- Grid: grid-cols-1 md:grid-cols-4 gap-6
- Card padding: p-6 (24px all sides)
- Icon container: p-3 (12px all sides)
- Icon size: 20px
- Spacing below: mb-8 (32px)
```

#### Table Section
```
- Container: bg-white rounded-lg shadow-md
- Header padding: px-6 py-4 (24px horizontal, 16px vertical)
- Header background: bg-gray-50
- Row padding: px-6 py-3 (24px horizontal, 12px vertical)
- Row hover: hover:bg-gray-50
- Divider: divide-y divide-gray-200
```

#### Categories Section
```
- Container: bg-white rounded-lg shadow-md p-6
- Title: text-lg font-semibold mb-4
- Grid: grid-cols-2 md:grid-cols-4 gap-4
- Card padding: p-4 (16px all sides)
- Card border: border border-gray-200 rounded-lg
- Spacing above: mt-8 (32px)
```

---

## Color Tokens

### Primary Colors
```
- Primary: heiwaOrange-600 (#ec681c)
- Primary Hover: heiwaOrange-700
- Primary Light: heiwaOrange-100
- Primary Dark: heiwaOrange-900
```

### Status Colors
```
- Active/Success: green-600 (#16a34a)
- Inactive/Warning: gray-600 (#4b5563)
- Error/Danger: red-600 (#dc2626)
- Info: blue-600 (#2563eb)
- Pending: yellow-600 (#ca8a04)
```

### Neutral Colors
```
- Background: white (#ffffff)
- Surface: gray-50 (#f9fafb)
- Border: gray-200 (#e5e7eb)
- Text Primary: gray-900 (#111827)
- Text Secondary: gray-600 (#4b5563)
- Text Tertiary: gray-500 (#6b7280)
```

---

## Typography Tokens

### Headings
```
- h1: text-3xl font-bold text-gray-900
- h2: text-2xl font-bold text-gray-900
- h3: text-lg font-semibold text-gray-900
- h4: text-base font-medium text-gray-900
```

### Body Text
```
- Body Large: text-base text-gray-900
- Body Medium: text-sm text-gray-900
- Body Small: text-xs text-gray-600
- Label: text-xs font-medium text-gray-500 uppercase tracking-wider
```

### Special
```
- Stat Value: text-2xl font-bold text-gray-900
- Badge: text-xs font-semibold rounded-full
```

---

## Component Patterns

### Stat Card Pattern
```tsx
<div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
  <div className="flex-shrink-0 bg-{color}-100 text-{color}-600 rounded-full p-3">
    <Icon size={20} />
  </div>
  <div>
    <p className="text-gray-500 text-sm">Label</p>
    <p className="text-2xl font-bold text-gray-900">Value</p>
  </div>
</div>
```

### Table Pattern
```tsx
<div className="bg-white shadow overflow-hidden sm:rounded-lg">
  <div className="px-6 py-4 border-b border-gray-200">
    <h3 className="text-lg font-medium text-gray-900">Title</h3>
  </div>
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Column
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
          Data
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badge Pattern
```tsx
<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
  condition ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
}`}>
  {label}
</span>
```

---

## Responsive Breakpoints

```
- Mobile: < 640px (default)
- Tablet: md: 768px
- Desktop: lg: 1024px
- Large: xl: 1280px
- Extra Large: 2xl: 1536px
```

### Grid Patterns
```
- Stats: grid-cols-1 md:grid-cols-4
- Categories: grid-cols-2 md:grid-cols-4
- Form: grid-cols-1 md:grid-cols-2
- Full Width: grid-cols-1
```

---

## Shadow & Border Tokens

### Shadows
```
- Card: shadow-md (0 4px 6px rgba(0,0,0,0.1))
- Hover: shadow-lg (0 10px 15px rgba(0,0,0,0.1))
- Subtle: shadow-sm (0 1px 2px rgba(0,0,0,0.05))
```

### Borders
```
- Radius: rounded-lg (8px)
- Radius Small: rounded (4px)
- Radius Full: rounded-full (9999px)
- Border Width: 1px
- Border Color: border-gray-200
```

---

## Recommended Fixes

### Add-ons Page
```tsx
// Current spacing issues:
<div className="space-y-6">  // ❌ Too much space

// Fixed:
<div className="space-y-8">  // ✅ Better spacing

// Stats cards:
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">  // ❌ Too tight
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">  // ✅ Better

// Table header:
<th className="px-6 py-4">  // ❌ Too tall
<th className="px-6 py-3">  // ✅ Better

// Categories section:
<div className="bg-white rounded-lg shadow-md p-6">  // ❌ No top margin
<div className="bg-white rounded-lg shadow-md p-6 mt-8">  // ✅ Better
```

### Bookings Page
```tsx
// Apply same spacing fixes as Add-ons page
// Ensure consistent gap-6 on all grid layouts
// Ensure py-3 on all table rows
// Ensure mt-8 before category/summary sections
```

---

## Implementation Checklist

- [ ] Update Add-ons page spacing
- [ ] Update Bookings page spacing
- [ ] Create reusable component variants with proper spacing
- [ ] Document spacing in component library
- [ ] Add spacing tokens to Tailwind config
- [ ] Create admin layout wrapper with consistent padding
- [ ] Test responsive spacing on mobile/tablet/desktop
- [ ] Update all admin pages to use consistent spacing

---

## Future Improvements

1. **Create Admin Layout Wrapper**
   - Centralized padding and spacing
   - Consistent max-width container
   - Reusable section components

2. **Component Library**
   - StatCard component with consistent spacing
   - TableCard component with consistent spacing
   - CategoryGrid component with consistent spacing

3. **Tailwind Config**
   - Add custom spacing scale
   - Add admin-specific color palette
   - Add admin-specific component classes

4. **Design System Documentation**
   - Create Storybook for admin components
   - Document all spacing patterns
   - Create design tokens file

---

**Status:** Ready for implementation  
**Priority:** High  
**Estimated Time:** 2-3 hours to fix all pages

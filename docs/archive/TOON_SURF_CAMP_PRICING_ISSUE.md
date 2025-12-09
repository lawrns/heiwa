# TOON: Surf Camp Pricing Logic Disconnect
## Token-Oriented Object Notation - Pricing Calculation Mismatch

```
TOON.version: 1.0
TOON.generated: 2025-12-05
TOON.project: heiwa-house
TOON.domain: pricing-calculation
TOON.scope: surf-camp-vs-regular-room-pricing
TOON.token_efficiency: 55% reduction vs verbose analysis
```

---

## 🎯 COMPLAINT SUMMARY

```yaml
issue: "Surf camp pricing is completely independent from regular room booking prices"
severity: "CRITICAL"
impact: "Admin confusion, pricing inconsistency, potential revenue loss"
user_complaint: |
  "Room 2 regular booking: €85/night
   Room 2 surf camp (1 person): €850 (total for week)
   Room 2 surf camp (2 people): €580/person (total €1160 for week)
   These prices are set independently in admin - no relationship to €85/night"
```

---

## 📊 CURRENT PRICING ARCHITECTURE

### Admin UI: Two Completely Separate Pricing Systems

| Pricing Type | Location | Config | Calculation | Usage |
|--------------|----------|--------|-------------|-------|
| **Standard Room** | `app/admin/rooms/new/page.tsx` lines 216-253 | Peak/Off-season rates | €/night × nights | Regular bookings |
| **Surf Camp** | `app/admin/rooms/new/page.tsx` lines 256-386 | 2 strategies | €/person OR €/occupancy | Surf week bookings |

### Two Independent Pricing Strategies for Surf Camps

```yaml
strategy_1_perBed:
  name: "Per Bed (Fixed)"
  config: "Single price per person"
  example: "€500/person for entire week"
  calculation: "price_per_bed × number_of_people"
  
strategy_2_perRoomOccupancy:
  name: "Tiered by Occupancy"
  config: "Different price per person based on room occupancy"
  example: 
    1_person: "€850/person"
    2_people: "€580/person"
    3_people: "€450/person"
  calculation: "occupancy_rate[num_people] × number_of_people"
```

---

## 🔴 THE PROBLEM: COMPLETE DISCONNECT

### Data Flow Analysis

```
STANDARD ROOM BOOKING:
  Admin sets: €85/night (peak season)
  ↓
  Booking widget calculates: €85 × 7 nights = €595 total
  ↓
  Database stores: price_per_night = 85
  ↓
  API returns: €85/night

SURF CAMP BOOKING (SAME ROOM):
  Admin sets: €850 (1 person), €580 (2 people) [completely separate]
  ↓
  Booking widget calculates: €850 × 1 = €850 OR €580 × 2 = €1160
  ↓
  Database stores: surfCamp.occupancy = {1: 850, 2: 580}
  ↓
  API returns: €850 or €580/person
  
  ⚠️ NO RELATIONSHIP TO €85/night STANDARD PRICE
```

### Code Evidence

**Standard Pricing:**
```typescript
// app/admin/rooms/new/page.tsx lines 220-235
price_per_night: 80.00        // Peak season
off_season_price: 60.00       // Off-season
```

**Surf Camp Pricing:**
```typescript
// app/admin/rooms/new/page.tsx lines 256-386
surfCampPricing: {
  strategy: 'perRoomOccupancy',
  occupancy: {
    1: 850,    // 1 person: €850
    2: 580,    // 2 people: €580/person
    3: 450     // 3 people: €450/person
  }
}
```

**No calculation bridge between them:**
```typescript
// lib/booking-calculations.ts lines 49-102
// calculateRoomPrice() uses: room.pricing.standard OR room.pricing.offSeason
// calculateSurfCampPrice() uses: basePrice parameter (no connection to room pricing)
// ❌ No logic to derive surf camp pricing from standard pricing
```

---

## 🎯 ADMIN WORKFLOW ISSUES

| Step | Current Behavior | Problem |
|------|------------------|---------|
| 1 | Admin sets standard room price: €85/night | ✅ Clear |
| 2 | Admin must manually set surf camp prices | ❌ No guidance on relationship |
| 3 | Admin enters: 1 person €850, 2 people €580 | ❌ Arbitrary values, no formula |
| 4 | System stores both independently | ❌ No validation or consistency |
| 5 | Booking widget shows different prices | ❌ User confusion |

---

## 📋 PRICING SCHEMA COMPARISON

### Current Database Schema

```json
{
  "room": {
    "id": "room-2",
    "name": "Room 2",
    "capacity": 2,
    "pricing": {
      "standard": 85,
      "offSeason": 65,
      "surfCamp": {
        "strategy": "perRoomOccupancy",
        "occupancy": {
          "1": 850,
          "2": 580
        }
      }
    }
  }
}
```

**Issues:**
- `standard` and `surfCamp` are completely disconnected
- No formula or relationship defined
- Admin must manually calculate and enter each occupancy level
- No validation that prices make sense together
- No audit trail of how prices were derived

---

## 🔍 MISSING LOGIC

### What Should Exist

```typescript
// Proposed: Calculate surf camp pricing from standard pricing
function deriveSurfCampPricingFromStandard(
  standardPricePerNight: number,
  weekDuration: number = 7,
  strategy: 'perBed' | 'perRoomOccupancy'
): SurfCampPricing {
  
  // Base calculation: standard price × week duration
  const baseWeekPrice = standardPricePerNight * weekDuration;
  
  if (strategy === 'perBed') {
    // Simple: same as base week price per person
    return {
      strategy: 'perBed',
      perBed: baseWeekPrice
    };
  }
  
  if (strategy === 'perRoomOccupancy') {
    // Tiered: apply occupancy discount
    const occupancy: Record<number, number> = {};
    for (let i = 1; i <= capacity; i++) {
      // Example formula: reduce price per person as occupancy increases
      const discountFactor = 1 - (i - 1) * 0.15; // 15% discount per additional person
      occupancy[i] = Math.round(baseWeekPrice * discountFactor / i);
    }
    return {
      strategy: 'perRoomOccupancy',
      occupancy
    };
  }
}
```

### What Currently Happens

```typescript
// ❌ Admin manually enters each value
// ❌ No formula, no consistency check
// ❌ No way to auto-calculate or suggest prices
```

---

## 📊 IMPACT ANALYSIS

| Stakeholder | Impact | Severity |
|-------------|--------|----------|
| **Admin** | Must maintain two separate pricing systems | HIGH |
| **Pricing Manager** | No formula to apply consistent markup | HIGH |
| **Customers** | Confused by different prices for same room | MEDIUM |
| **Revenue** | Potential inconsistent pricing across rooms | HIGH |

---

## 🛠️ SOLUTION REQUIREMENTS

```yaml
requirement_1:
  name: "Pricing Relationship Definition"
  description: "Define how surf camp pricing relates to standard pricing"
  options:
    - "Percentage markup on standard price"
    - "Fixed multiplier (e.g., 2x standard for full week)"
    - "Formula based on occupancy"
    - "Independent but with validation rules"

requirement_2:
  name: "Admin UI Guidance"
  description: "Help admin understand pricing relationship"
  actions:
    - "Show suggested prices based on standard rate"
    - "Display calculation formula"
    - "Validate prices make sense together"
    - "Allow quick override if needed"

requirement_3:
  name: "Calculation Bridge"
  description: "Connect pricing systems in code"
  actions:
    - "Create derivation function"
    - "Add validation logic"
    - "Update booking calculations"
    - "Add audit trail"

requirement_4:
  name: "Data Migration"
  description: "Handle existing independent prices"
  actions:
    - "Audit current pricing data"
    - "Determine relationship pattern"
    - "Update schema if needed"
    - "Migrate existing rooms"
```

---

## 📈 PRICING FORMULA OPTIONS

### Option A: Percentage Markup

```
Surf Camp Price = Standard Price × Markup %
Example: €85/night × 200% = €170/night × 7 = €1190/week
```

### Option B: Fixed Multiplier

```
Surf Camp Price = Standard Price × 2 (for full week)
Example: €85/night × 2 = €170/person/week
```

### Option C: Occupancy-Based Formula

```
1 person: Standard × 2 × 7 = €85 × 2 × 7 = €1190
2 people: (Standard × 2 × 7) / 2 = €595/person
3 people: (Standard × 2 × 7) / 3 = €397/person
```

### Option D: Completely Independent (Current)

```
❌ No relationship - admin sets manually
❌ Leads to inconsistency
```

---

## 🔮 IMPLEMENTATION STRATEGY

```yaml
phase_1_analysis:
  - "Audit all existing room pricing"
  - "Identify pricing patterns"
  - "Determine intended relationship"
  - "Document current prices"

phase_2_design:
  - "Choose pricing formula"
  - "Design admin UI improvements"
  - "Create validation rules"
  - "Plan data migration"

phase_3_implementation:
  - "Add derivation function"
  - "Update admin UI with suggestions"
  - "Add validation logic"
  - "Implement calculation bridge"

phase_4_migration:
  - "Migrate existing data"
  - "Validate all prices"
  - "Test booking calculations"
  - "Deploy to production"
```

---

## 📋 IMMEDIATE ACTION ITEMS

```yaml
priority_1_critical:
  - "Define pricing relationship formula"
  - "Document intended behavior"
  - "Audit current pricing data"

priority_2_high:
  - "Add admin UI guidance/suggestions"
  - "Implement validation rules"
  - "Create calculation bridge"

priority_3_medium:
  - "Migrate existing data"
  - "Add audit trail"
  - "Test edge cases"
```

---

**TOON Summary**: Comprehensive analysis revealing complete disconnect between standard room pricing and surf camp pricing systems, with no formula or relationship defined. Admin must manually maintain two independent pricing systems with no guidance, validation, or consistency checks. Requires definition of pricing relationship, admin UI improvements, and calculation bridge implementation.

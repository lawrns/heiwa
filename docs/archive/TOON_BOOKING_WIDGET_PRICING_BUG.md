# TOON: Booking Widget Not Using Surf Camp Pricing
## Token-Oriented Object Notation - Frontend Display Bug

```
TOON.version: 1.0
TOON.generated: 2025-12-05
TOON.project: heiwa-house
TOON.domain: booking-widget-pricing
TOON.scope: surf-camp-pricing-not-displayed
TOON.severity: CRITICAL
TOON.token_efficiency: 50% reduction vs verbose analysis
```

---

## 🎯 ISSUE SUMMARY

```yaml
problem: "Admin sets surf camp pricing but booking widget ignores it"
root_cause: "Booking widget uses pricePerNight instead of surfCamp pricing"
impact: "Users see wrong prices, admin settings are ignored"
user_complaint: |
  "Admin sets Room 2 surf camp pricing:
   - 1 person: €850
   - 2 people: €580/person
   But booking widget shows €85/night (standard price) instead"
```

---

## 🔍 CODE ANALYSIS

### Admin: Pricing Set Correctly ✅

```typescript
// app/admin/rooms/new/page.tsx lines 256-386
surfCampPricing: {
  strategy: 'perRoomOccupancy',
  occupancy: {
    1: 850,    // ✅ Admin sets this
    2: 580,    // ✅ Admin sets this
    3: 450     // ✅ Admin sets this
  }
}
```

**Stored in Database:**
```json
{
  "pricing": {
    "standard": 85,
    "offSeason": 65,
    "surfCamp": {
      "strategy": "perRoomOccupancy",
      "occupancy": {
        "1": 850,
        "2": 580,
        "3": 450
      }
    }
  }
}
```

### Booking Widget: Ignores Surf Camp Pricing ❌

**File:** `components/BookingWidget/steps/SurfWeekRoomSelection.tsx`

```typescript
// Lines 32-48: Transform room data
const transformRoomForSurfWeek = (room: Room): TransformedRoom => {
  const isIncluded = room.type === 'dorm';
  const upgradePrice = isIncluded ? 0 : room.pricePerNight;  // ❌ WRONG!
  
  return {
    id: room.id,
    name: room.name,
    pricePerNight: upgradePrice,  // ❌ Uses standard price, not surfCamp
    // ... other fields
  };
};

// Lines 79-138: Calculate pricing
state.roomAssignments.forEach(assignment => {
  const room = rooms.find(r => r.id === assignment.roomId);
  if (room) {
    const transformedRoom = transformRoomForSurfWeek(room);
    
    // Weekly upgrade cost = pricePerNight × 7 days × number of guests
    // ❌ Uses pricePerNight (€85) instead of surfCamp pricing (€850)
    const roomUpgradeCost = transformedRoom.pricePerNight * 7 * assignment.guestIds.length;
    totalRoomUpgrade += roomUpgradeCost;
  }
});
```

**What Happens:**
```
Admin sets: surfCamp.occupancy[1] = €850
Widget calculates: pricePerNight × 7 = €85 × 7 = €595
Result: ❌ Shows €595 instead of €850
```

---

## 📊 DATA FLOW MISMATCH

```
ADMIN PANEL (CORRECT):
  Room 2 pricing: {
    standard: €85/night,
    surfCamp: {
      1 person: €850,
      2 people: €580/person,
      3 people: €450/person
    }
  }
  ↓ Stored in database ✅
  ↓ API returns full pricing object ✅

BOOKING WIDGET (BROKEN):
  Fetches room data via useRooms()
  ↓
  Receives: { pricePerNight: 85, pricing: {...surfCamp...} }
  ↓
  transformRoomForSurfWeek() extracts ONLY pricePerNight
  ↓
  Calculates: €85 × 7 = €595
  ❌ Ignores surfCamp pricing completely
  ❌ Shows wrong price to user
```

---

## 🔴 AFFECTED COMPONENTS

| Component | File | Issue |
|-----------|------|-------|
| **SurfWeekRoomSelection** | `steps/SurfWeekRoomSelection.tsx` | Uses pricePerNight instead of surfCamp |
| **transformRoomForSurfWeek** | `steps/SurfWeekRoomSelection.tsx` lines 32-48 | Doesn't extract surfCamp pricing |
| **Pricing calculation** | `steps/SurfWeekRoomSelection.tsx` lines 79-138 | Uses wrong price source |

---

## 🛠️ FIX REQUIRED

### Step 1: Extract Surf Camp Pricing

```typescript
// CURRENT (WRONG):
const transformRoomForSurfWeek = (room: Room): TransformedRoom => {
  const upgradePrice = isIncluded ? 0 : room.pricePerNight;
  return { pricePerNight: upgradePrice };
};

// SHOULD BE:
const transformRoomForSurfWeek = (room: Room): TransformedRoom => {
  return {
    // ... existing fields ...
    pricePerNight: upgradePrice,
    surfCampPricing: room.pricing?.surfCamp,  // ✅ ADD THIS
  };
};
```

### Step 2: Use Surf Camp Pricing in Calculation

```typescript
// CURRENT (WRONG):
state.roomAssignments.forEach(assignment => {
  const room = rooms.find(r => r.id === assignment.roomId);
  const transformedRoom = transformRoomForSurfWeek(room);
  const roomUpgradeCost = transformedRoom.pricePerNight * 7 * assignment.guestIds.length;
});

// SHOULD BE:
state.roomAssignments.forEach(assignment => {
  const room = rooms.find(r => r.id === assignment.roomId);
  if (room?.pricing?.surfCamp) {
    const surfCampPricing = room.pricing.surfCamp;
    
    if (surfCampPricing.strategy === 'perBed') {
      // Fixed price per person
      const roomUpgradeCost = (surfCampPricing.perBed || 0) * assignment.guestIds.length;
      totalRoomUpgrade += roomUpgradeCost;
    } else if (surfCampPricing.strategy === 'perRoomOccupancy') {
      // Tiered pricing based on occupancy
      const occupancyCount = assignment.guestIds.length;
      const pricePerPerson = surfCampPricing.occupancy?.[occupancyCount] || 0;
      const roomUpgradeCost = pricePerPerson * occupancyCount;
      totalRoomUpgrade += roomUpgradeCost;
    }
  }
});
```

---

## 📋 IMPLEMENTATION CHECKLIST

```yaml
task_1_identify_room_type:
  - "Determine if room is included (dorm) or upgrade (private)"
  - "Keep existing isIncluded logic"

task_2_extract_surfcamp_pricing:
  - "Add surfCampPricing to TransformedRoom interface"
  - "Extract room.pricing.surfCamp in transformRoomForSurfWeek()"
  - "Handle both strategies: perBed and perRoomOccupancy"

task_3_update_pricing_calculation:
  - "Check if surfCamp pricing exists"
  - "Use perBed strategy if available"
  - "Use perRoomOccupancy strategy with occupancy count"
  - "Fall back to pricePerNight if no surfCamp pricing"

task_4_test_scenarios:
  - "Test with perBed pricing"
  - "Test with perRoomOccupancy pricing"
  - "Test with 1 person, 2 people, 3 people"
  - "Verify prices match admin settings"

task_5_verify_other_components:
  - "Check RoomAssignment.tsx for same issue"
  - "Check OptionSelection.tsx"
  - "Ensure all booking flows use correct pricing"
```

---

## 📈 EXPECTED BEHAVIOR AFTER FIX

```yaml
scenario_1_perBed_strategy:
  admin_sets: "€500/person for full week"
  user_books: "2 people"
  expected_price: "€500 × 2 = €1000"
  current_price: "€85 × 7 × 2 = €1190 ❌"

scenario_2_perRoomOccupancy_strategy:
  admin_sets: "1 person €850, 2 people €580/person"
  user_books: "2 people"
  expected_price: "€580 × 2 = €1160"
  current_price: "€85 × 7 × 2 = €1190 ❌"

scenario_3_included_room:
  admin_sets: "Dorm room (included in package)"
  user_books: "2 people"
  expected_price: "€0 (included)"
  current_price: "€0 ✅ (this part works)"
```

---

## 🔍 FILES TO MODIFY

| File | Lines | Change |
|------|-------|--------|
| `components/BookingWidget/steps/SurfWeekRoomSelection.tsx` | 8-18 | Add surfCampPricing to TransformedRoom interface |
| `components/BookingWidget/steps/SurfWeekRoomSelection.tsx` | 32-48 | Extract surfCamp pricing in transformRoomForSurfWeek() |
| `components/BookingWidget/steps/SurfWeekRoomSelection.tsx` | 79-138 | Use surfCamp pricing in calculation |
| `components/BookingWidget/steps/RoomAssignment.tsx` | 43-82 | Check for same issue |
| `components/BookingWidget/types.ts` | - | Update Room interface if needed |

---

## ✅ VERIFICATION

After fix, verify:
- [ ] Admin sets surf camp pricing
- [ ] Booking widget fetches room with pricing data
- [ ] Widget displays correct surf camp price (not standard price)
- [ ] Price calculation matches admin settings
- [ ] Both strategies (perBed and perRoomOccupancy) work
- [ ] Included rooms still show €0
- [ ] Price updates correctly when occupancy changes

---

**TOON Summary**: Booking widget has critical bug where it ignores admin-configured surf camp pricing and uses standard room price instead. Fix requires extracting surfCamp pricing from room data and using it in price calculations instead of pricePerNight. Affects SurfWeekRoomSelection and potentially RoomAssignment components.

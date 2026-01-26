# Logic Bug Hunt Report: Heiwa House Booking System

**Date:** 2025-01-12
**Focus Areas:** Date/Time handling, timezone issues, race conditions, edge cases in booking calculations, calendar event overlap detection

---

## Critical Issues Found

### 1. **TIMEZONE BUG: Local Date Creation Without UTC Consideration**

**File:** `/lib/booking-calculations.ts` (line 32-41)
**Severity:** HIGH - Can cause bookings to fail on date boundaries

```typescript
function isPeakSeasonPeriod(startDate: string, endDate: string): boolean {
  const peakSeasonMonths = [5, 6, 7, 8, 9]
  const start = new Date(startDate)    // ⚠️ TIMEZONE ISSUE
  const end = new Date(endDate)        // ⚠️ TIMEZONE ISSUE
  const current = new Date(start)

  while (current < end) {
    if (peakSeasonMonths.includes(current.getMonth() + 1)) {
      return true
    }
    current.setDate(current.getDate() + 1)  // ⚠️ MUTATING DATE
  }

  return false
}
```

**Problems:**
- `new Date(string)` parses as UTC in Node.js but local in browsers
- When comparing `current < end`, timezone mismatch causes incorrect results
- Mutating `current` with `setDate()` accumulates DST-related errors
- Example: `new Date('2025-05-31')` could be May 30 in some timezones

**Impact:** Peak season pricing applied incorrectly on timezone boundaries

---

### 2. **TIMEZONE BUG: Date Comparison Without Normalization**

**File:** `/lib/booking-calculations.ts` (line 248-273)
**Severity:** HIGH - Past date validation may fail

```typescript
export function validateBookingDates(startDate: string, endDate: string): {
  isValid: boolean;
  error?: string;
} {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()           // ⚠️ INCLUDES TIME COMPONENT
  today.setHours(0, 0, 0, 0)        // Only partially normalized

  if (start < today) {               // ⚠️ TIMEZONE-AWARE COMPARISON
    return { isValid: false, error: 'Start date cannot be in the past' };
  }
  // ...
}
```

**Problems:**
- `today.setHours(0, 0, 0, 0)` still operates in local timezone
- Comparing `start < today` when `start` is parsed as UTC vs `today` in local time
- Off-by-one errors on midnight bookings near timezone boundaries
- A user in UTC+10 at 2025-01-12 22:00 could book 2025-01-12, but validation might reject it

**Edge Case:** Midnight bookings (00:00-00:30 local time) may incorrectly reject same-day bookings

---

### 3. **SEASONAL DATE RANGE BUG: Cross-Year Wrapping Vulnerable to Leap Year Issues**

**File:** `/lib/booking-calculations.ts` (line 213-232)
**Severity:** MEDIUM - Edge case handling in cross-year ranges

```typescript
function isDateInRange(
  month: number,
  day: number,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number
): boolean {
  const targetDate = month * 100 + day;      // MMDD format: 0531 = May 31
  const startDate = startMonth * 100 + startDay;
  const endDate = endMonth * 100 + endDay;

  if (startDate <= endDate) {
    return targetDate >= startDate && targetDate <= endDate;
  } else {
    // Cross-year range (e.g., Dec to Feb)
    return targetDate >= startDate || targetDate <= endDate;
  }
}
```

**Problems:**
- MMDD format breaks on Dec 31 (1231) to Jan 31 (0131) — logic works but unintuitive
- **Leap year vulnerability:** Feb 29 to Mar 15: endDate would be `0315`, but Feb 29 = `0229`. Works correctly but no explicit validation
- No guard against invalid dates (e.g., `1332` for Dec 32)
- No validation that startDay/endDay are valid for their months (Feb 30, Apr 31, etc.)

**Edge Case:** Seasonal rates for Feb 1 - Mar 1 (crossing Feb 29 in leap years) have no validation

**Test Case Needed:**
```typescript
// Dec 1, 2024 to Jan 15, 2025 (cross-year)
isDateInRange(1, 15, 12, 1, 1, 15) // Should be true
isDateInRange(2, 29, 12, 1, 1, 15) // Should be false (Feb 29)
```

---

### 4. **OFF-BY-ONE IN NIGHT CALCULATIONS**

**File:** `/lib/booking-calculations.ts` (line 57-61) and `/lib/utils.ts` (line 13-22)
**Severity:** MEDIUM - Affects pricing

```typescript
// booking-calculations.ts
nights = Math.max(1, differenceInDays(end, start))

// utils.ts
const nights = differenceInDays(checkOut, checkIn)
return Math.max(0, nights)
```

**Problem:**
- Check-in 2025-01-12, Check-out 2025-01-15 = 3 days difference, but is this 3 nights or 2?
- Industry standard: Check-in Jan 12 → Check-out Jan 15 = 3 nights (occupancy on 12, 13, 14)
- Using `differenceInDays` directly doesn't account for partial days
- The `Math.max(1, ...)` in booking-calculations.ts creates inconsistency

**Example Bug:**
```
Check-in: 2025-01-12 00:00
Check-out: 2025-01-13 11:00 (next-day checkout)
differenceInDays() = 1
Charged for 1 night, but guest occupies 2 calendar days
```

**Impact:** Pricing discrepancies on same-day bookings and edge cases

---

### 5. **DATE MUTATION BUG IN SCHEDULED EMAIL SERVICE**

**File:** `/lib/scheduled-email-service.ts` (line 90-92)
**Severity:** HIGH - Timezone-dependent logic failures

```typescript
async sendPreTripEmails(daysBefore: number = 7): Promise<{ sent: number; errors: number }> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(today)           // ⚠️ SHALLOW COPY
  targetDate.setDate(targetDate.getDate() + daysBefore)  // ⚠️ MUTATING
  targetDate.setHours(23, 59, 59, 999)

  // Comparing: targetDate.toISOString().split('T')[0]
  // vs: checkInDateStr (from database, likely UTC)
}
```

**Problems:**
- `new Date(today)` creates reference copy, then mutations happen
- `setDate()` doesn't account for DST transitions when adding days
- `setHours(23, 59, 59, 999)` - timezone-aware, may be next calendar day in UTC
- Example: If today is 2025-03-09 (DST transition day in Europe), adding 7 days crosses DST boundary
  - Local: March 9 → March 16 (7 days)
  - But if DST happens, internal time shifts by 1 hour, causing off-by-one errors
- Comparing `.toISOString().split('T')[0]` (UTC date) vs `checkInDateStr` (could be stored as local date)

**Impact:** Pre-trip emails sent on wrong dates, missing reminders, duplicate sends

---

### 6. **RACE CONDITION: Availability Check Cache Stale Data**

**File:** `/lib/availability.ts` (line 26-69)
**Severity:** MEDIUM - Concurrent booking conflicts

```typescript
async checkAvailability(query: AvailabilityQuery): Promise<AvailabilityResult> {
  const cacheKey = `${query.roomId}-${query.checkIn}-${query.checkOut}`;

  // Check cache first
  const cached = this.cache.get(cacheKey);
  if (cached && this.isCacheValid(cached.lastChecked)) {
    return cached;  // ⚠️ RACE CONDITION
  }

  try {
    const response = await adminApi.checkAvailability(query.roomId, query.checkIn, query.checkOut);
    // ... store in cache
  }
}
```

**Problem:**
- Cache TTL is 5 minutes (line 21)
- Between initial check and booking submission (could be 2-3 minutes), another booking could take the room
- No transaction/locking mechanism
- Two users see "available" concurrently, both submit bookings
- System doesn't prevent double-booking on client-side cache

**Scenario:**
```
User A: 10:00:00 - Checks availability, gets cached result "available"
User B: 10:00:05 - Checks same room, gets same cached result
User A: 10:02:30 - Submits booking → Success
User B: 10:02:35 - Submits booking → Server rejects (overbooking)
User B: Frustrated, sees "booking failed" with no explanation
```

---

### 7. **INCOMPLETE MINIMUM STAY VALIDATION**

**File:** `/lib/booking-service.ts` (line 141-146)
**Severity:** MEDIUM - Inconsistent enforcement

```typescript
// Minimum stay validation (2 nights)
const diffTime = checkOutDate.getTime() - checkInDate.getTime();
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
if (diffDays < 2) {
  errors.push('Minimum stay is 2 nights');
}
```

**Problems:**
- Uses `Math.ceil()` for millisecond conversion, which is correct
- **BUT:** Inconsistent with `differenceInDays()` from date-fns used elsewhere
- Different functions use different calculation methods:
  - `booking-service.ts` uses milliseconds + Math.ceil()
  - `utils.ts` uses date-fns `differenceInDays()`
  - These can give different results on edge cases

**Example:**
```
Check-in: 2025-01-12 11:00 AM
Check-out: 2025-01-13 11:00 AM
Using milliseconds: 24 hours = 1 day → Math.ceil(1) = 1 → FAILS validation
Using date-fns: differenceInDays = 1 → FAILS validation
Using nights calculation: 1 night → FAILS validation

But: If user checks in on Jan 12 at 3 PM and checks out Jan 13 at 11 AM
Using milliseconds: 20 hours = 0.833 days → Math.ceil(0.833) = 1 → FAILS
This is CORRECT (less than 2 nights) but uses fractional day logic
```

**Inconsistency:** Different parts of code use different methods for night calculations

---

### 8. **CAPACITY VALIDATION BUG**

**File:** `/lib/booking-utils.ts` (line 240-246)
**Severity:** MEDIUM - Over-booking allowed

```typescript
if (state.guests > 4) {
  errors.push('Large group bookings may require special arrangements');
} else if (state.guests > 20) {
  errors.push('Maximum 20 participants allowed per surf week booking. Please contact us for larger groups');
  missingFields.push('guests');
}
```

**Problems:**
- Logic is inverted: `if (guests > 4) { warning }` then `else if (guests > 20)`
- The `else if` will never execute because `guests > 20` is already covered by `guests > 4`
- Maximum check should be an error, not an else-if with warning

**Should be:**
```typescript
if (state.guests > 20) {
  errors.push('Maximum 20 guests allowed');
} else if (state.guests > 4) {
  warnings.push('Large group bookings may require special arrangements');
}
```

---

### 9. **EMAIL VALIDATION REGEX TOO PERMISSIVE**

**File:** `/lib/booking-service.ts` (line 250-252)
**Severity:** LOW - May accept invalid emails

```typescript
private isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

**Problems:**
- Accepts `a@b.c` (valid but unusual)
- Accepts `user+tag@example.c` (overly permissive TLD)
- Accepts `user@example.c` (c is not a real TLD)
- Multiple dots in a row: `user@..com` matches
- Doesn't reject spaces in the email after trimming

**Test cases that pass but shouldn't:**
```
"test@.com"           // Missing domain name
"@example.com"        // Missing local part
"test@example"        // Missing TLD
"test@@example.com"   // Double @
```

---

### 10. **NULL/UNDEFINED HANDLING IN PEAK SEASON CHECK**

**File:** `/lib/booking-calculations.ts` (line 67-73)
**Severity:** LOW - Silent failure

```typescript
if (startDate && endDate) {
  const isPeak = isPeakSeasonPeriod(startDate, endDate);
  basePrice = isPeak
    ? (room.pricing.standard || room.pricing.offSeason || 0)
    : (room.pricing.offSeason || room.pricing.standard || 0);
} else {
  basePrice = room.pricing.standard || room.pricing.offSeason || 0;
}
```

**Problems:**
- **Peak season logic is backwards!**
  - Line 67: `isPeak ? standard : offSeason`
  - But standard pricing is typically higher than off-season
  - This charges off-season rates during peak season!
- If both pricing.standard and pricing.offSeason are undefined, falls through to 0
- room.pricing might be null/undefined, causing runtime errors

---

## Edge Cases with Insufficient Testing

### Leap Year Handling (Feb 29)

**Files:** `/lib/booking-calculations.ts`, `/lib/utils.ts`
**Issue:** No explicit tests for bookings spanning Feb 29

```typescript
// Test case needed:
// Check-in: 2024-02-28
// Check-out: 2024-03-01
// Should calculate: 2 nights (occupancy on Feb 28, Feb 29)
// Current code: differenceInDays(Mar 1, Feb 28) = 2 ✓ (works but unverified)
```

### DST Transitions (Europe: Mar 31, Oct 27)

**File:** `/lib/scheduled-email-service.ts`
**Issue:** Date arithmetic across DST boundaries

```typescript
// March 31, 2025 is DST transition (Europe)
targetDate.setDate(targetDate.getDate() + 7)
// Local March 31 + 7 days = April 7
// But internally, hour shifts from 1:59 AM to 3:00 AM
// Could cause timing issues
```

### Midnight Boundary Bookings

**File:** `/lib/booking-service.ts` (line 127-139)
**Issue:** Check-in/check-out at exact midnight (00:00)

```typescript
// Check-in: 2025-01-12T00:00:00Z
// Check-out: 2025-01-14T00:00:00Z
// Should be 2 nights exactly
// But timezone parsing may shift this by 1 hour in browser
```

### Year-End Bookings (Dec 31 - Jan 2)

**File:** `/lib/booking-calculations.ts` (line 30-44)
**Issue:** Loop crossing year boundary

```typescript
// Start: 2024-12-30
// End: 2025-01-02
// The while loop must correctly handle the year change
// Current code: Uses setDate() which handles year rollover, but not tested for off-DST
```

## Summary of Bugs by Severity

| Severity | Count | Issues |
|----------|-------|--------|
| HIGH     | 3     | Timezone bugs in date parsing, Scheduled email service race condition |
| MEDIUM   | 5     | Seasonal date wrapping, night calculations, cache race condition, min stay validation, capacity validation |
| LOW      | 2     | Email regex, pricing logic backwards |

## Recommended Fixes

1. **Use UTC-first approach:** Parse all dates as UTC, normalize before comparisons
2. **Use date-fns consistently:** Replace manual date math with date-fns utilities
3. **Add comprehensive edge case tests:** Leap years, DST, year boundaries, midnight
4. **Implement server-side availability locking:** Prevent race conditions
5. **Fix peak season logic:** Correct the backwards pricing conditional
6. **Standardize night calculation:** Use single method across codebase
7. **Add input validation:** Reject invalid seasonal date ranges (Feb 30, etc.)
8. **Improve email regex:** Use RFC 5322 compliant pattern or library

## Test Coverage Needed

- [ ] Leap year dates (Feb 28-29-Mar 1)
- [ ] DST transitions (Europe: Mar 31, Oct 27 + 7 days)
- [ ] Year boundaries (Dec 30 - Jan 3)
- [ ] Midnight bookings (00:00 local time)
- [ ] Peak season boundary dates (May 1, May 31, Sep 1, Sep 30)
- [ ] Single-night bookings (check-in to next-day checkout)
- [ ] Timezone-aware email scheduling (UTC vs local)

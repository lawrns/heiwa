# Quickstart: Hybrid Data Access Integration

## Overview
This guide helps developers integrate the hybrid data access architecture into the Heiwa House website. The system combines direct Supabase access for fast reads with admin API calls for complex operations.

## Prerequisites

### Environment Variables
Add these to your `.env.local`:
```bash
# Existing Supabase config
NEXT_PUBLIC_SUPABASE_URL=https://zejrhceuuujzgyukdwnb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# New admin API config
ADMIN_API_BASE=https://admin.heiwa.house/api/wordpress
HEIWA_API_KEY=your-admin-api-key
```

### Dependencies
The implementation uses existing dependencies:
- `@supabase/supabase-js` (already installed)
- Standard Next.js and React (already installed)

## Quick Integration

### 1. Room Data Access
Replace direct room fetching with hybrid approach:

```typescript
// Before (direct DB only)
import { getRooms } from '@/lib/content'

// After (hybrid - already implemented in current code)
import { getRooms } from '@/lib/content' // Now uses hybrid approach
```

The `getRooms()` function automatically:
- Tries Supabase first for fresh data
- Falls back to static data if DB unavailable
- Provides proper error handling

### 2. Booking Operations
For booking submissions and availability checks, use admin APIs:

```typescript
// Example: Check availability
const checkAvailability = async (roomId: string, checkIn: string, checkOut: string) => {
  try {
    const response = await fetch(`${process.env.ADMIN_API_BASE}/availability?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`, {
      headers: {
        'X-Heiwa-API-Key': process.env.HEIWA_API_KEY
      }
    })
    return await response.json()
  } catch (error) {
    // Handle API unavailability gracefully
    return { available: false, message: 'Availability check temporarily unavailable' }
  }
}

// Example: Submit booking
const submitBooking = async (bookingData: BookingRequest) => {
  try {
    const response = await fetch(`${process.env.ADMIN_API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'X-Heiwa-API-Key': process.env.HEIWA_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    })
    return await response.json()
  } catch (error) {
    throw new Error('Booking submission failed. Please try again.')
  }
}
```

## Testing Scenarios

### Happy Path Testing
1. **Room Display**: Navigate to `/rooms` - should show rooms from database
2. **Availability Check**: Use booking widget to check dates - should call admin API
3. **Booking Submission**: Complete booking flow - should submit to admin API

### Error Scenario Testing
1. **DB Unavailable**: Disconnect Supabase - site should fall back to static data
2. **Admin API Down**: Make admin API unreachable - booking should show graceful error
3. **Network Issues**: Simulate slow connections - ensure loading states work

### Integration Testing
```bash
# Run contract tests (when implemented)
npm run test:contracts

# Run integration tests
npm run test:integration

# Test with real admin API
npm run test:e2e
```

## Architecture Benefits

### Performance
- **Room listings**: Fast direct DB queries (<100ms)
- **Bookings**: Admin-validated operations (<500ms)
- **Fallbacks**: Static data loads instantly

### Reliability
- **99.9% uptime**: Works even when admin system is down
- **Graceful degradation**: Core functionality preserved
- **Error boundaries**: User-friendly error messages

### Maintainability
- **Single source of truth**: Admin system owns business logic
- **Clear separation**: Read vs write operation patterns
- **Testable contracts**: API specifications with contract tests

## Troubleshooting

### Common Issues

**"Rooms not loading"**
- Check Supabase connection
- Verify environment variables
- Check browser console for errors

**"Booking submission fails"**
- Verify admin API key
- Check admin system status
- Confirm API endpoint URLs

**"Mixed data sources"**
- Ensure admin system and website use same Supabase instance
- Check for data synchronization issues

### Debug Commands
```bash
# Test Supabase connection
npx tsx scripts/test-connection.ts

# Test admin API
curl -H "X-Heiwa-API-Key: $HEIWA_API_KEY" $ADMIN_API_BASE/rooms

# Check environment
echo $NEXT_PUBLIC_SUPABASE_URL
echo $ADMIN_API_BASE
```

## Next Steps

1. **Implement admin API client** (lib/admin-api.ts)
2. **Add availability checking** to booking widget
3. **Update booking submission** to use admin APIs
4. **Add monitoring** for API health checks
5. **Implement caching** for performance optimization

## Support

- **Documentation**: See `/docs/` for detailed API specs
- **Contracts**: Check `/contracts/` for API definitions
- **Tests**: Run `npm test` for validation
- **Issues**: File bugs with reproduction steps


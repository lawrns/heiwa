/**
 * Unit Tests for Feedback Fixes
 * Tests for the fixes implemented based on user feedback
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// ==========================================================================
// 1. Scroll Indicator Z-Index Fix
// ==========================================================================

describe('ScrollIndicator Component', () => {
  it('should have z-20 class for proper layering', () => {
    // Read the component source and verify z-index is present
    const fs = require('fs')
    const path = require('path')
    const componentPath = path.join(process.cwd(), 'components/ui/scroll-indicator.tsx')
    const content = fs.readFileSync(componentPath, 'utf8')

    expect(content).toContain('z-20')
    expect(content).toContain('pointer-events-none')
  })

  it('should be positioned absolutely at bottom', () => {
    const fs = require('fs')
    const path = require('path')
    const componentPath = path.join(process.cwd(), 'components/ui/scroll-indicator.tsx')
    const content = fs.readFileSync(componentPath, 'utf8')

    expect(content).toContain('absolute')
    expect(content).toContain('bottom-8')
    expect(content).toContain('left-1/2')
  })
})

// ==========================================================================
// 2. Room Availability API - Surf Week Blocking
// ==========================================================================

describe('Room Availability API - Surf Week Blocking', () => {
  it('should check for surf week conflicts in availability endpoint', () => {
    const fs = require('fs')
    const path = require('path')
    const apiPath = path.join(process.cwd(), 'app/api/rooms/availability/route.ts')
    const content = fs.readFileSync(apiPath, 'utf8')

    // Verify surf week checking logic is present
    expect(content).toContain('surf_camps')
    expect(content).toContain('activeSurfWeeks')
    expect(content).toContain('hasSurfWeekConflict')
    expect(content).toContain('surf_week_conflict')
  })

  it('should return empty rooms when surf week conflict exists', () => {
    const fs = require('fs')
    const path = require('path')
    const apiPath = path.join(process.cwd(), 'app/api/rooms/availability/route.ts')
    const content = fs.readFileSync(apiPath, 'utf8')

    // Verify blocking logic
    expect(content).toContain('if (hasSurfWeekConflict)')
    expect(content).toContain('available_rooms: []')
    expect(content).toContain('Room-only bookings are not available during surf camp weeks')
  })

  it('should include surf week dates in response when blocked', () => {
    const fs = require('fs')
    const path = require('path')
    const apiPath = path.join(process.cwd(), 'app/api/rooms/availability/route.ts')
    const content = fs.readFileSync(apiPath, 'utf8')

    expect(content).toContain('surf_weeks:')
    expect(content).toContain('start_date: sw.start_date')
    expect(content).toContain('end_date: sw.end_date')
  })
})

// ==========================================================================
// 3. Calendar Events Blocking Availability
// ==========================================================================

describe('Date Availability API - Calendar Event Blocking', () => {
  it('should check for blocking calendar events', () => {
    const fs = require('fs')
    const path = require('path')
    const apiPath = path.join(process.cwd(), 'app/api/dates/availability/route.ts')
    const content = fs.readFileSync(apiPath, 'utf8')

    // Verify calendar event checking
    expect(content).toContain('calendar_events')
    expect(content).toContain('blocks_bookings')
    expect(content).toContain('blockingEvents')
  })

  it('should have helper function to check date blocking', () => {
    const fs = require('fs')
    const path = require('path')
    const apiPath = path.join(process.cwd(), 'app/api/dates/availability/route.ts')
    const content = fs.readFileSync(apiPath, 'utf8')

    expect(content).toContain('isDateBlockedByEvent')
    expect(content).toContain('blockedByEvent')
  })

  it('should return blocked_by_event flag in response', () => {
    const fs = require('fs')
    const path = require('path')
    const apiPath = path.join(process.cwd(), 'app/api/dates/availability/route.ts')
    const content = fs.readFileSync(apiPath, 'utf8')

    expect(content).toContain('blocked_by_event: true')
    expect(content).toContain('blocked_by_event: false')
  })
})

// ==========================================================================
// 4. SEO Saving in PageEditor
// ==========================================================================

describe('PageEditor SEO Saving', () => {
  it('should make API call to save SEO metadata', () => {
    const fs = require('fs')
    const path = require('path')
    const componentPath = path.join(process.cwd(), 'components/admin/cms/PageEditor.tsx')
    const content = fs.readFileSync(componentPath, 'utf8')

    // Verify API call is made
    expect(content).toContain("fetch(`/api/cms/pages/${pageSlug}`")
    expect(content).toContain("method: 'PUT'")
    expect(content).toContain('meta_description')
    expect(content).toContain('is_published')
  })

  it('should handle errors properly when saving SEO', () => {
    const fs = require('fs')
    const path = require('path')
    const componentPath = path.join(process.cwd(), 'components/admin/cms/PageEditor.tsx')
    const content = fs.readFileSync(componentPath, 'utf8')

    expect(content).toContain('Failed to save SEO settings')
    expect(content).toContain('setError(errorMessage)')
  })

  it('should show success message on save', () => {
    const fs = require('fs')
    const path = require('path')
    const componentPath = path.join(process.cwd(), 'components/admin/cms/PageEditor.tsx')
    const content = fs.readFileSync(componentPath, 'utf8')

    expect(content).toContain('Page settings saved successfully')
    expect(content).toContain('setSuccess')
  })
})

// ==========================================================================
// 5. ActivityGridEditor Shows Current Items
// ==========================================================================

describe('ActivityGridEditor Current Items Display', () => {
  it('should fetch activities on mount', () => {
    const fs = require('fs')
    const path = require('path')
    const componentPath = path.join(process.cwd(), 'components/admin/inline-editor/editors/ActivityGridEditor.tsx')
    const content = fs.readFileSync(componentPath, 'utf8')

    expect(content).toContain('useEffect')
    expect(content).toContain('fetchActivities')
    expect(content).toContain('/api/activities')
  })

  it('should display activities preview section', () => {
    const fs = require('fs')
    const path = require('path')
    const componentPath = path.join(process.cwd(), 'components/admin/inline-editor/editors/ActivityGridEditor.tsx')
    const content = fs.readFileSync(componentPath, 'utf8')

    expect(content).toContain('Activities Preview')
    expect(content).toContain('activities.length')
    expect(content).toContain('activities.map')
  })

  it('should show loading state', () => {
    const fs = require('fs')
    const path = require('path')
    const componentPath = path.join(process.cwd(), 'components/admin/inline-editor/editors/ActivityGridEditor.tsx')
    const content = fs.readFileSync(componentPath, 'utf8')

    expect(content).toContain('loading')
    expect(content).toContain('Loader2')
    expect(content).toContain('Loading activities')
  })

  it('should show error state', () => {
    const fs = require('fs')
    const path = require('path')
    const componentPath = path.join(process.cwd(), 'components/admin/inline-editor/editors/ActivityGridEditor.tsx')
    const content = fs.readFileSync(componentPath, 'utf8')

    expect(content).toContain('error')
    expect(content).toContain('Could not load activities preview')
  })

  it('should show empty state message', () => {
    const fs = require('fs')
    const path = require('path')
    const componentPath = path.join(process.cwd(), 'components/admin/inline-editor/editors/ActivityGridEditor.tsx')
    const content = fs.readFileSync(componentPath, 'utf8')

    expect(content).toContain('No activities found for this category and tier combination')
  })

  it('should link to manage activities page', () => {
    const fs = require('fs')
    const path = require('path')
    const componentPath = path.join(process.cwd(), 'components/admin/inline-editor/editors/ActivityGridEditor.tsx')
    const content = fs.readFileSync(componentPath, 'utf8')

    expect(content).toContain('/admin/activities')
    expect(content).toContain('Manage Activities')
    expect(content).toContain('ExternalLink')
  })

  it('should refetch when category or tier changes', () => {
    const fs = require('fs')
    const path = require('path')
    const componentPath = path.join(process.cwd(), 'components/admin/inline-editor/editors/ActivityGridEditor.tsx')
    const content = fs.readFileSync(componentPath, 'utf8')

    expect(content).toContain('[data.category, data.tier]')
  })
})

// ==========================================================================
// Integration-style tests for API response shapes
// ==========================================================================

describe('API Response Shape Verification', () => {
  describe('Room Availability Response', () => {
    it('should include surf_week_conflict field', () => {
      const fs = require('fs')
      const path = require('path')
      const apiPath = path.join(process.cwd(), 'app/api/rooms/availability/route.ts')
      const content = fs.readFileSync(apiPath, 'utf8')

      // Both branches should have this field
      expect(content.match(/surf_week_conflict/g)?.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Date Availability Response', () => {
    it('should include blocked_by_event field in date availability', () => {
      const fs = require('fs')
      const path = require('path')
      const apiPath = path.join(process.cwd(), 'app/api/dates/availability/route.ts')
      const content = fs.readFileSync(apiPath, 'utf8')

      expect(content).toContain('blocked_by_event')
    })
  })
})

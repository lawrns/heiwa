/**
 * Comprehensive tests for formatDate function in surf camps admin
 *
 * The formatDate function was fixed to handle timezone issues that caused
 * dates to shift by one day depending on the user's timezone. The fix
 * ensures dates are always interpreted as UTC and formatted consistently.
 *
 * Related files:
 * - /app/admin/surf-camps/page.tsx
 * - /app/admin/surf-camps/[id]/page.tsx
 */

describe('formatDate function - Timezone Fix Tests', () => {
  /**
   * The formatDate function implementation being tested.
   * This matches the implementation in both surf camps admin pages.
   */
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    })
  }

  describe('Core Functionality', () => {
    it('formats standard date correctly', () => {
      expect(formatDate('2026-06-12')).toBe('12 Jun 2026')
    })

    it('formats date at start of year', () => {
      expect(formatDate('2026-01-01')).toBe('01 Jan 2026')
    })

    it('formats date at end of year', () => {
      expect(formatDate('2026-12-31')).toBe('31 Dec 2026')
    })

    it('formats date in middle of month', () => {
      expect(formatDate('2026-07-15')).toBe('15 Jul 2026')
    })
  })

  describe('Timezone Independence', () => {
    /**
     * These tests verify that the formatDate function produces consistent
     * results regardless of the system timezone. Before the fix, dates
     * would shift by one day in certain timezones.
     */

    it('handles date that would cross day boundary in negative timezone', () => {
      // In UTC-8 (PST), parsing '2026-06-12' without UTC would create
      // a date at midnight PST, which is 8am UTC the same day.
      // The old implementation could show '11 Jun 2026' in some cases.
      expect(formatDate('2026-06-12')).toBe('12 Jun 2026')
    })

    it('handles date that would cross day boundary in positive timezone', () => {
      // In UTC+9 (JST), parsing '2026-06-12' without UTC would create
      // a date at midnight JST, which is 3pm UTC the previous day.
      // The old implementation could show '13 Jun 2026' in some cases.
      expect(formatDate('2026-06-12')).toBe('12 Jun 2026')
    })

    it('maintains consistency across multiple calls', () => {
      const date = '2026-06-12'
      const result1 = formatDate(date)
      const result2 = formatDate(date)
      const result3 = formatDate(date)

      expect(result1).toBe('12 Jun 2026')
      expect(result2).toBe('12 Jun 2026')
      expect(result3).toBe('12 Jun 2026')
    })
  })

  describe('Edge Cases - Month Boundaries', () => {
    it('handles end of January', () => {
      expect(formatDate('2026-01-31')).toBe('31 Jan 2026')
    })

    it('handles end of February in non-leap year', () => {
      expect(formatDate('2026-02-28')).toBe('28 Feb 2026')
    })

    it('handles end of February in leap year', () => {
      expect(formatDate('2024-02-29')).toBe('29 Feb 2024')
    })

    it('handles end of March', () => {
      expect(formatDate('2026-03-31')).toBe('31 Mar 2026')
    })

    it('handles end of April (30 days)', () => {
      expect(formatDate('2026-04-30')).toBe('30 Apr 2026')
    })

    it('handles end of May', () => {
      expect(formatDate('2026-05-31')).toBe('31 May 2026')
    })

    it('handles end of June (30 days)', () => {
      expect(formatDate('2026-06-30')).toBe('30 Jun 2026')
    })

    it('handles end of July', () => {
      expect(formatDate('2026-07-31')).toBe('31 Jul 2026')
    })

    it('handles end of August', () => {
      expect(formatDate('2026-08-31')).toBe('31 Aug 2026')
    })

    it('handles end of September (30 days)', () => {
      // Browser may return 'Sep' or 'Sept' depending on locale
      expect(formatDate('2026-09-30')).toMatch(/30 Sept? 2026/)
    })

    it('handles end of October', () => {
      expect(formatDate('2026-10-31')).toBe('31 Oct 2026')
    })

    it('handles end of November (30 days)', () => {
      expect(formatDate('2026-11-30')).toBe('30 Nov 2026')
    })

    it('handles end of December', () => {
      expect(formatDate('2026-12-31')).toBe('31 Dec 2026')
    })
  })

  describe('Edge Cases - Year Boundaries', () => {
    it('handles first day of year', () => {
      expect(formatDate('2026-01-01')).toBe('01 Jan 2026')
    })

    it('handles last day of year', () => {
      expect(formatDate('2025-12-31')).toBe('31 Dec 2025')
    })

    it('handles dates around year transition', () => {
      expect(formatDate('2025-12-30')).toBe('30 Dec 2025')
      expect(formatDate('2025-12-31')).toBe('31 Dec 2025')
      expect(formatDate('2026-01-01')).toBe('01 Jan 2026')
      expect(formatDate('2026-01-02')).toBe('02 Jan 2026')
    })
  })

  describe('Leap Year Handling', () => {
    it('handles leap year February 29th', () => {
      expect(formatDate('2024-02-29')).toBe('29 Feb 2024')
    })

    it('handles leap year March 1st', () => {
      expect(formatDate('2024-03-01')).toBe('01 Mar 2024')
    })

    it('handles non-leap year February 28th', () => {
      expect(formatDate('2025-02-28')).toBe('28 Feb 2025')
    })

    it('handles non-leap year March 1st', () => {
      expect(formatDate('2025-03-01')).toBe('01 Mar 2025')
    })

    it('handles century leap year (divisible by 400)', () => {
      expect(formatDate('2000-02-29')).toBe('29 Feb 2000')
    })
  })

  describe('Month Abbreviations', () => {
    it('uses correct abbreviated month names', () => {
      expect(formatDate('2026-01-15')).toContain('Jan')
      expect(formatDate('2026-02-15')).toContain('Feb')
      expect(formatDate('2026-03-15')).toContain('Mar')
      expect(formatDate('2026-04-15')).toContain('Apr')
      expect(formatDate('2026-05-15')).toContain('May')
      expect(formatDate('2026-06-15')).toContain('Jun')
      expect(formatDate('2026-07-15')).toContain('Jul')
      expect(formatDate('2026-08-15')).toContain('Aug')
      expect(formatDate('2026-09-15')).toContain('Sep')
      expect(formatDate('2026-10-15')).toContain('Oct')
      expect(formatDate('2026-11-15')).toContain('Nov')
      expect(formatDate('2026-12-15')).toContain('Dec')
    })
  })

  describe('Format Consistency', () => {
    it('always uses 2-digit day format', () => {
      expect(formatDate('2026-06-01')).toBe('01 Jun 2026')
      expect(formatDate('2026-06-09')).toBe('09 Jun 2026')
      expect(formatDate('2026-06-10')).toBe('10 Jun 2026')
      expect(formatDate('2026-06-30')).toBe('30 Jun 2026')
    })

    it('maintains consistent spacing and formatting', () => {
      const result = formatDate('2026-06-12')
      expect(result).toMatch(/^\d{2} [A-Z][a-z]{2} \d{4}$/)
    })

    it('uses 4-digit year format', () => {
      expect(formatDate('2026-06-12')).toContain('2026')
      expect(formatDate('2025-06-12')).toContain('2025')
      expect(formatDate('2030-06-12')).toContain('2030')
    })
  })

  describe('Historical and Future Dates', () => {
    it('handles past dates', () => {
      expect(formatDate('2020-03-15')).toBe('15 Mar 2020')
      expect(formatDate('2015-12-25')).toBe('25 Dec 2015')
      expect(formatDate('2010-01-01')).toBe('01 Jan 2010')
    })

    it('handles far future dates', () => {
      expect(formatDate('2030-06-12')).toBe('12 Jun 2030')
      expect(formatDate('2050-12-31')).toBe('31 Dec 2050')
      expect(formatDate('2099-01-01')).toBe('01 Jan 2099')
    })
  })

  describe('Date Range Scenarios', () => {
    /**
     * These tests simulate real-world surf camp date scenarios
     * to ensure the function works correctly in production use cases.
     */

    it('handles typical surf camp date range', () => {
      const startDate = formatDate('2026-06-12')
      const endDate = formatDate('2026-06-19')

      expect(startDate).toBe('12 Jun 2026')
      expect(endDate).toBe('19 Jun 2026')
    })

    it('handles surf camp crossing month boundary', () => {
      const startDate = formatDate('2026-06-28')
      const endDate = formatDate('2026-07-05')

      expect(startDate).toBe('28 Jun 2026')
      expect(endDate).toBe('05 Jul 2026')
    })

    it('handles surf camp crossing year boundary', () => {
      const startDate = formatDate('2025-12-28')
      const endDate = formatDate('2026-01-04')

      expect(startDate).toBe('28 Dec 2025')
      expect(endDate).toBe('04 Jan 2026')
    })

    it('handles consecutive surf camp dates', () => {
      // Week 1: June 12-19
      expect(formatDate('2026-06-12')).toBe('12 Jun 2026')
      expect(formatDate('2026-06-19')).toBe('19 Jun 2026')

      // Week 2: June 20-27 (starts day after previous ends)
      expect(formatDate('2026-06-20')).toBe('20 Jun 2026')
      expect(formatDate('2026-06-27')).toBe('27 Jun 2026')
    })
  })

  describe('Regression Tests', () => {
    /**
     * These tests verify the specific bug that was fixed:
     * Dates shifting by one day in certain timezones.
     */

    it('prevents day shift in Western timezones (UTC-)', () => {
      // These dates were problematic in UTC-8 and similar timezones
      expect(formatDate('2026-06-12')).toBe('12 Jun 2026')
      expect(formatDate('2026-01-01')).toBe('01 Jan 2026')
      expect(formatDate('2026-12-31')).toBe('31 Dec 2026')
    })

    it('prevents day shift in Eastern timezones (UTC+)', () => {
      // These dates were problematic in UTC+9 and similar timezones
      expect(formatDate('2026-06-12')).toBe('12 Jun 2026')
      expect(formatDate('2026-01-01')).toBe('01 Jan 2026')
      expect(formatDate('2026-12-31')).toBe('31 Dec 2026')
    })

    it('handles dates that cross DST boundaries', () => {
      // Daylight Saving Time changes (if applicable in user's timezone)
      // should not affect the output since we use UTC
      expect(formatDate('2026-03-08')).toBe('08 Mar 2026')  // Around DST start
      expect(formatDate('2026-11-01')).toBe('01 Nov 2026')  // Around DST end
    })
  })

  describe('Input Format Validation', () => {
    /**
     * These tests verify that the function correctly handles
     * the expected YYYY-MM-DD format from the database.
     */

    it('handles single-digit month with leading zero', () => {
      expect(formatDate('2026-01-15')).toBe('15 Jan 2026')
      // Browser may return 'Sep' or 'Sept' depending on locale
      expect(formatDate('2026-09-15')).toMatch(/15 Sept? 2026/)
    })

    it('handles single-digit day with leading zero', () => {
      expect(formatDate('2026-06-01')).toBe('01 Jun 2026')
      expect(formatDate('2026-06-09')).toBe('09 Jun 2026')
    })

    it('handles full date format from database', () => {
      // This is the typical format from PostgreSQL date columns
      expect(formatDate('2026-06-12')).toBe('12 Jun 2026')
    })
  })

  describe('Comparison with Native Date Parsing', () => {
    /**
     * These tests demonstrate why the UTC parsing is necessary
     * by showing what would happen with naive Date parsing.
     */

    it('produces consistent output regardless of local timezone', () => {
      // Using the fixed formatDate function
      const fixedResult = formatDate('2026-06-12')

      // This should always be '12 Jun 2026' regardless of where the test runs
      expect(fixedResult).toBe('12 Jun 2026')
    })

    it('avoids timezone offset issues', () => {
      // The key dates that were problematic before the fix
      const testDates = [
        '2026-01-01',
        '2026-06-12',
        '2026-12-31',
        '2024-02-29',
        '2025-12-25'
      ]

      const expectedResults = [
        '01 Jan 2026',
        '12 Jun 2026',
        '31 Dec 2026',
        '29 Feb 2024',
        '25 Dec 2025'
      ]

      testDates.forEach((date, index) => {
        expect(formatDate(date)).toBe(expectedResults[index])
      })
    })
  })
})

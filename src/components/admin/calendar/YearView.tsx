import React, { useMemo } from 'react'

// Lightweight custom Year view for react-big-calendar.
// It renders a 12-month grid and highlights days that have events.
// We intentionally keep types loose to avoid tight coupling with rbc internals.

type RBCEvent = {
  id: string
  title: string
  start: Date
  end: Date
  resource?: any
}

type YearViewProps = {
  date: Date
  events: RBCEvent[]
  localizer: any
  onSelectEvent?: (event: RBCEvent) => void
  onSelectSlot?: (slot: { start: Date; end: Date; action: 'click' }) => void
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function dayHasEvent(day: Date, events: RBCEvent[]) {
  const dayStart = startOfDay(day)
  const dayEnd = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate() + 1)
  return events.some((e) => e.start < dayEnd && e.end > dayStart)
}

function eventsOnDay(day: Date, events: RBCEvent[]) {
  const dayStart = startOfDay(day)
  const dayEnd = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate() + 1)
  return events.filter((e) => e.start < dayEnd && e.end > dayStart)
}

function buildMonthMatrix(year: number, month: number) {
  // Returns a 6x7 matrix of dates for the month view (like typical calendars)
  const firstOfMonth = new Date(year, month, 1)
  const dayOfWeek = firstOfMonth.getDay() // 0 Sun .. 6 Sat
  const gridStart = new Date(year, month, 1 - dayOfWeek)
  const matrix: Date[][] = []
  const current = new Date(gridStart)
  for (let w = 0; w < 6; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    matrix.push(week)
  }
  return matrix
}

export const YearView: React.FC<YearViewProps> & {
  range?: (date: Date) => Date[]
  navigate?: (date: Date, action: 'PREV' | 'NEXT' | 'TODAY') => Date
  title?: (date: Date) => string
} = ({ date, events, localizer, onSelectEvent, onSelectSlot }) => {
  const year = date.getFullYear()

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => ({
      month: m,
      name: localizer?.format(new Date(year, m, 1), 'MMMM') ?? new Date(year, m, 1).toLocaleString(undefined, { month: 'long' }),
      matrix: buildMonthMatrix(year, m),
    }))
  }, [year, localizer])

  return (
    <div className="h-full overflow-auto p-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map(({ month, name, matrix }) => (
          <div key={month} className="border rounded-lg bg-white">
            <div className="px-3 py-2 border-b font-semibold text-gray-800">{name} {year}</div>
            <div className="grid grid-cols-7 text-xs text-gray-500 px-3 pt-2">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                <div key={d} className="py-1 text-center">{d}</div>
              ))}
            </div>
            <div className="grid grid-rows-6 grid-cols-7 gap-1 p-2">
              {matrix.flat().map((day, idx) => {
                const inMonth = day.getMonth() === month
                const has = dayHasEvent(day, events)
                const todaysEvents = has ? eventsOnDay(day, events) : []
                return (
                  <button
                    key={idx}
                    type="button"
                    className={[
                      'relative h-10 rounded-md border text-xs flex items-center justify-center transition-colors',
                      inMonth ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 text-gray-400',
                      has ? 'border-blue-300' : 'border-gray-200',
                    ].join(' ')}
                    onClick={() => onSelectSlot?.({ start: startOfDay(day), end: new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1), action: 'click' })}
                    aria-label={`${day.toDateString()}${has ? `, ${todaysEvents.length} events` : ''}`}
                  >
                    <span className="absolute top-1 left-1 text-[10px]">{day.getDate()}</span>
                    {has && (
                      <span className="absolute bottom-1 right-1 flex -space-x-1">
                        {todaysEvents.slice(0, 3).map((e) => (
                          <span
                            key={e.id}
                            title={e.title}
                            className={[
                              'inline-block w-2.5 h-2.5 rounded-full border border-white',
                              e.resource?.type === 'surfCamp'
                                ? (e.resource?.category === 'FR' ? 'bg-orange-500' : 'bg-blue-500')
                                : e.resource?.type === 'booking'
                                ? 'bg-gray-500'
                                : 'bg-green-500',
                            ].join(' ')}
                            onClick={(ev) => { ev.stopPropagation(); onSelectEvent?.(e) }}
                          />
                        ))}
                        {todaysEvents.length > 3 && (
                          <span className="ml-1 text-[10px] text-gray-600">+{todaysEvents.length - 3}</span>
                        )}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Static hooks for react-big-calendar toolbars/navigation
YearView.range = function range(date: Date) {
  // Not used by our custom renderer, but required by RBC API
  // Return first and last day of the year as a minimal range
  const start = new Date(date.getFullYear(), 0, 1)
  const end = new Date(date.getFullYear(), 11, 31)
  return [start, end]
}

YearView.navigate = function navigate(date: Date, action: 'PREV' | 'NEXT' | 'TODAY') {
  switch (action) {
    case 'PREV':
      return new Date(date.getFullYear() - 1, date.getMonth(), 1)
    case 'NEXT':
      return new Date(date.getFullYear() + 1, date.getMonth(), 1)
    case 'TODAY':
    default:
      return new Date()
  }
}

YearView.title = function title(date: Date) {
  return `${date.getFullYear()}`
}

export default YearView


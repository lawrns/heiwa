import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatCard from '@/components/admin/StatCard'
import { TrendingUp } from 'lucide-react'

describe('StatCard Component', () => {
  it('renders with title and value', () => {
    const { container } = render(
      <StatCard
        title="Total Bookings"
        value="150"
        icon={TrendingUp}
      />
    )
    
    expect(container.textContent).toContain('Total Bookings')
    expect(container.textContent).toContain('150')
  })

  it('displays positive trend correctly', () => {
    const { container } = render(
      <StatCard
        title="Revenue"
        value="€5,000"
        icon={TrendingUp}
        trend={{ value: 12.5, direction: 'up' }}
      />
    )
    
    expect(container.textContent).toContain('12.5')
    expect(container.textContent).toContain('↑')
  })

  it('displays negative trend correctly', () => {
    const { container } = render(
      <StatCard
        title="Cancellations"
        value="5"
        icon={TrendingUp}
        trend={{ value: 5.2, direction: 'down' }}
      />
    )
    
    expect(container.textContent).toContain('5.2')
    expect(container.textContent).toContain('↓')
  })

  it('renders with custom color', () => {
    const { container } = render(
      <StatCard
        title="Active Clients"
        value="45"
        icon={TrendingUp}
        color="green"
      />
    )
    
    expect(container.textContent).toContain('Active Clients')
    expect(container.textContent).toContain('45')
  })

  it('renders without trend when not provided', () => {
    const { container } = render(
      <StatCard
        title="Total Users"
        value="1,200"
        icon={TrendingUp}
      />
    )
    
    expect(container.textContent).toContain('Total Users')
    expect(container.textContent).toContain('1,200')
  })

  it('renders with description', () => {
    const { container } = render(
      <StatCard
        title="Total Bookings"
        value="150"
        icon={TrendingUp}
        description="This month"
      />
    )
    
    expect(container.textContent).toContain('This month')
  })
})

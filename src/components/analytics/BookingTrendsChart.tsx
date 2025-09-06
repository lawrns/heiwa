'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

interface BookingTrendsData {
  month: string;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
}

export default function BookingTrendsChart() {
  const [data, setData] = useState<BookingTrendsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingTrendsData = async () => {
      try {
        setLoading(true);
        
        // Mock data - in real implementation, fetch from /api/analytics/booking-trends
        const mockData: BookingTrendsData[] = [
          { month: 'Jan', totalBookings: 45, confirmedBookings: 38, pendingBookings: 4, cancelledBookings: 3 },
          { month: 'Feb', totalBookings: 52, confirmedBookings: 44, pendingBookings: 5, cancelledBookings: 3 },
          { month: 'Mar', totalBookings: 61, confirmedBookings: 53, pendingBookings: 6, cancelledBookings: 2 },
          { month: 'Apr', totalBookings: 58, confirmedBookings: 49, pendingBookings: 7, cancelledBookings: 2 },
          { month: 'May', totalBookings: 67, confirmedBookings: 58, pendingBookings: 6, cancelledBookings: 3 },
          { month: 'Jun', totalBookings: 74, confirmedBookings: 65, pendingBookings: 7, cancelledBookings: 2 },
          { month: 'Jul', totalBookings: 82, confirmedBookings: 72, pendingBookings: 8, cancelledBookings: 2 },
          { month: 'Aug', totalBookings: 79, confirmedBookings: 69, pendingBookings: 7, cancelledBookings: 3 },
          { month: 'Sep', totalBookings: 71, confirmedBookings: 62, pendingBookings: 6, cancelledBookings: 3 },
          { month: 'Oct', totalBookings: 64, confirmedBookings: 56, pendingBookings: 5, cancelledBookings: 3 },
          { month: 'Nov', totalBookings: 58, confirmedBookings: 51, pendingBookings: 4, cancelledBookings: 3 },
          { month: 'Dec', totalBookings: 63, confirmedBookings: 55, pendingBookings: 5, cancelledBookings: 3 }
        ];

        setData(mockData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch booking trends data:', err);
        setError('Failed to load booking trends data');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingTrendsData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} bookings
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const totalBookings = data.reduce((sum, item) => sum + item.totalBookings, 0);
  const totalConfirmed = data.reduce((sum, item) => sum + item.confirmedBookings, 0);
  const confirmationRate = totalBookings > 0 ? (totalConfirmed / totalBookings) * 100 : 0;
  
  // Calculate trend (comparing last 3 months to previous 3 months)
  const recentMonths = data.slice(-3);
  const previousMonths = data.slice(-6, -3);
  const recentAvg = recentMonths.reduce((sum, item) => sum + item.totalBookings, 0) / 3;
  const previousAvg = previousMonths.reduce((sum, item) => sum + item.totalBookings, 0) / 3;
  const trendPercentage = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {totalBookings} Total Bookings
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {confirmationRate.toFixed(1)}% Confirmed
          </Badge>
          <Badge 
            variant="secondary" 
            className={`flex items-center ${
              trendPercentage >= 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {trendPercentage >= 0 ? (
              <TrendingUpIcon className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDownIcon className="w-3 h-3 mr-1" />
            )}
            {trendPercentage >= 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
          </Badge>
        </div>
      </div>

      <div data-testid="booking-trends-chart">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalBookings"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="Total Bookings"
            />
            <Line
              type="monotone"
              dataKey="confirmedBookings"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              name="Confirmed"
            />
            <Line
              type="monotone"
              dataKey="pendingBookings"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              name="Pending"
            />
            <Line
              type="monotone"
              dataKey="cancelledBookings"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              name="Cancelled"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Booking trends and status breakdown over the past 12 months
        </p>
      </div>
    </div>
  );
}

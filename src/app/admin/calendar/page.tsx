'use client'

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { supabase } from '@/lib/firebase';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import { format } from 'date-fns';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// This page uses Supabase and should not be prerendered
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SurfCamp, Booking } from '@/lib/schemas';
import { CalendarDays, Users, MapPin, Plus } from 'lucide-react';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Calendar event interface
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'surfCamp' | 'booking';
    category?: 'FR' | 'HH';
    occupancy: number;
    capacity: number;
    status?: string;
    location?: string;
  };
}

// Custom event component for the calendar
const EventComponent = ({ event }: { event: CalendarEvent }) => {
  const getEventColor = () => {
    if (event.resource.type === 'surfCamp') {
      return event.resource.category === 'FR' ? 'bg-orange-500' : 'bg-blue-500';
    }
    return 'bg-gray-500';
  };

  const getEventIcon = () => {
    return event.resource.type === 'surfCamp' ? <MapPin className="w-3 h-3" /> : <Users className="w-3 h-3" />;
  };

  return (
    <div className={`flex items-center space-x-1 text-white text-xs p-1 rounded ${getEventColor()}`}>
      {getEventIcon()}
      <span className="truncate">{event.title}</span>
      <Badge variant="secondary" className="text-xs ml-auto">
        {event.resource.occupancy}/{event.resource.capacity}
      </Badge>
    </div>
  );
};

export default function CalendarPage() {
  const router = useRouter();
  // State for data and loading
  const [surfCamps, setSurfCamps] = useState<(SurfCamp & { id: string })[]>([]);
  const [bookings, setBookings] = useState<(Booking & { id: string })[]>([]);
  const [loadingCamps, setLoadingCamps] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Fetch surf camps from Supabase with caching
  const fetchSurfCamps = useCallback(async () => {
    try {
      setLoadingCamps(true);
      const { data, error } = await supabase
        .from('surf_camps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching surf camps:', error);
        return;
      }

      if (data) {
        const formattedCamps = data.map(camp => ({
          id: camp.id,
          name: camp.name,
          description: camp.description,
          startDate: new Date(camp.start_date),
          endDate: new Date(camp.end_date),
          maxParticipants: camp.max_participants,
          price: camp.price,
          level: camp.level,
          includes: camp.includes || [],
          images: camp.images || [],
          isActive: camp.is_active,
          createdAt: new Date(camp.created_at),
          updatedAt: new Date(camp.updated_at)
        }));
        setSurfCamps(formattedCamps);
      }
    } catch (error) {
      console.error('Error fetching surf camps:', error);
    } finally {
      setLoadingCamps(false);
    }
  }, []);

  // Fetch bookings from Supabase with caching
  const fetchBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }

      if (data) {
        const formattedBookings = data.map(booking => ({
          id: booking.id,
          clientIds: booking.client_ids || [],
          items: booking.items || [],
          totalAmount: booking.total_amount,
          paymentStatus: booking.payment_status,
          paymentMethod: booking.payment_method,
          notes: booking.notes,
          createdAt: new Date(booking.created_at),
          updatedAt: new Date(booking.updated_at)
        }));
        setBookings(formattedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchSurfCamps();
    fetchBookings();
  }, [fetchSurfCamps, fetchBookings]);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to surf camps changes
    const surfCampsSubscription = supabase
      .channel('surf_camps_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'surf_camps' },
        (payload) => {
          console.log('Surf camps change detected:', payload);
          fetchSurfCamps(); // Refresh data when changes occur
        }
      )
      .subscribe();

    // Subscribe to bookings changes
    const bookingsSubscription = supabase
      .channel('bookings_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log('Bookings change detected:', payload);
          fetchBookings(); // Refresh data when changes occur
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      surfCampsSubscription.unsubscribe();
      bookingsSubscription.unsubscribe();
    };
  }, [fetchSurfCamps, fetchBookings]);

  // Create calendar events from surf camps and bookings (memoized for performance)
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add surf camp events
    surfCamps.forEach(camp => {
      if (camp.startDate && camp.endDate) {
        const startDate = camp.startDate.toDate();
        const endDate = camp.endDate.toDate();

        // Calculate current occupancy from bookings
        const campBookings = bookings.filter(booking =>
          booking.items.some(item => item.type === 'surfCamp' && item.itemId === camp.id)
        );
        const currentOccupancy = campBookings.reduce((total, booking) => total + booking.clientIds.length, 0);

        events.push({
          id: `camp-${camp.id}`,
          title: `${camp.category} Surf Camp`,
          start: startDate,
          end: endDate,
          resource: {
            type: 'surfCamp',
            category: camp.category,
            occupancy: currentOccupancy,
            capacity: camp.occupancy,
            location: camp.category === 'FR' ? 'Frenchman\'s' : 'Honolua Bay',
          },
        });
      }
    });

    // Add booking events (room bookings)
    bookings.forEach(booking => {
      booking.items.forEach((item, index) => {
        if (item.type === 'room' && item.dates) {
          const startDate = item.dates.checkIn.toDate();
          const endDate = item.dates.checkOut.toDate();

          events.push({
            id: `booking-${booking.id}-${index}`,
            title: `Room Booking (${booking.clientIds.length} guests)`,
            start: startDate,
            end: endDate,
            resource: {
              type: 'booking',
              occupancy: booking.clientIds.length,
              capacity: 10, // Default capacity, could be made dynamic
              status: booking.paymentStatus,
            },
          });
        }
      });
    });

    return events;
  }, [surfCamps, bookings]);

  // Event styling function
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    let backgroundColor = '#6b7280'; // Default gray

    if (event.resource.type === 'surfCamp') {
      backgroundColor = event.resource.category === 'FR' ? '#f97316' : '#3b82f6';
    } else if (event.resource.type === 'booking') {
      backgroundColor = '#4b5563'; // Darker gray for bookings
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  }, []);

  // Event click handler
  const handleEventClick = useCallback((event: CalendarEvent) => {
    if (event.resource.type === 'surfCamp') {
      router.push(`/admin/surfcamps`);
    } else if (event.resource.type === 'booking') {
      router.push(`/admin/bookings`);
    }
  }, [router]);

  // Custom tooltip
  const EventTooltip = ({ event }: { event: CalendarEvent }) => {
    const occupancyText = `${event.resource.occupancy}/${event.resource.capacity} spots`;
    const statusText = event.resource.status ? `Status: ${event.resource.status}` : '';
    const locationText = event.resource.location ? `Location: ${event.resource.location}` : '';

    return (
      <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-lg max-w-xs">
        <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p><Users className="w-4 h-4 inline mr-1" />{occupancyText}</p>
          {locationText && <p><MapPin className="w-4 h-4 inline mr-1" />{locationText}</p>}
          {statusText && <p>{statusText}</p>}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {moment(event.start).format('MMM DD, YYYY')} - {moment(event.end).format('MMM DD, YYYY')}
        </div>
      </div>
    );
  };

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => onNavigate('PREV')}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate('TODAY')}>
          Today
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate('NEXT')}>
          Next
        </Button>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">{label}</h2>
      <div className="flex items-center space-x-2 flex-wrap">
        <Button
          variant={onView === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView('month')}
          className="text-xs sm:text-sm"
        >
          Month
        </Button>
        <Button
          variant={onView === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView('week')}
          className="text-xs sm:text-sm"
        >
          Week
        </Button>
        <Button
          variant={onView === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView('day')}
          className="text-xs sm:text-sm"
        >
          Day
        </Button>
      </div>
    </div>
  );

  if (loadingCamps || loadingBookings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading calendar...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            className="text-3xl font-bold text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Calendar
          </motion.h1>
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            View booking calendar and manage schedules
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </motion.div>
      </div>

      {/* Legend */}
      <motion.div
        className="flex items-center space-x-6 p-4 bg-white border border-gray-200 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-sm font-medium">Frenchman's Surf Camp</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm font-medium">Honolua Bay Surf Camp</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <span className="text-sm font-medium">Room Bookings</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Booking Calendar</CardTitle>
            <CardDescription>
              View and manage all bookings and surf camp sessions in calendar format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[600px] sm:h-[700px] lg:h-[800px]" role="main" aria-label="Booking calendar">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleEventClick}
                components={{
                  event: EventComponent,
                  toolbar: CustomToolbar,
                }}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                defaultView={Views.MONTH}
                popup
                selectable
                tooltipAccessor={(event) => `${event.resource.occupancy}/${event.resource.capacity} spots`}
                aria-describedby="calendar-description"
              />
            </div>
            <div id="calendar-description" className="sr-only">
              Interactive calendar showing surf camp sessions and room bookings. Click on events to view details.
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{calendarEvents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Surf Camp Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {calendarEvents.filter(event => event.resource.type === 'surfCamp').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Room Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {calendarEvents.filter(event => event.resource.type === 'booking').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {calendarEvents.filter(event => {
                const now = new Date();
                return event.start.getMonth() === now.getMonth() &&
                       event.start.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

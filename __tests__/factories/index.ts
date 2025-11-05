// Test data factories for consistent test data across all tests

export interface TestDataOverrides {
  [key: string]: any
}

// Base factory
export abstract class Factory<T> {
  abstract build(overrides?: TestDataOverrides): T
  
  buildList(count: number, overrides?: TestDataOverrides): T[] {
    return Array.from({ length: count }, () => this.build(overrides))
  }
}

// Room factory
export class RoomFactory extends Factory<any> {
  build(overrides: TestDataOverrides = {}) {
    return {
      id: 'room-1',
      name: 'Dorm room',
      description: 'Shared dormitory room with ocean views',
      capacity: 6,
      price_per_night: 30,
      images: ['/images/dorm-room.jpg'],
      amenities: ['wifi', 'kitchen', 'ocean-view'],
      available: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      ...overrides
    }
  }

  static dorm(overrides: TestDataOverrides = {}) {
    return new RoomFactory().build({
      id: 'room-dorm',
      name: 'Dorm room',
      capacity: 6,
      price_per_night: 30,
      ...overrides
    })
  }

  static private(overrides: TestDataOverrides = {}) {
    return new RoomFactory().build({
      id: 'room-private',
      name: 'Private Room',
      capacity: 1,
      price_per_night: 80,
      ...overrides
    })
  }

  static suite(overrides: TestDataOverrides = {}) {
    return new RoomFactory().build({
      id: 'room-suite',
      name: 'Suite',
      capacity: 2,
      price_per_night: 120,
      ...overrides
    })
  }

  static cave(overrides: TestDataOverrides = {}) {
    return new RoomFactory().build({
      id: 'room-cave',
      name: 'The Cave',
      capacity: 3,
      price_per_night: 90,
      ...overrides
    })
  }
}

// Booking factory
export class BookingFactory extends Factory<any> {
  build(overrides: TestDataOverrides = {}) {
    return {
      id: 'booking-1',
      clientName: 'John Doe',
      email: 'john@example.com',
      phone: '+351 912 193 785',
      checkIn: '2026-02-01',
      checkOut: '2026-02-03',
      roomId: 'room-1',
      guests: 2,
      status: 'confirmed',
      total_amount: 60,
      message: 'Looking forward to our stay',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      ...overrides
    }
  }

  static confirmed(overrides: TestDataOverrides = {}) {
    return new BookingFactory().build({
      status: 'confirmed',
      ...overrides
    })
  }

  static pending(overrides: TestDataOverrides = {}) {
    return new BookingFactory().build({
      status: 'pending',
      ...overrides
    })
  }

  static cancelled(overrides: TestDataOverrides = {}) {
    return new BookingFactory().build({
      status: 'cancelled',
      ...overrides
    })
  }
}

// Add-on factory
export class AddOnFactory extends Factory<any> {
  build(overrides: TestDataOverrides = {}) {
    return {
      id: 'addon-1',
      name: 'Surf Lesson',
      description: '2-hour surf lesson with instructor',
      price: 50,
      duration: '2 hours',
      available: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      ...overrides
    }
  }

  static surfLesson(overrides: TestDataOverrides = {}) {
    return new AddOnFactory().build({
      id: 'addon-surf',
      name: 'Surf Lesson',
      price: 50,
      duration: '2 hours',
      ...overrides
    })
  }

  static yogaClass(overrides: TestDataOverrides = {}) {
    return new AddOnFactory().build({
      id: 'addon-yoga',
      name: 'Yoga Class',
      price: 30,
      duration: '1.5 hours',
      ...overrides
    })
  }

  static bikeRental(overrides: TestDataOverrides = {}) {
    return new AddOnFactory().build({
      id: 'addon-bike',
      name: 'Bike Rental',
      price: 25,
      duration: '1 day',
      ...overrides
    })
  }
}

// Surf camp factory
export class SurfCampFactory extends Factory<any> {
  build(overrides: TestDataOverrides = {}) {
    return {
      id: 'camp-1',
      name: 'Beginner Surf Camp',
      description: '7-day surf camp for beginners',
      price: 500,
      duration: '7 days',
      level: 'beginner',
      max_participants: 10,
      available: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      ...overrides
    }
  }

  static beginner(overrides: TestDataOverrides = {}) {
    return new SurfCampFactory().build({
      id: 'camp-beginner',
      name: 'Beginner Surf Camp',
      level: 'beginner',
      price: 500,
      ...overrides
    })
  }

  static advanced(overrides: TestDataOverrides = {}) {
    return new SurfCampFactory().build({
      id: 'camp-advanced',
      name: 'Advanced Surf Camp',
      level: 'advanced',
      price: 700,
      ...overrides
    })
  }
}

// Review factory
export class ReviewFactory extends Factory<any> {
  build(overrides: TestDataOverrides = {}) {
    return {
      id: 'review-1',
      author_name: 'John Doe',
      rating: 5,
      text: 'Amazing experience! Highly recommended.',
      relative_time_description: '1 week ago',
      profile_photo_url: '/images/default-avatar.jpg',
      ...overrides
    }
  }

  static fiveStar(overrides: TestDataOverrides = {}) {
    return new ReviewFactory().build({
      rating: 5,
      text: 'Amazing experience! Highly recommended.',
      ...overrides
    })
  }

  static fourStar(overrides: TestDataOverrides = {}) {
    return new ReviewFactory().build({
      rating: 4,
      text: 'Great place to stay, beautiful location.',
      ...overrides
    })
  }

  static threeStar(overrides: TestDataOverrides = {}) {
    return new ReviewFactory().build({
      rating: 3,
      text: 'Good experience, some room for improvement.',
      ...overrides
    })
  }
}

// User factory
export class UserFactory extends Factory<any> {
  build(overrides: TestDataOverrides = {}) {
    return {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+351 912 193 785',
      avatar: '/images/default-avatar.jpg',
      role: 'customer',
      created_at: '2024-01-01T00:00:00Z',
      ...overrides
    }
  }

  static customer(overrides: TestDataOverrides = {}) {
    return new UserFactory().build({
      role: 'customer',
      ...overrides
    })
  }

  static admin(overrides: TestDataOverrides = {}) {
    return new UserFactory().build({
      role: 'admin',
      email: 'admin@heiwa-house.com',
      ...overrides
    })
  }
}

// Form data factory for testing form submissions
export class FormDataFactory {
  static booking(overrides: TestDataOverrides = {}) {
    return {
      clientName: 'John Doe',
      email: 'john@example.com',
      phone: '+351 912 193 785',
      checkIn: '2026-02-01',
      checkOut: '2026-02-03',
      roomId: 'room-1',
      guests: 2,
      message: 'Looking forward to our stay',
      ...overrides
    }
  }

  static invalidBooking(overrides: TestDataOverrides = {}) {
    return {
      clientName: '',
      email: 'invalid-email',
      phone: '',
      checkIn: '',
      checkOut: '',
      roomId: '',
      guests: 0,
      ...overrides
    }
  }

  static contact(overrides: TestDataOverrides = {}) {
    return {
      name: 'Jane Smith',
      email: 'jane@example.com',
      subject: 'General Inquiry',
      message: 'I would like to know more about your facilities.',
      ...overrides
    }
  }
}

// API response factory
export class ApiResponseFactory {
  static success(data: any, message = 'Success') {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    }
  }

  static error(message = 'Error occurred', status = 400) {
    return {
      success: false,
      error: message,
      status,
      timestamp: new Date().toISOString()
    }
  }

  static validation(errors: string[]) {
    return {
      success: false,
      error: 'Validation failed',
      errors,
      timestamp: new Date().toISOString()
    }
  }
}

// Export all factories for easy importing
export {
  RoomFactory,
  BookingFactory,
  AddOnFactory,
  SurfCampFactory,
  ReviewFactory,
  UserFactory,
  FormDataFactory,
  ApiResponseFactory
}

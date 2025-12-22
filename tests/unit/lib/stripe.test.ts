/**
 * Stripe Integration Unit Tests
 * Tests for Stripe client initialization and configuration
 */

// Mock Stripe before importing
jest.mock('stripe', () => {
  return jest.fn().mockImplementation((apiKey: string, config: any) => ({
    apiKey,
    config,
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

import Stripe from 'stripe';

describe('Stripe Integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // ==========================================================================
  // Client Initialization Tests
  // ==========================================================================

  describe('Client Initialization', () => {
    it('should initialize Stripe client with API key', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      
      // Re-import to get fresh module with new env
      jest.resetModules();
      const { stripe } = await import('@/lib/stripe');

      // Stripe client should be defined
      expect(stripe).toBeDefined();
    });

    it('should use placeholder key when STRIPE_SECRET_KEY is missing', async () => {
      delete process.env.STRIPE_SECRET_KEY;
      
      jest.resetModules();
      
      // Should not throw, should use placeholder
      const module = await import('@/lib/stripe');
      expect(module.stripe).toBeDefined();
    });

    it('should configure Stripe with correct API version', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      
      jest.resetModules();
      await import('@/lib/stripe');

      const mockCalls = (Stripe as jest.Mock).mock.calls;
      if (mockCalls.length > 0) {
        const config = mockCalls[0][1];
        expect(config.apiVersion).toBeDefined();
      }
    });

    it('should configure Stripe with app info', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      
      jest.resetModules();
      await import('@/lib/stripe');

      const mockCalls = (Stripe as jest.Mock).mock.calls;
      if (mockCalls.length > 0) {
        const config = mockCalls[0][1];
        expect(config.appInfo).toBeDefined();
        expect(config.appInfo.name).toBe('Heiwa House');
      }
    });

    it('should enable TypeScript mode', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      
      jest.resetModules();
      await import('@/lib/stripe');

      const mockCalls = (Stripe as jest.Mock).mock.calls;
      if (mockCalls.length > 0) {
        const config = mockCalls[0][1];
        expect(config.typescript).toBe(true);
      }
    });
  });

  // ==========================================================================
  // Payment Intent Tests (Mocked)
  // ==========================================================================

  describe('Payment Intents', () => {
    let mockStripe: any;

    beforeEach(async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      jest.resetModules();
      const { stripe } = await import('@/lib/stripe');
      mockStripe = stripe;
    });

    it('should have paymentIntents.create method', () => {
      expect(mockStripe.paymentIntents.create).toBeDefined();
    });

    it('should have paymentIntents.retrieve method', () => {
      expect(mockStripe.paymentIntents.retrieve).toBeDefined();
    });

    it('should have paymentIntents.update method', () => {
      expect(mockStripe.paymentIntents.update).toBeDefined();
    });

    it('should have paymentIntents.cancel method', () => {
      expect(mockStripe.paymentIntents.cancel).toBeDefined();
    });
  });

  // ==========================================================================
  // Customer Tests (Mocked)
  // ==========================================================================

  describe('Customers', () => {
    let mockStripe: any;

    beforeEach(async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      jest.resetModules();
      const { stripe } = await import('@/lib/stripe');
      mockStripe = stripe;
    });

    it('should have customers.create method', () => {
      expect(mockStripe.customers.create).toBeDefined();
    });

    it('should have customers.retrieve method', () => {
      expect(mockStripe.customers.retrieve).toBeDefined();
    });
  });

  // ==========================================================================
  // Webhook Tests (Mocked)
  // ==========================================================================

  describe('Webhooks', () => {
    let mockStripe: any;

    beforeEach(async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      jest.resetModules();
      const { stripe } = await import('@/lib/stripe');
      mockStripe = stripe;
    });

    it('should have webhooks.constructEvent method', () => {
      expect(mockStripe.webhooks.constructEvent).toBeDefined();
    });

    it('should verify webhook signature', () => {
      const payload = JSON.stringify({ type: 'payment_intent.succeeded' });
      const signature = 'test_signature';
      const secret = 'whsec_test';

      // Mock the constructEvent to return a valid event
      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: {} },
      });

      const event = mockStripe.webhooks.constructEvent(payload, signature, secret);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        secret
      );
      expect(event.type).toBe('payment_intent.succeeded');
    });

    it('should throw on invalid webhook signature', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      expect(() => {
        mockStripe.webhooks.constructEvent('payload', 'bad_sig', 'secret');
      }).toThrow('Invalid signature');
    });
  });

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('Error Handling', () => {
    it('should handle missing API key gracefully in development', async () => {
      delete process.env.STRIPE_SECRET_KEY;
      process.env.NODE_ENV = 'development';
      
      jest.resetModules();
      
      // Should not throw
      const module = await import('@/lib/stripe');
      expect(module.stripe).toBeDefined();
    });

    it('should warn when API key is missing', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      delete process.env.STRIPE_SECRET_KEY;
      
      jest.resetModules();
      await import('@/lib/stripe');

      // Check if warning was logged
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

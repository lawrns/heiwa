import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe configuration
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Payment service interface
export interface PaymentService {
  createPaymentIntent(amount: number, currency: string, metadata?: Record<string, any>): Promise<string>;
  confirmPayment(clientSecret: string, paymentMethod: any): Promise<any>;
  retrievePaymentIntent(paymentIntentId: string): Promise<any>;
}

// Stripe payment service implementation
class StripePaymentService implements PaymentService {
  async createPaymentIntent(amount: number, currency = 'usd', metadata?: Record<string, any>) {
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    return data.clientSecret;
  }

  async confirmPayment(clientSecret: string, paymentMethod: any) {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod,
    });

    if (error) {
      throw error;
    }

    return paymentIntent;
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    const response = await fetch(`/api/payment-intent/${paymentIntentId}`);
    if (!response.ok) {
      throw new Error('Failed to retrieve payment intent');
    }
    return response.json();
  }
}

// Export singleton instance
export const paymentService = new StripePaymentService();

// Payment status types
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';

// Payment intent interface
export interface PaymentIntent {
  id: string;
  clientSecret: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

// Helper functions
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const calculateBookingTotal = (items: any[]): number => {
  return items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
};

export const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case 'succeeded':
      return 'text-green-600 bg-green-100';
    case 'processing':
      return 'text-yellow-600 bg-yellow-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'canceled':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-blue-600 bg-blue-100';
  }
};

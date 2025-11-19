import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing. Please set it in your environment variables.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia', // Use latest or pin to a specific version
  appInfo: {
    name: 'Heiwa House',
    version: '0.1.0',
  },
  typescript: true,
});




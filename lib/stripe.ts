import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_build_placeholder';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is missing. Using placeholder for build/dev.');
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-11-17.clover', // Use latest or pin to a specific version
  appInfo: {
    name: 'Heiwa House',
    version: '0.1.0',
  },
  typescript: true,
});




'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { AlertCircle, CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment functionality will not work.');
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface StripeCheckoutFormProps {
  amount: number;
  currency?: string;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: any) => void;
  metadata?: Record<string, any>;
  disabled?: boolean;
}

function CheckoutForm({
  amount,
  currency = 'usd',
  onSuccess,
  onError,
  metadata,
  disabled = false
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message || 'Payment failed');
        onError?.(error);
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment succeeded!');
        onSuccess?.(paymentIntent);
        toast.success('Payment successful!');
      }
    } catch (error: any) {
      setMessage('An unexpected error occurred');
      onError?.(error);
      toast.error('Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {message && (
        <div className={`p-3 rounded-md flex items-center space-x-2 ${
          message.includes('succeeded')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.includes('succeeded') ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm">{message}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || !elements || isLoading || disabled}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency.toUpperCase(),
            }).format(amount / 100)}
          </>
        )}
      </Button>
    </form>
  );
}

interface StripeCheckoutProps extends StripeCheckoutFormProps {
  clientSecret: string;
}

export function StripeCheckout({
  clientSecret,
  amount,
  currency = 'usd',
  onSuccess,
  onError,
  metadata,
  disabled = false
}: StripeCheckoutProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0ea5e9',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Secure Payment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CheckoutForm
            amount={amount}
            currency={currency}
            onSuccess={onSuccess}
            onError={onError}
            metadata={metadata}
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </Elements>
  );
}

// Hook for creating payment intents
export function usePaymentIntent() {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const createPaymentIntent = async (
    amount: number,
    currency = 'usd',
    metadata?: Record<string, any>
  ) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      return data.clientSecret;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    clientSecret,
    loading,
    error,
    createPaymentIntent,
  };
}

export default StripeCheckout;

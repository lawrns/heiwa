'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import {
  CreditCardIcon,
  DollarSignIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  XCircleIcon,
  ExternalLinkIcon,
  ReceiptIcon
} from 'lucide-react';

interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  bookingName?: string;
}

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  // Fetch user payments
  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Mock payment data - in real implementation, fetch from /api/payments/client
        const mockPayments: Payment[] = [
          {
            id: 'payment_001',
            bookingId: 'booking_001',
            amount: 450.00,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'card',
            transactionId: 'pi_test_1234567890abcdef',
            paymentDate: new Date('2024-02-15T10:30:00Z'),
            createdAt: new Date('2024-02-15T10:25:00Z'),
            updatedAt: new Date('2024-02-15T10:35:00Z'),
            bookingName: 'Beginner\'s Paradise Surf Camp'
          },
          {
            id: 'payment_002',
            bookingId: 'booking_002',
            amount: 1000.00,
            currency: 'USD',
            status: 'pending',
            paymentMethod: 'card',
            createdAt: new Date('2024-03-20T14:20:00Z'),
            updatedAt: new Date('2024-03-20T14:20:00Z'),
            bookingName: 'Ocean View Suite'
          },
          {
            id: 'payment_003',
            bookingId: 'booking_003',
            amount: 750.00,
            currency: 'USD',
            status: 'failed',
            paymentMethod: 'card',
            createdAt: new Date('2024-01-10T16:45:00Z'),
            updatedAt: new Date('2024-01-10T16:50:00Z'),
            bookingName: 'Advanced Surf Camp'
          }
        ];

        setPayments(mockPayments);
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  const handlePayNow = async (payment: Payment) => {
    try {
      setProcessingPayment(payment.id);
      
      // Call Stripe checkout session API
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: payment.bookingId,
          amount: payment.amount,
          currency: payment.currency
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();
      
      // Redirect to Stripe checkout or payment page
      if (url) {
        window.location.href = url;
      } else {
        toast.success('Redirecting to payment...');
        // In a real implementation, you would redirect to Stripe Checkout
        console.log('Stripe session ID:', sessionId);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setProcessingPayment(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'failed':
        return <XCircleIcon className="w-4 h-4" />;
      case 'refunded':
        return <AlertCircleIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const completedPayments = payments.filter(p => p.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-yellow-600" />
                <span>Pending Payments</span>
              </CardTitle>
              <CardDescription>
                Complete these payments to confirm your bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <CreditCardIcon className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {payment.bookingName || `Booking ${payment.bookingId}`}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <DollarSignIcon className="w-4 h-4" />
                            <span>{formatCurrency(payment.amount, payment.currency)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>Due: {payment.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </Badge>
                      <Button
                        onClick={() => handlePayNow(payment)}
                        disabled={processingPayment === payment.id}
                        data-testid="pay-button"
                      >
                        {processingPayment === payment.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 flex-shrink-0"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCardIcon className="w-4 h-4 mr-2" />
                            Pay Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ReceiptIcon className="w-5 h-5" />
              <span>Payment History</span>
            </CardTitle>
            <CardDescription>
              View all your past payments and transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {completedPayments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
                <p className="text-gray-500">Your completed payments will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        payment.status === 'completed' ? 'bg-green-100' :
                        payment.status === 'failed' ? 'bg-red-100' :
                        payment.status === 'refunded' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <CreditCardIcon className={`w-6 h-6 ${
                          payment.status === 'completed' ? 'text-green-600' :
                          payment.status === 'failed' ? 'text-red-600' :
                          payment.status === 'refunded' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {payment.bookingName || `Booking ${payment.bookingId}`}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <DollarSignIcon className="w-4 h-4" />
                            <span>{formatCurrency(payment.amount, payment.currency)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              {payment.paymentDate 
                                ? payment.paymentDate.toLocaleDateString()
                                : payment.createdAt.toLocaleDateString()
                              }
                            </span>
                          </div>
                          {payment.transactionId && (
                            <div className="flex items-center space-x-1">
                              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                {payment.transactionId.slice(-8)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </Badge>
                      {payment.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePayNow(payment)}
                          disabled={processingPayment === payment.id}
                        >
                          <ExternalLinkIcon className="w-4 h-4 mr-2" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  completedPayments
                    .filter(p => p.status === 'completed')
                    .reduce((sum, p) => sum + p.amount, 0),
                  'USD'
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(
                  pendingPayments.reduce((sum, p) => sum + p.amount, 0),
                  'USD'
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

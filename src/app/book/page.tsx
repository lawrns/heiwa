'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface SurfCamp {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  maxParticipants: number;
  level: string;
  available: boolean;
}

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  surfLevel: string;
  specialRequests: string;
}

interface BookingData {
  selectedCamp: SurfCamp | null;
  participants: Participant[];
  totalAmount: number;
}

const STEPS = [
  { id: 1, title: 'Select Camp', description: 'Choose your surf camp' },
  { id: 2, title: 'Group Details', description: 'Add participant information' },
  { id: 3, title: 'Additional Info', description: 'Special requests and preferences' },
  { id: 4, title: 'Review', description: 'Review your booking details' },
  { id: 5, title: 'Payment', description: 'Complete your booking' }
];

const MOCK_CAMPS: SurfCamp[] = [
  {
    id: 'camp_001',
    name: 'Beginner\'s Paradise',
    description: 'Perfect introduction to surfing with gentle waves',
    startDate: '2024-03-01',
    endDate: '2024-03-07',
    price: 450,
    maxParticipants: 12,
    level: 'beginner',
    available: true
  },
  {
    id: 'camp_002',
    name: 'Intermediate Challenge',
    description: 'Take your surfing to the next level',
    startDate: '2024-03-08',
    endDate: '2024-03-14',
    price: 550,
    maxParticipants: 10,
    level: 'intermediate',
    available: true
  },
  {
    id: 'camp_003',
    name: 'Advanced Waves',
    description: 'For experienced surfers seeking bigger challenges',
    startDate: '2024-03-15',
    endDate: '2024-03-21',
    price: 650,
    maxParticipants: 8,
    level: 'advanced',
    available: false
  }
];

export default function BookPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    selectedCamp: null,
    participants: [],
    totalAmount: 0
  });

  const progress = (currentStep / STEPS.length) * 100;

  // Add a default participant when component mounts
  useEffect(() => {
    if (bookingData.participants.length === 0) {
      addParticipant();
    }
  }, []);

  const addParticipant = () => {
    const newParticipant: Participant = {
      id: `participant_${Date.now()}`,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      surfLevel: 'beginner',
      specialRequests: ''
    };
    setBookingData(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }));
  };

  const updateParticipant = (id: string, field: keyof Participant, value: string) => {
    setBookingData(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const removeParticipant = (id: string) => {
    if (bookingData.participants.length > 1) {
      setBookingData(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.id !== id)
      }));
    }
  };

  const selectCamp = (camp: SurfCamp) => {
    setBookingData(prev => ({
      ...prev,
      selectedCamp: camp,
      totalAmount: camp.price * prev.participants.length
    }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return bookingData.selectedCamp !== null;
      case 2:
        return bookingData.participants.every(p => 
          p.firstName && p.lastName && p.email && p.phone
        );
      case 3:
        return true; // Optional step
      case 4:
        return true; // Review step
      case 5:
        return true; // Payment step
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      setLoading(true);
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep(prev => prev + 1);
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate booking submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Booking submitted successfully!');
      // In a real app, redirect to payment or success page
    } catch (error) {
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6" data-testid="camp-selection">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Choose Your Surf Camp</h2>
              <p className="text-gray-600">Select the perfect camp for your skill level</p>
            </div>
            <div className="grid gap-4">
              {MOCK_CAMPS.map(camp => (
                <Card 
                  key={camp.id} 
                  className={`cursor-pointer transition-all ${
                    bookingData.selectedCamp?.id === camp.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  } ${!camp.available ? 'opacity-50' : ''}`}
                  onClick={() => camp.available && selectCamp(camp)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{camp.name}</h3>
                        <p className="text-gray-600 mt-1">{camp.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {camp.startDate} - {camp.endDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Max {camp.maxParticipants} participants
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${camp.price}</div>
                        <Badge variant={camp.available ? 'default' : 'secondary'}>
                          {camp.available ? 'Available' : 'Full'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6" data-testid="group-details-form">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Group Details</h2>
              <p className="text-gray-600">Add information for all participants</p>
            </div>
            <div className="space-y-4">
              {bookingData.participants.map((participant, index) => (
                <Card key={participant.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Participant {index + 1}</CardTitle>
                      {bookingData.participants.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParticipant(participant.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`firstName-${participant.id}`}>First Name</Label>
                        <Input
                          id={`firstName-${participant.id}`}
                          placeholder="Enter first name"
                          value={participant.firstName}
                          onChange={(e) => updateParticipant(participant.id, 'firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`lastName-${participant.id}`}>Last Name</Label>
                        <Input
                          id={`lastName-${participant.id}`}
                          placeholder="Enter last name"
                          value={participant.lastName}
                          onChange={(e) => updateParticipant(participant.id, 'lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`email-${participant.id}`}>Email</Label>
                        <Input
                          id={`email-${participant.id}`}
                          type="email"
                          placeholder="Enter email address"
                          value={participant.email}
                          onChange={(e) => updateParticipant(participant.id, 'email', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`phone-${participant.id}`}>Phone</Label>
                        <Input
                          id={`phone-${participant.id}`}
                          type="tel"
                          placeholder="Enter phone number"
                          value={participant.phone}
                          onChange={(e) => updateParticipant(participant.id, 'phone', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`surfLevel-${participant.id}`}>Surf Level</Label>
                      <Select
                        value={participant.surfLevel}
                        onValueChange={(value) => updateParticipant(participant.id, 'surfLevel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select surf level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="outline"
                onClick={addParticipant}
                className="w-full"
                data-testid="add-participant"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Another Participant
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6" data-testid="additional-info-step">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Additional Information</h2>
              <p className="text-gray-600">Any special requests or dietary requirements?</p>
            </div>
            <div className="space-y-4">
              {bookingData.participants.map((participant, index) => (
                <Card key={participant.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {participant.firstName} {participant.lastName} - Special Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Any dietary restrictions, medical conditions, or special requests..."
                      value={participant.specialRequests}
                      onChange={(e) => updateParticipant(participant.id, 'specialRequests', e.target.value)}
                      rows={3}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6" data-testid="booking-summary">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Booking Summary</h2>
              <p className="text-gray-600">Review your booking details before proceeding</p>
            </div>
            
            {bookingData.selectedCamp && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Camp</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{bookingData.selectedCamp.name}</h3>
                    <p className="text-gray-600">{bookingData.selectedCamp.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {bookingData.selectedCamp.startDate} - {bookingData.selectedCamp.endDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${bookingData.selectedCamp.price} per person
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Participants ({bookingData.participants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bookingData.participants.map((participant, index) => (
                    <div key={participant.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">
                          {participant.firstName} {participant.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {participant.email} • {participant.surfLevel}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${bookingData.selectedCamp?.price || 0}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total Amount:</span>
                  <span>${bookingData.totalAmount}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6" data-testid="payment-step">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
              <p className="text-gray-600">Secure payment processing</p>
            </div>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <div className="text-2xl font-bold">
                    Total: ${bookingData.totalAmount}
                  </div>
                  <p className="text-gray-600">
                    Click below to proceed to secure payment
                  </p>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Pay Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Surf Adventure</h1>
          <p className="text-gray-600">Complete your booking in {STEPS.length} easy steps</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-2 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading...</span>
                  </div>
                ) : (
                  renderStepContent()
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceedToNext() || loading}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="text-sm text-gray-500">
              Complete payment above to finish booking
            </div>
          )}
        </div>

        {/* Error Message */}
        {!canProceedToNext() && currentStep > 1 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg" data-testid="error-message">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                Please complete all required fields before proceeding.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

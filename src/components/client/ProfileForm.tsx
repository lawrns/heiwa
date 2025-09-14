'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  WavesIcon,
  SaveIcon,
  EditIcon,
  XIcon
} from 'lucide-react';

const ProfileFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone number is required'),
  location: z.string().optional(),
  surfLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  medicalConditions: z.string().optional(),
  notes: z.string().optional(),
});

type ProfileFormData = z.infer<typeof ProfileFormSchema>;

interface UserProfile extends ProfileFormData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ProfileForm() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileFormSchema)
  });

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Mock profile data - in real implementation, fetch from /api/client/profile
        const mockProfile: UserProfile = {
          id: user.id,
          name: user.displayName || 'John Doe',
          email: user.email || 'john@example.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          surfLevel: 'intermediate',
          emergencyContact: 'Jane Doe',
          emergencyPhone: '+1 (555) 987-6543',
          dietaryRestrictions: 'Vegetarian',
          medicalConditions: '',
          notes: 'Loves early morning surf sessions',
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2024-02-20')
        };

        setProfile(mockProfile);
        reset(mockProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Mock API call - in real implementation, call /api/client/profile
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedProfile: UserProfile = {
        ...data,
        id: profile?.id || user?.uid || '',
        createdAt: profile?.createdAt || new Date(),
        updatedAt: new Date()
      };

      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    if (profile) {
      reset(profile);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
            <p className="text-gray-500">Unable to load your profile information.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Manage your account details and preferences
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                data-testid="edit-profile-button"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-message">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-message">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-message">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="City, State/Country"
                  />
                </div>
              </div>
            </div>

            {/* Surf Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <WavesIcon className="w-5 h-5" />
                <span>Surf Information</span>
              </h3>
              
              <div>
                <Label htmlFor="surfLevel">Surf Level</Label>
                <Select 
                  {...register('surfLevel')} 
                  disabled={!isEditing}
                  defaultValue={profile.surfLevel}
                >
                  <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                    <SelectValue placeholder="Select your surf level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    {...register('emergencyContact')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="Emergency contact name"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    {...register('emergencyPhone')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="Emergency contact phone"
                  />
                </div>
              </div>
            </div>

            {/* Health & Dietary Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Health & Dietary Information</h3>
              
              <div>
                <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                <Textarea
                  id="dietaryRestrictions"
                  {...register('dietaryRestrictions')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                  placeholder="Any dietary restrictions or allergies..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  {...register('medicalConditions')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                  placeholder="Any medical conditions we should be aware of..."
                  rows={2}
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Additional Notes</h3>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                  placeholder="Any additional information or preferences..."
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>

          {/* Profile Metadata */}
          {!isEditing && (
            <div className="mt-6 pt-4 border-t text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Profile created: {profile.createdAt.toLocaleDateString()}</span>
                <span>Last updated: {profile.updatedAt.toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

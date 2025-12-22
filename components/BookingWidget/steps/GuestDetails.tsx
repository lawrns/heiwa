import { useState, useEffect } from 'react';
import { User, Mail, Phone, Utensils, AlertCircle, Edit3, ChevronDown, CheckCircle } from 'lucide-react';
import { BookingState, GuestInfo } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GuestDetailsProps {
  state: BookingState;
  actions: {
    updateGuestDetails: (guest: GuestInfo) => void;
    setParticipantNames?: (names: { id: string; firstName: string }[]) => void;
  };
}

interface GuestFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dietaryRequirements: string;
  specialRequests: string;
}

export function GuestDetails({ state, actions }: GuestDetailsProps) {
  const [guestForms, setGuestForms] = useState<GuestFormData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [initializedGuestCount, setInitializedGuestCount] = useState(0);
  const [userManuallyExpanded, setUserManuallyExpanded] = useState(false);
  const [savedGuests, setSavedGuests] = useState<Set<number>>(new Set());
  const [showSuccessMessage, setShowSuccessMessage] = useState<number | null>(null);

  // Initialize guest forms based on guest count - only when guest count changes
  // Pre-fill firstName from participantNames (Step 2) if available
  useEffect(() => {
    if (state.guests !== initializedGuestCount) {
      const newForms: GuestFormData[] = [];
      for (let i = 0; i < state.guests; i++) {
        const existingGuest = state.guestDetails[i];
        const existingForm = guestForms[i];
        const participantName = state.participantNames[i];

        // Preserve existing form data if it exists and has unsaved changes
        if (existingForm && (
          existingForm.firstName || existingForm.lastName ||
          existingForm.email || existingForm.phone ||
          existingForm.dietaryRequirements || existingForm.specialRequests
        )) {
          // Keep existing form data
          newForms.push(existingForm);
        } else {
          // Initialize from saved guest data, participant names (Step 2), or empty
          // Priority: existingGuest > participantName > empty
          newForms.push({
            firstName: existingGuest?.firstName || participantName?.firstName || '',
            lastName: existingGuest?.lastName || '',
            email: existingGuest?.email || '',
            phone: existingGuest?.phone || '',
            dietaryRequirements: existingGuest?.dietaryRequirements || '',
            specialRequests: existingGuest?.specialRequests || '',
          });
        }
      }
      setGuestForms(newForms);
      setInitializedGuestCount(state.guests);
    }
  }, [state.guests, state.guestDetails, state.participantNames, guestForms, initializedGuestCount]);

  // Check if all guests are valid and completed
  const checkAllGuestsCompleted = () => {
    if (guestForms.length !== state.guests) return false;

    return guestForms.every((form, index) => {
      const formErrors = validateForm(form, index);
      return formErrors.length === 0;
    }) && state.guestDetails.length === state.guests;
  };

  // Auto-collapse when all guests are completed (but only if user hasn't manually expanded)
  useEffect(() => {
    const allCompleted = checkAllGuestsCompleted();
    if (allCompleted && !isCollapsed && !userManuallyExpanded) {
      // Add a small delay for better UX
      const timer = setTimeout(() => {
        setIsCollapsed(true);
      }, 500);
      return () => clearTimeout(timer);
    }
    // Reset the manual expansion flag when guests are no longer all completed
    if (!allCompleted && userManuallyExpanded) {
      setUserManuallyExpanded(false);
    }
  }, [guestForms, state.guestDetails, state.guests, isCollapsed, userManuallyExpanded]);

  const validateForm = (formData: GuestFormData, index: number): string[] => {
    const formErrors: string[] = [];
    
    if (!formData.firstName.trim()) {
      formErrors.push(`Guest ${index + 1} first name is required`);
    }
    if (!formData.lastName.trim()) {
      formErrors.push(`Guest ${index + 1} last name is required`);
    }
    if (!formData.email.trim()) {
      formErrors.push(`Guest ${index + 1} email is required`);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      formErrors.push(`Guest ${index + 1} email is invalid`);
    }
    if (!formData.phone.trim()) {
      formErrors.push(`Guest ${index + 1} phone number is required`);
    }

    return formErrors;
  };

  const handleInputChange = (index: number, field: keyof GuestFormData, value: string) => {
    const newForms = [...guestForms];
    newForms[index] = { ...newForms[index], [field]: value };
    setGuestForms(newForms);

    // BI-DIRECTIONAL SYNC: Update participantNames when firstName changes
    if (field === 'firstName' && actions.setParticipantNames) {
      const updatedParticipantNames = [...state.participantNames];
      // Ensure array is long enough
      while (updatedParticipantNames.length <= index) {
        updatedParticipantNames.push({ id: `guest-${updatedParticipantNames.length + 1}`, firstName: '' });
      }
      updatedParticipantNames[index] = {
        id: `guest-${index + 1}`,
        firstName: value.trim()
      };
      actions.setParticipantNames(updatedParticipantNames);
    }

    // Clear error for this guest when any field is changed
    const errorKey = `guest-${index}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const handleSaveGuest = (index: number) => {
    const formData = guestForms[index];
    const formErrors = validateForm(formData, index);

    if (formErrors.length > 0) {
      // Set error for this specific guest
      const newErrors = { ...errors };
      newErrors[`guest-${index}`] = formErrors[0]; // Show first error
      setErrors(newErrors);
      
      // Scroll to first error field in this guest form
      setTimeout(() => {
        const guestFormElement = document.getElementById(`guest-form-${index}`)
        if (guestFormElement) {
          // Try to find the first invalid input in this guest form
          const firstInvalidInput = guestFormElement.querySelector('input[aria-invalid="true"], input:invalid, textarea[aria-invalid="true"], textarea:invalid')
          if (firstInvalidInput) {
            (firstInvalidInput as HTMLElement).scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
            setTimeout(() => {
              (firstInvalidInput as HTMLElement).focus()
            }, 300)
          } else {
            // Fallback: scroll to the guest form container
            guestFormElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }
        }
      }, 100)
      return;
    }

    // Clear any existing errors for this guest
    const newErrors = { ...errors };
    delete newErrors[`guest-${index}`];
    setErrors(newErrors);

    const guestInfo: GuestInfo = {
      id: `guest-${index}`,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      dietaryRequirements: formData.dietaryRequirements.trim() || undefined,
      specialRequests: formData.specialRequests.trim() || undefined,
    };

    actions.updateGuestDetails(guestInfo);
    
    // Mark guest as saved
    setSavedGuests(prev => new Set(prev).add(index));
    setShowSuccessMessage(index);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(null);
    }, 3000);
    
    // Scroll to next guest if there is one, otherwise scroll to summary
    setTimeout(() => {
      const nextGuestIndex = index + 1;
      if (nextGuestIndex < state.guests) {
        const nextGuestElement = document.getElementById(`guest-form-${nextGuestIndex}`);
        if (nextGuestElement) {
          nextGuestElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Focus first input of next guest
          const firstInput = nextGuestElement.querySelector('input') as HTMLInputElement;
          if (firstInput) {
            setTimeout(() => firstInput.focus(), 500);
          }
        }
      } else {
        // Scroll to summary section
        const summaryElement = document.querySelector('[data-testid="guest-completion-status"]')?.closest('.bg-orange-50');
        if (summaryElement) {
          summaryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 300);
  };

  const allGuestsValid = () => {
    return guestForms.every((form, index) => validateForm(form, index).length === 0);
  };

  const completedGuestsCount = state.guestDetails.filter(g => g.firstName && g.lastName && g.email).length;
  const allCompleted = checkAllGuestsCompleted();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-bold text-gray-900">Guest Details</h3>
        <p className="text-lg text-gray-600" data-testid="guest-count-instruction">
          Please provide details for all {state.guests} {state.guests === 1 ? 'guest' : 'guests'}
        </p>
      </div>

      {/* Collapsed Summary Card */}
      {isCollapsed && allCompleted && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-green-900">
                  {completedGuestsCount} {completedGuestsCount === 1 ? 'Participant' : 'Participants'} Added
                </h4>
                <p className="text-sm text-green-700">
                  {state.guestDetails.map(g => `${g.firstName} ${g.lastName}`).join(', ')}
                </p>
              </div>
            </div>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setUserManuallyExpanded(true);
                setIsCollapsed(false);
              }}
              variant="outline"
              size="default"
              className="text-green-700 border-green-300 hover:bg-green-50 gap-2"
            >
              <Edit3 size={16} />
              <span>Edit</span>
              <ChevronDown size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Guest Forms - Show when not collapsed */}
      {!isCollapsed && (
        <div className="space-y-6 transition-all duration-300">
          {guestForms.map((guestForm, index) => {
            const isSaved = savedGuests.has(index);
            const showSuccess = showSuccessMessage === index;
            
            return (
            <div 
              key={`guest-${index}`} 
              id={`guest-form-${index}`}
              className={`bg-gray-50 rounded-[10px] p-6 border transition-all duration-300 ${
                isSaved 
                  ? 'border-green-500 bg-green-50/30' 
                  : showSuccessMessage === index + 1 || (index === 0 && showSuccessMessage === null && savedGuests.has(1))
                  ? 'border-orange-300 ring-2 ring-orange-200'
                  : 'border-gray-200'
              }`}
            >
            {/* Guest Header - TOON-compliant icon-text gap (8px) */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-all duration-300 ${
                isSaved 
                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                  : 'bg-gradient-to-br from-orange-500 to-orange-600'
              }`}>
                {isSaved ? <CheckCircle size={20} /> : index + 1}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-900">
                  Guest {index + 1} {index === 0 && '(Primary Guest)'}
                  {isSaved && <span className="ml-2 text-base font-normal text-green-600">✓ Saved</span>}
                </h4>
              </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 animate-in fade-in-0 slide-in-from-top-2 duration-300" data-testid={`guest-${index}-success`}>
                <CheckCircle size={16} className="flex-shrink-0" />
                <span className="text-base font-medium">
                  Guest {index + 1} saved successfully!
                  {index + 1 < state.guests && ` Continue with Guest ${index + 2} below.`}
                </span>
              </div>
            )}

            {/* Error Message */}
            {errors[`guest-${index}`] && (
              <div id={`guest-${index}-error`} className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700" data-testid={`guest-${index}-error`} role="alert">
                <AlertCircle size={16} />
                <span className="text-base">{errors[`guest-${index}`]}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1.5">
                <label htmlFor={`firstName-${index}`} className="block text-xs font-medium text-gray-700">
                  First Name *
                </label>
                <Input
                  id={`firstName-${index}`}
                  type="text"
                  value={guestForm.firstName}
                  onChange={(e) => handleInputChange(index, 'firstName', e.target.value)}
                  placeholder="Enter first name"
                  isError={errors[`guest-${index}`] ? true : false}
                  aria-invalid={errors[`guest-${index}`] ? 'true' : 'false'}
                  aria-describedby={errors[`guest-${index}`] ? `guest-${index}-error` : undefined}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label htmlFor={`lastName-${index}`} className="block text-xs font-medium text-gray-700">
                  Last Name *
                </label>
                <Input
                  id={`lastName-${index}`}
                  type="text"
                  value={guestForm.lastName}
                  onChange={(e) => handleInputChange(index, 'lastName', e.target.value)}
                  placeholder="Enter last name"
                  isError={errors[`guest-${index}`] ? true : false}
                  aria-invalid={errors[`guest-${index}`] ? 'true' : 'false'}
                  aria-describedby={errors[`guest-${index}`] ? `guest-${index}-error` : undefined}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor={`email-${index}`} className="block text-xs font-medium text-gray-700">
                  Email Address *
                </label>
                <Input
                  id={`email-${index}`}
                  type="email"
                  value={guestForm.email}
                  onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                  placeholder="Enter email address"
                  isError={guestForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestForm.email) ? true : false}
                  isSuccess={guestForm.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestForm.email) ? true : false}
                  errorMessage={guestForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestForm.email) ? 'Please enter a valid email address' : undefined}
                  aria-invalid={guestForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestForm.email) ? 'true' : 'false'}
                  aria-describedby={
                    guestForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestForm.email)
                      ? `email-${index}-validation`
                      : errors[`guest-${index}`] ? `guest-${index}-error` : undefined
                  }
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor={`phone-${index}`} className="block text-xs font-medium text-gray-700">
                  Phone Number *
                </label>
                <Input
                  id={`phone-${index}`}
                  type="tel"
                  value={guestForm.phone}
                  onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                  placeholder="Enter phone number"
                  isError={errors[`guest-${index}`] ? true : false}
                  aria-invalid={errors[`guest-${index}`] ? 'true' : 'false'}
                  aria-describedby={errors[`guest-${index}`] ? `guest-${index}-error` : undefined}
                />
              </div>
            </div>

            {/* Dietary Requirements */}
            <div className="mt-4 space-y-1.5">
              <label htmlFor={`dietary-${index}`} className="block text-xs font-medium text-gray-700">
                Dietary Requirements
              </label>
              <textarea
                id={`dietary-${index}`}
                value={guestForm.dietaryRequirements}
                onChange={(e) => handleInputChange(index, 'dietaryRequirements', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-[#ec681c]/20 focus:border-[#ec681c] transition-all duration-300 motion-reduce:transition-none resize-none text-[14px] placeholder:text-gray-400"
                placeholder="Any dietary restrictions or preferences?"
              />
            </div>

            {/* Special Requests */}
            <div className="mt-4 space-y-1.5">
              <label htmlFor={`requests-${index}`} className="block text-xs font-medium text-gray-700">
                Special Requests
              </label>
              <textarea
                id={`requests-${index}`}
                value={guestForm.specialRequests}
                onChange={(e) => handleInputChange(index, 'specialRequests', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-[#ec681c]/20 focus:border-[#ec681c] transition-all duration-300 motion-reduce:transition-none resize-none text-[14px] placeholder:text-gray-400"
                placeholder="Any special requests or notes?"
              />
            </div>

            {/* Save Button - TOON-compliant CTA with 24px margin-top for isolation */}
            {/* Requirements: 9.1, 9.2, 9.3, 2.4 */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => handleSaveGuest(index)}
                disabled={isSaved}
                variant="default"
                size="default"
                className={isSaved ? 'bg-green-500 hover:bg-green-500' : ''}
              >
                {isSaved ? (
                  <>
                    <CheckCircle size={16} />
                    Saved
                  </>
                ) : (
                  `Save Guest ${index + 1}${index + 1 < state.guests ? ' & Continue' : ''}`
                )}
              </Button>
            </div>
          </div>
        );
          })}
        </div>
      )}

      {/* Summary - Only show when not collapsed */}
      {!isCollapsed && (
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-orange-900">Guest Information Status</h5>
              <p className="text-base text-orange-700" data-testid="guest-completion-status">
                {completedGuestsCount} of {state.guests} guests completed
              </p>
            </div>
            <div className="text-right">
              {allCompleted ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-base font-medium">All guests ready</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-base font-medium">Complete all fields</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-base text-gray-500">
          All information is required for booking confirmation and emergency contact purposes.
        </p>
      </div>
    </div>
  );
}
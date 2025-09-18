'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Client, CreateClient, UpdateClient, CreateClientSchema, UpdateClientSchema } from '@/lib/clients/schema';

export interface ClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSave: (data: CreateClient | UpdateClient) => Promise<void>;
  isSaving?: boolean;
  mode?: 'create' | 'edit';
}

const BRAND_OPTIONS = [
  { value: 'Heiwa House', label: 'Heiwa House' },
  { value: 'Freedom Routes', label: 'Freedom Routes' },
];



export function ClientDialog({
  isOpen,
  onClose,
  client,
  onSave,
  isSaving = false,
  mode = 'create',
}: ClientDialogProps) {
  const isEdit = mode === 'edit' && !!client;

  const form = useForm<CreateClient | UpdateClient>({
    resolver: zodResolver(isEdit ? UpdateClientSchema : CreateClientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      brand: 'Heiwa House',
      socials: { instagram: '', facebook: '', twitter: '' },
      notes: '',
    },
  });

  // Reset form when dialog opens/closes or client changes
  useEffect(() => {
    if (isOpen) {
      if (isEdit && client) {
        // Populate form with existing client data
        form.reset({
          name: client.name,
          email: client.email,
          phone: client.phone || '',
          brand: client.brand,
          socials: {
            instagram: (client as any).socials?.instagram || '',
            facebook: (client as any).socials?.facebook || '',
            twitter: (client as any).socials?.twitter || '',
          },
          notes: client.notes || '',
        });
      } else {
        // Reset to defaults for new client
        form.reset({
          name: '',
          email: '',
          phone: '',
          brand: 'Heiwa House',
          socials: { instagram: '', facebook: '', twitter: '' },
          notes: '',
        });
      }
    }
  }, [isOpen, isEdit, client, form]);

  const onSubmit = async (data: CreateClient | UpdateClient) => {
    try {
      console.log('ClientDialog: Form submission started with data:', data);
      console.log('ClientDialog: Form validation state:', form.formState);
      console.log('ClientDialog: Form errors:', form.formState.errors);

      // Validate the data against the schema manually for debugging
      try {
        const schema = isEdit ? UpdateClientSchema : CreateClientSchema;
        const validatedData = schema.parse(data);
        console.log('ClientDialog: Schema validation passed:', validatedData);
      } catch (validationError) {
        console.error('ClientDialog: Schema validation failed:', validationError);
        toast.error('Please check your input and try again.');
        throw validationError;
      }

      // Convert date string to proper format if needed
      if (data.lastBookingDate && typeof data.lastBookingDate === 'string') {
        // Keep as string for now, let the backend handle conversion
      }

      await onSave(data);
      console.log('ClientDialog: Form submission successful');
      onClose();
      form.reset();
    } catch (error) {
      console.error('ClientDialog: Failed to save client:', error);
      // Enhanced error handling with user-friendly messages
      if (error instanceof Error) {
        if (error.message.includes('socials')) {
          toast.error('Database configuration issue. Please contact support.');
        } else if (error.message.includes('email')) {
          toast.error('Email address is already in use or invalid.');
        } else if (error.message.includes('network')) {
          toast.error('Network error. Please check your connection and try again.');
        } else {
          toast.error(`Failed to save client: ${error.message}`);
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      // Don't close the dialog on error so user can retry
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Client' : 'Add New Client'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update client information below.'
              : 'Fill in the details to add a new client.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              console.log('Form onSubmit event triggered');
              console.log('Form state:', form.formState);
              console.log('Form values:', form.getValues());
              console.log('Form errors:', form.formState.errors);
              return form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter full name"
                      {...field}
                      autoFocus
                      aria-label="Client name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      {...field}
                      aria-label="Client email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      {...field}
                      aria-label="Client phone"
                    />
                  </FormControl>
                  <FormDescription>
                    International format recommended
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Brand Field */}
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue="Heiwa House"
                  >
                    <FormControl>
                      <SelectTrigger aria-label="Select brand">
                        <SelectValue placeholder="Select a brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BRAND_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Hidden input to ensure the value is included in FormData */}
                  <input type="hidden" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />


            {/* Socials Fields */}
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="socials.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="@handle or URL" {...field} aria-label="Instagram" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socials.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input placeholder="Profile/Page URL" {...field} aria-label="Facebook" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socials.twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter/X</FormLabel>
                    <FormControl>
                      <Input placeholder="@handle or URL" {...field} aria-label="Twitter" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>




            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about the client..."
                      rows={3}
                      {...field}
                      aria-label="Client notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSaving}
                data-testid="client-dialog-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-heiwaOrange-600 hover:bg-heiwaOrange-700"
                data-testid="client-dialog-submit"
              >
                {isSaving ? 'Saving...' : isEdit ? 'Update Client' : 'Add Client'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

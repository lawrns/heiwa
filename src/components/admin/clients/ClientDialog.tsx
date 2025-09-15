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
      // Convert date string to proper format if needed
      if (data.lastBookingDate && typeof data.lastBookingDate === 'string') {
        // Keep as string for now, let the backend handle conversion
      }

      await onSave(data);
      onClose();
      form.reset();
    } catch (error) {
      console.error('Failed to save client:', error);
      // Error handling is done in the parent component via toast
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-heiwaOrange-600 hover:bg-heiwaOrange-700"
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

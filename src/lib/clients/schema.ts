import { z } from 'zod';

// Base timestamp schema for Firebase
const TimestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number().optional(),
});

// Client schema with all required fields
export const ClientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone is required'),
  brand: z.enum(['Heiwa House', 'Freedom Routes'], {
    errorMap: () => ({ message: 'Brand must be Heiwa House or Freedom Routes' })
  }),
  status: z.enum(['Active', 'Inactive'], {
    errorMap: () => ({ message: 'Status must be Active or Inactive' })
  }),
  lastBookingDate: TimestampSchema.nullable(),
  registrationDate: TimestampSchema,
  notes: z.string().optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

// Schema for creating new clients (without id and timestamps)
export const CreateClientSchema = ClientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  registrationDate: true,
});

// Schema for updating clients (partial update)
export const UpdateClientSchema = CreateClientSchema.partial();

// Schema for CSV import rows
export const ImportRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  brand: z.enum(['Heiwa House', 'Freedom Routes']).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  lastBookingDate: z.string().optional(), // ISO date string
  registrationDate: z.string().optional(), // ISO date string
  notes: z.string().optional(),
});

// TypeScript types inferred from schemas
export type Client = z.infer<typeof ClientSchema>;
export type CreateClient = z.infer<typeof CreateClientSchema>;
export type UpdateClient = z.infer<typeof UpdateClientSchema>;
export type ImportRow = z.infer<typeof ImportRowSchema>;

// Validation helpers
export const validateClient = (data: unknown): Client => {
  return ClientSchema.parse(data);
};

export const validateCreateClient = (data: unknown): CreateClient => {
  return CreateClientSchema.parse(data);
};

export const validateUpdateClient = (data: unknown): UpdateClient => {
  return UpdateClientSchema.parse(data);
};

export const validateImportRow = (data: unknown): ImportRow => {
  return ImportRowSchema.parse(data);
};

// Error types for validation
export type ClientValidationError = z.ZodError<Client>;
export type CreateClientValidationError = z.ZodError<CreateClient>;
export type UpdateClientValidationError = z.ZodError<UpdateClient>;
export type ImportRowValidationError = z.ZodError<ImportRow>;

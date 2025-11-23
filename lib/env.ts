/**
 * Type-safe environment variable validation
 * Centralized location for all environment variable access
 */

import { z } from 'zod';

/**
 * Environment variable schema
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Email service (Resend)
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().default('Heiwa House <noreply@heiwahouse.com>'),
  ADMIN_EMAIL: z.string().default('info@heiwahouse.com'),
  REPLY_TO_EMAIL: z.string().default('info@heiwahouse.com'),
  
  // Database
  DATABASE_URL: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // Payment processing
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Other API keys
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
});

/**
 * Validated environment variables
 */
type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Get validated environment variables
 * Throws error if required variables are missing in production
 */
export function getEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  const rawEnv = {
    NODE_ENV: process.env.NODE_ENV,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    REPLY_TO_EMAIL: process.env.REPLY_TO_EMAIL,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  };

  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    const error = new Error(`Invalid environment variables: ${errors}`);
    
    // Log error but don't crash in development
    if (isProduction()) {
      // In production, log and rethrow
      console.error('[ENV ERROR]', error.message);
      throw error;
    } else {
      // In development, log warning and return defaults
      console.warn('[ENV WARNING]', error.message);
      // Return defaults for development
      validatedEnv = {
        NODE_ENV: 'development',
        FROM_EMAIL: 'Heiwa House <noreply@heiwahouse.com>',
        ADMIN_EMAIL: 'info@heiwahouse.com',
        REPLY_TO_EMAIL: 'info@heiwahouse.com',
        ...rawEnv as any,
      };
      return validatedEnv;
    }
  }

  validatedEnv = result.data;
  return validatedEnv;
}

/**
 * Get environment variable with validation
 * Use this instead of direct process.env access
 */
export const env = new Proxy({} as Env, {
  get(_target, prop: keyof Env) {
    const env = getEnv();
    return env[prop];
  },
});

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}


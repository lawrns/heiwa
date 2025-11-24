# Netlify Environment Variables Required

## Critical Variables for Production

Add these to Netlify Dashboard → Site Settings → Environment Variables:

### Database & Supabase
```
DATABASE_URL=postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://pguipwhrxdzzrndbluxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjU4ODUsImV4cCI6MjA3ODQ0MTg4NX0.9Kq4rka92XmoJj_BWu4eEYvbhaasljZX6yTp8FMof7o
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Stripe (NEW - Required for Payments)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51S5rs9FEEJxD4ZIKRD0unHIlYC8VVotHbpL5urYoBuVfl7kYe875EX39BvQ3yu15Rx5uhZbsx8e0chX3hsoiWJd700hJv7ZXev
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=<configure-in-stripe-dashboard>
```

### Email Service (Resend - Required for Email Confirmations)
```
RESEND_API_KEY=<get-from-resend.com>
FROM_EMAIL=Heiwa House <noreply@heiwahouse.com>
ADMIN_EMAIL=info@heiwahouse.com
REPLY_TO_EMAIL=info@heiwahouse.com
NEXT_PUBLIC_SITE_URL=https://heiwahouse.com
```

### Optional
```
GOOGLE_PLACES_API_KEY=<for-google-reviews>
```

## Steps to Add Variables in Netlify:
1. Go to https://app.netlify.com/
2. Select your site
3. Site settings → Environment variables
4. Add each variable above
5. Redeploy site (or wait for next auto-deploy)


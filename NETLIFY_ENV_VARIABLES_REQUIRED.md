# Netlify Environment Variables Required

## Critical Variables for Production

Add these to Netlify Dashboard → Site Settings → Environment Variables:

### Database & Supabase
```
DATABASE_URL=postgresql://postgres:cqv_kmb-WEP.vez6xze@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://zejrhceuuujzgyukdwnb.supabase.co
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


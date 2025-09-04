# Deployment Guide

This guide covers deploying the Heiwa House Admin Dashboard to various platforms.

## Prerequisites

- Firebase project configured with Authentication and Firestore
- Admin user accounts created in Firebase Authentication
- Environment variables configured

## Vercel Deployment (Recommended)

### 1. Prepare for Deployment

```bash
# Install dependencies
npm install

# Build the project locally to test
npm run build
```

### 2. Deploy to Vercel

1. **Connect Repository**
   - Push your code to GitHub, GitLab, or Bitbucket
   - Connect your repository to Vercel

2. **Configure Environment Variables**
   In Vercel dashboard, add these environment variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_ADMIN_CLIENTS_V2=true
   ```

3. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Check deployment logs for any issues

### 3. Configure Custom Domain (Optional)

1. Add your domain in Vercel dashboard
2. Update DNS records as instructed
3. SSL certificate will be automatically provisioned

## Netlify Deployment

### 1. Build Settings

```bash
# Build command
npm run build

# Publish directory
.next
```

### 2. Environment Variables

Add the same environment variables as listed in the Vercel section.

### 3. Deploy

1. Connect your repository to Netlify
2. Configure build settings
3. Add environment variables
4. Deploy

## Firebase Hosting

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase Hosting

```bash
firebase init hosting
```

Select:
- Use existing project
- Public directory: `.next`
- Single-page app: Yes
- Overwrite index.html: No

### 3. Build and Deploy

```bash
npm run build
firebase deploy --only hosting
```

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Build and Run

```bash
docker build -t admin-dashboard .
docker run -p 3000:3000 admin-dashboard
```

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_production_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_production_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_production_app_id
NEXT_PUBLIC_ADMIN_CLIENTS_V2=true
NODE_ENV=production
```

## Security Considerations

### 1. Firebase Security Rules

Ensure your Firestore security rules are properly configured:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.email in [
          'your-admin@email.com'
        ];
    }
  }
}
```

### 2. Admin Email Configuration

Update admin emails in production:

1. Edit `src/lib/auth.ts`
2. Update the `ADMIN_EMAILS` array with production admin emails
3. Redeploy the application

### 3. HTTPS Configuration

- Vercel and Netlify provide HTTPS automatically
- For custom deployments, ensure SSL certificates are configured
- Use secure cookies in production

## Monitoring and Maintenance

### 1. Error Monitoring

Consider integrating error monitoring:
- Sentry
- LogRocket
- Bugsnag

### 2. Analytics

Add analytics if needed:
- Google Analytics
- Mixpanel
- PostHog

### 3. Performance Monitoring

Monitor application performance:
- Vercel Analytics
- Firebase Performance Monitoring
- Web Vitals

## Backup and Recovery

### 1. Database Backups

- Firebase automatically backs up Firestore data
- Consider exporting data regularly for additional backup

### 2. Code Backups

- Ensure code is backed up in version control
- Tag releases for easy rollback

## Scaling Considerations

### 1. Firebase Limits

- Monitor Firestore usage and quotas
- Consider Firebase pricing plans as usage grows

### 2. Performance Optimization

- Implement pagination for large datasets
- Use Firebase real-time listeners efficiently
- Optimize bundle size with code splitting

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review deployment logs
3. Verify environment variables
4. Test locally before deploying

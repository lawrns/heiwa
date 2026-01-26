# Monitoring Setup Guide

## Current Status
✅ Basic monitoring utilities created (`lib/monitoring.ts`)
✅ Health check endpoint created (`/api/health`)
✅ Health check script created (`scripts/health-check.sh`)

## Recommended Next Steps

### 1. Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
```

Then configure in `sentry.client.config.ts` and `sentry.server.config.ts`

### 2. Performance Monitoring (Vercel Analytics)
Already available if using Vercel. Enable in dashboard.

### 3. Uptime Monitoring
- Set up UptimeRobot or Pingdom
- Monitor: `https://heiwahauz.netlify.app/api/health`
- Alert on HTTP 500 or response time > 5s

### 4. Log Aggregation
- Consider CloudWatch, Datadog, or LogTail
- Configure environment variables for log shipping

## Usage

### Health Check
```bash
./scripts/health-check.sh
```

### API Health Endpoint
```bash
curl https://heiwahauz.netlify.app/api/health
```

### Monitor Errors
```typescript
import { monitoring } from '@/lib/monitoring'

// Log an error
monitoring.logError(error, { userId, requestId })

// Track performance
await measurePerformance('operation.name', async () => {
  // your code
})
```



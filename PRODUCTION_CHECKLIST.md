# Production Readiness Checklist

## Environment Configuration

### Required Environment Variables
```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (Required for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# AI Configuration (Required)
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key

# App Configuration
NEXT_PUBLIC_SITE_URL=https://hansa.ai.kr
NEXT_PUBLIC_BASE_URL=https://hansa.ai.kr
NODE_ENV=production

# Sentry (Recommended)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token

# SEO Verification (Optional)
GOOGLE_SITE_VERIFICATION=xxx
NAVER_SITE_VERIFICATION=xxx

# Logging (Optional)
LOG_LEVEL=info
```

## Pre-Deployment Checklist

### Security
- [ ] All API routes have proper authentication
- [ ] Rate limiting configured
- [ ] CORS settings verified
- [ ] Environment variables secured (not exposed to client)
- [ ] Stripe webhook secret configured
- [ ] Supabase RLS policies verified

### Performance
- [ ] Images optimized with Next.js Image component
- [ ] API responses have proper caching headers
- [ ] Streaming enabled for AI responses
- [ ] Web Vitals monitoring enabled

### Monitoring
- [ ] Health check endpoint accessible at `/api/health`
- [ ] Sentry error tracking configured
- [ ] Structured logging enabled
- [ ] Performance metrics collection active

### User Experience
- [ ] Toast notifications working
- [ ] Offline status detection enabled
- [ ] Error boundaries in place
- [ ] Loading states implemented

### SEO & Accessibility
- [ ] Meta tags configured
- [ ] OpenGraph images generated
- [ ] Sitemap accessible
- [ ] robots.txt configured

## Post-Deployment Verification

### Health Check
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-xx-xx",
  "checks": {
    "database": { "status": "healthy" },
    "memory": { "status": "healthy" },
    "environment": { "status": "healthy" }
  }
}
```

### Stripe Webhook Test
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger payment_intent.succeeded
```

### Performance Monitoring
- Monitor Web Vitals in browser console
- Check Sentry for error reports
- Verify API response times < 500ms

## Rollback Plan

1. Keep previous deployment available
2. Database migrations should be backwards compatible
3. Feature flags for gradual rollout
4. Monitor error rates post-deployment

## Contact

For production issues, check:
1. Sentry dashboard for errors
2. Supabase dashboard for database issues
3. Vercel/deployment platform logs

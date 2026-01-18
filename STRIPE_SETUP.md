# Stripe Integration Setup Guide

This guide will help you complete the Stripe integration for premium subscriptions.

## What's Already Done

✅ Stripe product created: "청기운 프리미엄"
✅ Prices created:
  - KRW: ₩12,000/year (`price_1SglVfIGSqpGTA9i1HIxPO7T`)
  - USD: $12/year (`price_1SglVgIGSqpGTA9i9TIdIQ2K`)
✅ Checkout session API: `/api/stripe/create-checkout-session`
✅ Webhook handler: `/api/stripe/webhook`
✅ Premium page with checkout button
✅ Profile page with subscription management
✅ Success page after payment

## Required Steps

### 1. Get Stripe Secret Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for production)
3. Update `.env`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
   ```

### 2. Set Up Webhook

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Set endpoint URL:
   - Development: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) for local testing
   - Production: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Update `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

### 3. Testing with Stripe CLI (Development)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# This will output a webhook signing secret - add it to .env
# STRIPE_WEBHOOK_SECRET=whsec_...

# Test with test cards
# Card: 4242 4242 4242 4242
# Date: Any future date
# CVC: Any 3 digits
```

### 4. Update Supabase Service Role Key

The webhook handler needs admin access to bypass RLS. Get your service role key:

1. Go to [Supabase Project Settings](https://supabase.com/dashboard/project/ypwvlmhdqavbqltsetmk/settings/api)
2. Copy the **service_role** key
3. Already added to `.env` ✅

### 5. Configure Supabase Auth

1. Go to [Auth Settings](https://supabase.com/dashboard/project/ypwvlmhdqavbqltsetmk/auth/providers)
2. Enable **Email** provider
3. **Disable** "Confirm email" checkbox
4. Go to **URL Configuration**
5. Add site URLs:
   - Development: `http://localhost:3000`
   - Production: Your production URL

### 6. Install Dependencies

```bash
npm install
```

This installs:
- `@supabase/ssr` - Supabase SSR support
- `stripe` - Stripe Node.js SDK

## Testing the Flow

1. **Sign up/Login**: Create a new account or login
2. **Navigate to Premium**: Go to `/premium`
3. **Click "프리미엄 시작하기"**
4. **Complete checkout**: Use test card `4242 4242 4242 4242`
5. **Webhook processes**: Subscription is created in database
6. **Redirect to success**: User sees success page
7. **Check profile**: User should now see "프리미엄" tier

## Webhook Events Flow

```
1. User completes checkout
   ↓
2. Stripe sends `checkout.session.completed`
   ↓
3. Webhook creates subscription record
   ↓
4. User profile updated to premium tier
   ↓
5. User redirected to success page
```

## Subscription Lifecycle

- **New subscription**: `checkout.session.completed` → Premium activated
- **Renewal**: `invoice.payment_succeeded` → Subscription renewed
- **Cancellation**: `customer.subscription.deleted` → Downgraded to free
- **Payment failure**: `invoice.payment_failed` → User notified

## Production Checklist

- [ ] Switch to live Stripe API keys
- [ ] Set up production webhook endpoint
- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Test payment flow end-to-end
- [ ] Set up email notifications for failed payments
- [ ] Configure Stripe customer portal for self-service
- [ ] Add monitoring for webhook failures

## Stripe Customer Portal (Optional)

Allow users to manage their subscriptions:

1. Enable [Customer Portal](https://dashboard.stripe.com/settings/billing/portal)
2. Configure settings (cancel subscription, update payment method, etc.)
3. Add link to profile page:
   ```typescript
   const { url } = await stripe.billingPortal.sessions.create({
     customer: customerId,
     return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
   });
   ```

## Troubleshooting

**"Invalid API Key"**
- Check that `STRIPE_SECRET_KEY` is correct and starts with `sk_`

**Webhook not receiving events**
- Verify webhook endpoint URL is correct
- Check webhook signing secret is set
- Use Stripe CLI for local testing

**User not upgraded after payment**
- Check webhook logs in Stripe Dashboard
- Verify Supabase service role key is correct
- Check database for subscription records

**"Cannot find module '@supabase/ssr'"**
- Run `npm install`

## Support

- Stripe Docs: https://stripe.com/docs
- Supabase Docs: https://supabase.com/docs
- Stripe Testing: https://stripe.com/docs/testing

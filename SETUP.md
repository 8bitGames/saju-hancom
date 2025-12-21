# Supabase Auth Setup Guide

This guide will help you set up Supabase authentication and the free/premium tier system for your Saju app.

## Prerequisites

1. A Supabase account (https://supabase.com)
2. Node.js and npm installed

## Step 1: Get Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard/project/ypwvlmhdqavbqltsetmk
2. Go to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://ypwvlmhdqavbqltsetmk.supabase.co`)
   - **anon/public** key

## Step 2: Update Environment Variables

Update your `.env` file with the Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ypwvlmhdqavbqltsetmk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## Step 3: Configure Supabase Auth Settings

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Email** provider
3. **Disable** "Confirm email" (as per your requirements)
4. Go to **Authentication** → **URL Configuration**
5. Add your site URL: `http://localhost:3000` (for development)
6. Add production URL when deploying

## Step 4: Install Dependencies

```bash
npm install
```

This will install the required `@supabase/ssr` package.

## Step 5: Verify Database Schema

The database migration has already been applied with the following tables:
- `user_profiles` - Extended user data with subscription info
- `saju_results` - Saved fortune readings
- `usage_tracking` - Track free tier actions (PDF, share, save)
- `subscriptions` - Premium subscription records

To verify, go to **Database** → **Tables** in your Supabase dashboard.

## Step 6: Optional - KakaoTalk Sharing

To enable KakaoTalk sharing:

1. Create a Kakao Developers account: https://developers.kakao.com/
2. Create a new application
3. Get your **JavaScript Key**
4. Add to `.env`:
   ```bash
   NEXT_PUBLIC_KAKAO_JS_KEY=your_kakao_js_key_here
   ```

## Step 7: Test the Integration

1. Start the development server (requires permission as per CLAUDE.md)
2. Generate a Saju result
3. Try the following actions:
   - **Save Result** - Should prompt for login/register if not authenticated
   - **Download PDF** - Should check free tier limits
   - **Share on KakaoTalk** - Should track usage

## Features Implemented

### Free Tier
- 1 result save
- 1 PDF download
- 1 KakaoTalk share

### Premium Tier (₩12,000/year or $12/year)
- Unlimited result saves
- Unlimited PDF downloads
- Unlimited KakaoTalk shares
- Ad-free experience

## API Endpoints

- `POST /api/saju/save` - Save a Saju result
- `POST /api/saju/check-usage` - Check if user has remaining usage
- `POST /api/saju/track-usage` - Track a usage action

## Database Queries Available

All queries are in `lib/supabase/usage.ts`:
- `checkUsageLimit(userId, actionType)` - Check if action is allowed
- `trackUsage(userId, actionType)` - Record a usage action
- `saveSajuResult(userId, birthData, resultData)` - Save a result
- `getUserSubscription(userId)` - Get user's subscription status
- `getUserSajuResults(userId)` - Get all saved results for a user

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Auth middleware handles session management automatically

## Next Steps

1. Implement payment integration for premium subscriptions (Stripe, Toss Payments, etc.)
2. Add user profile page to view saved results
3. Add subscription management page
4. Implement email notifications for subscription expiry

## Troubleshooting

### "Not authenticated" errors
- Make sure Supabase credentials are correct in `.env`
- Check that middleware is working (refresh the page)

### Usage limits not working
- Verify the migration was applied successfully
- Check Supabase logs in the dashboard

### KakaoTalk share not working
- Make sure the Kakao SDK script loads (check browser console)
- Verify your Kakao JS key is correct
- Add your domain to the Kakao app settings

## Support

For issues or questions, refer to:
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs

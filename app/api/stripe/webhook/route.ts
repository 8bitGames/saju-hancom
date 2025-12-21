import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

// Create Supabase admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id || session.client_reference_id;

  if (!userId) {
    console.error('No user ID in checkout session');
    return;
  }

  // Get subscription details
  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const expiresAt = new Date(subscription.current_period_end * 1000);

  // Update user profile to premium
  const { error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_tier: 'premium',
      subscription_expires_at: expiresAt.toISOString(),
    })
    .eq('id', userId);

  if (profileError) {
    console.error('Error updating user profile:', profileError);
    return;
  }

  // Create subscription record
  const { error: subscriptionError } = await supabaseAdmin
    .from('subscriptions')
    .insert({
      user_id: userId,
      status: 'active',
      plan: 'yearly',
      amount_krw: subscription.currency === 'krw' ? subscription.items.data[0].price.unit_amount || 0 : 0,
      amount_usd: subscription.currency === 'usd' ? (subscription.items.data[0].price.unit_amount || 0) / 100 : 0,
      payment_method: 'stripe',
      starts_at: new Date(subscription.current_period_start * 1000).toISOString(),
      expires_at: expiresAt.toISOString(),
    });

  if (subscriptionError) {
    console.error('Error creating subscription record:', subscriptionError);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;

  if (!userId) {
    console.error('No user ID in subscription metadata');
    return;
  }

  const expiresAt = new Date(subscription.current_period_end * 1000);
  const status = subscription.status === 'active' ? 'active' : subscription.status === 'canceled' ? 'cancelled' : 'expired';

  // Update user profile
  await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_tier: status === 'active' ? 'premium' : 'free',
      subscription_expires_at: status === 'active' ? expiresAt.toISOString() : null,
    })
    .eq('id', userId);

  // Update subscription record
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status,
      expires_at: expiresAt.toISOString(),
    })
    .eq('user_id', userId)
    .eq('status', 'active');
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;

  if (!userId) {
    console.error('No user ID in subscription metadata');
    return;
  }

  // Downgrade user to free tier
  await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_tier: 'free',
      subscription_expires_at: null,
    })
    .eq('id', userId);

  // Mark subscription as cancelled
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('user_id', userId)
    .eq('status', 'active');
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Payment succeeded - subscription will be updated via subscription.updated event
  console.log(`Payment succeeded for invoice ${invoice.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.error(`Payment failed for invoice ${invoice.id}`);
  // You could send an email notification here
}

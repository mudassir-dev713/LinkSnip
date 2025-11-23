import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { buffer } from 'node:stream/consumers';
import { dbConnect } from '@/lib/dbConnect';
import Subscription from '@/models/Subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const rawBody = await buffer(req.body);
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    await dbConnect();

    switch (event.type) {
      case 'checkout.session.completed':
        // Fulfill the purchase
        console.log('Checkout Session completed!');
        break;
      case 'customer.subscription.created':
        // Create subscription in DB
        console.log('Subscription created!');
        break;
      case 'customer.subscription.updated':
        // Update subscription in DB
        console.log('Subscription updated!');
        break;
      case 'customer.subscription.deleted':
        // Cancel subscription in DB
        console.log('Subscription canceled!');
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
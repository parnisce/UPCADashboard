import { loadStripe } from '@stripe/stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
    console.warn("Stripe Publishable Key is missing. Check your .env file.");
}

export const stripePromise = loadStripe(stripeKey || '');

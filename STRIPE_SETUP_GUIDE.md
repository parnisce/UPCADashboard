# Stripe Payment Integration - Complete Setup Guide

## ✅ Step 1: Install Supabase CLI

If you haven't already, install the Supabase CLI:

```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

## 🔐 Step 2: Add Your Stripe Secret Key

1. Go to your **Stripe Dashboard**: https://dashboard.stripe.com/apikeys
2. Copy your **Secret Key** (starts with `sk_test_...`)
3. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
4. Navigate to: **Project Settings > Edge Functions > Secrets**
5. Add a new secret:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: `sk_test_YOUR_ACTUAL_SECRET_KEY`
6. Click **Save**

## 🚀 Step 3: Deploy the Edge Function

From your project root directory, run:

```bash
supabase functions deploy create-payment-intent
```

If this is your first time deploying, you may need to:
1. Login: `supabase login`
2. Link your project: `supabase link --project-ref YOUR_PROJECT_ID`

## 📝 Step 4: Update Your Frontend Code

The Edge Function URL will be:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/create-payment-intent
```

I will now update your `api.ts` to call this function.

## 🧪 Step 5: Test the Payment Flow

1. Restart your dev server: `npm run dev`
2. Go to Payment Methods and link a test card
3. Use Stripe's test card: **4242 4242 4242 4242**
   - **Expiry**: Any future date (e.g., 12/28)
   - **CVC**: Any 3 digits (e.g., 123)
4. Create an order and complete payment!

## 🎯 Test Cards Reference

- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995

Full list: https://stripe.com/docs/testing

## 🔒 Security Notes

- ✅ Your secret key is stored securely in Supabase (not in your code)
- ✅ Card data never touches your server (goes directly to Stripe)
- ✅ Edge Functions run on secure, isolated serverless infrastructure

---

**Next**: I will update your frontend to call this Edge Function when processing payments.

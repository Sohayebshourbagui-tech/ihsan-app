import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-04-22.dahlia",
});

export const PLANS = {
  PREMIUM_MONTHLY: {
    priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    name: "Ihsan Premium",
    amount: 999,
  },
};

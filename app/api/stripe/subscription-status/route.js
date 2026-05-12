import { requireAuth, getDbUser, apiError } from "../../../../lib/auth.js";
import { stripe } from "../../../../lib/stripe.js";
import { db } from "../../../../lib/db.js";

export async function GET() {
  try {
    const userId = await requireAuth();
    const user   = await getDbUser(userId);

    // If DB already shows PREMIUM, trust it
    if (user.subscription?.plan === "PREMIUM" && user.subscription?.status === "ACTIVE") {
      return Response.json({ plan: "PREMIUM" });
    }

    // Otherwise check Stripe directly by email so webhook delay doesn't matter
    if (user.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      const customer  = customers.data[0];
      if (customer) {
        const subs = await stripe.subscriptions.list({ customer: customer.id, status: "active", limit: 1 });
        if (subs.data.length > 0) {
          const sub = subs.data[0];
          // Sync to DB so future checks are fast
          await db.subscription.upsert({
            where:  { userId },
            create: {
              userId,
              plan:                   "PREMIUM",
              status:                 "ACTIVE",
              stripeCustomerId:       customer.id,
              stripeSubscriptionId:   sub.id,
              stripePriceId:          sub.items.data[0]?.price.id,
              stripeCurrentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
            },
            update: {
              plan:                   "PREMIUM",
              status:                 "ACTIVE",
              stripeCustomerId:       customer.id,
              stripeSubscriptionId:   sub.id,
              stripePriceId:          sub.items.data[0]?.price.id,
              stripeCurrentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
            },
          });
          return Response.json({ plan: "PREMIUM" });
        }
      }
    }

    return Response.json({ plan: user.subscription?.plan ?? "FREE" });
  } catch (err) {
    return apiError(err.message, err.status ?? 500);
  }
}

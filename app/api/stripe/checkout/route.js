import { stripe, PLANS } from "../../../../lib/stripe.js";
import { requireAuth, getDbUser, apiError } from "../../../../lib/auth.js";

export async function POST(request) {
  try {
    const userId = await requireAuth();
    const user   = await getDbUser(userId);
    const { priceId = PLANS.PREMIUM_MONTHLY.priceId } = await request.json().catch(() => ({}));

    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      ...(user.subscription?.stripeCustomerId
        ? { customer: user.subscription.stripeCustomerId }
        : { customer_email: user.email }),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/settings?checkout=success`,
      cancel_url:  `${origin}/settings?checkout=cancel`,
      metadata: { userId },
      subscription_data: { metadata: { userId } },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    return apiError(err.message, err.status ?? 500);
  }
}

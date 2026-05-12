import { stripe } from "../../../../lib/stripe.js";
import { requireAuth, getDbUser, apiError } from "../../../../lib/auth.js";

export async function POST(request) {
  try {
    const userId = await requireAuth();
    const user   = await getDbUser(userId);

    if (!user.subscription?.stripeCustomerId) {
      return apiError("No active subscription found.", 400);
    }

    const origin  = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const session = await stripe.billingPortal.sessions.create({
      customer:   user.subscription.stripeCustomerId,
      return_url: `${origin}/settings`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    return apiError(err.message, err.status ?? 500);
  }
}

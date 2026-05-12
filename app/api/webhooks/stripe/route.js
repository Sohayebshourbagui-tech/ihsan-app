import { stripe } from "../../../../lib/stripe.js";
import { db }     from "../../../../lib/db.js";

export async function POST(request) {
  const sig    = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const body   = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[stripe-webhook] signature failed:", err.message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const obj = event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      if (obj.mode !== "subscription") break;
      const sub = await stripe.subscriptions.retrieve(obj.subscription);
      await db.subscription.upsert({
        where:  { userId: obj.metadata.userId },
        create: {
          userId:                obj.metadata.userId,
          stripeCustomerId:      obj.customer,
          stripeSubscriptionId:  sub.id,
          stripePriceId:         sub.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
          plan:   "PREMIUM",
          status: "ACTIVE",
        },
        update: {
          stripeCustomerId:      obj.customer,
          stripeSubscriptionId:  sub.id,
          stripePriceId:         sub.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
          plan:   "PREMIUM",
          status: "ACTIVE",
        },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      if (!obj.subscription) break;
      const sub = await stripe.subscriptions.retrieve(obj.subscription);
      await db.subscription
        .update({
          where: { stripeSubscriptionId: sub.id },
          data: {
            stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
            status: "ACTIVE",
          },
        })
        .catch(() => {});
      break;
    }

    case "customer.subscription.updated": {
      const statusMap = {
        active:   "ACTIVE",
        canceled: "CANCELED",
        past_due: "PAST_DUE",
        trialing: "TRIALING",
        incomplete: "INCOMPLETE",
      };
      await db.subscription
        .update({
          where: { stripeSubscriptionId: obj.id },
          data: {
            stripePriceId:         obj.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(obj.current_period_end * 1000),
            status: statusMap[obj.status] ?? "ACTIVE",
          },
        })
        .catch(() => {});
      break;
    }

    case "customer.subscription.deleted": {
      await db.subscription
        .update({
          where: { stripeSubscriptionId: obj.id },
          data:  { plan: "FREE", status: "CANCELED" },
        })
        .catch(() => {});
      break;
    }
  }

  return Response.json({ received: true });
}

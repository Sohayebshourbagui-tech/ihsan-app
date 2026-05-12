import { Webhook } from "svix";
import { db } from "../../../../lib/db.js";

export async function POST(request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const svixId        = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await request.text();
  const wh = new Webhook(webhookSecret);

  let event;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created") {
    const email = data.email_addresses?.[0]?.email_address ?? "";
    await db.user.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        email,
        subscription: { create: { plan: "FREE" } },
        profile: { create: {} },
      },
      update: { email },
    });
    console.log(`[clerk-webhook] user.created: ${data.id}`);
  }

  if (type === "user.updated") {
    const email = data.email_addresses?.[0]?.email_address;
    if (email) {
      await db.user.update({ where: { id: data.id }, data: { email } }).catch(() => {});
    }
  }

  if (type === "user.deleted") {
    await db.user.delete({ where: { id: data.id } }).catch(() => {});
    console.log(`[clerk-webhook] user.deleted: ${data.id}`);
  }

  return Response.json({ received: true });
}

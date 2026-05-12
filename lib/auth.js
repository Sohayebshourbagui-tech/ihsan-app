import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db.js";

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  return userId;
}

export async function getDbUser(clerkUserId) {
  let user = await db.user.findUnique({
    where: { id: clerkUserId },
    include: { subscription: true, profile: true },
  });

  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
    user = await db.user.upsert({
      where: { id: clerkUserId },
      create: {
        id: clerkUserId,
        email,
        subscription: { create: { plan: "FREE" } },
        profile: { create: {} },
      },
      update: {},
      include: { subscription: true, profile: true },
    });
  }

  return user;
}

export function isPremium(user) {
  const sub = user.subscription;
  if (!sub || sub.plan !== "PREMIUM") return false;
  if (sub.status !== "ACTIVE" && sub.status !== "TRIALING") return false;
  if (sub.stripeCurrentPeriodEnd && sub.stripeCurrentPeriodEnd < new Date()) return false;
  return true;
}

export function apiError(message, status = 500) {
  return Response.json({ error: message }, { status });
}

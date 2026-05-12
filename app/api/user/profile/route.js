import { requireAuth, getDbUser, apiError } from "../../../../lib/auth.js";
import { db } from "../../../../lib/db.js";
import { profileSchema } from "../../../../lib/validate.js";

export async function GET() {
  try {
    const userId = await requireAuth();
    const user   = await getDbUser(userId);
    return Response.json({ profile: user.profile });
  } catch (err) {
    return apiError(err.message, err.status ?? 500);
  }
}

export async function PUT(request) {
  try {
    const userId = await requireAuth();
    const body   = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid profile data.", 400);

    const profile = await db.userProfile.upsert({
      where:  { userId },
      create: { userId, ...parsed.data },
      update: parsed.data,
    });
    return Response.json({ profile });
  } catch (err) {
    return apiError(err.message, err.status ?? 500);
  }
}

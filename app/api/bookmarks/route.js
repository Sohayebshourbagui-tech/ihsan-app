import { requireAuth, apiError } from "../../../lib/auth.js";
import { db } from "../../../lib/db.js";
import { bookmarkSchema } from "../../../lib/validate.js";

export async function GET(request) {
  try {
    const userId = await requireAuth();
    const sp     = new URL(request.url).searchParams;
    const type   = sp.get("type");

    const bookmarks = await db.bookmark.findMany({
      where: { userId, ...(type ? { type } : {}) },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return Response.json({ bookmarks });
  } catch (err) {
    return apiError(err.message, err.status ?? 500);
  }
}

export async function POST(request) {
  try {
    const userId = await requireAuth();
    const body   = await request.json();
    const parsed = bookmarkSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid bookmark data.", 400);

    const bookmark = await db.bookmark.create({ data: { userId, ...parsed.data } });
    return Response.json({ bookmark }, { status: 201 });
  } catch (err) {
    return apiError(err.message, err.status ?? 500);
  }
}

export async function DELETE(request) {
  try {
    const userId   = await requireAuth();
    const { id }   = await request.json();
    if (!id) return apiError("Missing bookmark id.", 400);

    const bookmark = await db.bookmark.findUnique({ where: { id } });
    if (!bookmark || bookmark.userId !== userId) return apiError("Not found.", 404);

    await db.bookmark.delete({ where: { id } });
    return Response.json({ deleted: true });
  } catch (err) {
    return apiError(err.message, err.status ?? 500);
  }
}

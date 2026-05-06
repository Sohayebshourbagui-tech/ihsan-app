import { NextResponse } from "next/server";
import { getHadithCollection } from "../../../../lib/hadith";

const VALID = new Set(["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah"]);

export async function GET(request, context) {
  const params = await context.params;
  const slug = params.collection?.toLowerCase();
  if (!VALID.has(slug)) {
    return NextResponse.json({ success: false, error: "Invalid collection." }, { status: 400 });
  }

  const sp      = request.nextUrl.searchParams;
  const page    = Math.max(Number(sp.get("page"))    || 1,  1);
  const perPage = Math.min(Math.max(Number(sp.get("count")) || 10, 1), 20);

  try {
    const hadiths = await getHadithCollection(slug, page, perPage);
    return NextResponse.json({ success: true, collection: slug, hadiths }, { status: 200 });
  } catch (err) {
    console.error(`[api/hadith/${slug}] error:`, err.message);
    return NextResponse.json({ success: false, error: "Could not fetch collection hadiths." }, { status: 500 });
  }
}

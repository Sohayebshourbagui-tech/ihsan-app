import { NextResponse } from "next/server";
import { searchHadiths } from "../../../../lib/hadith";

export async function GET(request) {
  const sp    = request.nextUrl.searchParams;
  const query = sp.get("q")?.trim() || "";

  if (!query) {
    return NextResponse.json({ success: true, hadiths: [] }, { status: 200 });
  }

  const page    = Math.max(Number(sp.get("page"))    || 1,  1);
  const perPage = Math.min(Math.max(Number(sp.get("count")) || 10, 1), 20);

  try {
    const hadiths = await searchHadiths(query, page, perPage);
    return NextResponse.json({ success: true, query, hadiths }, { status: 200 });
  } catch (err) {
    console.error("[api/hadith/search] error:", err.message);
    return NextResponse.json({ success: false, error: "Search failed." }, { status: 500 });
  }
}

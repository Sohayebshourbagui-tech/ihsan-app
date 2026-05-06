import { NextResponse } from "next/server";
import { getHadithByNumber } from "../../../../lib/hadith";

export async function GET(request) {
  const sp   = request.nextUrl.searchParams;
  const n    = sp.get("n")?.trim();
  const book = sp.get("book")?.trim() || null;

  if (!n || isNaN(Number(n)) || Number(n) <= 0) {
    return NextResponse.json({ success: false, error: "Provide a valid hadith number." }, { status: 400 });
  }

  try {
    const hadiths = await getHadithByNumber(n, book);
    return NextResponse.json({ success: true, hadiths }, { status: 200 });
  } catch (err) {
    console.error("[api/hadith/number] error:", err.message);
    return NextResponse.json({ success: false, error: "Could not fetch hadith." }, { status: 500 });
  }
}

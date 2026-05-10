import { NextResponse } from "next/server";
import { readFileSync }  from "fs";
import { join }          from "path";

let translationCache = null;

function getTranslations() {
  if (translationCache) return translationCache;
  const filePath = join(process.cwd(), "public", "translations", "sahih.json");
  translationCache = JSON.parse(readFileSync(filePath, "utf8"));
  return translationCache;
}

export async function GET(request) {
  const sp    = request.nextUrl.searchParams;
  const surah = parseInt(sp.get("surah"), 10);
  const ayah  = parseInt(sp.get("ayah"),  10);

  if (!surah || !ayah || isNaN(surah) || isNaN(ayah) || surah < 1 || surah > 114 || ayah < 1) {
    return NextResponse.json({ error: "Provide valid surah and ayah query params." }, { status: 400 });
  }

  try {
    const key   = `${surah}:${ayah}`;
    const entry = getTranslations()[key];
    if (!entry) return NextResponse.json({ error: "Verse not found." }, { status: 404 });
    return NextResponse.json({ translation: entry.t });
  } catch (err) {
    console.error("[api/quran/verse] error:", err.message);
    return NextResponse.json({ error: "Translation service unavailable." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getRandomHadith } from "../../../lib/hadith";

export async function GET() {
  try {
    const hadith = await getRandomHadith();
    return NextResponse.json({ success: true, hadith }, { status: 200 });
  } catch (err) {
    console.error("[api/hadith] random hadith error:", err.message);
    return NextResponse.json({ success: false, error: "Hadith service unavailable." }, { status: 500 });
  }
}

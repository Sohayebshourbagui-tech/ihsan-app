import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://random-hadith-generator.vercel.app/bukhari/", {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch hadith." }, { status: 502 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Hadith service unavailable." }, { status: 500 });
  }
}

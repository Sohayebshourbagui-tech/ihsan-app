import { NextResponse } from "next/server";

const COLLECTIONS = new Set([
  "bukhari",
  "muslim",
  "abudawud",
  "tirmidhi",
  "nasai",
  "ibnmajah",
]);

export async function GET(request, { params }) {
  const collection = params.collection?.toLowerCase();
  if (!COLLECTIONS.has(collection)) {
    return NextResponse.json({ error: "Invalid collection." }, { status: 400 });
  }

  const countRaw = request.nextUrl.searchParams.get("count");
  const count = Math.min(Math.max(Number(countRaw) || 1, 1), 20);
  const url = `https://random-hadith-generator.vercel.app/${collection}/`;

  try {
    const requests = Array.from({ length: count }, () =>
      fetch(url, { cache: "no-store" }).then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error("Failed request");
        return data;
      })
    );

    const results = await Promise.all(requests);
    return NextResponse.json({ collection, data: results }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Could not fetch collection hadiths." },
      { status: 500 }
    );
  }
}

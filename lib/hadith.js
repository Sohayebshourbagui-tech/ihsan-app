/**
 * Hadith service layer — HadithAPI.com.
 *
 * All public functions return hadiths normalized to:
 * { id, englishText, arabicText, narrator, grade, source, chapter, hadithNumber }
 */

const BASE = "https://hadithapi.com/api";

// Map our UI slugs → HadithAPI.com book slugs
const SLUG_MAP = {
  bukhari:  "sahih-bukhari",
  muslim:   "sahih-muslim",
  abudawud: "abu-dawud",
  tirmidhi: "al-tirmidhi",
  nasai:    "al-nasai",
  ibnmajah: "ibn-majah",
};

// Static fallback shown when the API is unavailable
const FALLBACK_HADITH = {
  id:           null,
  englishText:  "The best among you are those who learn the Quran and teach it.",
  arabicText:   "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
  narrator:     "Narrated 'Uthman ibn 'Affan (may Allah be pleased with him)",
  grade:        "Sahih",
  source:       "Hadith 5027",
  chapter:      "The Excellence of the Quran",
  hadithNumber: "5027",
};

function apiKey() {
  const raw = process.env.HADITH_API_KEY || "";
  if (!raw) return "";
  // Key is stored base64-encoded to avoid dotenv $ expansion issues
  try { return Buffer.from(raw, "base64").toString("utf8"); } catch { return raw; }
}

function buildUrl(path, params = {}) {
  const key = apiKey();
  const base = `${BASE}${path}?apiKey=${key}`;
  const qs = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  return qs ? `${base}&${qs}` : base;
}

/** Normalize a single hadith from HadithAPI.com into our stable shape */
function normalizeHadithApi(raw) {
  return {
    id:           raw.id ?? null,
    englishText:  raw.hadithEnglish || "",
    arabicText:   raw.hadithArabic  || "",
    narrator:     raw.englishNarrator || "",
    grade:        raw.status || "",
    source:       raw.hadithNumber ? `Hadith ${raw.hadithNumber}` : "",
    chapter:      raw.chapter?.chapterEnglish || raw.headingEnglish || "",
    hadithNumber: String(raw.hadithNumber || ""),
  };
}

/** Fetch a single random hadith */
export async function getRandomHadith() {
  try {
    const randomPage = Math.floor(Math.random() * 100) + 1;
    const url = buildUrl("/hadiths/", { paginate: 1, page: randomPage });
    const res  = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    console.log("[hadith] random — HadithAPI status:", json.status);
    if (json.status !== 200) throw new Error(`HadithAPI returned status ${json.status}`);
    const data = json.hadiths?.data ?? [];
    if (data.length > 0) return normalizeHadithApi(data[0]);
    throw new Error("Empty data from HadithAPI");
  } catch (err) {
    console.error("[hadith] getRandomHadith failed:", err.message, "— using static fallback");
    return FALLBACK_HADITH;
  }
}

/**
 * Fetch hadiths from a collection.
 * @param {string} slug  — one of the UI slugs (bukhari, muslim, …)
 * @param {number} page
 * @param {number} perPage
 */
export async function getHadithCollection(slug, page = 1, perPage = 10) {
  const apiSlug = SLUG_MAP[slug];
  if (!apiSlug) throw new Error(`Unknown collection: ${slug}`);

  const url = buildUrl("/hadiths/", { book: apiSlug, paginate: perPage, page });
  const res  = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  console.log(`[hadith] collection ${slug} page ${page} — HadithAPI status:`, json.status, "count:", json.hadiths?.data?.length ?? 0);
  if (json.status !== 200) throw new Error(`HadithAPI returned status ${json.status}`);
  return (json.hadiths?.data ?? []).map(normalizeHadithApi);
}

/**
 * Fetch hadiths by hadith number, optionally scoped to one book.
 * @param {string|number} number
 * @param {string|null}   book  — UI slug (e.g. "bukhari") or null for all books
 */
export async function getHadithByNumber(number, book = null) {
  const params = { hadithNumber: number, paginate: 10 };
  if (book) params.book = SLUG_MAP[book] ?? book;
  const url  = buildUrl("/hadiths/", params);
  const res  = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  console.log(`[hadith] byNumber ${number} book=${book ?? "all"} — status:`, json.status, "count:", json.hadiths?.data?.length ?? 0);
  if (json.status !== 200) throw new Error(`HadithAPI returned status ${json.status}`);
  return (json.hadiths?.data ?? []).map(normalizeHadithApi);
}

/**
 * Search hadiths by English text.
 * @param {string} query
 * @param {number} page
 * @param {number} perPage
 */
export async function searchHadiths(query, page = 1, perPage = 10) {
  if (!query?.trim()) return [];

  const url  = buildUrl("/hadiths/", { hadithEnglish: query.trim(), paginate: perPage, page });
  const res  = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  console.log(`[hadith] search "${query}" — HadithAPI status:`, json.status, "count:", json.hadiths?.data?.length ?? 0);
  if (json.status !== 200) throw new Error(`HadithAPI returned status ${json.status}`);
  return (json.hadiths?.data ?? []).map(normalizeHadithApi);
}

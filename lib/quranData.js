import { readFileSync } from "fs";
import { join }         from "path";
import { SURAHS }       from "./storage.js";

// ─── Singleton caches ──────────────────────────────────────────────────────
let tafsirCache    = null;
let surahInfoCache = null;

function loadTafsir() {
  if (tafsirCache) return tafsirCache;
  tafsirCache = JSON.parse(readFileSync(join(process.cwd(), "data", "tafsir-ibn-kathir.json"), "utf8"));
  return tafsirCache;
}

function loadSurahInfo() {
  if (surahInfoCache) return surahInfoCache;
  surahInfoCache = JSON.parse(readFileSync(join(process.cwd(), "data", "surah-info.json"), "utf8"));
  return surahInfoCache;
}

// ─── HTML → plain text ────────────────────────────────────────────────────
function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ").trim();
}

// ─── Surah name → number lookup ───────────────────────────────────────────
// Build a list of (regex, surahNumber) pairs covering common name variants.
const SURAH_PATTERNS = (() => {
  const pairs = [];
  for (const s of SURAHS) {
    // "Al-Baqarah" → also match "Baqarah", "al baqarah", "albaqarah"
    const base = s.name.replace(/^(Al|An|As|At|Az|Adh|Ar|Ath)-/i, "").toLowerCase();
    const full = s.name.toLowerCase().replace(/-/g, "[- ]?");
    pairs.push({ re: new RegExp(`\\b(al[- ]?)?${base}\\b`, "i"), n: s.n });
    if (full !== base) {
      pairs.push({ re: new RegExp(`\\b${full}\\b`, "i"), n: s.n });
    }
  }
  // Special well-known names
  const specials = [
    { re: /\bayat[\s-]?al[- ]?kursi\b/i, n: 2, a: 255 },
    { re: /\bkursi\b/i,                  n: 2, a: 255 },
    { re: /\byaseen\b|\bya[- ]?sin\b/i,  n: 36 },
    { re: /\bikhlas\b|\bqul huwa\b/i,    n: 112 },
    { re: /\bfatiha\b|\bfatihah\b/i,     n: 1 },
    { re: /\bkahf\b/i,                   n: 18 },
    { re: /\bmulk\b/i,                   n: 67 },
    { re: /\bnas\b/i,                    n: 114 },
    { re: /\bfalaq\b/i,                  n: 113 },
    { re: /\bwaqiah\b|\bwaq'iah\b/i,     n: 56 },
    { re: /\brahman\b/i,                 n: 55 },
  ];
  return { pairs, specials };
})();

/**
 * Detect surah number and optional ayah number from text.
 * Returns { surah: number, ayah: number|null } or null.
 */
function detectReference(text) {
  // 1. Explicit surah:ayah notation e.g. "2:255" or "2 : 255"
  const explicitRef = text.match(/\b(\d{1,3})\s*:\s*(\d{1,3})\b/);
  if (explicitRef) {
    const s = parseInt(explicitRef[1], 10);
    const a = parseInt(explicitRef[2], 10);
    if (s >= 1 && s <= 114) return { surah: s, ayah: a };
  }

  // 2. Special well-known verse/name overrides (include fixed ayah)
  for (const sp of SURAH_PATTERNS.specials) {
    if (sp.re.test(text)) return { surah: sp.n, ayah: sp.a ?? null };
  }

  // 3. "surah 36" / "chapter 36"
  const byNumber = text.match(/\b(?:surah|sura|chapter)\s+(\d{1,3})\b/i);
  if (byNumber) {
    const s = parseInt(byNumber[1], 10);
    if (s >= 1 && s <= 114) {
      // also look for ayah mention nearby
      const ayahMatch = text.match(/\b(?:ayah|verse|ayat|aya)\s+(\d{1,3})\b/i);
      return { surah: s, ayah: ayahMatch ? parseInt(ayahMatch[1], 10) : null };
    }
  }

  // 4. Surah name match
  for (const { re, n } of SURAH_PATTERNS.pairs) {
    if (re.test(text)) {
      const ayahMatch = text.match(/\b(?:ayah|verse|ayat|aya)\s+(\d{1,3})\b/i);
      return { surah: n, ayah: ayahMatch ? parseInt(ayahMatch[1], 10) : null };
    }
  }

  return null;
}

/**
 * Returns true if the message is asking about tafsir / surah info.
 */
function isTafsirQuery(text) {
  return /\b(tafsir|tafseer|exeges|interpretation|meaning|explain|what does|reveal|themes?|topic|background|context|surah info|when was|makkah|madinah|meccan|medinan|nazil|period of revelation)\b/i.test(text);
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Get stripped tafsir text for a specific verse (truncated to maxChars).
 */
export function getTafsir(surah, ayah, maxChars = 2800) {
  try {
    const tafsir = loadTafsir();
    const key    = `${surah}:${ayah}`;
    const entry  = tafsir[key];
    if (!entry) return null;
    const text = stripHtml(entry.text);
    return text.length > maxChars ? text.slice(0, maxChars) + "…" : text;
  } catch { return null; }
}

/**
 * Get stripped surah info text (truncated to maxChars).
 */
export function getSurahInfo(surah, maxChars = 2500) {
  try {
    const info  = loadSurahInfo();
    const entry = info[String(surah)];
    if (!entry) return null;
    const text = stripHtml(entry.text);
    return text.length > maxChars ? text.slice(0, maxChars) + "…" : text;
  } catch { return null; }
}

/**
 * Analyse the user's latest message and return a context block to inject
 * into the system prompt, or null if no Quran context is needed.
 *
 * Returns: { contextBlock: string, surah: number, ayah: number|null } | null
 */
export function getQuranContext(messages) {
  const last = messages.findLast?.(m => m.role === "user") ?? messages.filter(m => m.role === "user").at(-1);
  if (!last) return null;

  const text = String(last.content);

  // Only bother fetching context when the user seems to be asking about tafsir/surah
  if (!isTafsirQuery(text) && !/\b(surah|sura|ayah|verse|ayat|chapter|quran|quranic|qur'an)\b/i.test(text)) {
    return null;
  }

  const ref = detectReference(text);
  if (!ref) return null;

  const { surah, ayah } = ref;
  const surahEntry = SURAHS.find(s => s.n === surah);
  const surahLabel = surahEntry ? `Surah ${surahEntry.name} (${surah})` : `Surah ${surah}`;

  const blocks = [];

  if (ayah) {
    const tafsirText = getTafsir(surah, ayah);
    if (tafsirText) {
      blocks.push(`IBN KATHIR TAFSIR — ${surahLabel}, Ayah ${ayah}:\n${tafsirText}`);
    }
  }

  // Always include surah info when surah is identified
  const surahInfoText = getSurahInfo(surah);
  if (surahInfoText) {
    blocks.push(`SURAH INFO — ${surahLabel}:\n${surahInfoText}`);
  }

  if (blocks.length === 0) return null;

  return {
    contextBlock: blocks.join("\n\n---\n\n"),
    surah,
    ayah: ayah ?? null,
  };
}

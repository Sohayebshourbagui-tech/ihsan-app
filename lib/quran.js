const cache    = new Map(); // surahNumber -> string[]
const inflight = new Map(); // surahNumber -> Promise<string[]>

export const BISMILLAH = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

// Bismillah is stripped from API text in getSurah; this is now a pass-through.
export function withBismillah(_surahNumber, _ayahNumber, text) {
  return text;
}

// Fire-and-forget cache warm — call before the user reaches a surah boundary.
export function prefetchSurah(surahNumber) {
  if (surahNumber >= 1 && surahNumber <= 114) getSurah(surahNumber).catch(() => {});
}

/**
 * Fetch all ayah texts for a surah.
 * Returns a string[] (index = ayahNumber - 1), or null on error.
 * Results are cached in memory for the session lifetime.
 */
export async function getSurah(surahNumber) {
  if (cache.has(surahNumber)) return cache.get(surahNumber);
  if (inflight.has(surahNumber)) return inflight.get(surahNumber);

  const promise = fetch(
    `https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`
  )
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(json => {
      const texts = json.data.ayahs.map((a, i) => {
        const t = a.text;
        // quran-uthmani API embeds Bismillah in ayah 1 for surahs 2–114.
        // Strip it — surah 1 ayah 1 is the Bismillah itself, leave that alone.
        if (i === 0 && surahNumber !== 1 && t.trimStart().startsWith("بِسْمِ")) {
          const words = t.trimStart().split(/\s+/);
          return words.slice(4).join(" ");
        }
        return t;
      });
      cache.set(surahNumber, texts);
      inflight.delete(surahNumber);
      return texts;
    })
    .catch(() => {
      inflight.delete(surahNumber);
      return null;
    });

  inflight.set(surahNumber, promise);
  return promise;
}

/**
 * Fetch a single ayah's Arabic text.
 * Returns the text string, or null if unavailable.
 */
export async function getAyah(surahNumber, ayahNumber) {
  const texts = await getSurah(surahNumber);
  if (!texts) return null;
  return texts[ayahNumber - 1] ?? null;
}

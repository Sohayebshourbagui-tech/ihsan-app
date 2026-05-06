/**
 * Huruf Muqatta'at — disconnected letters that open 29 Quranic surahs.
 *
 * Speech-recognition engines almost always transcribe them by their Arabic
 * letter names ("الف لام ميم") instead of the compact Quran form ("الم"),
 * or occasionally merge all names into a single token ("الفلامميم").
 * This module normalises those spoken forms back to compact text so that
 * the word-level comparison engine sees identical tokens and scores them as
 * exact matches.
 *
 * ── Design constraints ───────────────────────────────────────────────────────
 * • All string literals are in POST-normalizeArabic form (no tashkeel,
 *   alef variants → ا, ء → "", ة → ه, ى → ي).
 * • Collapse is guided by the expected words: we only fold sequences whose
 *   compact result appears in the expected text, preventing false collapses
 *   of ordinary words like "لام" (to blame) or "ها" (here) in normal ayahs.
 * • Greedy longest-match: "الف لام ميم صاد" → المص, not الم + leftover.
 *
 * ── Adding a new alias or variant ───────────────────────────────────────────
 * 1. Identify the compact normalised form (run normalizeArabic on the Quran
 *    text for that muqatta'ah).
 * 2. Add it to MUQATTAAT_SEQUENCES with every STT spelling variant as a
 *    sub-array of normalised letter names.  Single-token joined outputs
 *    (e.g. "الفلامميم") go as a one-element sub-array.
 * 3. If the individual letter name is not already in LETTER_NAME_TO_LETTER,
 *    add it there too (for documentation and future use).
 */

// ── Letter-name vocabulary (reference / future use) ───────────────────────────
// Maps each normalised Arabic letter name to the single letter it names.
// Not used by the collapse algorithm directly, but kept here so new entries
// in MUQATTAAT_SEQUENCES can be verified at a glance.
//
// Normalization effects shown in comments (normalizeArabic has already run):
//   أَلِف  →  alef variant أ → ا  ∴  "الف"
//   هَاء   →  ء stripped        ∴  "ها"
//   يَاء   →  ء stripped        ∴  "يا"
//   رَاء   →  ء stripped        ∴  "را"
//   طَاء   →  ء stripped        ∴  "طا"
//   حَاء   →  ء stripped        ∴  "حا"
export const LETTER_NAME_TO_LETTER = new Map([
  // ── Alif — two STT surface forms ──────────────────────────────────────────
  ["الف",  "ا"],   // أَلِف  standard
  ["اليف", "ا"],   // اليف   common STT variant (ya inserted)
  // ── Rest of the alphabet (only those appearing in muqatta'at) ─────────────
  ["لام",  "ل"],
  ["ميم",  "م"],
  ["نون",  "ن"],
  ["را",   "ر"],   // رَاء → strip ء
  ["سين",  "س"],
  ["صاد",  "ص"],
  ["قاف",  "ق"],
  ["كاف",  "ك"],
  ["ها",   "ه"],   // هَاء → strip ء
  ["يا",   "ي"],   // يَاء → strip ء
  ["عين",  "ع"],
  ["طا",   "ط"],   // طَاء → strip ء
  ["حا",   "ح"],   // حَاء → strip ء
]);

// ── Muqatta'at with their letter-name expansions ──────────────────────────────
// Format: [compact_normalised_form, [[spoken_word, ...], ...alternate_sequences]]
//
// Multiple sub-arrays cover STT variation:
//   • "اليف" vs "الف" for alif (most common difference)
//   • Joined single-token outputs where STT merges all letter names
//
// Compact forms are what normalizeArabic produces from the Quran text:
//   الٓمٓ → الم   يسٓ → يس   طٰهٰ → طه   حٰمٓ → حم   etc.
const MUQATTAAT_SEQUENCES = [
  // ── Single letter ──────────────────────────────────────────────────────────
  ["ص",     [["صاد"]]],                                      // Surah 38
  ["ق",     [["قاف"]]],                                      // Surah 50
  ["ن",     [["نون"]]],                                      // Surah 68

  // ── Two letters ────────────────────────────────────────────────────────────
  ["طه",    [["طا", "ها"]]],                                 // Surah 20
  ["يس",    [["يا", "سين"]]],                                // Surah 36
  ["طس",    [["طا", "سين"]]],                                // Surah 27
  ["حم",    [["حا", "ميم"]]],                                // Surahs 40-46

  // ── Three letters ──────────────────────────────────────────────────────────
  ["الم",   [
    ["الف",  "لام", "ميم"],                                  // standard alif name
    ["اليف", "لام", "ميم"],                                  // STT variant alif
    ["الفلامميم"],                                           // merged single token
    ["اليفلامميم"],                                          // merged with STT alif
  ]],                                                        // Surahs 2,3,29,30,31,32
  ["الر",   [
    ["الف",  "لام", "را"],
    ["اليف", "لام", "را"],
  ]],                                                        // Surahs 10,11,12,14,15
  ["طسم",   [["طا", "سين", "ميم"]]],                        // Surahs 26, 28

  // ── Four letters ───────────────────────────────────────────────────────────
  ["المر",  [
    ["الف",  "لام", "ميم", "را"],
    ["اليف", "لام", "ميم", "را"],
  ]],                                                        // Surah 13
  ["المص",  [
    ["الف",  "لام", "ميم", "صاد"],
    ["اليف", "لام", "ميم", "صاد"],
  ]],                                                        // Surah 7

  // ── Five letters ───────────────────────────────────────────────────────────
  ["كهيعص", [["كاف", "ها", "يا", "عين", "صاد"]]],          // Surah 19
  ["عسق",   [["عين", "سين", "قاف"]]],                       // Surah 42 ayah 2
];

// ── Derived lookups (built once at module load) ───────────────────────────────

/** Set of all compact muqatta'at forms after normalizeArabic. */
export const MUQATTAAT = new Set(MUQATTAAT_SEQUENCES.map(([form]) => form));

// Reverse map: pipe-joined sequence key → compact form.
// E.g. "الف|لام|ميم" → "الم",  "الفلامميم" → "الم"
const SEQUENCE_TO_COMPACT = new Map();
for (const [compact, sequences] of MUQATTAAT_SEQUENCES) {
  for (const seq of sequences) {
    SEQUENCE_TO_COMPACT.set(seq.join("|"), compact);
  }
}

// Longest sequence length — caps the sliding window in collapseLetterNames.
const MAX_SEQ_LEN = Math.max(
  ...Array.from(SEQUENCE_TO_COMPACT.keys()).map(k => k.split("|").length),
);

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns true if `normalizedWord` is a known compact muqatta'ah.
 * Input must already have been processed by normalizeArabic.
 */
export function isMuqattaah(normalizedWord) {
  return MUQATTAAT.has(normalizedWord);
}

/**
 * Scan `spkWords` (already normalised) for letter-name sequences that
 * correspond to muqatta'at appearing in `expWords`, and collapse them to
 * their compact Quran forms.
 *
 * Safety: only collapses a sequence when its compact result is actually
 * present in `expWords`.  This prevents false positives in ordinary ayahs
 * where words like "لام" or "ها" appear in normal speech.
 *
 * Algorithm: greedy longest-match left-to-right so that a longer muqatta'ah
 * ("الف لام ميم صاد" → المص) is never partially consumed as a shorter one
 * ("الف لام ميم" → الم) when the expected word is in fact المص.
 *
 * @param {string[]} spkWords  - normalised spoken words (post-normalizeArabic)
 * @param {string[]} expWords  - normalised expected words (used as a guide)
 * @returns {string[]}         - spoken words with letter-name runs collapsed
 */
export function collapseLetterNames(spkWords, expWords) {
  // Fast path: skip entirely when no expected word is a muqatta'ah.
  const expectedMuqattaat = new Set(expWords.filter(w => MUQATTAAT.has(w)));
  if (expectedMuqattaat.size === 0) return spkWords;

  const out = [];
  let i = 0;

  while (i < spkWords.length) {
    let collapsed = false;

    // Try windows from longest to shortest (greedy) at the current position.
    const maxLen = Math.min(MAX_SEQ_LEN, spkWords.length - i);
    for (let len = maxLen; len >= 1; len--) {
      const key     = spkWords.slice(i, i + len).join("|");
      const compact = SEQUENCE_TO_COMPACT.get(key);

      if (compact && expectedMuqattaat.has(compact)) {
        // Collapse this letter-name run to its compact muqatta'ah form.
        out.push(compact);
        i += len;
        collapsed = true;
        break;
      }
    }

    if (!collapsed) {
      // Not a letter-name sequence — pass through unchanged.
      out.push(spkWords[i]);
      i++;
    }
  }

  return out;
}

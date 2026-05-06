import { collapseLetterNames } from "./muqattaat";

/**
 * Strips ALL tashkeel, harakat, and Quranic annotation marks.
 * Ranges: U+0610-U+061A, U+064B-U+065F, U+0670 (superscript alef),
 *         U+06D6-U+06DC, U+06DF-U+06E4, U+06E7-U+06E8, U+06EA-U+06ED
 */
export function normalizeArabic(text) {
  if (!text) return "";
  let t = text;

  // All tashkeel / harakat / Quranic annotations
  t = t.replace(/[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ]/g, "");
  // Tatweel
  t = t.replace(/ـ/g, "");
  // Alef variants → bare alef
  t = t.replace(/[أإآٱ]/g, "ا");
  // Hamza carriers
  t = t.replace(/ؤ/g, "و");
  t = t.replace(/ئ/g, "ي");
  // Standalone hamza – often dropped in STT output
  t = t.replace(/ء/g, "");
  // Ta marbuta → ha (pause-form pronunciation)
  t = t.replace(/ة/g, "ه");
  // Alef maqsura → ya
  t = t.replace(/ى/g, "ي");
  // Arabic punctuation
  t = t.replace(/[،؛؟۔٪]/g, "");
  t = t.replace(/[.,;:!?()\[\]{}\-'"]/g, "");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

/** Convert Western digits to Arabic-Indic (٠١٢٣…). */
export function toArabicIndic(n) {
  return String(n).replace(/[0-9]/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
}

// ─── Core distance ────────────────────────────────────────────────────────────

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function wordSimilarity(a, b) {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

// ─── New recitation comparison ─────────────────────────────────────────────────

const CORRECT_THRESHOLD = 0.85;
const LOOKAHEAD = 3;

/**
 * Compare recited words against expected words with look-ahead skip detection.
 *
 * @param {string[]} expectedWords  – raw (un-normalised) expected words
 * @param {string[]} recitedWords   – raw words from STT
 * @param {{ threshold?: number, isLive?: boolean }} opts
 *   threshold – minimum similarity to count as a match (default 0.60)
 *   isLive    – if true, trailing unmatched words are "pending" not "missed"
 *
 * Returns per-word result for each expected word:
 *   { word, status: 'correct'|'wrong'|'missed'|'pending', score, recited }
 */
export function compareRecitation(expectedWords, recitedWords, { threshold = 0.60, isLive = false } = {}) {
  const normExp = expectedWords.map(w => normalizeArabic(w));
  const normRec = recitedWords.map(w => normalizeArabic(w));

  // Collapse letter-name sequences in the spoken words before comparison so
  // that muqatta'at pronounced by name ("الف لام ميم") match their compact
  // form ("الم").  processedNormRec may be shorter than the original normRec;
  // bestRi indexes into it, and we store processedNormRec[bestRi] in the
  // `recited` field (shows the compact form in tooltips, which is correct).
  const processedNormRec = collapseLetterNames(normRec, normExp);

  const results = [];
  let recIdx = 0;

  for (let ei = 0; ei < normExp.length; ei++) {
    if (recIdx >= processedNormRec.length) {
      results.push({ word: expectedWords[ei], status: isLive ? "pending" : "missed", score: 0, recited: null });
      continue;
    }

    let bestSim = 0;
    let bestRi  = -1;
    const end   = Math.min(recIdx + LOOKAHEAD, processedNormRec.length);

    for (let ri = recIdx; ri < end; ri++) {
      const sim = wordSimilarity(normExp[ei], processedNormRec[ri]);
      if (sim > bestSim) { bestSim = sim; bestRi = ri; }
    }

    if (bestSim >= threshold) {
      recIdx = bestRi + 1;
      const status = bestSim >= CORRECT_THRESHOLD ? "correct" : "wrong";
      results.push({ word: expectedWords[ei], status, score: Math.round(bestSim * 100), recited: processedNormRec[bestRi] });
    } else {
      results.push({ word: expectedWords[ei], status: "missed", score: 0, recited: null });
    }
  }

  return results;
}

/** Aggregate per-word results into summary statistics. */
export function calculateScore(results) {
  const total   = results.length;
  const pending = results.filter(r => r.status === "pending").length;
  const correct = results.filter(r => r.status === "correct").length;
  const wrong   = results.filter(r => r.status === "wrong").length;
  const missed  = results.filter(r => r.status === "missed").length;
  const scored  = total - pending;
  const score   = scored > 0 ? Math.round((correct / scored) * 100) : 0;
  return { score, correct, wrong, missed, pending, total };
}

// ─── Legacy comparison (used by RecitationModal + continuous page) ─────────────

function fuzzyLCS(expWords, spkWords, threshold = 0.7) {
  const m = expWords.length, n = spkWords.length;
  const sim = Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) => wordSimilarity(expWords[i], spkWords[j]))
  );
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        sim[i - 1][j - 1] >= threshold
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const pairs = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (sim[i - 1][j - 1] >= threshold && dp[i][j] === dp[i - 1][j - 1] + 1) {
      pairs.unshift({ ei: i - 1, sj: j - 1, similarity: sim[i - 1][j - 1] });
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return pairs;
}

/**
 * Legacy single-ayah comparison (RecitationModal, continuous page, hifz page).
 * Returns { score, matched, missing, incorrect, passed, expectedWords, spokenWords }
 */
export function compareAyah(expected, spoken) {
  const expWords = normalizeArabic(expected).split(" ").filter(Boolean);
  const spkWords = normalizeArabic(spoken).split(" ").filter(Boolean);

  // Collapse letter-name sequences in the spoken words (e.g. "الف لام ميم"
  // → "الم") so muqatta'at are compared as their compact Quran form.
  // Collapse is a no-op for ayahs that contain no muqatta'at.
  const processedSpkWords = collapseLetterNames(spkWords, expWords);

  if (expWords.length === 0) {
    return {
      score: 100, matched: 0, missing: 0, incorrect: processedSpkWords.length,
      passed: true,
      expectedWords: [],
      spokenWords: processedSpkWords.map(word => ({ word, status: "incorrect" })),
    };
  }
  if (processedSpkWords.length === 0) {
    return {
      score: 0, matched: 0, missing: expWords.length, incorrect: 0,
      passed: false,
      expectedWords: expWords.map(word => ({ word, status: "missing" })),
      spokenWords: [],
    };
  }

  const pairs      = fuzzyLCS(expWords, processedSpkWords);
  const expMatchAt = new Map(pairs.map(p => [p.ei, p]));
  const spkMatchAt = new Map(pairs.map(p => [p.sj, p]));

  const expectedWords = expWords.map((word, i) => {
    const p = expMatchAt.get(i);
    if (!p) return { word, status: "missing" };
    return { word, status: p.similarity === 1 ? "matched" : "close" };
  });
  const spokenWords = processedSpkWords.map((word, j) => {
    const p = spkMatchAt.get(j);
    if (!p) return { word, status: "incorrect" };
    return { word, status: p.similarity === 1 ? "matched" : "close" };
  });

  const matchedCount   = expectedWords.filter(w => w.status === "matched").length;
  const closeCount     = expectedWords.filter(w => w.status === "close").length;
  const missingCount   = expectedWords.filter(w => w.status === "missing").length;
  const incorrectCount = spokenWords.filter(w => w.status === "incorrect").length;
  const score          = Math.round(((matchedCount + closeCount) / expWords.length) * 100);

  return {
    score,
    matched:   matchedCount + closeCount,
    missing:   missingCount,
    incorrect: incorrectCount,
    passed:    score >= 60,
    expectedWords,
    spokenWords,
  };
}

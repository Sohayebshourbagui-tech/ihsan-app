/**
 * Strip tashkeel, tatweel, punctuation, and extra whitespace from Arabic text.
 * Used to normalize both the reference ayah and the speech-recognition transcript
 * before comparison.
 *
 * Unicode ranges removed:
 *   U+0610-U+061A  Arabic sign characters (not letter-forming)
 *   U+064B-U+065F  Harakat: fathatan, dammatan, kasratan, fathah, dammah,
 *                  kasrah, shadda, sukun, and extended combining marks
 *   U+0670         Arabic Letter Superscript Alef
 *   U+06D6-U+06DC  Arabic small high decorative marks
 *   U+06DF-U+06E4  Arabic combining marks
 *   U+06E7-U+06E8  Arabic small high meem / noon
 *   U+06EA-U+06ED  Arabic combining marks
 *
 * Arabic letter codepoints (U+0621-U+063A, U+0641-U+064A) are intentionally
 * excluded from all ranges above so they are never stripped.
 */
export function normalizeArabic(text) {
  if (!text) return "";
  return text
    .replace(/[ؐ-ؚ]/g, "")
    .replace(/[ً-ٟ]/g, "")
    .replace(/ٰ/g, "")
    .replace(/[ۖ-ۜ]/g, "")
    .replace(/[۟-ۤ]/g, "")
    .replace(/[ۧ-ۨ]/g, "")
    .replace(/[۪-ۭ]/g, "")
    .replace(/ـ/g, "")                          // tatweel / kashida
    .replace(/[،؛؟۔]/g, "")      // Arabic punctuation
    .replace(/[.,;:!?()\[\]{}\-'"]/g, "")            // ASCII punctuation
    .replace(/\s+/g, " ")
    .trim();
}

// Returns the sets of matched indices (into a and b) that form their LCS.
function lcs(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const expIndices = new Set();
  const spkIndices = new Set();
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      expIndices.add(i - 1);
      spkIndices.add(j - 1);
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return { expIndices, spkIndices };
}

/**
 * Compare a spoken recitation against the expected ayah text.
 *
 * @param {string} expected  - Raw ayah text from the API
 * @param {string} spoken    - Raw transcript from speech recognition
 * @returns {{
 *   score: number,
 *   matched: number,
 *   missing: number,
 *   incorrect: number,
 *   passed: boolean,
 *   expectedWords: { word: string, status: "matched"|"missing" }[],
 *   spokenWords:   { word: string, status: "matched"|"incorrect" }[],
 * }}
 */
export function compareAyah(expected, spoken) {
  const expWords = normalizeArabic(expected).split(" ").filter(Boolean);
  const spkWords = normalizeArabic(spoken).split(" ").filter(Boolean);

  if (expWords.length === 0) {
    return {
      score: 100, matched: 0, missing: 0, incorrect: spkWords.length,
      passed: true,
      expectedWords: [],
      spokenWords: spkWords.map(word => ({ word, status: "incorrect" })),
    };
  }

  if (spkWords.length === 0) {
    return {
      score: 0, matched: 0, missing: expWords.length, incorrect: 0,
      passed: false,
      expectedWords: expWords.map(word => ({ word, status: "missing" })),
      spokenWords: [],
    };
  }

  const { expIndices, spkIndices } = lcs(expWords, spkWords);

  const matchedCount   = expIndices.size;
  const missingCount   = expWords.length - matchedCount;
  const incorrectCount = spkWords.length - spkIndices.size;
  const score          = Math.round((matchedCount / expWords.length) * 100);

  return {
    score,
    matched:   matchedCount,
    missing:   missingCount,
    incorrect: incorrectCount,
    passed:    score >= 90,
    expectedWords: expWords.map((word, i) => ({
      word, status: expIndices.has(i) ? "matched" : "missing",
    })),
    spokenWords: spkWords.map((word, j) => ({
      word, status: spkIndices.has(j) ? "matched" : "incorrect",
    })),
  };
}

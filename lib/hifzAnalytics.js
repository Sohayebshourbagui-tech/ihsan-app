const STORAGE_KEY = "hifz_analytics";

function load() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function ayahKey(surah, ayah) { return `${surah}:${ayah}`; }

function nextReviewTime(score) {
  const now = Date.now();
  if (score < 70) return now;                           // needs review today
  if (score < 90) return now + 24 * 60 * 60 * 1000;    // review tomorrow
  return now + 7 * 24 * 60 * 60 * 1000;                // strong — revisit in 7 days
}

/**
 * Record the result of a recitation attempt for a single ayah.
 */
export function recordRecitationResult({ surah, ayah, score, passed }) {
  const data = load();
  const key  = ayahKey(surah, ayah);
  const prev = data[key] ?? {
    surah, ayah,
    attempts: 0, totalScore: 0, averageScore: 0,
    lastScore: 0, lastReviewed: 0,
    weakCount: 0, strongCount: 0,
    nextReview: 0,
  };

  prev.attempts++;
  prev.totalScore   += score;
  prev.averageScore  = Math.round(prev.totalScore / prev.attempts);
  prev.lastScore     = score;
  prev.lastReviewed  = Date.now();
  prev.nextReview    = nextReviewTime(score);

  if (passed) prev.strongCount++;
  else        prev.weakCount++;

  data[key] = prev;
  save(data);
}

/**
 * Return ayahs with the lowest average scores (weakest first).
 * @param {number} limit
 */
export function getWeakAyahs(limit = 5) {
  return Object.values(load())
    .filter(r => r.attempts > 0 && r.averageScore < 90)
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, limit);
}

/**
 * Return ayahs whose nextReview timestamp is in the past (due now or overdue).
 * @param {number} limit
 */
export function getReviewQueue(limit = 10) {
  const now = Date.now();
  return Object.values(load())
    .filter(r => r.nextReview <= now)
    .sort((a, b) => a.nextReview - b.nextReview)
    .slice(0, limit);
}

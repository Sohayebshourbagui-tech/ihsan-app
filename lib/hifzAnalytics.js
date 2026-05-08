const STORAGE_KEY  = "hifz_analytics";
const ACTIVITY_KEY = "hifz_activity";

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function recordDailyActivity() {
  if (typeof window === "undefined") return;
  try {
    const raw  = localStorage.getItem(ACTIVITY_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const key  = getTodayKey();
    data[key]  = (data[key] ?? 0) + 1;
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(data));
  } catch {}
}

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
  recordDailyActivity();
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

/** Aggregate stats for the daily review dashboard. */
export function getReviewStats() {
  const data = load();
  const all  = Object.values(data);
  const now  = Date.now();
  const DAY  = 24 * 60 * 60 * 1000;

  const due      = all.filter(r => r.nextReview <= now);
  const overdue  = all.filter(r => r.nextReview > 0 && r.nextReview < now - DAY);
  const weak     = all.filter(r => r.attempts > 0 && r.averageScore < 90);
  const reviewed = all.filter(r => r.lastReviewed >= now - 7 * DAY);

  const future = all
    .filter(r => r.nextReview > now)
    .sort((a, b) => a.nextReview - b.nextReview);

  return {
    due:            due.length,
    overdue:        overdue.length,
    weak:           weak.length,
    total:          all.length,
    completionRate: all.length > 0 ? Math.round((reviewed.length / all.length) * 100) : 0,
    nextReviewMs:   future.length > 0 ? future[0].nextReview - now : null,
  };
}

/**
 * Classify review urgency for a single analytics record.
 * @param {{ nextReview: number }} record
 * @returns {'overdue'|'today'|'upcoming'}
 */
export function getReviewUrgency(record) {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  if (record.nextReview < now - DAY) return "overdue";
  if (record.nextReview <= now + DAY) return "today";
  return "upcoming";
}

/** Average score for a specific ayah, or 0 if not yet recorded. */
export function getAverageScore(surah, ayah) {
  const data = load();
  return data[ayahKey(surah, ayah)]?.averageScore ?? 0;
}

/** Percentage of tracked ayahs reviewed in the last 7 days (0–100). */
export function getCompletionRate() {
  return getReviewStats().completionRate;
}

/** Consecutive-day review streak (counts today if ≥1 review done today). */
export function getStreak() {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return 0;
    const data  = JSON.parse(raw);
    let streak  = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      if (data[key]) { streak++; }
      else if (i > 0) break;
    }
    return streak;
  } catch { return 0; }
}

/** Overall average accuracy across all tracked ayahs (0–100). */
export function getOverallAccuracy() {
  const all = Object.values(load()).filter(r => r.attempts > 0);
  if (all.length === 0) return 0;
  return Math.round(all.reduce((s, r) => s + r.averageScore, 0) / all.length);
}

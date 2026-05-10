"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";
import RecitationModal from "../../components/recitation/RecitationModal";
import { SURAHS } from "../../../lib/storage";
import { getAyah } from "../../../lib/quran";
import { T } from "../../../lib/theme";
import {
  getReviewQueue,
  getWeakAyahs,
  getReviewStats,
  getReviewUrgency,
  recordRecitationResult,
} from "../../../lib/hifzAnalytics";

const URGENCY_STYLE = {
  overdue:  { color: T.red,   bg: T.redBg,   label: "Overdue"    },
  today:    { color: T.amber, bg: T.amberBg,  label: "Due today"  },
  upcoming: { color: T.green, bg: T.greenMuted, label: "Optional" },
};

function scoreFeedback(score) {
  if (score >= 93) return { text: "Excellent recitation.",         color: T.greenDark };
  if (score >= 80) return { text: "Very good — nearly there.",     color: T.green     };
  if (score >= 65) return { text: "Good effort. One more time.",   color: T.green     };
  if (score >= 50) return { text: "Keep practising this ayah.",    color: T.amber     };
  return              { text: "Focus and try again.",              color: T.red       };
}

function formatCountdown(ms) {
  if (!ms || ms <= 0) return null;
  const h = Math.floor(ms / (60 * 60 * 1000));
  const m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function ProgressRing({ pct, size = 80, stroke = 6 }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.bgSubtle} strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={T.green} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
}

export default function ReviewPage() {
  const [queue,          setQueue]          = useState([]);
  const [weakAyahs,      setWeakAyahs]      = useState([]);
  const [stats,          setStats]          = useState({ due: 0, overdue: 0, weak: 0, total: 0, completionRate: 0, nextReviewMs: null });
  const [activeItem,     setActiveItem]     = useState(null);
  const [loadingItem,    setLoadingItem]    = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const [lastFeedback,   setLastFeedback]   = useState(null);
  const [mounted,        setMounted]        = useState(false);
  const [sessionDone,    setSessionDone]    = useState(false);
  const [showWeak,       setShowWeak]       = useState(false);

  const refreshData = useCallback(() => {
    setQueue(getReviewQueue(50));
    setWeakAyahs(getWeakAyahs(10));
    setStats(getReviewStats());
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshData();
  }, [refreshData]);

  async function startReviewItem(item) {
    setLoadingItem(true);
    const surahInfo  = SURAHS.find(s => s.n === item.surah);
    const arabicText = await getAyah(item.surah, item.ayah);
    setLoadingItem(false);
    if (!arabicText || !surahInfo) return;
    setActiveItem({
      surah:     item.surah,
      ayahNum:   item.ayah,
      arabicText,
      surahName: surahInfo.name,
    });
  }

  function handleResult({ surah, ayah, score, passed }) {
    recordRecitationResult({ surah, ayah, score, passed });
    const next = completedToday + 1;
    setCompletedToday(next);
    setLastFeedback(scoreFeedback(score));
    refreshData();
  }

  function handleNextAyah() {
    const fresh = getReviewQueue(50);
    const currentKey = activeItem ? `${activeItem.surah}:${activeItem.ayahNum}` : null;
    const next = fresh.find(r => `${r.surah}:${r.ayah}` !== currentKey) ?? fresh[0];
    if (next) {
      startReviewItem(next);
    } else {
      setActiveItem(null);
      if (completedToday > 0) setSessionDone(true);
    }
  }

  const hasNextAyah = useMemo(() => {
    if (!activeItem) return false;
    const currentKey = `${activeItem.surah}:${activeItem.ayahNum}`;
    return queue.some(r => `${r.surah}:${r.ayah}` !== currentKey);
  }, [queue, activeItem]);

  return (
    <div style={{ minHeight: "100vh", background: T.bgPage, paddingBottom: 80 }}>

      {/* ── Header ── */}
      <header style={{
        background: T.bgCard,
        borderBottom: `1px solid ${T.border}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: 680, margin: "0 auto",
          padding: "14px 20px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <Link href="/hifz" style={{ textDecoration: "none", color: T.textSecondary, fontSize: 20, lineHeight: 1 }}>
            ←
          </Link>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary }}>Today's Review</div>
          </div>
          {completedToday > 0 && (
            <div style={{
              background: T.greenMuted,
              borderRadius: T.radiusFull,
              padding: "4px 12px",
              fontSize: 12, fontWeight: 700, color: T.green,
            }}>
              {completedToday} done ✓
            </div>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* ── Stats pills ── */}
        {mounted && (
          <div style={{ display: "flex", gap: 8, padding: "20px 20px 0" }}>
            {[
              { label: "Due",      value: stats.due,                  color: stats.due > 0 ? T.red : T.textTertiary },
              { label: "Weak",     value: stats.weak,                 color: stats.weak > 0 ? T.amber : T.textTertiary },
              { label: "Reviewed", value: `${stats.completionRate}%`, color: T.green },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                flex: 1, background: T.bgSubtle, borderRadius: T.radiusSm,
                padding: "10px 8px", textAlign: "center",
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10, color: T.textTertiary, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Feedback toast ── */}
        {lastFeedback && (
          <div className="animate-fadeUp" style={{
            margin: "16px 20px 0",
            background: T.bgCard,
            borderRadius: T.radiusSm,
            padding: "12px 16px",
            textAlign: "center",
            border: `1px solid ${T.border}`,
            color: lastFeedback.color, fontWeight: 600, fontSize: 14,
          }}>
            {lastFeedback.text}
          </div>
        )}

        {/* ── Session completion ceremony ── */}
        {sessionDone && queue.length === 0 && (
          <div className="animate-fadeUp" style={{
            margin: "24px 20px 0",
            background: T.bgCard,
            borderRadius: T.radiusLg,
            padding: "40px 24px",
            textAlign: "center",
            border: `1px solid ${T.border}`,
            boxShadow: T.shadowMd,
          }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
              <ProgressRing pct={100} />
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}>✓</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.green, marginBottom: 8 }}>
              Session complete
            </div>
            <div style={{ fontSize: 14, color: T.textSecondary, marginBottom: 24 }}>
              {completedToday} ayah{completedToday !== 1 ? "s" : ""} reviewed today
            </div>
            <div style={{
              fontFamily: T.fontArabic,
              fontSize: 22, direction: "rtl", lineHeight: 2.0,
              color: T.textPrimary, marginBottom: 8,
            }}>
              إِنَّ مَعَ الْعُسْرِ يُسْرًا
            </div>
            <div style={{ fontSize: 13, color: T.textTertiary, fontStyle: "italic", marginBottom: 24 }}>
              Indeed, with hardship comes ease. — 94:6
            </div>
            <Link href="/" style={{ fontSize: 14, fontWeight: 600, color: T.textSecondary, textDecoration: "none" }}>
              Return home
            </Link>
          </div>
        )}

        {!mounted ? null : queue.length > 0 ? (
          /* ── Review Queue ── */
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              Review Queue
            </div>
            <div style={{
              background: T.bgCard,
              borderRadius: T.radiusMd,
              border: `1px solid ${T.border}`,
              overflow: "hidden",
              boxShadow: T.shadowSm,
            }}>
              {queue.map((item, idx) => {
                const urgency   = getReviewUrgency(item);
                const ust       = URGENCY_STYLE[urgency];
                const surahInfo = SURAHS.find(s => s.n === item.surah);
                const key       = `${item.surah}:${item.ayah}`;
                return (
                  <div key={key} style={{
                    display: "flex", alignItems: "center",
                    padding: "16px 20px",
                    borderTop: idx > 0 ? `1px solid ${T.border}` : "none",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>
                          {surahInfo?.name ?? `Surah ${item.surah}`}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: ust.color, background: ust.bg,
                          padding: "2px 8px", borderRadius: T.radiusFull,
                        }}>
                          {ust.label}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: T.textTertiary }}>Ayah {item.ayah}</span>
                        {item.lastScore > 0 && (
                          <span style={{
                            fontSize: 12, fontWeight: 600,
                            color: item.lastScore >= 90 ? T.green : item.lastScore >= 70 ? T.amber : T.red,
                          }}>
                            {item.lastScore}% last
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => startReviewItem(item)}
                      disabled={loadingItem}
                      style={{
                        background: "transparent", border: "none",
                        fontSize: 14, fontWeight: 600, color: T.green,
                        cursor: loadingItem ? "not-allowed" : "pointer",
                        opacity: loadingItem ? 0.5 : 1,
                        padding: "4px 0",
                        flexShrink: 0,
                        fontFamily: "inherit",
                      }}
                    >
                      {loadingItem ? "…" : "Recite →"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Empty / clear state ── */
          !sessionDone && (
            <div className="animate-fadeUp" style={{
              margin: "24px 20px 0",
              background: T.bgCard,
              borderRadius: T.radiusLg,
              padding: "40px 24px",
              textAlign: "center",
              border: `1px solid ${T.border}`,
              boxShadow: T.shadowSm,
            }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                <ProgressRing pct={stats.completionRate} />
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: T.green,
                }}>
                  {stats.completionRate}%
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>
                Review queue is clear
              </div>
              <div style={{ fontSize: 14, color: T.textSecondary, marginBottom: 6, fontFamily: T.fontArabic, direction: "rtl", lineHeight: 1.9 }}>
                وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا
              </div>
              <div style={{ fontSize: 13, color: T.textTertiary, marginBottom: 24, lineHeight: 1.6 }}>
                {stats.nextReviewMs
                  ? `Next review in ${formatCountdown(stats.nextReviewMs)}`
                  : "Your daily review is complete. Well done."}
              </div>
              {weakAyahs.length > 0 && (
                <button
                  onClick={() => setShowWeak(v => !v)}
                  style={{
                    background: "transparent", border: "none",
                    fontSize: 14, fontWeight: 600, color: T.green,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {showWeak ? "Hide" : "Review weak ayahs"}
                </button>
              )}
            </div>
          )
        )}

        {/* ── Weak Ayahs ── */}
        {mounted && weakAyahs.length > 0 && (queue.length > 0 || showWeak) && (
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              Weak Ayahs
            </div>
            <div style={{
              background: T.bgCard,
              borderRadius: T.radiusMd,
              border: `1px solid ${T.border}`,
              overflow: "hidden",
              boxShadow: T.shadowSm,
            }}>
              {weakAyahs.map((item, idx) => {
                const surahInfo = SURAHS.find(s => s.n === item.surah);
                const score     = item.averageScore;
                const scoreColor = score < 50 ? T.red : T.amber;
                return (
                  <div key={`weak-${item.surah}:${item.ayah}`} style={{
                    display: "flex", alignItems: "center",
                    padding: "14px 20px",
                    borderTop: idx > 0 ? `1px solid ${T.border}` : "none",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, marginBottom: 2 }}>
                        {surahInfo?.name ?? `Surah ${item.surah}`}
                        <span style={{ marginLeft: 8, fontSize: 12, color: T.textTertiary }}>Ayah {item.ayah}</span>
                      </div>
                      <div style={{ fontSize: 12, color: T.textTertiary }}>
                        {item.attempts} attempt{item.attempts !== 1 ? "s" : ""} ·{" "}
                        <span style={{ fontWeight: 600, color: scoreColor }}>{score}% avg</span>
                      </div>
                    </div>
                    <button
                      onClick={() => startReviewItem(item)}
                      disabled={loadingItem}
                      style={{
                        background: "transparent", border: "none",
                        fontSize: 13, fontWeight: 600, color: T.green,
                        cursor: loadingItem ? "not-allowed" : "pointer",
                        opacity: loadingItem ? 0.5 : 1,
                        fontFamily: "inherit",
                      }}
                    >
                      Review →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>

      {activeItem && (
        <RecitationModal
          key={`${activeItem.surah}-${activeItem.ayahNum}`}
          ayah={activeItem.arabicText}
          surahName={activeItem.surahName}
          surahNumber={activeItem.surah}
          ayahNumber={activeItem.ayahNum}
          onResult={handleResult}
          onClose={() => setActiveItem(null)}
          onNextAyah={handleNextAyah}
          hasNextAyah={hasNextAyah}
          autoStart={false}
        />
      )}

      <BottomNav />
    </div>
  );
}

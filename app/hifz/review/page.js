"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";
import RecitationModal from "../../components/recitation/RecitationModal";
import { SURAHS } from "../../../lib/storage";
import { getAyah } from "../../../lib/quran";
import {
  getReviewQueue,
  getWeakAyahs,
  getReviewStats,
  getReviewUrgency,
  recordRecitationResult,
} from "../../../lib/hifzAnalytics";

const G  = "#1a8a4a";
const G2 = "#2ea55f";

const URGENCY_STYLE = {
  overdue:  { border: "#dc2626", bg: "#fef2f2", label: "Overdue",    labelColor: "#dc2626" },
  today:    { border: "#d97706", bg: "#fffbeb", label: "Due today",  labelColor: "#d97706" },
  upcoming: { border: "#16a34a", bg: "#f0fdf4", label: "Optional",   labelColor: "#16a34a" },
};

function scoreFeedback(score) {
  if (score >= 90) return { text: "Excellent! 🌟",     color: "#16a34a" };
  if (score >= 70) return { text: "Good work 👍",       color: G };
  if (score >= 50) return { text: "Keep practicing",    color: "#d97706" };
  return              { text: "Needs more work",        color: "#dc2626" };
}

function formatCountdown(ms) {
  if (!ms || ms <= 0) return null;
  const h = Math.floor(ms / (60 * 60 * 1000));
  const m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function ProgressRing({ pct, size = 88, stroke = 7 }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={G} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
}

function GeoPattern({ id, opacity = 0.12 }) {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity, pointerEvents: "none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={id} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 2 L58 30 L30 58 L2 30 Z" fill="none" stroke="white" strokeWidth="0.8" />
          <path d="M30 16 L44 30 L30 44 L16 30 Z" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="30" cy="30" r="2"   fill="white" />
          <circle cx="0"  cy="0"  r="1.5" fill="white" />
          <circle cx="60" cy="0"  r="1.5" fill="white" />
          <circle cx="0"  cy="60" r="1.5" fill="white" />
          <circle cx="60" cy="60" r="1.5" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
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
    setCompletedToday(c => c + 1);
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
    }
  }

  const hasNextAyah = useMemo(() => {
    if (!activeItem) return false;
    const currentKey = `${activeItem.surah}:${activeItem.ayahNum}`;
    return queue.some(r => `${r.surah}:${r.ayah}` !== currentKey);
  }, [queue, activeItem]);

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { display: none; }
        .review-start-btn:active { opacity: 0.8; }
        .weak-review-btn:hover   { background: ${G} !important; color: #fff !important; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f8f9fa", paddingBottom: 80 }}>

        {/* ── Header ── */}
        <nav style={{
          background: `linear-gradient(135deg, #157a3c 0%, ${G} 55%, ${G2} 100%)`,
          position: "relative", overflow: "hidden",
          boxShadow: "0 2px 16px rgba(26,138,74,0.32)",
        }}>
          <GeoPattern id="reviewNav" opacity={0.13} />
          <div style={{
            maxWidth: 680, margin: "0 auto", padding: "13px 20px 15px",
            display: "flex", alignItems: "center", gap: 12,
            position: "relative", zIndex: 1,
          }}>
            <Link href="/hifz" style={{ textDecoration: "none" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 16, cursor: "pointer",
              }}>
                ←
              </div>
            </Link>
            <div>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>Today's Review</div>
              <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 11, marginTop: 2 }}>Daily Hifz practice</div>
            </div>
            {completedToday > 0 && (
              <div style={{
                marginLeft: "auto",
                background: "rgba(255,255,255,0.22)", borderRadius: 20,
                padding: "4px 12px", color: "#fff", fontSize: 12, fontWeight: 700,
              }}>
                {completedToday} done ✓
              </div>
            )}
          </div>
        </nav>

        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* ── Stats strip ── */}
          {mounted && (
            <div style={{
              display: "flex", gap: 10, padding: "16px 16px 0",
              animation: "fadeInUp 0.35s ease",
            }}>
              {[
                { label: "Due",      value: stats.due,                 accent: stats.due > 0 ? "#dc2626" : G },
                { label: "Weak",     value: stats.weak,                accent: stats.weak > 0 ? "#d97706" : G },
                { label: "Reviewed", value: `${stats.completionRate}%`, accent: G },
              ].map(({ label, value, accent }) => (
                <div key={label} style={{
                  flex: 1, background: "#fff", borderRadius: 12,
                  padding: "12px 8px", textAlign: "center",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Feedback toast ── */}
          {lastFeedback && (
            <div style={{
              margin: "12px 16px 0",
              background: "#fff", borderRadius: 12,
              padding: "10px 16px", textAlign: "center",
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
              color: lastFeedback.color, fontWeight: 700, fontSize: 14,
              animation: "fadeInUp 0.25s ease",
            }}>
              {lastFeedback.text}
            </div>
          )}

          {!mounted ? null : queue.length > 0 ? (
            /* ── Review Queue ── */
            <div style={{ padding: "16px 16px 0" }}>
              <p style={{
                fontSize: 11, fontWeight: 800, color: G,
                letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 12,
              }}>
                Review Queue
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {queue.map((item) => {
                  const urgency  = getReviewUrgency(item);
                  const ust      = URGENCY_STYLE[urgency];
                  const surahInfo = SURAHS.find(s => s.n === item.surah);
                  const key      = `${item.surah}:${item.ayah}`;
                  return (
                    <div key={key} style={{
                      background: "#fff", borderRadius: 14,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      display: "flex", overflow: "hidden",
                      borderLeft: `4px solid ${ust.border}`,
                      animation: "fadeInUp 0.3s ease",
                    }}>
                      <div style={{ flex: 1, padding: "14px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                            {surahInfo?.name ?? `Surah ${item.surah}`}
                          </span>
                          <span style={{ fontSize: 11, color: "#9ca3af" }}>Ayah {item.ayah}</span>
                          <span style={{
                            marginLeft: "auto",
                            fontSize: 10, fontWeight: 700,
                            color: ust.labelColor, background: ust.bg,
                            padding: "2px 8px", borderRadius: 99,
                          }}>
                            {ust.label}
                          </span>
                        </div>
                        {item.lastScore > 0 && (
                          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                            Last score:{" "}
                            <span style={{
                              fontWeight: 700,
                              color: item.lastScore >= 90 ? G : item.lastScore >= 70 ? "#d97706" : "#dc2626",
                            }}>
                              {item.lastScore}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", padding: "0 14px", flexShrink: 0 }}>
                        <button
                          className="review-start-btn"
                          onClick={() => startReviewItem(item)}
                          disabled={loadingItem}
                          style={{
                            background: G, color: "#fff", border: "none",
                            borderRadius: 10, padding: "9px 14px",
                            fontSize: 12, fontWeight: 700, cursor: loadingItem ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                            opacity: loadingItem ? 0.55 : 1,
                            transition: "opacity 0.15s",
                            boxShadow: "0 2px 8px rgba(26,138,74,0.25)",
                          }}
                        >
                          {loadingItem ? "…" : "Start →"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── Empty state ── */
            <div style={{
              margin: "20px 16px 0",
              background: "#fff", borderRadius: 20,
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
              padding: "36px 24px", textAlign: "center",
              animation: "fadeInUp 0.35s ease",
            }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                <ProgressRing pct={stats.completionRate} />
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: G,
                }}>
                  {stats.completionRate}%
                </div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
                Review queue is clear ✓
              </div>
              <div style={{
                fontSize: 13, color: "#6b7280", marginBottom: 6,
                fontFamily: "Amiri, serif", direction: "rtl", lineHeight: 1.8,
              }}>
                وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا
              </div>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20, lineHeight: 1.5 }}>
                {stats.nextReviewMs
                  ? `Next review in ${formatCountdown(stats.nextReviewMs)}`
                  : "Your daily review is complete. Well done."}
              </div>
              {weakAyahs.length > 0 && (
                <button
                  onClick={() => startReviewItem(weakAyahs[0])}
                  disabled={loadingItem}
                  style={{
                    background: "#ecfdf3", color: G,
                    border: `1px solid ${G}30`,
                    borderRadius: 12, padding: "12px 24px",
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                    opacity: loadingItem ? 0.6 : 1,
                  }}
                >
                  Review weak ayahs anyway
                </button>
              )}
            </div>
          )}

          {/* ── Weak Ayahs ── */}
          {mounted && weakAyahs.length > 0 && (
            <div style={{ padding: "20px 16px 0" }}>
              <p style={{
                fontSize: 11, fontWeight: 800, color: G,
                letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 12,
              }}>
                Weak Ayahs
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {weakAyahs.map((item) => {
                  const surahInfo = SURAHS.find(s => s.n === item.surah);
                  const score     = item.averageScore;
                  const isLow     = score < 50;
                  return (
                    <div key={`weak-${item.surah}:${item.ayah}`} style={{
                      background: "#fff", borderRadius: 14,
                      boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                      padding: "12px 14px",
                      display: "flex", alignItems: "center", gap: 12,
                      animation: "fadeInUp 0.3s ease",
                    }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                        background: isLow ? "#fef2f2" : "#fffbeb",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800,
                        color: isLow ? "#dc2626" : "#d97706",
                      }}>
                        {score}%
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                          {surahInfo?.name ?? `Surah ${item.surah}`}
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                          Ayah {item.ayah} · {item.attempts} attempt{item.attempts !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <button
                        className="weak-review-btn"
                        onClick={() => startReviewItem(item)}
                        disabled={loadingItem}
                        style={{
                          background: "#ecfdf3", color: G,
                          border: `1px solid ${G}30`,
                          borderRadius: 10, padding: "8px 12px",
                          fontSize: 11, fontWeight: 700,
                          cursor: loadingItem ? "not-allowed" : "pointer",
                          flexShrink: 0,
                          opacity: loadingItem ? 0.6 : 1,
                          transition: "all 0.15s",
                        }}
                      >
                        Review
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ height: 24 }} />
        </div>
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
    </>
  );
}

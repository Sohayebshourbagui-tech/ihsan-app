"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SURAHS } from "../../../lib/storage";
import { getSurah, withBismillah, prefetchSurah } from "../../../lib/quran";
import { compareAyah, normalizeArabic } from "../../../lib/arabic";
import { recordRecitationResult } from "../../../lib/hifzAnalytics";
import BottomNav from "../../components/BottomNav";

const G  = "#1a8a4a";
const G2 = "#2ea55f";

// Start of each juz: {surah, ayah} (1-indexed juz → index 0–29)
const JUZ_STARTS = [
  { surah: 1,  ayah: 1   }, { surah: 2,  ayah: 142 }, { surah: 2,  ayah: 253 },
  { surah: 3,  ayah: 92  }, { surah: 4,  ayah: 24  }, { surah: 4,  ayah: 148 },
  { surah: 5,  ayah: 82  }, { surah: 6,  ayah: 111 }, { surah: 7,  ayah: 88  },
  { surah: 8,  ayah: 41  }, { surah: 9,  ayah: 93  }, { surah: 11, ayah: 6   },
  { surah: 12, ayah: 53  }, { surah: 15, ayah: 1   }, { surah: 17, ayah: 1   },
  { surah: 18, ayah: 75  }, { surah: 21, ayah: 1   }, { surah: 23, ayah: 1   },
  { surah: 25, ayah: 21  }, { surah: 27, ayah: 56  }, { surah: 29, ayah: 46  },
  { surah: 33, ayah: 31  }, { surah: 36, ayah: 28  }, { surah: 39, ayah: 32  },
  { surah: 41, ayah: 47  }, { surah: 46, ayah: 1   }, { surah: 51, ayah: 31  },
  { surah: 58, ayah: 1   }, { surah: 67, ayah: 1   }, { surah: 78, ayah: 1   },
];

function getJuzOf(surahN, ayahN) {
  for (let i = JUZ_STARTS.length - 1; i >= 0; i--) {
    const j = JUZ_STARTS[i];
    if (j.surah < surahN || (j.surah === surahN && j.ayah <= ayahN)) return i + 1;
  }
  return 1;
}

function getJuzEnd(juzNum) {
  if (juzNum >= 30) return { surah: 114, ayah: SURAHS.find(s => s.n === 114).a };
  const next = JUZ_STARTS[juzNum]; // start of next juz
  if (next.ayah === 1) {
    const prev = SURAHS.find(s => s.n === next.surah - 1);
    return { surah: next.surah - 1, ayah: prev.a };
  }
  return { surah: next.surah, ayah: next.ayah - 1 };
}

function saveSession(results, startMs, endMs) {
  if (!results.length) return;
  const avg = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  const session = {
    id: Date.now(),
    date: new Date().toISOString(),
    totalAyahs: results.length,
    averageScore: avg,
    timeSeconds: startMs ? Math.round((endMs - startMs) / 1000) : 0,
    results: results.map(r => ({ surah: r.surah, ayah: r.ayah, score: r.score })),
  };
  try {
    const prev = JSON.parse(localStorage.getItem("recitation_sessions") || "[]");
    localStorage.setItem("recitation_sessions", JSON.stringify([session, ...prev].slice(0, 50)));
  } catch {}
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function WordSpan({ word, status }) {
  const s = {
    matched:   { color: "#15803d", bg: "rgba(21,128,61,0.15)"  },
    close:     { color: "#ca8a04", bg: "rgba(234,179,8,0.18)"  },
    missing:   { color: "#374151", bg: "transparent"           },
    incorrect: { color: "#dc2626", bg: "rgba(220,38,38,0.10)"  },
  }[status] ?? { color: "#374151", bg: "transparent" };
  return (
    <span style={{
      color: s.color, background: s.bg, borderRadius: 4,
      padding: "2px 6px", display: "inline-block", lineHeight: 1.6,
      transition: "color 0.2s, background 0.2s",
    }}>
      {word}
    </span>
  );
}

function AyahDisplay({ text, comparison }) {
  if (!text) return null;
  if (comparison?.expectedWords?.length) {
    return (
      <p style={{
        fontFamily: "Amiri, serif", fontSize: 28, lineHeight: 2.2,
        direction: "rtl", textAlign: "center", margin: 0,
      }}>
        {comparison.expectedWords.map((w, i) => (
          <span key={i}><WordSpan word={w.word} status={w.status} />{" "}</span>
        ))}
      </p>
    );
  }
  return (
    <p style={{
      fontFamily: "Amiri, serif", fontSize: 28, lineHeight: 2.2,
      direction: "rtl", textAlign: "center", margin: 0, color: "#111827",
    }}>
      {text}
    </p>
  );
}

function ScoreChip({ score }) {
  const [color, bg, border] =
    score >= 90 ? ["#15803d", "#f0fdf4", "#bbf7d0"] :
    score >= 70 ? ["#b45309", "#fefce8", "#fde68a"] :
                  ["#dc2626", "#fef2f2", "#fecaca"];
  return (
    <span style={{
      fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 99,
      color, background: bg, border: `1px solid ${border}`,
    }}>
      {score}%
    </span>
  );
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────

function SetupScreen({ onStart }) {
  const [startSurahIdx, setStartSurahIdx] = useState(0);
  const [startAyah,     setStartAyah]     = useState(1);
  const [endMode,       setEndMode]       = useState("surah");
  const [endSurahIdx,   setEndSurahIdx]   = useState(0);
  const [endAyah,       setEndAyah]       = useState(1);

  const startSurah = SURAHS[startSurahIdx];
  const endSurah   = SURAHS[endSurahIdx];

  function handleStart() {
    let endS, endA;
    if (endMode === "surah") {
      endS = startSurah.n; endA = startSurah.a;
    } else if (endMode === "juz") {
      const je = getJuzEnd(getJuzOf(startSurah.n, startAyah));
      endS = je.surah; endA = je.ayah;
    } else if (endMode === "specific") {
      endS = endSurah.n; endA = endAyah;
    } else {
      // manual — signal no fixed end; startSession will lazy-load surahs
      endS = null; endA = null;
    }
    onStart({ startSurah: startSurah.n, startAyah, endSurah: endS, endAyah: endA });
  }

  const validRange =
    endMode === "manual" || endMode === "surah" || endMode === "juz" ||
    (endMode === "specific" && (endSurah.n > startSurah.n ||
      (endSurah.n === startSurah.n && endAyah >= startAyah)));

  const cardStyle = {
    background: "#fff", borderRadius: 16, padding: 20,
    marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };
  const labelStyle = { fontSize: 12, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 4 };
  const selectStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: "1.5px solid #e5e7eb", fontSize: 14, background: "#fff",
    marginBottom: 12, appearance: "none",
  };

  return (
    <div style={{ padding: "16px 16px 0" }}>
      {/* Start point */}
      <div style={cardStyle}>
        <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 800, color: G, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Starting Point
        </p>
        <label style={labelStyle}>Surah</label>
        <select value={startSurahIdx} onChange={e => { setStartSurahIdx(+e.target.value); setStartAyah(1); }} style={selectStyle}>
          {SURAHS.map((s, i) => <option key={s.n} value={i}>{s.n}. {s.name} ({s.a} ayahs)</option>)}
        </select>
        <label style={labelStyle}>Starting Ayah</label>
        <select value={startAyah} onChange={e => setStartAyah(+e.target.value)} style={{ ...selectStyle, marginBottom: 0 }}>
          {Array.from({ length: startSurah.a }, (_, i) => (
            <option key={i + 1} value={i + 1}>Ayah {i + 1}</option>
          ))}
        </select>
      </div>

      {/* End point */}
      <div style={cardStyle}>
        <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 800, color: G, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          End Point
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { id: "surah",    label: "End of Surah"  },
            { id: "juz",      label: "End of Juz"    },
            { id: "specific", label: "Specific Ayah" },
            { id: "manual",   label: "Manual Stop"   },
          ].map(opt => (
            <button key={opt.id} onClick={() => setEndMode(opt.id)} style={{
              padding: "10px 8px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
              border: `1.5px solid ${endMode === opt.id ? G : "#e5e7eb"}`,
              background: endMode === opt.id ? "#ecfdf3" : "#f9fafb",
              color: endMode === opt.id ? G : "#374151",
            }}>
              {opt.label}
            </button>
          ))}
        </div>

        {endMode === "specific" && (
          <>
            <label style={labelStyle}>End Surah</label>
            <select value={endSurahIdx} onChange={e => { setEndSurahIdx(+e.target.value); setEndAyah(1); }} style={selectStyle}>
              {SURAHS.map((s, i) => <option key={s.n} value={i}>{s.n}. {s.name}</option>)}
            </select>
            <label style={labelStyle}>End Ayah</label>
            <select value={endAyah} onChange={e => setEndAyah(+e.target.value)} style={{ ...selectStyle, marginBottom: 0 }}>
              {Array.from({ length: endSurah.a }, (_, i) => (
                <option key={i + 1} value={i + 1}>Ayah {i + 1}</option>
              ))}
            </select>
          </>
        )}

        {endMode === "juz" && (
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280", background: "#f0fdf4", padding: "8px 12px", borderRadius: 8 }}>
            Will recite to end of Juz {getJuzOf(startSurah.n, startAyah)}
          </p>
        )}

        {endMode === "manual" && (
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280", background: "#f0fdf4", padding: "8px 12px", borderRadius: 8 }}>
            Recite as much as you like — tap Stop when done
          </p>
        )}
      </div>

      <button onClick={handleStart} disabled={!validRange} style={{
        width: "100%", padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 800, border: "none",
        background: validRange ? `linear-gradient(135deg,${G},${G2})` : "#e5e7eb",
        color: validRange ? "#fff" : "#9ca3af",
        cursor: validRange ? "pointer" : "default",
        boxShadow: validRange ? "0 4px 16px rgba(26,138,74,0.3)" : "none",
        marginBottom: 20,
      }}>
        🎙️  Start Recitation
      </button>
    </div>
  );
}

// ─── Recitation Screen ────────────────────────────────────────────────────────

function RecitationScreen({ ayahList, currentIdx, liveTranscript, liveComparison, paused, onPause, onStop }) {
  const current  = ayahList[currentIdx];
  const surahName = current ? SURAHS.find(s => s.n === current.surah)?.name ?? `Surah ${current.surah}` : "";

  return (
    <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Progress bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: G }}>{surahName} · Ayah {current?.ayah}</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{currentIdx + 1} / {ayahList.length}</span>
        </div>
        <div style={{ background: "#e5e7eb", borderRadius: 99, height: 6, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: `linear-gradient(90deg,${G},${G2})`,
            width: `${((currentIdx + 1) / ayahList.length) * 100}%`,
            transition: "width 0.4s ease",
          }}/>
        </div>
      </div>

      {/* Arabic ayah with live highlights */}
      <div style={{
        background: "#fff", borderRadius: 20, padding: "28px 20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        minHeight: 140, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <AyahDisplay text={current?.text} comparison={liveComparison} />
      </div>

      {/* Live transcript */}
      <div style={{
        background: "#f9fafb", borderRadius: 14, padding: "14px 16px", minHeight: 64,
      }}>
        <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Live Transcript
        </p>
        {liveTranscript ? (
          <p style={{
            margin: 0, fontFamily: "Amiri, serif", fontSize: 18,
            direction: "rtl", textAlign: "right", color: "#6b7280", lineHeight: 1.8,
          }}>
            {liveTranscript}
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: "#d1d5db", fontStyle: "italic" }}>
            {paused ? "Paused — tap Resume to continue" : "Listening…"}
          </p>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, paddingBottom: 4 }}>
        <button onClick={onPause} style={{
          flex: 1, padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
          border: "1.5px solid #e5e7eb", background: "#f9fafb", color: "#374151",
        }}>
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
        <button onClick={onStop} style={{
          flex: 1, padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
          border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626",
        }}>
          ■ Stop Session
        </button>
      </div>
    </div>
  );
}

// ─── Summary Screen ───────────────────────────────────────────────────────────

function SummaryScreen({ results, totalSeconds, onRestart }) {
  const totalAyahs  = results.length;
  const avgScore    = totalAyahs ? Math.round(results.reduce((s, r) => s + r.score, 0) / totalAyahs) : 0;
  const mins        = Math.floor(totalSeconds / 60);
  const secs        = totalSeconds % 60;
  const great       = avgScore >= 70;
  const needsReview = results.filter(r => r.score < 70);

  return (
    <div style={{ padding: "16px 16px 0" }}>
      {/* Hero card */}
      <div style={{
        background: great
          ? `linear-gradient(135deg,#166534,${G})`
          : "linear-gradient(135deg,#92400e,#b45309)",
        borderRadius: 20, padding: "28px 20px", textAlign: "center",
        marginBottom: 14, boxShadow: "0 8px 24px rgba(26,138,74,0.22)",
      }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>{great ? "✅" : "📖"}</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{avgScore}%</div>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.82)" }}>
          {great ? "Great session! Keep it up." : "Every recitation is progress. Keep going!"}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Ayahs",    value: totalAyahs },
          { label: "Avg Score", value: `${avgScore}%` },
          { label: "Time",     value: `${mins}:${String(secs).padStart(2,"0")}` },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "#fff", borderRadius: 14, padding: "16px 10px",
            textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Needs review list */}
      {needsReview.length > 0 && (
        <div style={{
          background: "#fff", borderRadius: 16, padding: 16,
          marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 800, color: "#dc2626", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Needs Review ({needsReview.length})
          </p>
          {needsReview.map((r, i) => {
            const name = SURAHS.find(s => s.n === r.surah)?.name ?? `Surah ${r.surah}`;
            return (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0",
                borderBottom: i < needsReview.length - 1 ? "1px solid #f3f4f6" : "none",
              }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{name} · Ayah {r.ayah}</span>
                <ScoreChip score={r.score} />
              </div>
            );
          })}
        </div>
      )}

      {/* All results */}
      {results.length > 0 && needsReview.length < results.length && (
        <div style={{
          background: "#fff", borderRadius: 16, padding: 16,
          marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 800, color: G, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            All Ayahs
          </p>
          {results.map((r, i) => {
            const name = SURAHS.find(s => s.n === r.surah)?.name ?? `Surah ${r.surah}`;
            return (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "7px 0",
                borderBottom: i < results.length - 1 ? "1px solid #f3f4f6" : "none",
              }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{name} · Ayah {r.ayah}</span>
                <ScoreChip score={r.score} />
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, paddingBottom: 20 }}>
        <button onClick={onRestart} style={{
          flex: 1, padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700, border: "none",
          background: `linear-gradient(135deg,${G},${G2})`, color: "#fff", cursor: "pointer",
        }}>
          New Session
        </button>
        <Link href="/hifz" style={{ flex: 1, textDecoration: "none" }}>
          <button style={{
            width: "100%", padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: "#f3f4f6", color: "#374151", border: "none", cursor: "pointer",
          }}>
            Back to Hifz
          </button>
        </Link>
      </div>
    </div>
  );
}

// ─── Dev debug panel ──────────────────────────────────────────────────────────
// Mirrors the three gate conditions from finalizeAndAdvance() using live state.
// Shown only when process.env.NODE_ENV === "development".
// Next.js removes this component entirely from production builds via dead-code
// elimination on the static NODE_ENV check.
//
// ⚠  These thresholds must stay in sync with finalizeAndAdvance().
const DBG_SCORE_SHORT    = 92;   // scoreThreshold for ≤3-word ayahs
const DBG_SCORE_NORMAL   = 85;   // scoreThreshold for longer ayahs
const DBG_COMPLETION_MIN = 0.85; // minimum matched/expected ratio

function DebugPanel({ liveTranscript, liveComparison, currentAyah, isActive }) {
  if (process.env.NODE_ENV !== "development") return null;
  if (!isActive) return null;

  const raw      = liveTranscript ?? "";
  const norm     = normalizeArabic(raw);
  const expected = currentAyah?.expected ?? "";

  // ── Mirror gate conditions ─────────────────────────────────────────────────
  const expWordCount   = liveComparison?.expectedWords?.length ?? 0;
  const isShortAyah    = expWordCount > 0 && expWordCount <= 3;
  const scoreThreshold = isShortAyah ? DBG_SCORE_SHORT : DBG_SCORE_NORMAL;
  const score          = liveComparison?.score ?? null;          // null = no speech yet
  const matched        = liveComparison?.matched ?? 0;
  const completion     = expWordCount > 0 ? matched / expWordCount : null;
  const lastWord       = liveComparison?.expectedWords?.[expWordCount - 1] ?? null;
  const finalWordOk    = lastWord != null && lastWord.status !== "missing";

  const scoreOk      = score != null && score      >= scoreThreshold;
  const completionOk = completion != null && completion >= DBG_COMPLETION_MIN;
  const canAdvance   = scoreOk && completionOk && finalWordOk;
  const hasData      = score != null;

  // Collect rejection reasons (only once we have a comparison result)
  const rejections = [];
  if (hasData) {
    if (!scoreOk)      rejections.push(`score ${score}% < ${scoreThreshold}% (${isShortAyah ? "short" : "normal"} ayah)`);
    if (!completionOk) rejections.push(`completion ${Math.round((completion ?? 0) * 100)}% < ${DBG_COMPLETION_MIN * 100}%`);
    if (!finalWordOk)  rejections.push(`last word "${lastWord?.word ?? "?"}" not found`);
  }

  // Colour helper: green = pass, red = fail, grey = no data yet
  function val(text, ok) {
    const color = ok === true ? "#4ade80" : ok === false ? "#f87171" : "#9ca3af";
    return <span style={{ color, wordBreak: "break-all" }}>{text}</span>;
  }

  const row = (label, content) => (
    <div style={{ display: "flex", gap: 6, marginBottom: 2 }}>
      <span style={{ color: "#6b7280", flexShrink: 0, minWidth: 74 }}>{label}</span>
      <span style={{ flex: 1, textAlign: "right", direction: "ltr" }}>{content}</span>
    </div>
  );

  return (
    <div style={{
      position:       "fixed",
      bottom:         90,
      right:          10,
      width:          272,
      maxHeight:      "52vh",
      overflowY:      "auto",
      background:     "rgba(12,12,12,0.93)",
      color:          "#e5e7eb",
      fontFamily:     "'Courier New', Courier, monospace",
      fontSize:       11,
      lineHeight:     1.65,
      padding:        "10px 12px 12px",
      borderRadius:   8,
      zIndex:         9999,
      boxShadow:      "0 4px 24px rgba(0,0,0,0.6)",
      pointerEvents:  "none",         // never intercepts taps / clicks
      backdropFilter: "blur(4px)",
    }}>
      {/* Header */}
      <div style={{ color: "#facc15", fontWeight: "bold", marginBottom: 8, letterSpacing: "0.04em" }}>
        ⚙ DEV — Advance Gate
      </div>

      {/* Speech section */}
      {row("raw:",      val(raw  || "—"))}
      {row("norm:",     val(norm || "—"))}
      {row("expected:", val(expected || "—"))}

      <div style={{ borderTop: "1px solid #27272a", margin: "7px 0" }} />

      {/* Gate conditions */}
      {row("score:",      val(hasData ? `${score}% / ${scoreThreshold}%`              : "—", hasData ? scoreOk      : undefined))}
      {row("completion:", val(hasData ? `${Math.round((completion ?? 0) * 100)}% / ${DBG_COMPLETION_MIN * 100}%` : "—", hasData ? completionOk : undefined))}
      {row("final word:", val(lastWord ? `"${lastWord.word}" ${finalWordOk ? "✓" : "✗"}` : "—", lastWord ? finalWordOk : undefined))}

      <div style={{ borderTop: "1px solid #27272a", margin: "7px 0" }} />

      {/* Decision */}
      {row("advance:", val(hasData ? (canAdvance ? "YES ✓" : "NO ✗") : "waiting…", hasData ? canAdvance : undefined))}

      {/* Rejection reasons */}
      {rejections.length > 0 && (
        <div style={{ marginTop: 5, color: "#f87171", fontSize: 10, lineHeight: 1.7 }}>
          {rejections.map((r, i) => <div key={i}>↳ {r}</div>)}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContinuousRecitationPage() {
  const [phase,         setPhase]         = useState("setup");
  const [ayahList,      setAyahList]      = useState([]);
  const [currentIdx,    setCurrentIdx]    = useState(0);
  const [liveTranscript,setLiveTranscript]= useState("");
  const [liveComparison,setLiveComparison]= useState(null);
  const [results,       setResults]       = useState([]);
  const [totalSeconds,  setTotalSeconds]  = useState(0);
  const [error,         setError]         = useState(null);

  // Refs — everything read inside async callbacks lives here
  const recognitionRef   = useRef(null);
  const phaseRef         = useRef("setup");
  const ayahListRef      = useRef([]);
  const currentIdxRef    = useRef(0);
  const transcriptRef    = useRef("");
  const resultsRef       = useRef([]);
  const resultStartRef   = useRef(0);
  const lastResultCount  = useRef(0);
  const advanceTimer     = useRef(null);
  const startMsRef       = useRef(null);
  const isManualRef      = useRef(false); // true = no fixed endpoint, extend list lazily
  const extendingRef     = useRef(false); // guard against concurrent extends

  function setPhaseSync(p) { phaseRef.current = p; setPhase(p); }

  // ── Lazy-extend the ayah list (manual mode only) ──────────────────────────
  async function extendAyahList() {
    if (extendingRef.current) return;
    const last = ayahListRef.current[ayahListRef.current.length - 1];
    if (!last) return;
    const lastInfo = SURAHS.find(s => s.n === last.surah);
    if (!lastInfo || last.ayah < lastInfo.a) return; // still ayahs left in current surah
    const nextS = last.surah + 1;
    if (nextS > 114) return;
    extendingRef.current = true;
    const texts = await getSurah(nextS);
    extendingRef.current = false;
    if (!texts) return;
    const newItems = texts.map((text, i) => ({
      surah: nextS, ayah: i + 1, text,
      expected: withBismillah(nextS, i + 1, text),
    }));
    const extended = [...ayahListRef.current, ...newItems];
    ayahListRef.current = extended;
    setAyahList(extended);
    prefetchSurah(nextS + 1); // warm cache for the surah after that
  }

  // ── Finalize one ayah and advance (or finish) ──────────────────────────────
  function finalizeAndAdvance() {
    clearTimeout(advanceTimer.current);
    const ayah = ayahListRef.current[currentIdxRef.current];
    if (!ayah) return;

    const spoken = transcriptRef.current.trim();
    const result = spoken
      ? compareAyah(ayah.expected, spoken)
      : { score: 0, matched: 0, missing: 0, incorrect: 0, passed: false, expectedWords: [], spokenWords: [] };

    // ── Advancement gate ──────────────────────────────────────────────────────
    // All three conditions must hold simultaneously. Advancement is never
    // triggered by silence alone — the recitation must be substantively correct.

    // 1. Score threshold.
    //    Short ayahs (≤ 3 words) demand a higher bar because fuzzy matching
    //    on 1–3 word inputs has almost no discriminating power: a single wrong
    //    word can trivially reach a lenient threshold.  "عليم" for "الم" scores
    //    0% (similarity 0.5 < fuzzyLCS threshold 0.7) so it fails regardless,
    //    but the raised bar also blocks borderline near-misses.
    const expWordCount   = result.expectedWords.length;
    const isShortAyah    = expWordCount > 0 && expWordCount <= 3;
    const scoreThreshold = isShortAyah ? 92 : 85;

    // 2. Completion ratio: fraction of expected words found in the transcript.
    //    result.matched = words with status "matched" or "close" (both count).
    //    A ratio < 0.85 means the user spoke fewer than 85% of the ayah's
    //    words, blocking advancement on partial recitation.
    const completion = expWordCount > 0 ? result.matched / expWordCount : 0;

    // 3. Final-word anchor: the last expected word must appear in the
    //    transcript.  Without this, reciting only the opening of a long ayah
    //    and then pausing would advance the session even if score is below
    //    threshold.  Both "matched" and "close" satisfy this; only "missing"
    //    fails (meaning the word was never found in the spoken text at all).
    const lastWord         = result.expectedWords[expWordCount - 1];
    const finalWordMatched = lastWord != null && lastWord.status !== "missing";

    const canAdvance =
      result.score >= scoreThreshold &&  // 92% for ≤3-word ayahs, 85% for longer
      completion   >= 0.85            &&  // ≥85% of expected words present
      finalWordMatched;                   // last word of the ayah must be recited

    if (!canAdvance) {
      // Gate not met — reset transcript and stay on the same ayah.
      // The recognition session keeps running; the user must recite again.
      // resultStartRef advances past the failed attempt so its words are not
      // re-read by the next onresult event.
      resultStartRef.current = lastResultCount.current;
      transcriptRef.current  = "";
      setLiveTranscript("");
      setLiveComparison(null);
      return;
    }
    // ── End advancement gate ──────────────────────────────────────────────────

    // Record only after the gate passes so failed attempts are not persisted
    // to hifz analytics or the session summary.
    const entry = { surah: ayah.surah, ayah: ayah.ayah, score: result.score, passed: result.passed };
    recordRecitationResult({ surah: ayah.surah, ayah: ayah.ayah, score: result.score, passed: result.passed });

    const nextResults = [...resultsRef.current, entry];
    resultsRef.current = nextResults;
    setResults(nextResults);

    const nextIdx = currentIdxRef.current + 1;

    // Extend list if manual mode is running low
    if (isManualRef.current && ayahListRef.current.length - nextIdx < 10) {
      extendAyahList();
    }

    // Pre-fetch next surah when approaching a surah boundary (speeds up transitions)
    const nextAyah = ayahListRef.current[nextIdx];
    if (nextAyah) {
      const info = SURAHS.find(s => s.n === nextAyah.surah);
      if (info && nextAyah.ayah >= info.a - 5) prefetchSurah(nextAyah.surah + 1);
    }

    if (nextIdx < ayahListRef.current.length && phaseRef.current === "running") {
      resultStartRef.current = lastResultCount.current;
      transcriptRef.current  = "";
      currentIdxRef.current  = nextIdx;
      setCurrentIdx(nextIdx);
      setLiveTranscript("");
      setLiveComparison(null);
    } else if (!isManualRef.current) {
      completeSession(nextResults);
    }
    // If manual and list temporarily empty, wait for extendAyahList to append more
  }

  function completeSession(finalResults) {
    clearTimeout(advanceTimer.current);
    phaseRef.current = "summary";
    try { recognitionRef.current?.stop(); } catch {}
    const elapsed = startMsRef.current ? Math.round((Date.now() - startMsRef.current) / 1000) : 0;
    setTotalSeconds(elapsed);
    setResults(finalResults);
    resultsRef.current = finalResults;
    saveSession(finalResults, startMsRef.current, Date.now());
    setPhase("summary");
  }

  // ── Start a session ────────────────────────────────────────────────────────
  function startSession({ startSurah, startAyah, endSurah, endAyah }) {
    setError(null);
    setPhaseSync("loading");
    setResults([]); resultsRef.current = [];
    setCurrentIdx(0); currentIdxRef.current = 0;
    setLiveTranscript(""); setLiveComparison(null);

    const isManual = !endSurah;
    isManualRef.current = isManual;
    extendingRef.current = false;

    // For manual mode fetch only 3 surahs upfront to avoid 114 API calls.
    // For bounded modes fetch exactly the surahs in range.
    const trueEnd   = endSurah ?? Math.min(startSurah + 2, 114);
    const surahsNeeded = [];
    for (let s = startSurah; s <= trueEnd; s++) surahsNeeded.push(s);
    if (!isManual) prefetchSurah(endSurah + 1); // warm cache for the surah after the session

    Promise.all(surahsNeeded.map(s => getSurah(s).then(texts => ({ s, texts }))))
      .then(data => {
        const map = Object.fromEntries(data.map(d => [d.s, d.texts]));
        const list = [];

        const finalSurah = isManual ? trueEnd : endSurah;
        const finalAyah  = isManual
          ? (SURAHS.find(su => su.n === trueEnd)?.a ?? 1)
          : endAyah;

        for (let s = startSurah; s <= finalSurah; s++) {
          const info  = SURAHS.find(su => su.n === s);
          const texts = map[s];
          if (!texts || !info) continue;
          const aStart = s === startSurah  ? startAyah : 1;
          const aEnd   = s === finalSurah  ? finalAyah : info.a;
          for (let a = aStart; a <= aEnd; a++) {
            const raw = texts[a - 1];
            if (raw) list.push({ surah: s, ayah: a, text: raw, expected: withBismillah(s, a, raw) });
          }
        }
        if (!list.length) { setError("No ayahs found for this range."); setPhaseSync("setup"); return; }

        setAyahList(list);
        ayahListRef.current = list;

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { setError("Speech recognition is not supported in this browser."); setPhaseSync("setup"); return; }

        const r = new SR();
        r.lang = "ar-SA"; r.interimResults = true; r.continuous = true; r.maxAlternatives = 1;

        r.onresult = (event) => {
          if (phaseRef.current !== "running") return;
          lastResultCount.current = event.results.length;
          let text = "";
          for (let i = resultStartRef.current; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          transcriptRef.current = text;
          setLiveTranscript(text);
          const cur = ayahListRef.current[currentIdxRef.current];
          if (text.trim() && cur) {
            setLiveComparison(compareAyah(cur.expected, text));
          }
          clearTimeout(advanceTimer.current);
          advanceTimer.current = setTimeout(finalizeAndAdvance, 1500);
        };

        r.onerror = (event) => {
          if (event.error === "no-speech") return;
          if (event.error === "not-allowed") { setError("Microphone permission denied."); setPhaseSync("setup"); }
        };

        r.onend = () => {
          if (phaseRef.current === "running") {
            resultStartRef.current = 0; lastResultCount.current = 0;
            try { r.start(); } catch {}
          }
        };

        recognitionRef.current  = r;
        resultStartRef.current  = 0;
        lastResultCount.current = 0;
        transcriptRef.current   = "";
        startMsRef.current      = Date.now();

        try { r.start(); setPhaseSync("running"); }
        catch { setError("Could not start microphone."); setPhaseSync("setup"); }
      })
      .catch(() => { setError("Failed to load ayah data. Check your connection."); setPhaseSync("setup"); });
  }

  // ── Pause / Resume ─────────────────────────────────────────────────────────
  function handlePause() {
    if (phase === "running") {
      clearTimeout(advanceTimer.current);
      setPhaseSync("paused");
      try { recognitionRef.current?.stop(); } catch {}
    } else if (phase === "paused") {
      transcriptRef.current  = "";
      resultStartRef.current = 0;
      lastResultCount.current = 0;
      setLiveTranscript(""); setLiveComparison(null);
      setPhaseSync("running");
      try { recognitionRef.current?.start(); }
      catch { setError("Could not resume microphone."); }
    }
  }

  // ── Manual stop ────────────────────────────────────────────────────────────
  function handleStop() {
    clearTimeout(advanceTimer.current);
    phaseRef.current = "stopping";
    try { recognitionRef.current?.abort(); } catch {}

    const ayah = ayahListRef.current[currentIdxRef.current];
    let finalResults = [...resultsRef.current];
    if (ayah && transcriptRef.current.trim()) {
      const result = compareAyah(ayah.text, transcriptRef.current);
      const entry  = { surah: ayah.surah, ayah: ayah.ayah, score: result.score, passed: result.passed };
      recordRecitationResult({ surah: ayah.surah, ayah: ayah.ayah, score: result.score, passed: result.passed });
      finalResults = [...finalResults, entry];
    }
    completeSession(finalResults);
  }

  function handleRestart() {
    setPhaseSync("setup");
    setAyahList([]); ayahListRef.current = [];
    setCurrentIdx(0); currentIdxRef.current = 0;
    setLiveTranscript(""); setLiveComparison(null);
    setResults([]); resultsRef.current = [];
    setTotalSeconds(0); transcriptRef.current = "";
  }

  useEffect(() => {
    return () => {
      clearTimeout(advanceTimer.current);
      try { recognitionRef.current?.abort(); } catch {}
    };
  }, []);

  const isActive = phase === "running" || phase === "paused";

  return (
    <>
      <style>{`::-webkit-scrollbar{display:none}`}</style>
      <div style={{ minHeight: "100vh", background: "#f8f9fa", paddingBottom: 80 }}>

        {/* Navbar */}
        <nav style={{
          background: `linear-gradient(135deg,#157a3c 0%,${G} 55%,${G2} 100%)`,
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 2px 16px rgba(26,138,74,0.28)",
        }}>
          <div style={{
            maxWidth: 680, margin: "0 auto", padding: "13px 20px 15px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            {isActive ? (
              <div onClick={handleStop} style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 16, cursor: "pointer",
              }}>←</div>
            ) : (
              <Link href="/hifz">
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 16, cursor: "pointer",
                }}>←</div>
              </Link>
            )}
            <div>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
                Continuous Recitation
              </div>
              <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 11, marginTop: 2 }}>
                {phase === "running" ? "● Recording"
                  : phase === "paused"  ? "⏸ Paused"
                  : phase === "loading" ? "Loading…"
                  : phase === "summary" ? "Session complete"
                  : "Set your session"}
              </div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 22 }}>🎙️</div>
          </div>
        </nav>

        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {error && (
            <div style={{
              margin: "12px 16px 0", background: "#fef2f2",
              border: "1px solid #fecaca", borderRadius: 12, padding: "10px 14px",
            }}>
              <p style={{ margin: 0, fontSize: 13, color: "#dc2626" }}>{error}</p>
            </div>
          )}

          {phase === "setup" && <SetupScreen onStart={startSession} />}

          {phase === "loading" && (
            <div style={{ padding: 60, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>Loading ayahs…</p>
            </div>
          )}

          {isActive && (
            <RecitationScreen
              ayahList={ayahList}
              currentIdx={currentIdx}
              liveTranscript={liveTranscript}
              liveComparison={liveComparison}
              paused={phase === "paused"}
              onPause={handlePause}
              onStop={handleStop}
            />
          )}

          {phase === "summary" && (
            <SummaryScreen
              results={results}
              totalSeconds={totalSeconds}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
      <DebugPanel
        liveTranscript={liveTranscript}
        liveComparison={liveComparison}
        currentAyah={ayahList[currentIdx]}
        isActive={isActive}
      />
      <BottomNav />
    </>
  );
}

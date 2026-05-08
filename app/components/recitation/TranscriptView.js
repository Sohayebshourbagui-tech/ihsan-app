"use client";

const G = "#1a8a4a";

const STATUS_STYLES = {
  matched:   { color: "#15803d", bg: "rgba(21,128,61,0.13)",   border: "#15803d",  dashed: false },
  correct:   { color: "#15803d", bg: "rgba(21,128,61,0.13)",   border: "#15803d",  dashed: false },
  close:     { color: "#92400e", bg: "rgba(217,119,6,0.12)",   border: "#d97706",  dashed: false },
  wrong:     { color: "#b91c1c", bg: "rgba(220,38,38,0.10)",   border: "#ef4444",  dashed: false },
  missing:   { color: "#9ca3af", bg: "rgba(156,163,175,0.07)", border: "#d1d5db",  dashed: true  },
  missed:    { color: "#9ca3af", bg: "rgba(156,163,175,0.07)", border: "#d1d5db",  dashed: true  },
  incorrect: { color: "#c2410c", bg: "rgba(234,88,12,0.10)",   border: "#fb923c",  dashed: false },
  pending:   { color: "#9ca3af", bg: "rgba(156,163,175,0.05)", border: "transparent", dashed: false },
};

function WordSpan({ word, status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span style={{
      color: s.color,
      background: s.bg,
      borderRadius: 5,
      padding: "2px 5px",
      display: "inline-block",
      marginBottom: 3,
      borderBottom: `2px ${s.dashed ? "dashed" : "solid"} ${s.border}`,
      transition: "all 0.2s ease",
    }}>
      {word}
    </span>
  );
}

function HighlightedArabic({ words, fontSize = 22 }) {
  if (!words || words.length === 0) return null;
  return (
    <p style={{
      margin: 0,
      fontFamily: "Amiri, serif",
      fontSize,
      lineHeight: 2.3,
      direction: "rtl",
      textAlign: "right",
    }}>
      {words.map((w, i) => (
        <span key={i}>
          <WordSpan word={w.word} status={w.status} />
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

const SCORE_FEEDBACK = [
  { min: 93, text: "Excellent recitation.",        sub: "This ayah is well-retained.",              emoji: "✓"  },
  { min: 80, text: "Very good.",                   sub: "A few words to refine.",                   emoji: "↑"  },
  { min: 65, text: "Good effort.",                 sub: "Review once more for consistency.",         emoji: "→"  },
  { min: 50, text: "Keep practicing.",             sub: "Repetition builds strong memory.",          emoji: "↻"  },
  { min: 0,  text: "More practice needed.",        sub: "Focus on this ayah carefully.",             emoji: "↻"  },
];

function ScoreCard({ comparison }) {
  const { score, passed, matched, missing, incorrect } = comparison;
  const fb = SCORE_FEEDBACK.find(f => score >= f.min) ?? SCORE_FEEDBACK[SCORE_FEEDBACK.length - 1];

  return (
    <div style={{
      background: passed
        ? "linear-gradient(135deg, #14532d 0%, #166534 55%, #15803d 100%)"
        : "linear-gradient(135deg, #7f1d1d 0%, #991b1b 55%, #dc2626 100%)",
      borderRadius: 18,
      padding: "16px 20px 14px",
      marginBottom: 14,
    }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 10 }}>
        <span style={{
          fontSize: 52, fontWeight: 900, color: "#fff", lineHeight: 1,
          letterSpacing: "-2px", fontVariantNumeric: "tabular-nums",
        }}>
          {score}
        </span>
        <div style={{ paddingBottom: 5, flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 2 }}>
            score
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
            {fb.text}
          </div>
        </div>
        <div style={{
          width: 36, height: 36,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: "#fff", fontWeight: 900,
          flexShrink: 0,
        }}>
          {fb.emoji}
        </div>
      </div>

      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.15)",
        paddingTop: 10,
        display: "flex", gap: 12, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 12, color: "#bbf7d0", fontWeight: 600 }}>
          {matched} matched
        </span>
        {missing > 0 && (
          <span style={{ fontSize: 12, color: "#fca5a5", fontWeight: 600 }}>
            {missing} missed
          </span>
        )}
        {incorrect > 0 && (
          <span style={{ fontSize: 12, color: "#fde68a", fontWeight: 600 }}>
            {incorrect} extra
          </span>
        )}
      </div>

      <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(255,255,255,0.55)", fontStyle: "italic" }}>
        {fb.sub}
      </p>
    </div>
  );
}

export default function TranscriptView({ expected, transcript, listening, comparison, liveWords }) {
  const hasResult = comparison != null;
  const hasLive   = listening && liveWords && liveWords.length > 0;

  return (
    <>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .transcript-blink { animation: blink 1.1s ease-in-out infinite; }
      `}</style>

      {hasResult && <ScoreCard comparison={comparison} />}

      {/* Expected ayah — shows live word highlighting while recording */}
      <div style={{
        background: "#f0fdf4",
        border: `1.5px solid ${hasLive ? G + "60" : "#bbf7d0"}`,
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 10,
        transition: "border-color 0.3s ease",
      }}>
        <p style={{
          margin: "0 0 8px",
          fontSize: 10, fontWeight: 800, color: G,
          letterSpacing: "0.09em", textTransform: "uppercase",
        }}>
          {hasLive ? "Live feedback" : "Expected"}
        </p>

        {hasResult ? (
          <HighlightedArabic words={comparison.expectedWords} fontSize={22} />
        ) : hasLive ? (
          <HighlightedArabic
            words={liveWords.map(w => ({ word: w.word, status: w.status }))}
            fontSize={22}
          />
        ) : (
          <p style={{
            margin: 0,
            fontFamily: "Amiri, serif",
            fontSize: 22,
            lineHeight: 1.9,
            color: "#111827",
            direction: "rtl",
            textAlign: "right",
          }}>
            {expected || "—"}
          </p>
        )}
      </div>

      {/* Your recitation */}
      <div style={{
        background: "#f9fafb",
        border: `1.5px solid ${listening ? G + "35" : "#e5e7eb"}`,
        borderRadius: 14,
        padding: "14px 16px",
        minHeight: 76,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        transition: "border-color 0.3s ease",
      }}>
        <p style={{
          margin: "0 0 8px",
          fontSize: 10, fontWeight: 800, color: "#6b7280",
          letterSpacing: "0.09em", textTransform: "uppercase",
        }}>
          Your Recitation
        </p>

        {hasResult ? (
          <HighlightedArabic words={comparison.spokenWords} fontSize={20} />
        ) : transcript ? (
          <p style={{
            margin: 0,
            fontFamily: "Amiri, serif",
            fontSize: 20,
            lineHeight: 1.9,
            color: "#374151",
            direction: "rtl",
            textAlign: "right",
          }}>
            {transcript}
          </p>
        ) : (
          <p className={listening ? "transcript-blink" : ""} style={{
            margin: "4px 0 0",
            fontSize: 14,
            color: listening ? G : "#9ca3af",
            fontStyle: "italic",
          }}>
            {listening ? "Listening…" : "Press the mic to begin"}
          </p>
        )}
      </div>
    </>
  );
}

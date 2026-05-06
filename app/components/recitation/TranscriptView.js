"use client";

const G = "#1a8a4a";

function WordSpan({ word, status }) {
  const styles = {
    matched:   { color: "#15803d", background: "rgba(21,128,61,0.12)"  },
    close:     { color: "#ca8a04", background: "rgba(234,179,8,0.15)"  },
    missing:   { color: "#dc2626", background: "rgba(220,38,38,0.10)"  },
    incorrect: { color: "#b45309", background: "rgba(180,83,9,0.10)"   },
  };
  const s = styles[status] ?? styles.missing;
  return (
    <span style={{ ...s, borderRadius: 4, padding: "1px 4px", display: "inline-block" }}>
      {word}
    </span>
  );
}

function HighlightedArabic({ words, fontSize = 22 }) {
  if (!words || words.length === 0) return null;
  return (
    <p style={{
      margin: 0, fontFamily: "Amiri, serif", fontSize, lineHeight: 2,
      direction: "rtl", textAlign: "right",
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

function ScoreCard({ comparison }) {
  const { score, passed, matched, missing, incorrect } = comparison;
  return (
    <div style={{
      background: passed ? "linear-gradient(135deg,#166534,#15803d)" : "linear-gradient(135deg,#991b1b,#dc2626)",
      borderRadius: 16, padding: "18px 20px", marginBottom: 12,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 44, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
            {score}%
          </span>
          <span style={{
            fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 99,
            background: "rgba(255,255,255,0.22)", color: "#fff",
            letterSpacing: "0.07em", textTransform: "uppercase",
          }}>
            {passed ? "Passed" : "Needs Work"}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
          <span style={{ color: "#bbf7d0", fontWeight: 700 }}>{matched} matched</span>
          {missing   > 0 && <span style={{ color: "#fca5a5" }}> · {missing} missing</span>}
          {incorrect > 0 && <span style={{ color: "#fde68a" }}> · {incorrect} extra</span>}
        </p>
      </div>
      <div style={{ fontSize: 36 }}>{passed ? "✅" : "📖"}</div>
    </div>
  );
}

export default function TranscriptView({ expected, transcript, listening, comparison }) {
  console.log('TranscriptView received props:', { expected, transcript, listening, comparison });
  const hasResult = comparison != null;

  return (
    <>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .transcript-blink { animation: blink 1.2s ease-in-out infinite; }
      `}</style>

      {/* Score card — shown first, at the top, when result is available */}
      {hasResult && <ScoreCard comparison={comparison} />}

      {/* Expected ayah */}
      <div style={{
        background: "#f0fdf4", border: "1.5px solid #bbf7d0",
        borderRadius: 14, padding: "14px 16px", marginBottom: 10,
      }}>
        <p style={{
          margin: "0 0 8px", fontSize: 10, fontWeight: 800, color: G,
          letterSpacing: "0.09em", textTransform: "uppercase",
        }}>Expected</p>

        {hasResult ? (
          <HighlightedArabic words={comparison.expectedWords} fontSize={22} />
        ) : (
          <p style={{
            margin: 0, fontFamily: "Amiri, serif", fontSize: 22, lineHeight: 1.9,
            color: "#111827", direction: "rtl", textAlign: "right",
          }}>
            {expected || "—"}
          </p>
        )}
      </div>

      {/* Your recitation */}
      <div style={{
        background: "#f9fafb", border: "1.5px solid #e5e7eb",
        borderRadius: 14, padding: "14px 16px", minHeight: 80,
        display: "flex", flexDirection: "column", justifyContent: "flex-start",
      }}>
        <p style={{
          margin: "0 0 8px", fontSize: 10, fontWeight: 800, color: "#6b7280",
          letterSpacing: "0.09em", textTransform: "uppercase",
        }}>Your Recitation</p>

        {hasResult ? (
          <HighlightedArabic words={comparison.spokenWords} fontSize={20} />
        ) : transcript ? (
          <p style={{
            margin: 0, fontFamily: "Amiri, serif", fontSize: 20, lineHeight: 1.9,
            color: "#374151", direction: "rtl", textAlign: "right",
          }}>
            {transcript}
          </p>
        ) : (
          <p className={listening ? "transcript-blink" : ""} style={{
            marginTop: 4, marginRight: 0, marginBottom: 0, marginLeft: 0, fontSize: 14, color: "#9ca3af", fontStyle: "italic",
          }}>
            {listening ? "Listening…" : "Press the mic to begin"}
          </p>
        )}
      </div>
    </>
  );
}

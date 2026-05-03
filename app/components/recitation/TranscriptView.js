"use client";

const G = "#1a8a4a";

function WordSpan({ word, status }) {
  const matched    = status === "matched";
  const color      = matched ? "#15803d" : "#dc2626";
  const background = matched ? "rgba(21,128,61,0.10)" : "rgba(220,38,38,0.10)";
  return (
    <span style={{ color, background, borderRadius: 4, padding: "1px 3px" }}>
      {word}
    </span>
  );
}

function HighlightedArabic({ words, fontSize = 22 }) {
  return (
    <p style={{
      margin: 0, fontFamily: "Amiri, serif", fontSize, lineHeight: 1.9,
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

export default function TranscriptView({ expected, transcript, listening, comparison }) {
  const hasResult = Boolean(comparison);

  return (
    <>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .transcript-blink { animation: blink 1.2s ease-in-out infinite; }
      `}</style>

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

      {/* Score card — shown only after comparison */}
      {hasResult && (
        <div style={{
          background: comparison.passed ? "#f0fdf4" : "#fef2f2",
          border: `1.5px solid ${comparison.passed ? "#86efac" : "#fca5a5"}`,
          borderRadius: 14, padding: "14px 16px", marginBottom: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
              <span style={{
                fontSize: 32, fontWeight: 900, lineHeight: 1,
                color: comparison.passed ? "#15803d" : "#dc2626",
              }}>
                {comparison.score}%
              </span>
              <span style={{
                fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 99,
                background: comparison.passed ? "#15803d" : "#dc2626",
                color: "#fff", letterSpacing: "0.07em", textTransform: "uppercase",
              }}>
                {comparison.passed ? "Passed" : "Needs Work"}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
              <span style={{ color: "#15803d", fontWeight: 700 }}>{comparison.matched} matched</span>
              {comparison.missing   > 0 && <span style={{ color: "#dc2626" }}> · {comparison.missing} missing</span>}
              {comparison.incorrect > 0 && <span style={{ color: "#b45309" }}> · {comparison.incorrect} extra</span>}
            </p>
          </div>
          <div style={{ fontSize: 28 }}>{comparison.passed ? "✅" : "📖"}</div>
        </div>
      )}

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
            margin: 0, fontSize: 14, color: "#9ca3af", fontStyle: "italic", marginTop: 4,
          }}>
            {listening ? "Listening…" : "Press the mic to begin"}
          </p>
        )}
      </div>
    </>
  );
}

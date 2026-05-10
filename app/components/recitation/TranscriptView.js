"use client";

import { T } from "../../../lib/theme";

const STATUS_STYLES = {
  matched:   { color: T.green,        bg: "rgba(26,138,74,0.1)",   border: T.green,        dashed: false },
  correct:   { color: T.green,        bg: "rgba(26,138,74,0.1)",   border: T.green,        dashed: false },
  close:     { color: T.amber,        bg: "rgba(180,83,9,0.08)",   border: T.amber,        dashed: false },
  wrong:     { color: T.red,          bg: "rgba(192,57,43,0.08)",  border: T.red,          dashed: false },
  missing:   { color: T.textTertiary, bg: "rgba(168,162,158,0.07)",border: T.border,       dashed: true  },
  missed:    { color: T.textTertiary, bg: "rgba(168,162,158,0.07)",border: T.border,       dashed: true  },
  incorrect: { color: T.red,          bg: "rgba(192,57,43,0.08)",  border: T.red,          dashed: false },
  pending:   { color: T.textTertiary, bg: "transparent",           border: "transparent",  dashed: false },
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
      fontFamily: T.fontArabic,
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
  { min: 93, text: "Excellent recitation.",     sub: "This ayah is well-retained.",         emoji: "✓" },
  { min: 80, text: "Very good.",                sub: "A few words to refine.",               emoji: "↑" },
  { min: 65, text: "Good effort.",              sub: "Review once more for consistency.",    emoji: "→" },
  { min: 50, text: "Keep practising.",          sub: "Repetition builds strong memory.",     emoji: "↻" },
  { min: 0,  text: "More practice needed.",     sub: "Focus on this ayah carefully.",        emoji: "↻" },
];

function ScoreCard({ comparison }) {
  const { score, passed, matched, missing, incorrect } = comparison;
  const fb = SCORE_FEEDBACK.find(f => score >= f.min) ?? SCORE_FEEDBACK[SCORE_FEEDBACK.length - 1];
  const scoreColor = passed ? T.green : T.red;
  const scoreBg    = passed ? T.greenMuted : T.redBg;

  return (
    <div style={{
      background: T.bgCard,
      borderRadius: T.radiusMd,
      border: `1px solid ${T.border}`,
      padding: "20px",
      marginBottom: 14,
    }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 12 }}>
        <span style={{
          fontSize: 52, fontWeight: 900, color: scoreColor, lineHeight: 1,
          letterSpacing: "-2px", fontVariantNumeric: "tabular-nums",
        }}>
          {score}
        </span>
        <div style={{ paddingBottom: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, lineHeight: 1.3 }}>
            {fb.text}
          </div>
          <div style={{ fontSize: 12, color: T.textTertiary, marginTop: 2 }}>
            {fb.sub}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 11, fontWeight: 600,
          background: T.greenMuted, color: T.green,
          padding: "3px 10px", borderRadius: T.radiusFull,
        }}>
          {matched} matched
        </span>
        {missing > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            background: T.redBg, color: T.red,
            padding: "3px 10px", borderRadius: T.radiusFull,
          }}>
            {missing} missed
          </span>
        )}
        {incorrect > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            background: T.amberBg, color: T.amber,
            padding: "3px 10px", borderRadius: T.radiusFull,
          }}>
            {incorrect} extra
          </span>
        )}
      </div>
    </div>
  );
}

export default function TranscriptView({ expected, transcript, listening, comparison, liveWords }) {
  const hasResult = comparison != null;
  const hasLive   = listening && liveWords && liveWords.length > 0;

  return (
    <>
      <style>{`
        .transcript-blink { animation: blink 1.1s ease-in-out infinite; }
      `}</style>

      {hasResult && <ScoreCard comparison={comparison} />}

      {/* Expected ayah */}
      <div style={{
        background: hasLive ? "rgba(26,138,74,0.04)" : T.bgSubtle,
        border: `1.5px solid ${hasLive ? T.green + "50" : T.border}`,
        borderRadius: T.radiusMd,
        padding: "14px 16px",
        marginBottom: 10,
        transition: "border-color 0.3s, background 0.3s",
      }}>
        <p style={{
          margin: "0 0 10px",
          fontSize: 10, fontWeight: 700, color: T.textTertiary,
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          {hasLive ? "Live feedback" : "Expected"}
        </p>

        {hasResult ? (
          <HighlightedArabic words={comparison.expectedWords} fontSize={22} />
        ) : hasLive ? (
          <HighlightedArabic words={liveWords.map(w => ({ word: w.word, status: w.status }))} fontSize={22} />
        ) : (
          <p style={{
            margin: 0, fontFamily: T.fontArabic,
            fontSize: 22, lineHeight: 2.0,
            color: T.textPrimary, direction: "rtl", textAlign: "right",
          }}>
            {expected || "—"}
          </p>
        )}
      </div>

      {/* Your recitation */}
      <div style={{
        background: T.bgCard,
        border: `1.5px solid ${listening ? T.green + "30" : T.border}`,
        borderRadius: T.radiusMd,
        padding: "14px 16px",
        minHeight: 76,
        display: "flex", flexDirection: "column",
        transition: "border-color 0.3s",
      }}>
        <p style={{
          margin: "0 0 10px",
          fontSize: 10, fontWeight: 700, color: T.textTertiary,
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          Your Recitation
        </p>

        {hasResult ? (
          <HighlightedArabic words={comparison.spokenWords} fontSize={20} />
        ) : transcript ? (
          <p style={{
            margin: 0, fontFamily: T.fontArabic,
            fontSize: 20, lineHeight: 1.9,
            color: T.textSecondary, direction: "rtl", textAlign: "right",
          }}>
            {transcript}
          </p>
        ) : (
          <p className={listening ? "transcript-blink" : ""} style={{
            margin: "4px 0 0", fontSize: 14,
            color: listening ? T.green : T.textTertiary,
            fontStyle: "italic",
          }}>
            {listening ? "Listening…" : "Press the mic to begin"}
          </p>
        )}
      </div>
    </>
  );
}

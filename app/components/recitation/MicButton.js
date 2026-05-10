"use client";

import { T } from "../../../lib/theme";

export default function MicButton({ listening, disabled, onClick }) {
  const bg = disabled
    ? T.bgSubtle
    : listening
      ? `linear-gradient(135deg, ${T.red}, #e74c3c)`
      : `linear-gradient(135deg, ${T.greenDark}, ${T.green})`;

  return (
    <>
      <style>{`
        @keyframes mic-pulse {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(1.75); opacity: 0;  }
        }
        .mic-pulse-ring { animation: mic-pulse 1.2s ease-out infinite; }
      `}</style>

      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        {listening && (
          <div className="mic-pulse-ring" style={{
            position: "absolute",
            width: 80, height: 80,
            borderRadius: "50%",
            background: "rgba(192,57,43,0.25)",
            pointerEvents: "none",
          }} />
        )}
        <button
          onClick={onClick}
          disabled={disabled}
          style={{
            width: 80, height: 80, borderRadius: "50%",
            background: bg, border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: disabled ? "not-allowed" : "pointer",
            boxShadow: disabled ? "none" : listening
              ? `0 4px 24px rgba(192,57,43,0.3)`
              : `0 4px 20px rgba(26,138,74,0.28)`,
            transition: "transform 0.15s, box-shadow 0.15s",
            position: "relative", zIndex: 1,
          }}
          onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = "scale(1.05)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke={disabled ? T.textTertiary : "white"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8"  y1="23" x2="16" y2="23" />
          </svg>
        </button>
      </div>
    </>
  );
}

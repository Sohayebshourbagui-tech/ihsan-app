"use client";

const G  = "#1a8a4a";
const G2 = "#2ea55f";

export default function MicButton({ listening, disabled, onClick }) {
  const bg = disabled
    ? "#e5e7eb"
    : listening
      ? "linear-gradient(135deg,#dc2626,#ef4444)"
      : `linear-gradient(135deg,${G},${G2})`;

  const cursor = disabled ? "not-allowed" : "pointer";

  return (
    <>
      <style>{`
        @keyframes mic-pulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0;   }
        }
        .mic-pulse-ring {
          animation: mic-pulse 1.2s ease-out infinite;
        }
      `}</style>

      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        {listening && (
          <div className="mic-pulse-ring" style={{
            position: "absolute",
            width: 72, height: 72,
            borderRadius: "50%",
            background: "rgba(220,38,38,0.35)",
            pointerEvents: "none",
          }}/>
        )}
        <button
          onClick={onClick}
          disabled={disabled}
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: bg, border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor, boxShadow: disabled ? "none" : "0 4px 16px rgba(0,0,0,0.18)",
            transition: "transform 0.15s, box-shadow 0.15s",
            position: "relative", zIndex: 1,
          }}
          onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = "scale(1.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
               stroke={disabled ? "#9ca3af" : "white"}
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8"  y1="23" x2="16" y2="23"/>
          </svg>
        </button>
      </div>
    </>
  );
}

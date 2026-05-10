"use client";

import { useRef } from "react";
import { T } from "../../../lib/theme";

// Updated status styles using the new warm palette
const STATUS_STYLES = {
  0: { bg: T.bgSubtle,   border: T.border,         color: T.textTertiary, label: "Not Started" },
  1: { bg: "#fef3e2",    border: "#f0c070",         color: T.amber,        label: "In Progress" },
  2: { bg: T.greenMuted, border: "rgba(26,138,74,0.35)", color: T.green,   label: "Memorised"   },
};

export default function AyahGrid({ progress, onToggle, ayahTexts, onRecite }) {
  const pressTimer   = useRef(null);
  const didLongPress = useRef(false);

  function handlePointerDown(idx) {
    didLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      const text = ayahTexts?.[idx] ?? null;
      onRecite?.(idx, text);
    }, 600);
  }

  function handlePointerUp() {
    clearTimeout(pressTimer.current);
  }

  function handleClick(idx) {
    if (didLongPress.current) return;
    onToggle(idx, ayahTexts?.[idx] ?? null);
  }

  return (
    <div style={{ padding: "16px 20px 0" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
        Tap to cycle · Hold to recite
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))",
        gap: 6,
      }}>
        {progress.map((status, idx) => {
          const s = STATUS_STYLES[status] ?? STATUS_STYLES[0];
          return (
            <button
              key={idx}
              onPointerDown={() => handlePointerDown(idx)}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onClick={() => handleClick(idx)}
              title={`Ayah ${idx + 1}`}
              style={{
                height: 44, borderRadius: T.radiusSm,
                background: s.bg,
                border: `1.5px solid ${s.border}`,
                color: s.color, fontSize: 11, fontWeight: 700,
                cursor: "pointer",
                transition: "transform 0.1s, box-shadow 0.1s",
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "none",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = T.shadowSm;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

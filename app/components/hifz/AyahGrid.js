"use client";

import { useRef } from "react";
import { STATUS_STYLE } from "../../../lib/storage";

const G = "#1a8a4a";
const CARD_SHADOW = "0 2px 8px rgba(0,0,0,0.06)";

export default function AyahGrid({ progress, onToggle, ayahTexts, onRecite }) {
  const pressTimer  = useRef(null);
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
    <div style={{
      background: "#fff", margin: "12px 16px 0", borderRadius: 16,
      boxShadow: CARD_SHADOW, padding: "16px",
    }}>
      <p style={{
        margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: G,
        textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        Tap to cycle · Hold to recite
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(40px,1fr))",
        gap: 5,
      }}>
        {progress.map((status, idx) => {
          const s = STATUS_STYLE[status];
          return (
            <button
              key={idx}
              onPointerDown={() => handlePointerDown(idx)}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onClick={() => handleClick(idx)}
              title={`Ayah ${idx + 1}`}
              style={{
                height: 40, borderRadius: 7,
                background: s.bg, border: `1.5px solid ${s.border}`,
                color: s.color, fontSize: 11, fontWeight: 700,
                cursor: "pointer", transition: "transform 0.1s,background 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "none",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { T } from "../../../lib/theme";

const LEGEND = [
  { label: "Memorised",   bg: T.greenMuted, border: "rgba(26,138,74,0.35)", color: T.green  },
  { label: "In Progress", bg: "#fef3e2",    border: "#f0c070",               color: T.amber  },
  { label: "Not started", bg: T.bgSubtle,   border: T.border,                color: T.textTertiary },
];

export default function StatusLegend() {
  return (
    <div style={{ padding: "16px 20px 0", display: "flex", gap: 8 }}>
      {LEGEND.map(({ label, bg, border, color }) => (
        <div key={label} style={{
          flex: 1, background: bg,
          border: `1px solid ${border}`,
          borderRadius: T.radiusSm,
          padding: "8px 6px", textAlign: "center",
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

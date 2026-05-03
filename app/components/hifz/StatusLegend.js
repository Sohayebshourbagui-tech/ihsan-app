"use client";

import { STATUS_STYLE } from "../../../lib/storage";

export default function StatusLegend() {
  return (
    <div style={{
      margin: "12px 16px 0", display: "grid",
      gridTemplateColumns: "repeat(3,1fr)", gap: 8,
    }}>
      {Object.entries(STATUS_STYLE).map(([k, s]) => (
        <div key={k} style={{
          background: s.bg, border: `1px solid ${s.border}`,
          borderRadius: 10, padding: "10px 8px", textAlign: "center",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

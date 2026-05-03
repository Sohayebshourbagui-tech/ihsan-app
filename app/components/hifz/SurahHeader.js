"use client";

import { STATUS } from "../../../lib/storage";

const G  = "#1a8a4a";
const G2 = "#2ea55f";
const CARD_SHADOW = "0 2px 8px rgba(0,0,0,0.06)";

export default function SurahHeader({ surah, progress, onMarkAll, onReset }) {
  const surahMemorized  = progress.filter(v => v === STATUS.MEMORIZED).length;
  const surahInProgress = progress.filter(v => v === STATUS.PROGRESS).length;
  const surahPct = Math.round((surahMemorized / surah.a) * 100);

  return (
    <div style={{
      background: "#fff", margin: "12px 16px 0", borderRadius: 16,
      boxShadow: CARD_SHADOW, padding: "18px 16px",
      borderLeft: `4px solid ${G}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 800, color: "#111827" }}>
            {surah.name}
          </h3>
          <p style={{
            margin: "0 0 4px", fontFamily: "Amiri,serif", fontSize: 20,
            color: "#374151", direction: "rtl",
          }}>{surah.ar}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
            Surah {surah.n} · {surah.a} ayahs
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: G }}>{surahPct}%</p>
          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>memorised</p>
        </div>
      </div>

      <div style={{ height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden", marginBottom: 10 }}>
        <div style={{
          height: "100%", borderRadius: 999,
          background: `linear-gradient(90deg,${G},${G2})`,
          width: `${surahPct}%`, transition: "width 0.3s ease",
        }}/>
      </div>

      <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
        <span style={{ color: "#15803d", fontWeight: 700 }}>✓ {surahMemorized} memorised</span>
        {surahInProgress > 0 && (
          <span style={{ color: "#b45309", fontWeight: 700 }}>⟳ {surahInProgress} in progress</span>
        )}
        <span>{surah.a - surahMemorized - surahInProgress} not started</span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onMarkAll} style={{
          flex: 1, border: `1px solid ${G}`, background: "#ecfdf3",
          color: G, borderRadius: 8, padding: "8px",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
        }}>Mark All Memorised</button>
        <button onClick={onReset} style={{
          flex: 1, border: "1px solid #e5e7eb", background: "#f9fafb",
          color: "#6b7280", borderRadius: 8, padding: "8px",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
        }}>Reset</button>
      </div>
    </div>
  );
}

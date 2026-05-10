"use client";

import { STATUS } from "../../../lib/storage";
import { T } from "../../../lib/theme";

export default function SurahHeader({ surah, progress, onMarkAll, onReset }) {
  const surahMemorized  = progress.filter(v => v === STATUS.MEMORIZED).length;
  const surahInProgress = progress.filter(v => v === STATUS.PROGRESS).length;
  const surahPct = Math.round((surahMemorized / surah.a) * 100);

  return (
    <div style={{ padding: "20px 20px 0" }}>
      <div style={{
        background: T.bgCard,
        borderRadius: T.radiusMd,
        border: `1px solid ${T.border}`,
        padding: "20px",
        boxShadow: T.shadowSm,
      }}>
        {/* Surah name */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: T.fontArabic, fontSize: 36, color: T.textPrimary, lineHeight: 1.4, marginBottom: 4 }}>
            {surah.ar}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>{surah.name}</div>
          <div style={{ fontSize: 12, color: T.textTertiary, marginTop: 3 }}>
            Surah {surah.n} · {surah.a} ayahs
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: T.textSecondary }}>Memorised</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.green }}>{surahPct}%</span>
          </div>
          <div style={{ height: 6, background: T.bgSubtle, borderRadius: T.radiusFull, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: T.radiusFull,
              background: T.green,
              width: `${surahPct}%`, transition: "width 0.35s ease",
            }} />
          </div>
        </div>

        {/* Stats line */}
        <div style={{ display: "flex", gap: 16, fontSize: 12, marginBottom: 16 }}>
          <span style={{ color: T.green, fontWeight: 600 }}>✓ {surahMemorized} memorised</span>
          {surahInProgress > 0 && (
            <span style={{ color: T.amber, fontWeight: 600 }}>◑ {surahInProgress} in progress</span>
          )}
          <span style={{ color: T.textTertiary }}>{surah.a - surahMemorized - surahInProgress} not started</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onMarkAll} style={{
            flex: 1, border: "none", background: T.greenMuted,
            color: T.green, borderRadius: T.radiusSm, padding: "9px",
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>
            Mark All Memorised
          </button>
          <button onClick={onReset} style={{
            background: "transparent", border: "none",
            color: T.textTertiary, borderRadius: T.radiusSm,
            padding: "9px 14px", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

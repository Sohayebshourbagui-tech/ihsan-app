"use client";

import { TOTAL_AYAHS } from "../../../lib/storage";
import { T } from "../../../lib/theme";

export default function HifzStatsCard({ mounted, stats, totalPct }) {
  return (
    <div style={{ padding: "20px 20px 0" }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 26, fontWeight: 900, color: T.textPrimary, letterSpacing: "-0.5px" }}>
          {mounted ? stats.memorized.toLocaleString() : "—"}
        </span>
        <span style={{ fontSize: 15, color: T.textTertiary, marginLeft: 4 }}>
          / {TOTAL_AYAHS.toLocaleString()} ayahs memorised
        </span>
      </div>
      <div style={{ height: 6, background: T.bgSubtle, borderRadius: T.radiusFull, overflow: "hidden", marginBottom: 8 }}>
        <div style={{
          height: "100%", borderRadius: T.radiusFull,
          background: T.green,
          width: `${mounted ? totalPct : 0}%`,
          transition: "width 0.5s ease",
        }} />
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <span style={{ fontSize: 12, color: T.green, fontWeight: 600 }}>{mounted ? totalPct : 0}% complete</span>
        {mounted && stats.inProgress > 0 && (
          <span style={{ fontSize: 12, color: T.textTertiary }}>
            {stats.inProgress.toLocaleString()} in progress
          </span>
        )}
      </div>
    </div>
  );
}

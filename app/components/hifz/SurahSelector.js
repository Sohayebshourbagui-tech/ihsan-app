"use client";

import { useState } from "react";
import { SURAHS, getSurahMemorizedCount } from "../../../lib/storage";
import { T } from "../../../lib/theme";

export default function SurahSelector({ selectedSurah, onSelect, mounted }) {
  const [search, setSearch] = useState("");

  const filtered = SURAHS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ar.includes(search) ||
    String(s.n).includes(search)
  );

  return (
    <div style={{ padding: "20px 20px 0" }}>
      <input
        type="text"
        placeholder="Search surah by name or number…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%", padding: "12px 16px",
          borderRadius: T.radiusMd,
          border: `1.5px solid ${T.border}`,
          background: T.bgInset,
          fontSize: 14, color: T.textPrimary,
          outline: "none", boxSizing: "border-box",
          fontFamily: "inherit",
          transition: "border-color 0.18s",
        }}
        onFocus={e => e.target.style.borderColor = T.green}
        onBlur={e => e.target.style.borderColor = T.border}
      />
      <div style={{
        maxHeight: 300, overflowY: "auto",
        marginTop: 8,
        background: T.bgCard,
        borderRadius: T.radiusMd,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowSm,
        overflow: "hidden",
      }}>
        {filtered.map((s, idx) => {
          const saved  = mounted ? getSurahMemorizedCount(s.n, s.a) : 0;
          const pct    = Math.round((saved / s.a) * 100);
          const active = selectedSurah?.n === s.n;
          return (
            <button key={s.n} onClick={() => onSelect(s)} style={{
              display: "flex", alignItems: "center", width: "100%",
              textAlign: "left", border: "none",
              background: active ? T.greenMuted : "transparent",
              borderTop: idx > 0 ? `1px solid ${T.border}` : "none",
              padding: "12px 16px",
              cursor: "pointer", gap: 12,
              borderLeft: active ? `3px solid ${T.green}` : "3px solid transparent",
              transition: "background 0.12s",
            }}>
              <span style={{ minWidth: 28, fontSize: 11, fontWeight: 600, color: T.textTertiary }}>
                {s.n}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: active ? T.greenDark : T.textPrimary }}>
                    {s.name}
                  </span>
                  <span style={{ fontFamily: T.fontArabic, fontSize: 13, color: T.textSecondary, marginLeft: 8, flexShrink: 0 }}>
                    {s.ar}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: T.textTertiary }}>{s.a} ayahs</span>
                  {pct > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: T.green }}>{pct}%</span>}
                </div>
                {pct > 0 && (
                  <div style={{ height: 3, background: T.bgSubtle, borderRadius: T.radiusFull, marginTop: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: T.green, borderRadius: T.radiusFull, width: `${pct}%` }} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

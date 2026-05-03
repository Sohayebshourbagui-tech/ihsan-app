"use client";

import { useState } from "react";
import { SURAHS, STATUS, getSurahMemorizedCount } from "../../../lib/storage";

const G = "#1a8a4a";
const CARD_SHADOW = "0 2px 8px rgba(0,0,0,0.06)";

export default function SurahSelector({ selectedSurah, onSelect, mounted }) {
  const [search, setSearch] = useState("");

  const filtered = SURAHS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ar.includes(search) ||
    String(s.n).includes(search)
  );

  return (
    <div style={{
      background: "#fff", margin: "12px 16px 0", borderRadius: 16,
      boxShadow: CARD_SHADOW, padding: "16px",
    }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#111827" }}>
        Select a Surah
      </h3>
      <input
        type="text"
        placeholder="Search by name or number…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 10,
          border: "1.5px solid #e5e7eb", fontSize: 14, color: "#374151",
          outline: "none", boxSizing: "border-box", marginBottom: 10,
          fontFamily: "inherit",
        }}
      />
      <div style={{ maxHeight: 260, overflowY: "auto" }}>
        {filtered.map(s => {
          const saved = mounted ? getSurahMemorizedCount(s.n, s.a) : 0;
          const pct = Math.round((saved / s.a) * 100);
          const active = selectedSurah?.n === s.n;
          return (
            <button key={s.n} onClick={() => onSelect(s)} style={{
              display: "flex", alignItems: "center", width: "100%",
              textAlign: "left", border: "none",
              background: active ? "#ecfdf3" : "transparent",
              borderRadius: 10, padding: "10px 10px",
              cursor: "pointer", gap: 12,
              borderLeft: active ? `3px solid ${G}` : "3px solid transparent",
            }}>
              <span style={{ minWidth: 32, fontSize: 12, fontWeight: 800, color: "#9ca3af" }}>
                {s.n}.
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: active ? G : "#111827" }}>
                    {s.name}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: G }}>
                    {pct > 0 ? `${pct}%` : ""}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>{s.a} ayahs</span>
                  <span style={{ fontFamily: "Amiri,serif", fontSize: 13, color: "#374151" }}>{s.ar}</span>
                </div>
                {pct > 0 && (
                  <div style={{ height: 3, background: "#e5e7eb", borderRadius: 999, marginTop: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: G, borderRadius: 999, width: `${pct}%` }}/>
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

"use client";

import { TOTAL_AYAHS } from "../../../lib/storage";

const G = "#1a8a4a";

function GeoPattern({ id, opacity = 0.12 }) {
  return (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity, pointerEvents:"none" }}
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={id} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 2 L58 30 L30 58 L2 30 Z" fill="none" stroke="white" strokeWidth="0.8"/>
          <path d="M30 16 L44 30 L30 44 L16 30 Z" fill="none" stroke="white" strokeWidth="0.5"/>
          <circle cx="30" cy="30" r="2"   fill="white"/>
          <circle cx="0"  cy="0"  r="1.5" fill="white"/>
          <circle cx="60" cy="0"  r="1.5" fill="white"/>
          <circle cx="0"  cy="60" r="1.5" fill="white"/>
          <circle cx="60" cy="60" r="1.5" fill="white"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`}/>
    </svg>
  );
}

export default function HifzStatsCard({ mounted, stats, totalPct }) {
  return (
    <div style={{
      background: `linear-gradient(135deg,#0d5e2e 0%,${G} 100%)`,
      margin: "16px 16px 0", borderRadius: 20, padding: "22px 20px",
      boxShadow: "0 4px 20px rgba(26,138,74,0.28)",
      position: "relative", overflow: "hidden",
    }}>
      <GeoPattern id="hifzStats" opacity={0.10} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <p style={{
              fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4,
            }}>Overall Progress</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
              {mounted ? stats.memorized.toLocaleString() : "—"}
              <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.7 }}>/{TOTAL_AYAHS.toLocaleString()}</span>
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 3 }}>
              ayahs memorised
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
              {mounted ? totalPct : 0}%
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>complete</p>
          </div>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 999, background: "rgba(255,255,255,0.85)",
            width: `${mounted ? totalPct : 0}%`, transition: "width 0.4s ease",
          }}/>
        </div>
        {mounted && stats.inProgress > 0 && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>
            {stats.inProgress.toLocaleString()} ayahs in progress
          </p>
        )}
      </div>
    </div>
  );
}

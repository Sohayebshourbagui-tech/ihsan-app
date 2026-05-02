"use client";

import Link from "next/link";
import BottomNav from "../components/BottomNav";

const G  = "#1a8a4a";
const G2 = "#2ea55f";

function GeoPattern({ id, opacity = 0.12 }) {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity, pointerEvents: "none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={id} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 2 L58 30 L30 58 L2 30 Z" fill="none" stroke="white" strokeWidth="0.8" />
          <path d="M30 16 L44 30 L30 44 L16 30 Z" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="30" cy="30" r="2"   fill="white" />
          <circle cx="0"  cy="0"  r="1.5" fill="white" />
          <circle cx="60" cy="0"  r="1.5" fill="white" />
          <circle cx="0"  cy="60" r="1.5" fill="white" />
          <circle cx="60" cy="60" r="1.5" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

const ITEMS = [
  {
    href: "/quran",
    label: "Quran",
    sub: "Browse surahs and ayahs",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={G} strokeWidth="2" strokeLinecap="round"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={G} strokeWidth="2" strokeLinejoin="round" fill={G + "18"}/>
      </svg>
    ),
  },
  {
    href: "/duas",
    label: "Duas",
    sub: "Morning, evening & daily supplications",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 3.25 2.09 6.02 5 7.08V19h4v-2.92A7.001 7.001 0 0019 9c0-3.87-3.13-7-7-7z" stroke={G} strokeWidth="2" fill={G + "18"}/>
        <path d="M9 22h6" stroke={G} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/hadith",
    label: "Hadith",
    sub: "Six major hadith collections",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke={G} strokeWidth="2" fill={G + "18"}/>
        <path d="M7 8h10M7 12h10M7 16h6" stroke={G} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/qibla",
    label: "Qibla",
    sub: "Find the direction of prayer",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={G} strokeWidth="2" fill={G + "18"}/>
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke={G} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="2" fill={G}/>
        <path d="M12 7l1 4h-2l1-4z" fill={G}/>
      </svg>
    ),
  },
];

export default function LibraryPage() {
  return (
    <>
      <style>{`::-webkit-scrollbar { display: none; }`}</style>
      <div style={{ minHeight: "100vh", background: "#f8f9fa", paddingBottom: 70 }}>

        {/* Navbar */}
        <nav style={{
          background: `linear-gradient(135deg, #157a3c 0%, ${G} 55%, ${G2} 100%)`,
          width: "100%",
          boxShadow: "0 2px 16px rgba(26,138,74,0.28)",
          position: "relative",
          overflow: "hidden",
        }}>
          <GeoPattern id="geoLibNav" opacity={0.13} />
          <div style={{
            maxWidth: 680, margin: "0 auto", padding: "14px 20px 16px",
            display: "flex", alignItems: "center", gap: 12,
            position: "relative", zIndex: 1,
          }}>
            <div>
              <div style={{ color: "#fff", fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>Library</div>
              <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 11, marginTop: 3 }}>Islamic reference tools</div>
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 20px 0" }}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}>
            {ITEMS.map(({ href, label, sub, icon }, i) => (
              <Link key={href} href={href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "16px 18px",
                  borderBottom: i < ITEMS.length - 1 ? "1px solid #f3f4f6" : "none",
                  cursor: "pointer",
                  transition: "background 0.12s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{
                    flexShrink: 0, width: 44, height: 44, borderRadius: 12,
                    background: G + "12",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{sub}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <BottomNav />
      </div>
    </>
  );
}

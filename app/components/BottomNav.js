"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const G = "#1a8a4a";

const NAV_ITEMS = [
  { label: "Home",    href: "/",          icon: BottomNavHome    },
  { label: "Learn",   href: "/hifz",      icon: BottomNavLearn   },
  { label: "Ask",     href: "/scholarly", icon: BottomNavAsk     },
  { label: "Library", href: "/library",   icon: BottomNavLibrary },
];

function BottomNavHome({ active }) {
  const c = active ? G : "#9ca3af";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke={c} strokeWidth="2" strokeLinejoin="round" fill={active ? G + "22" : "none"} />
    </svg>
  );
}

function BottomNavLearn({ active }) {
  const c = active ? G : "#9ca3af";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={c} strokeWidth="2" strokeLinejoin="round" fill={active ? G + "22" : "none"}/>
    </svg>
  );
}

function BottomNavAsk({ active }) {
  const c = active ? G : "#9ca3af";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke={c} strokeWidth="2" fill={active ? G + "22" : "none"}/>
      <path d="M21 21L16.65 16.65" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M11 8v3M11 14h.01" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function BottomNavLibrary({ active }) {
  const c = active ? G : "#9ca3af";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke={c} strokeWidth="2" fill={active ? G + "22" : "none"}/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke={c} strokeWidth="2" fill={active ? G + "22" : "none"}/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke={c} strokeWidth="2" fill={active ? G + "22" : "none"}/>
      <rect x="14" y="14" width="7" height="7" rx="1" stroke={c} strokeWidth="2" fill={active ? G + "22" : "none"}/>
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "#fff",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      zIndex: 200,
      boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
    }}>
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} style={{
            flex: 1, textDecoration: "none",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "6px 4px 10px",
            position: "relative",
          }}>
            {/* Green indicator dot above icon */}
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: active ? G : "transparent",
              marginBottom: 4,
              transition: "background 0.2s",
            }} />
            <Icon active={active} />
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500,
              marginTop: 3, letterSpacing: "0.01em",
              color: active ? G : "#9ca3af",
            }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

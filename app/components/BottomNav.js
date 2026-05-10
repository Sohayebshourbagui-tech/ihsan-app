"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { T } from "../../lib/theme";

const NAV_ITEMS = [
  { label: "Home",    href: "/",          icon: HomeIcon    },
  { label: "Learn",   href: "/hifz",      icon: LearnIcon   },
  { label: "Ask",     href: "/scholarly", icon: AskIcon     },
  { label: "Library", href: "/library",   icon: LibraryIcon },
];

function HomeIcon({ active }) {
  const c = active ? T.green : T.textTertiary;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
        stroke={c} strokeWidth="1.8" strokeLinejoin="round"
        fill={active ? T.greenMuted : "none"} />
    </svg>
  );
}

function LearnIcon({ active }) {
  const c = active ? T.green : T.textTertiary;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
        stroke={c} strokeWidth="1.8" strokeLinejoin="round"
        fill={active ? T.greenMuted : "none"} />
    </svg>
  );
}

function AskIcon({ active }) {
  const c = active ? T.green : T.textTertiary;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke={c} strokeWidth="1.8"
        fill={active ? T.greenMuted : "none"} />
      <path d="M21 21L16.65 16.65" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11 8v3M11 14h.01" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LibraryIcon({ active }) {
  const c = active ? T.green : T.textTertiary;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3"  y="3"  width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.8"
        fill={active ? T.greenMuted : "none"} />
      <rect x="14" y="3"  width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.8"
        fill={active ? T.greenMuted : "none"} />
      <rect x="3"  y="14" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.8"
        fill={active ? T.greenMuted : "none"} />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.8"
        fill={active ? T.greenMuted : "none"} />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: T.bgCard,
      borderTop: `1px solid ${T.border}`,
      display: "flex",
      zIndex: 200,
      paddingBottom: "env(safe-area-inset-bottom, 8px)",
    }}>
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} style={{
            flex: 1,
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 4px 10px",
            position: "relative",
          }}>
            {/* Pill background on active */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 16px",
              borderRadius: T.radiusFull,
              background: active ? `rgba(26,138,74,0.08)` : "transparent",
              transition: "background 0.2s",
            }}>
              <Icon active={active} />
              <span style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                letterSpacing: "0.01em",
                color: active ? T.green : T.textTertiary,
                transition: "color 0.2s",
              }}>
                {label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

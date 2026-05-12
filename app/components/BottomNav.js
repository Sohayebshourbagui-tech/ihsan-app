"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { T } from "../../lib/theme";

const NAV_ITEMS = [
  { label: "Home",     href: "/",          icon: HomeIcon     },
  { label: "Quran",    href: "/quran",     icon: QuranIcon    },
  { label: "Ask",      href: "/scholarly", icon: AskIcon      },
  { label: "Hadith",   href: "/hadith",    icon: HadithIcon   },
  { label: "Settings", href: "/settings",  icon: SettingsIcon },
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

function QuranIcon({ active }) {
  const c = active ? T.green : T.textTertiary;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
        stroke={c} strokeWidth="1.8" strokeLinejoin="round"
        fill={active ? T.greenMuted : "none"} />
      <path d="M9 7h6M9 11h4" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
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

function SettingsIcon({ active }) {
  const c = active ? T.green : T.textTertiary;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.8"
        fill={active ? T.greenMuted : "none"} />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HadithIcon({ active }) {
  const c = active ? T.green : T.textTertiary;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M8 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2h-2"
        stroke={c} strokeWidth="1.8" strokeLinecap="round"
        fill={active ? T.greenMuted : "none"} />
      <path d="M8 3a2 2 0 012-2h4a2 2 0 012 2v1H8V3z"
        stroke={c} strokeWidth="1.8" strokeLinejoin="round"
        fill={active ? T.greenMuted : "none"} />
      <path d="M9 12h6M9 16h4" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
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

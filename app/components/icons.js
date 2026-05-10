"use client";

import { T } from "../../lib/theme";

/* ── Base icon wrapper ─────────────────────────────────────────────────────── */

function Icon({ size, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ display: "block", flexShrink: 0 }}>
      {children}
    </svg>
  );
}

/* ── Functional icons ──────────────────────────────────────────────────────── */

export function MicIcon({ color = T.green, size = 20, strokeWidth = 1.8 }) {
  return (
    <Icon size={size}>
      <rect x="9" y="2" width="6" height="12" rx="3" stroke={color} strokeWidth={strokeWidth} />
      <path d="M5 10a7 7 0 0014 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="9" y1="21" x2="15" y2="21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Icon>
  );
}

export function BookIcon({ color = T.green, size = 20, strokeWidth = 1.8 }) {
  return (
    <Icon size={size}>
      <path d="M2 6C2 6 6 5 12 6V20C6 19 2 20 2 20V6Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M22 6C22 6 18 5 12 6V20C18 19 22 20 22 20V6Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <line x1="12" y1="6" x2="12" y2="20" stroke={color} strokeWidth={strokeWidth} />
    </Icon>
  );
}

export function KaabaIcon({ color = T.green, size = 20, strokeWidth = 1.8 }) {
  return (
    <Icon size={size}>
      <rect x="3" y="7" width="13" height="14" stroke={color} strokeWidth={strokeWidth} />
      <path d="M3 7 L8 3 L21 3 L16 7Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M16 7 L21 3 L21 17 L16 21" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <line x1="3" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.4" />
    </Icon>
  );
}

export function RefreshIcon({ color = T.green, size = 20, strokeWidth = 1.8 }) {
  return (
    <Icon size={size}>
      <path d="M12 4a8 8 0 1 0 7.5 5.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <polyline points="16.5 4 20 4 20 7.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function CheckCircleIcon({ color = T.green, size = 20, strokeWidth = 1.8 }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <path d="M8 12.5l3 3 5-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function InfoIcon({ color = T.green, size = 20, strokeWidth = 1.8 }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <line x1="12" y1="10" x2="12" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1" fill={color} />
    </Icon>
  );
}

/* ── Calendar icons ────────────────────────────────────────────────────────── */

export function CrescentIcon({ color = T.green, size = 20, strokeWidth = 1.8 }) {
  return (
    <Icon size={size}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </Icon>
  );
}

export function StarIcon({ color = T.green, size = 20, strokeWidth = 1.8 }) {
  return (
    <Icon size={size}>
      <path d="M12 3 L21.5 19.5 L2.5 19.5 Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M12 21 L2.5 4.5 L21.5 4.5 Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </Icon>
  );
}

export function OrnamentIcon({ color = T.green, size = 20, strokeWidth = 1.8 }) {
  return (
    <Icon size={size}>
      <path d="M12 2 L22 12 L12 22 L2 12 Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <rect x="9" y="9" width="6" height="6" stroke={color} strokeWidth={strokeWidth} />
      <circle cx="12" cy="12" r="1.5" fill={color} />
    </Icon>
  );
}

/* ── CalendarEventIcon helper ──────────────────────────────────────────────── */

export function CalendarEventIcon({ type, size = 18 }) {
  const color = type === "eid" ? T.gold : T.green;
  if (type === "crescent") return <CrescentIcon color={color} size={size} />;
  if (type === "star")     return <StarIcon     color={color} size={size} />;
  return                          <OrnamentIcon color={color} size={size} />;
}

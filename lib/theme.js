// Ihsan Design System — centralised JS token object
// Use this instead of per-file `const G = "#1a8a4a"` constants.

export const T = {
  // Brand
  green:        "#1a8a4a",
  greenDark:    "#136339",
  greenLight:   "#22a85c",
  greenMuted:   "#d6ede2",

  // Gold
  gold:         "#c8a96b",
  goldLight:    "#f5edd8",

  // Surfaces
  bgPage:       "#faf8f3",
  bgCard:       "#ffffff",
  bgSubtle:     "#f5f2eb",
  bgInset:      "#f0ece2",

  // Text — warm stone scale
  textPrimary:  "#1c1917",
  textSecondary:"#57534e",
  textTertiary: "#a8a29e",
  textInverse:  "#ffffff",

  // Borders
  border:       "#e8e3d8",
  borderStrong: "#c8bfaf",

  // Semantic
  red:          "#c0392b",
  redBg:        "#fdf2f2",
  amber:        "#b45309",
  amberBg:      "#fef9ee",

  // Shadows
  shadowSm:     "0 1px 4px rgba(28,25,23,0.06)",
  shadowMd:     "0 2px 12px rgba(28,25,23,0.08)",
  shadowLg:     "0 6px 28px rgba(28,25,23,0.11)",

  // Radius (as numbers for style objects)
  radiusSm:     8,
  radiusMd:     14,
  radiusLg:     20,
  radiusFull:   9999,

  // Typography
  fontArabic:   '"Amiri Quran", "Amiri", serif',
  fontUI:       'var(--font-geist-sans), system-ui, sans-serif',
};

// Gradient helpers
export const gradientGreen = `linear-gradient(135deg, ${T.greenDark} 0%, ${T.green} 60%, ${T.greenLight} 100%)`;
export const gradientGold  = `linear-gradient(135deg, #b8925a 0%, ${T.gold} 100%)`;

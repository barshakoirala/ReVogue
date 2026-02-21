/**
 * ReVogue Design System – Single source of truth for user-facing UI.
 * Change colors/fonts here and they propagate everywhere.
 *
 * Brand:
 *   - Purple (Re): #6A1B7A – script, elegant
 *   - Gold (VOGUE): #B88A2A – serif, luxury
 *
 * Fonts:
 *   - "Re" (script): Cormorant Garamond Italic
 *   - "VOGUE" (serif): Bodoni Moda
 */

// ─── COLORS ─────────────────────────────────────────────────────────────────
export const COLORS = {
  PURPLE: "#6A1B7A", // Re – script accent
  GOLD: "#B88A2A",   // VOGUE – serif accent
};

// ─── FONTS ──────────────────────────────────────────────────────────────────
export const FONTS = {
  SERIF: '"Bodoni Moda"',      // VOGUE-style headings
  SCRIPT: '"Cormorant Garamond"', // Re-style, body text
};

// Google Fonts URL (used in index.html)
export const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;0,6..96,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&display=swap";

// ─── TAILWIND CLASS COMBINATIONS ────────────────────────────────────────────
// Import and use these in components instead of hardcoding.
export const CLASSES = {
  // Typography
  heading: "font-revogue-serif",
  body: "font-revogue-script",

  // Primary actions
  primaryButton: "bg-revogue-purple hover:bg-revogue-purple/90 text-white",
  primaryButtonDark: "bg-stone-900 hover:bg-stone-800 text-white",

  // Links
  accentLink: "text-revogue-purple hover:text-revogue-gold transition-colors",

  // Badges & accents
  luxuryBadge: "bg-revogue-purple text-white",
  goldAccent: "text-revogue-gold",
  goldAccentMuted: "text-revogue-gold/90",

  // Interactive
  tierActive: "bg-revogue-purple text-white shadow-sm",
  tierInactive: "text-stone-600 hover:text-revogue-purple",
  cardHover: "group-hover:text-revogue-purple transition-colors",
  linkHover: "hover:text-revogue-purple transition-colors",

  // Form inputs
  inputFocus: "focus:ring-2 focus:ring-revogue-purple focus:border-revogue-purple outline-none",

  // Section nav
  sectionActive: "bg-revogue-purple text-white",
  sectionInactive: "bg-stone-200 text-stone-700 hover:bg-stone-300",

  // User wrapper (applies body font + brand styling)
  userWrapper: "revogue-user",
};

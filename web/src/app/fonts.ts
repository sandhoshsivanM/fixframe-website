import { Instrument_Serif, Inter } from "next/font/google";

// V1 B1: "One strong display family + one neutral sans; final fonts [TBD]".
// The final choice is still UNRESOLVED-001 — both are self-hosted by
// next/font, so swapping is a two-line change with no external request
// and no layout shift.

export const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const text = Inter({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
});

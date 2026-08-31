import { Anton, Inter } from "next/font/google";

// Bold condensed caps for every heading — the studio's actual look.
// Anton carries the weight the mockup needs; Inter handles body copy.

export const display = Anton({
  weight: "400", // Anton ships a single, already-heavy weight
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const text = Inter({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
});

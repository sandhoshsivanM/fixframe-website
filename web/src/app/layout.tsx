import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SiteHeader } from "@/components/SiteHeader";
import { getSite } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import { display, text } from "./fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    // Without this, every relative Open Graph and canonical URL resolves
    // against localhost and link previews break once deployed.
    metadataBase: new URL(siteUrl),
    title: {
      default: `${site.name} — ${site.tagline}`,
      template: `%s — ${site.name}`,
    },
    description: site.description,
    alternates: { canonical: "/" },
    openGraph: {
      title: `${site.name} — ${site.tagline}`,
      description: site.description,
      url: "/",
      siteName: site.name,
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name} — ${site.tagline}`,
      description: site.description,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();

  return (
    <html
      lang="en"
      className={`${display.variable} ${text.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint. Everything is visible without it — this
            only arms the reveal animation for browsers that can run it. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute('data-js','1')`,
          }}
        />
      </head>
      <body>
        <ScrollProgress />
        <SiteHeader nav={site.nav} />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

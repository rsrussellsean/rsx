import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "RSXCode",
  description:
    "RSX — Russell Sean, creative developer. Forging ahead with elite web designs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* No-flash: if we arrived from a project page's exit sweep, cover the
            page in black before first paint so the reveal is continuous (the
            class is consumed + animated away in SiteChrome). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('rsx-returning'))document.documentElement.classList.add('rsx-returning')}catch(e){}",
          }}
        />
        {/* React hoists these into <head>; preloading the display fonts keeps
            the SplitText entrance from measuring fallback glyphs */}
        <link
          rel="preload"
          href="/fonts/grifterbold.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/MADERegular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/MADEBold.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <SiteChrome />
        {children}
      </body>
    </html>
  );
}

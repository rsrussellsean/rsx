import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "RSXDesigns",
  description:
    "RSX — Russell Sean, creative developer. Forging ahead with elite web designs.",
  icons: { icon: "/images/rsx1.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
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

# RSX — Next.js

Next.js port of the RSX portfolio (the static HTML/CSS/JS site at the repo
root). Same design, animations and behavior, rebuilt with:

- **Next.js 16** (App Router, TypeScript, static export — deployable to
  GitHub Pages or any static host, also works on Vercel)
- **Tailwind CSS v4** for design tokens, with the bespoke animation-critical
  CSS ported into `app/globals.css`
- **GSAP 3** via `@gsap/react` (ScrollTrigger, SplitText, ScrambleText,
  ScrollTo, CustomEase, Observer)
- **Three.js** for the hero particle field, work-list hover distortion and
  the about-section pixel-text effect
- **EmailJS + SweetAlert2** for the contact form (unchanged semantics)

## Structure

```
app/
  layout.tsx            fonts, metadata, global overlays
  page.tsx              Hero / Work / About / Contact
  works/[slug]/         one static page per project (lib/works-data.ts)
components/             all interactive sections ('use client')
lib/
  gsap.ts               one-time plugin registration + "custom" ease
  fx.ts                 WebGL capability gate + shared rAF ticker
  works-data.ts         the 9 portfolio projects
public/fonts, images    assets copied from the original site
```

## Commands

```bash
npm run dev     # dev server
npm run build   # static export into out/
npm run lint
```

Serve the export locally:

```bash
python3 -m http.server 8766 --directory out
```

"use client";

// Editorial hero: cycling display word (ScrambleText) + entrance, no preloader.
// Direct port of the original script.js hero block.
import { useRef } from "react";
import { gsap, useGSAP, SplitText, prefersReduced } from "@/lib/gsap";
import HeroParticles from "./HeroParticles";

const HERO_WORDS = [
  { word: "VISION", tagline: "Forging ahead with elite web designs." },
  { word: "CONCEPT", tagline: "Top-notch components, engineered with intent." },
  { word: "MOTION", tagline: "Interfaces that move, respond, and feel alive." },
  { word: "REALITY", tagline: "Bring your project to life, quicker than ever." },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    (context, contextSafe) => {
      const heroSection = sectionRef.current!;
      const heroWordEl = wordRef.current!;
      const heroTaglineEl = taglineRef.current!;
      const heroIndexEl = indexRef.current!;
      const reduced = prefersReduced();

      let heroWordIndex = 0;
      let heroCycleId: ReturnType<typeof setInterval> | null = null;
      let heroVisible = true;

      function swapHeroWord(nextIndex: number) {
        heroWordIndex = nextIndex % HERO_WORDS.length;
        const { word, tagline } = HERO_WORDS[heroWordIndex];
        heroIndexEl.textContent = String(heroWordIndex + 1).padStart(2, "0");

        gsap.to(heroWordEl, {
          duration: 1,
          scrambleText: { text: word, chars: "upperCase", speed: 0.4 },
          ease: "none",
          overwrite: "auto",
        });

        gsap.to(heroTaglineEl, {
          autoAlpha: 0,
          yPercent: -40,
          duration: 0.3,
          ease: "power2.in",
          overwrite: "auto",
          onComplete: () => {
            heroTaglineEl.textContent = tagline;
            gsap.fromTo(
              heroTaglineEl,
              { autoAlpha: 0, yPercent: 40 },
              { autoAlpha: 1, yPercent: 0, duration: 0.5, ease: "power3.out" }
            );
          },
        });
      }

      function stopHeroCycle() {
        if (heroCycleId) clearInterval(heroCycleId);
        heroCycleId = null;
      }

      function startHeroCycle() {
        stopHeroCycle();
        heroCycleId = setInterval(() => {
          if (!document.hidden && heroVisible) swapHeroWord(heroWordIndex + 1);
        }, 4500);
      }

      let io: IntersectionObserver | null = null;
      const onTitleEnter = () => {
        // Hovering the big word skips ahead (and resets the timer)
        if (heroCycleId) {
          swapHeroWord(heroWordIndex + 1);
          startHeroCycle();
        }
      };

      if (!reduced) {
        // Only tick while the hero is actually on screen
        io = new IntersectionObserver((entries) => {
          heroVisible = entries[0].isIntersecting;
        });
        io.observe(heroSection);
        titleRef.current!.addEventListener("pointerenter", onTitleEnter);
      }

      // Wheel-down over the hero nudges to the work section — only while
      // actually at the top of the page, so it can never hijack scrolling later
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY > 50 && window.scrollY < 10) {
          gsap.to(window, {
            scrollTo: { y: "#work", autoKill: true },
            duration: 1,
            ease: "custom",
          });
        }
      };
      heroSection.addEventListener("wheel", onWheel, { passive: true });

      // Entrance: reveal straight away once fonts are ready — no loading screen
      const finishHeroIntro = () => {
        document.dispatchEvent(new CustomEvent("rsx:loaded"));
        if (!reduced) startHeroCycle();
      };

      if (reduced) {
        finishHeroIntro();
      } else {
        const heroChrome = [
          ".hero-nav",
          ".hero-footer",
          ".hero-tagline",
          ".hero-eyebrow-label",
          ".hero-word-index",
        ];
        gsap.set(heroChrome, { autoAlpha: 0 });
        gsap.set(".hero-eyebrow-rule", { scaleX: 0 });
        gsap.set(heroWordEl, { autoAlpha: 0 });

        // Wait for the display font itself, not just fonts.ready — splitting
        // while a fallback font is rendered leaves the chars mis-measured
        Promise.all([
          document.fonts.load('bold 100px "Grifter"'),
          document.fonts.ready,
        ]).then(
          contextSafe!(() => {
            // No mask: Grifter's glyphs overflow their line boxes
            // (line-height 0.88), so masked chars get visibly cut while
            // rising. Fade + rise can't clip.
            const split = SplitText.create(heroWordEl, { type: "chars" });
            gsap.set(heroWordEl, { autoAlpha: 1 });

            gsap
              .timeline({ defaults: { ease: "custom" } })
              .from(
                split.chars,
                { yPercent: 60, autoAlpha: 0, duration: 1.1, stagger: 0.05 },
                0.15
              )
              .to(".hero-eyebrow-rule", { scaleX: 1, duration: 1.2 }, 0.25)
              .to(
                [".hero-eyebrow-label", ".hero-word-index"],
                { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
                0.6
              )
              .to(
                ".hero-tagline",
                { autoAlpha: 1, duration: 0.7, ease: "power2.out" },
                0.9
              )
              .to(
                [".hero-nav", ".hero-footer"],
                { autoAlpha: 1, duration: 0.7, ease: "power2.out" },
                1.0
              )
              .add(finishHeroIntro, 1.0)
              // Hand the word back as plain text so ScrambleText can take over
              .add(() => split.revert(), 1.8);
          })
        );
      }

      return () => {
        stopHeroCycle();
        io?.disconnect();
        titleRef.current?.removeEventListener("pointerenter", onTitleEnter);
        heroSection.removeEventListener("wheel", onWheel);
      };
    },
    { scope: sectionRef }
  );

  return (
    <header className="hero-background" ref={sectionRef}>
      <div className="hero" ref={heroRef}>
        <nav className="hero-nav">
          <p className="hero-brand">RSX</p>
        </nav>

        <div className="hero-stage">
          <div className="hero-eyebrow">
            <p className="hero-eyebrow-label">From</p>
            <span className="hero-eyebrow-rule" aria-hidden="true"></span>
            <p className="hero-word-index">
              <span ref={indexRef}>01</span>&nbsp;/&nbsp;04
            </p>
          </div>
          <h1 className="hero-title" ref={titleRef}>
            <span className="hero-word" ref={wordRef}>
              Vision
            </span>
          </h1>
          <p className="hero-tagline" ref={taglineRef}>
            Forging ahead with elite web designs.
          </p>
        </div>

        <div className="hero-footer"></div>
        <HeroParticles hostRef={heroRef} sectionRef={sectionRef} />
      </div>
    </header>
  );
}

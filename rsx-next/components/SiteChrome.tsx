"use client";

// Global overlays: scroll progress bar, film grain, custom cursor.
// Mirrors the original script.js cursor / progress logic.
import { useRef } from "react";
import { gsap, useGSAP, prefersReduced } from "@/lib/gsap";
import { webglGateFails } from "@/lib/fx";

export default function SiteChrome() {
  const progressRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Reveal-from-black: when we land here from a project page's exit sweep,
    // the inline layout script already covered us (html.rsx-returning). Drop
    // that class on the next painted frame so #black-transition's CSS top
    // transition sweeps it back up — continuous with the project's black.
    let returning = false;
    try {
      returning = sessionStorage.getItem("rsx-returning") === "1";
      if (returning) sessionStorage.removeItem("rsx-returning");
    } catch {}
    if (returning) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          document.documentElement.classList.remove("rsx-returning")
        )
      );
    } else {
      document.documentElement.classList.remove("rsx-returning");
    }

    // CSS fallbacks key off body.no-webgl (vignette instead of particles, …)
    if (webglGateFails()) document.body.classList.add("no-webgl");

    // Global Scroll Progress Track
    gsap.to(progressRef.current, {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

    // Custom cursor (desktop pointer devices only, additive to native cursor)
    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      prefersReduced()
    ) {
      return;
    }

    document.body.classList.add("has-cursor");
    const cursorDot = dotRef.current!;
    const cursorRing = ringRef.current!;

    const dotX = gsap.quickTo(cursorDot, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(cursorDot, "y", { duration: 0.12, ease: "power3" });
    const ringX = gsap.quickTo(cursorRing, "x", { duration: 0.5, ease: "power3" });
    const ringY = gsap.quickTo(cursorRing, "y", { duration: 0.5, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      if ((e.target as Element).closest("[data-cursor='view']")) {
        cursorRing.classList.add("is-view");
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element).closest("[data-cursor='view']")) {
        cursorRing.classList.remove("is-view");
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.body.classList.remove("has-cursor");
    };
  });

  return (
    <>
      <div className="scroll-progress" ref={progressRef} />
      <div className="grain" aria-hidden="true" />
      <div className="cursor-dot" aria-hidden="true" ref={dotRef} />
      <div className="cursor-ring" aria-hidden="true" ref={ringRef}>
        <span className="cursor-label">View</span>
      </div>
    </>
  );
}

"use client";

// One-time GSAP setup shared by every client component.
// All plugins are free since GSAP 3.13.
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Observer } from "gsap/Observer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    CustomEase,
    SplitText,
    ScrambleTextPlugin,
    ScrollToPlugin,
    Observer
  );
  // Signature ease used across the whole site
  if (!gsap.parseEase("custom")) {
    CustomEase.create("custom", ".87,0,.13,1");
  }
}

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, useGSAP, ScrollTrigger, SplitText };

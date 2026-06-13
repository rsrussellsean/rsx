"use client";

// "01 — Work" style labels with a rule that draws in on first scroll into view.
import { useRef } from "react";
import { gsap, useGSAP, prefersReduced } from "@/lib/gsap";

export default function SectionLabel({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReduced()) return;
      const label = ref.current!;
      gsap
        .timeline({
          scrollTrigger: { trigger: label, start: "top 85%", once: true },
        })
        .from(label.querySelector(".rule"), {
          scaleX: 0,
          duration: 0.8,
          ease: "power3.inOut",
        })
        .from(
          label.querySelector("p"),
          { autoAlpha: 0, x: -10, duration: 0.5 },
          "-=0.3"
        );
    },
    { scope: ref }
  );

  return (
    <div className="section-label" ref={ref}>
      <span className="rule"></span>
      <p>{text}</p>
    </div>
  );
}

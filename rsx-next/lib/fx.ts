"use client";

// WebGL accent infrastructure — port of webgl.js.
// A capability gate keeps low-end / touch / reduced-motion users on the
// CSS fallbacks (keyed off body.no-webgl), and one shared rAF ticker
// drives every active effect, pausing when nothing is on screen.
import * as THREE from "three";

export function webglGateFails(): boolean {
  if (typeof window === "undefined") return true;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(hover: none)").matches;
  if (reduced || coarse || window.innerWidth < 768) return true;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory && nav.deviceMemory < 4) return true;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4)
    return true;
  try {
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return true;
  } catch {
    return true;
  }
  return false;
}

export interface Effect {
  update(dt: number, t: number): void;
}

// ---------- Shared ticker: one rAF loop, runs only while effects are active ----------
const activeEffects = new Set<Effect>();
let rafId: number | null = null;
let lastT = 0;
let visListenerAttached = false;

function loop(t: number) {
  if (!activeEffects.size || document.hidden) {
    rafId = null;
    return;
  }
  rafId = requestAnimationFrame(loop);
  const dt = Math.min((t - lastT) / 1000, 0.05);
  lastT = t;
  activeEffects.forEach((fx) => fx.update(dt, t / 1000));
}

export function wake() {
  if (!rafId && activeEffects.size && !document.hidden) {
    lastT = performance.now();
    rafId = requestAnimationFrame(loop);
  }
}

export function addEffect(fx: Effect) {
  if (!visListenerAttached) {
    visListenerAttached = true;
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) wake();
    });
  }
  activeEffects.add(fx);
  wake();
}

export function removeEffect(fx: Effect) {
  activeEffects.delete(fx);
}

export function makeRenderer(width: number, height: number) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(width, height);
  return renderer;
}

export function debounce(fn: () => void, ms: number) {
  let id: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(id);
    id = setTimeout(fn, ms);
  };
}

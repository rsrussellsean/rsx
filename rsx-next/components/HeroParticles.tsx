"use client";

// Hero particle drift field — port of webgl.js initHeroParticles.
// Mounts its canvas into the .hero element once the hero entrance finishes
// (the original waited for the "rsx:loaded" event; we keep the same event).
import { useEffect, type RefObject } from "react";
import * as THREE from "three";
import {
  webglGateFails,
  makeRenderer,
  addEffect,
  removeEffect,
  debounce,
  type Effect,
} from "@/lib/fx";

export default function HeroParticles({
  hostRef,
  sectionRef,
}: {
  hostRef: RefObject<HTMLDivElement | null>;
  sectionRef: RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    if (webglGateFails()) return;

    let disposed = false;
    let cleanupScene: (() => void) | null = null;

    function init() {
      const host = hostRef.current;
      const heroSection = sectionRef.current;
      if (disposed || !host || !heroSection) return;

      const renderer = makeRenderer(host.clientWidth, host.clientHeight);
      renderer.domElement.classList.add("gl-hero");
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.prepend(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        50,
        host.clientWidth / host.clientHeight,
        0.1,
        100
      );
      camera.position.z = 12;

      const COUNT = 1500;
      const positions = new Float32Array(COUNT * 3);
      const seeds = new Float32Array(COUNT);
      const tints = new Float32Array(COUNT);

      for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 18;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 11;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
        seeds[i] = Math.random() * 100;
        // ~5% of particles pick up the brand accents
        tints[i] = Math.random() < 0.05 ? (Math.random() < 0.5 ? 1 : 2) : 0;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      geometry.setAttribute("aTint", new THREE.BufferAttribute(tints, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: { u_time: { value: 0 } },
        vertexShader: `
          uniform float u_time;
          attribute float aSeed;
          attribute float aTint;
          varying float vTint;
          varying float vAlpha;
          void main() {
            vTint = aTint;
            vec3 p = position;
            p.x += sin(u_time * 0.12 + aSeed) * 0.8;
            p.y += cos(u_time * 0.10 + aSeed * 1.7) * 0.6;
            p.z += sin(u_time * 0.08 + aSeed * 0.6) * 0.5;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = 30.0 / -mv.z;
            vAlpha = 0.12 + 0.08 * fract(aSeed);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying float vTint;
          varying float vAlpha;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float a = smoothstep(0.5, 0.1, length(c)) * vAlpha;
            vec3 col = vec3(1.0);
            if (vTint > 1.5) col = vec3(1.0, 0.0, 0.95);
            else if (vTint > 0.5) col = vec3(0.25, 0.2, 1.0);
            gl_FragColor = vec4(col, a);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      scene.add(new THREE.Points(geometry, material));

      const pointer = { x: 0, y: 0 };
      const onPointerMove = (e: PointerEvent) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      document.addEventListener("pointermove", onPointerMove);

      const fx: Effect = {
        update(_dt, t) {
          material.uniforms.u_time.value = t;
          camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04;
          camera.position.y += (-pointer.y * 0.4 - camera.position.y) * 0.04;
          renderer.render(scene, camera);
        },
      };

      // Render only while the hero is on screen
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          addEffect(fx);
        } else {
          removeEffect(fx);
        }
      });
      io.observe(heroSection);

      const onResize = debounce(() => {
        renderer.setSize(host.clientWidth, host.clientHeight);
        camera.aspect = host.clientWidth / host.clientHeight;
        camera.updateProjectionMatrix();
      }, 150);
      window.addEventListener("resize", onResize);

      cleanupScene = () => {
        io.disconnect();
        removeEffect(fx);
        document.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("resize", onResize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    // Particles wait for the hero entrance so they never compete with it
    document.addEventListener("rsx:loaded", init, { once: true });

    return () => {
      disposed = true;
      document.removeEventListener("rsx:loaded", init);
      cleanupScene?.();
    };
  }, [hostRef, sectionRef]);

  return null;
}

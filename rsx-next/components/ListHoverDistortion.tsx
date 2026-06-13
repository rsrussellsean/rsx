"use client";

// Work-list hover distortion plane — port of webgl.js initListHover.
// A cursor-following plane shows the hovered project's texture through a
// displacement + RGB-shift shader scaled by cursor velocity.
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

export default function ListHoverDistortion({
  listRef,
}: {
  listRef: RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    if (webglGateFails()) return;
    const listContainer = listRef.current;
    if (!listContainer) return;
    const items = Array.from(
      listContainer.querySelectorAll<HTMLElement>(".list-item")
    );
    if (!items.length) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene;
    let camera: THREE.OrthographicCamera;
    let mesh: THREE.Mesh;
    let uniforms: {
      u_tex: { value: THREE.Texture | null };
      u_vel: { value: number };
      u_alpha: { value: number };
    };
    const textures = new Map<HTMLElement, THREE.Texture>();
    let onResize: (() => void) | null = null;

    const state = {
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      vel: 0,
      opacity: 0,
      targetOpacity: 0,
    };

    // Built lazily on the first list-item hover
    function build() {
      renderer = makeRenderer(window.innerWidth, window.innerHeight);
      renderer.domElement.classList.add("gl-list");
      renderer.domElement.setAttribute("aria-hidden", "true");
      document.body.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 10);
      camera.position.z = 1;

      uniforms = {
        u_tex: { value: null },
        u_vel: { value: 0 },
        u_alpha: { value: 0 },
      };

      mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.ShaderMaterial({
          uniforms,
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D u_tex;
            uniform float u_vel;
            uniform float u_alpha;
            varying vec2 vUv;
            void main() {
              vec2 uv = vUv;
              uv.x += sin(uv.y * 6.28318) * u_vel * 0.03;
              uv.y += sin(uv.x * 6.28318) * u_vel * 0.015;
              float shift = u_vel * 0.012;
              float r = texture2D(u_tex, uv + vec2(shift, 0.0)).r;
              float g = texture2D(u_tex, uv).g;
              float b = texture2D(u_tex, uv - vec2(shift, 0.0)).b;
              gl_FragColor = vec4(r, g, b, u_alpha);
            }
          `,
          transparent: true,
        })
      );
      mesh.scale.set(440, 270, 1);
      scene.add(mesh);

      const loader = new THREE.TextureLoader();
      items.forEach((item) => {
        const img = item.querySelector("img");
        if (!img) return;
        const tex = loader.load(img.currentSrc || img.src);
        tex.colorSpace = THREE.SRGBColorSpace;
        textures.set(item, tex);
      });

      onResize = debounce(() => {
        if (!renderer) return;
        const rw = window.innerWidth;
        const rh = window.innerHeight;
        renderer.setSize(rw, rh);
        camera.left = -rw / 2;
        camera.right = rw / 2;
        camera.top = rh / 2;
        camera.bottom = -rh / 2;
        camera.updateProjectionMatrix();
      }, 150);
      window.addEventListener("resize", onResize);
    }

    const fx: Effect = {
      update() {
        state.x += (state.tx - state.x) * 0.08;
        state.y += (state.ty - state.y) * 0.08;
        state.vel *= 0.92;
        state.opacity += (state.targetOpacity - state.opacity) * 0.1;

        mesh.position.set(
          state.x - window.innerWidth / 2,
          window.innerHeight / 2 - state.y,
          0
        );
        uniforms.u_vel.value = state.vel;
        uniforms.u_alpha.value = state.opacity;
        renderer!.render(scene, camera);

        // Fully faded out: stop ticking
        if (state.targetOpacity === 0 && state.opacity < 0.01) {
          removeEffect(fx);
        }
      },
    };

    const onPointerMove = (e: PointerEvent) => {
      state.tx = e.clientX;
      state.ty = e.clientY;
      state.vel = Math.min(
        1.5,
        state.vel + (Math.abs(e.movementX) + Math.abs(e.movementY)) * 0.012
      );
    };
    listContainer.addEventListener("pointermove", onPointerMove);

    const enterHandlers = new Map<HTMLElement, (e: PointerEvent) => void>();
    const leaveHandlers = new Map<HTMLElement, () => void>();

    items.forEach((item) => {
      const onEnter = (e: PointerEvent) => {
        if (!renderer) build();
        const tex = textures.get(item);
        if (!tex) return;
        uniforms.u_tex.value = tex;
        state.targetOpacity = 1;
        state.tx = e.clientX;
        state.ty = e.clientY;
        if (state.opacity < 0.01) {
          state.x = e.clientX;
          state.y = e.clientY;
        }
        listContainer.classList.add("gl-hover");
        addEffect(fx);
      };
      const onLeave = () => {
        state.targetOpacity = 0;
        listContainer.classList.remove("gl-hover");
      };
      item.addEventListener("pointerenter", onEnter);
      item.addEventListener("pointerleave", onLeave);
      enterHandlers.set(item, onEnter);
      leaveHandlers.set(item, onLeave);
    });

    return () => {
      removeEffect(fx);
      listContainer.removeEventListener("pointermove", onPointerMove);
      items.forEach((item) => {
        item.removeEventListener("pointerenter", enterHandlers.get(item)!);
        item.removeEventListener("pointerleave", leaveHandlers.get(item)!);
      });
      if (onResize) window.removeEventListener("resize", onResize);
      textures.forEach((t) => t.dispose());
      if (renderer) {
        (mesh.material as THREE.Material).dispose();
        mesh.geometry.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, [listRef]);

  return null;
}

// RSX WebGL accents — hero particle field + work-list hover distortion.
// Plain script (no bundler), uses the global THREE (r155) loaded via CDN.
// A capability gate keeps low-end / touch / reduced-motion users on the
// CSS fallbacks (keyed off body.no-webgl).

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(hover: none)").matches;

  function gateFails() {
    if (typeof THREE === "undefined") return true;
    if (reduced || coarse || window.innerWidth < 768) return true;
    if (navigator.deviceMemory && navigator.deviceMemory < 4) return true;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4)
      return true;
    try {
      const probe = document.createElement("canvas");
      if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return true;
    } catch (e) {
      return true;
    }
    return false;
  }

  if (gateFails()) {
    document.body.classList.add("no-webgl");
    return;
  }

  // ---------- Shared ticker: one rAF loop, runs only while effects are active ----------
  const activeEffects = new Set();
  let rafId = null;
  let lastT = 0;

  function loop(t) {
    if (!activeEffects.size || document.hidden) {
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(loop);
    const dt = Math.min((t - lastT) / 1000, 0.05);
    lastT = t;
    activeEffects.forEach((fx) => fx.update(dt, t / 1000));
  }

  function wake() {
    if (!rafId && activeEffects.size && !document.hidden) {
      lastT = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) wake();
  });

  function makeRenderer(width, height) {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    return renderer;
  }

  function debounce(fn, ms) {
    let id;
    return () => {
      clearTimeout(id);
      id = setTimeout(fn, ms);
    };
  }

  // ---------- Hero particle drift field ----------
  function initHeroParticles() {
    const host = document.querySelector(".containerShuffle");
    const heroSection = document.querySelector(".hero-background");
    if (!host || !heroSection) return;

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
    document.addEventListener("pointermove", (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    });

    const fx = {
      update(dt, t) {
        material.uniforms.u_time.value = t;
        camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04;
        camera.position.y += (-pointer.y * 0.4 - camera.position.y) * 0.04;
        renderer.render(scene, camera);
      },
    };

    // Render only while the hero is on screen
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        activeEffects.add(fx);
        wake();
      } else {
        activeEffects.delete(fx);
      }
    }).observe(heroSection);

    window.addEventListener(
      "resize",
      debounce(() => {
        renderer.setSize(host.clientWidth, host.clientHeight);
        camera.aspect = host.clientWidth / host.clientHeight;
        camera.updateProjectionMatrix();
      }, 150)
    );
  }

  // ---------- Work-list hover distortion plane ----------
  function initListHover() {
    const listContainer = document.querySelector(".workListContainer");
    if (!listContainer) return;
    const items = Array.from(listContainer.querySelectorAll(".list-item"));
    if (!items.length) return;

    let renderer = null;
    let scene, camera, mesh, uniforms;
    const textures = new Map();

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

      window.addEventListener(
        "resize",
        debounce(() => {
          const rw = window.innerWidth;
          const rh = window.innerHeight;
          renderer.setSize(rw, rh);
          camera.left = -rw / 2;
          camera.right = rw / 2;
          camera.top = rh / 2;
          camera.bottom = -rh / 2;
          camera.updateProjectionMatrix();
        }, 150)
      );
    }

    const fx = {
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
        renderer.render(scene, camera);

        // Fully faded out: stop ticking
        if (state.targetOpacity === 0 && state.opacity < 0.01) {
          activeEffects.delete(fx);
        }
      },
    };

    listContainer.addEventListener("pointermove", (e) => {
      state.tx = e.clientX;
      state.ty = e.clientY;
      state.vel = Math.min(
        1.5,
        state.vel + (Math.abs(e.movementX) + Math.abs(e.movementY)) * 0.012
      );
    });

    items.forEach((item) => {
      item.addEventListener("pointerenter", (e) => {
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
        activeEffects.add(fx);
        wake();
      });

      item.addEventListener("pointerleave", () => {
        state.targetOpacity = 0;
        listContainer.classList.remove("gl-hover");
      });
    });
  }

  // Hero particles wait for the preloader so they never compete with it
  document.addEventListener("rsx:loaded", initHeroParticles, { once: true });
  initListHover();
})();

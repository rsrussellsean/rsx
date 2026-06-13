"use client";

// About section: Three.js pixel-displacement "RUSSELL" text, gradient blob,
// scrubbed title fill, bio reveal and the skills logo marquee.
// Direct port of the original script.js about block.
import { useRef } from "react";
import * as THREE from "three";
import { gsap, useGSAP, SplitText, prefersReduced } from "@/lib/gsap";
import SectionLabel from "./SectionLabel";

const SKILLS = [
  "react",
  "next",
  "angular",
  "node",
  "java",
  "js",
  "wordpress",
  "shopify",
  "figma",
  "photoshop",
];

const vertexShader = `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D u_texture;
  uniform vec2 u_mouse;
  uniform vec2 u_prevMouse;

  void main () {
      vec2 gridUV = floor(vUv * vec2(40.0, 40.0)) / vec2(40.0, 40.0);
      vec2 centerOfPixel = gridUV + vec2(1.0 / 40.0, 1.0 / 40.0);

      vec2 mouseDirection = u_mouse - u_prevMouse;
      vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
      float pixelDistanceToMouse = length(pixelToMouseDirection);
      float strength = smoothstep(0.3, 0.0, pixelDistanceToMouse);

      vec2 uvOffset = strength * -mouseDirection * 0.3;
      vec2 ux = vUv - uvOffset;

      vec4 color = texture2D(u_texture, ux);
      gl_FragColor = color;
  }
`;

function createTextTexture(
  text: string,
  font: string,
  size: number | null,
  color: string,
  fontWeight = "100"
) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const canvasWidth = window.innerWidth * 2;
  const canvasHeight = window.innerHeight * 2;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.fillStyle = color || "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const fontSize = size || 600;
  ctx.fillStyle = "#ffffff";
  ctx.font = `${fontWeight} ${fontSize}px "${font || "MADERegular"}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;

  const scaleFactor = Math.min(1, (canvasWidth * 1) / textWidth);
  const aspectCorrection = canvasWidth / canvasHeight;

  ctx.setTransform(
    scaleFactor,
    0,
    0,
    scaleFactor / aspectCorrection,
    canvasWidth / 2,
    canvasHeight / 2
  );

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = fontSize * 0.005;

  for (let i = 0; i < 3; i++) {
    ctx.strokeText(text, 0, 0);
  }

  ctx.fillText(text, 0, 0);

  return new THREE.CanvasTexture(canvas);
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const skillsTrackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (context, contextSafe) => {
      const reduced = prefersReduced();
      const textContainer = textContainerRef.current!;
      const aboutSection = sectionRef.current!;

      // ----- Three.js pixel-text RUSSELL effect -----
      let easeFactor = 0.02;
      let scene: THREE.Scene | null = null;
      let camera: THREE.OrthographicCamera | null = null;
      let renderer: THREE.WebGLRenderer | null = null;
      let planeMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null =
        null;
      const mousePosition = { x: 0.5, y: 0.5 };
      let targetMousePosition = { x: 0.5, y: 0.5 };
      let prevPosition = { x: 0.5, y: 0.5 };

      let aboutSceneInit = false;
      let aboutInView = false;
      let aboutRafId: number | null = null;

      function initializeScene(texture: THREE.Texture) {
        scene = new THREE.Scene();

        const aspectRatio = window.innerWidth / window.innerHeight;

        camera = new THREE.OrthographicCamera(
          -1,
          1,
          1 / aspectRatio,
          -1 / aspectRatio,
          0.1,
          1000
        );
        camera.position.z = 1;

        planeMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(2, 2),
          new THREE.ShaderMaterial({
            uniforms: {
              u_mouse: { value: new THREE.Vector2() },
              u_prevMouse: { value: new THREE.Vector2() },
              u_texture: { value: texture },
            },
            vertexShader,
            fragmentShader,
          })
        );

        scene.add(planeMesh);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(0xffffff, 1);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        textContainer.appendChild(renderer.domElement);
      }

      function reloadTexture() {
        if (!planeMesh) return;
        const newTexture = createTextTexture(
          "RUSSELL",
          "MADERegular",
          null,
          "transparent",
          "100"
        );
        planeMesh.material.uniforms.u_texture.value = newTexture;
      }

      function renderAboutFrame() {
        if (!aboutInView || document.hidden) {
          aboutRafId = null;
          return;
        }
        aboutRafId = requestAnimationFrame(renderAboutFrame);

        mousePosition.x += (targetMousePosition.x - mousePosition.x) * easeFactor;
        mousePosition.y += (targetMousePosition.y - mousePosition.y) * easeFactor;

        planeMesh!.material.uniforms.u_mouse.value.set(
          mousePosition.x,
          1.0 - mousePosition.y
        );

        planeMesh!.material.uniforms.u_prevMouse.value.set(
          prevPosition.x,
          1.0 - prevPosition.y
        );

        renderer!.render(scene!, camera!);
      }

      function showRussellFallback() {
        textContainer.innerHTML = '<p class="russell-fallback">RUSSELL</p>';
      }

      function resumeAboutScene() {
        if (!aboutSceneInit) {
          aboutSceneInit = true;
          try {
            initializeScene(
              createTextTexture("RUSSELL", "MADERegular", null, "transparent", "100")
            );
          } catch (err) {
            console.warn("WebGL unavailable for about scene:", err);
            showRussellFallback();
            return;
          }
        }
        if (renderer && !aboutRafId) renderAboutFrame();
      }

      let aboutIO: IntersectionObserver | null = null;
      const onVisChange = () => {
        if (!document.hidden && aboutInView) resumeAboutScene();
      };

      if (reduced) {
        showRussellFallback();
      } else {
        // Lazy-init when the about section nears the viewport, render only
        // while it's in view and the tab is visible
        aboutIO = new IntersectionObserver(
          (entries) => {
            aboutInView = entries[0].isIntersecting;
            if (aboutInView && !document.hidden) {
              document.fonts.ready.then(resumeAboutScene);
            }
          },
          { rootMargin: "100% 0px" }
        );
        aboutIO.observe(aboutSection);
        document.addEventListener("visibilitychange", onVisChange);
      }

      const handleMouseMove = (event: MouseEvent) => {
        easeFactor = 0.04;
        const rect = textContainer.getBoundingClientRect();
        prevPosition = { ...targetMousePosition };

        targetMousePosition.x = (event.clientX - rect.left) / rect.width;
        targetMousePosition.y = (event.clientY - rect.top) / rect.height;
      };

      const handleMouseEnter = (event: MouseEvent) => {
        easeFactor = 0.02;
        const rect = textContainer.getBoundingClientRect();

        mousePosition.x = targetMousePosition.x =
          (event.clientX - rect.left) / rect.width;
        mousePosition.y = targetMousePosition.y =
          (event.clientY - rect.top) / rect.height;
      };

      const handleMouseLeave = () => {
        easeFactor = 0.02;
        targetMousePosition = { ...prevPosition };
      };

      textContainer.addEventListener("mousemove", handleMouseMove);
      textContainer.addEventListener("mouseenter", handleMouseEnter);
      textContainer.addEventListener("mouseleave", handleMouseLeave);

      const onWindowResize = () => {
        if (!renderer || !camera) return;
        const aspectRatio = window.innerWidth / window.innerHeight;
        camera.left = -1;
        camera.right = 1;
        camera.top = 1 / aspectRatio;
        camera.bottom = -1 / aspectRatio;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        reloadTexture();
      };
      window.addEventListener("resize", onWindowResize, false);

      // ----- Hovering the canvas cycles the title through fonts -----
      const text = titleRef.current!;
      const onSkillsEnter = () => text.classList.add("animate-font");
      const onSkillsLeave = () => text.classList.remove("animate-font");
      textContainer.addEventListener("mouseenter", onSkillsEnter);
      textContainer.addEventListener("mouseleave", onSkillsLeave);

      // ----- Reveals — split only after fonts load so masks measure correctly -----
      document.fonts.ready.then(
        contextSafe!(() => {
          const aboutTitleEl = titleRef.current;
          if (aboutTitleEl && !reduced) {
            // Scrubbed char fill: dim chars brighten as the section scrolls in
            const fillSplit = SplitText.create(aboutTitleEl, {
              type: "chars",
              charsClass: "char-fill",
            });
            gsap.to(fillSplit.chars, {
              opacity: 1,
              stagger: 0.04,
              ease: "none",
              scrollTrigger: {
                trigger: aboutSection,
                start: "top 75%",
                end: "top 30%",
                scrub: true,
              },
            });
          }

          const aboutBio = bioRef.current;
          if (aboutBio && !reduced) {
            const bioSplit = SplitText.create(aboutBio, {
              type: "lines",
              mask: "lines",
            });
            gsap.from(bioSplit.lines, {
              yPercent: 100,
              duration: 0.8,
              stagger: 0.07,
              ease: "power4.out",
              scrollTrigger: {
                trigger: ".skillsContainer",
                start: "top 80%",
                once: true,
              },
            });
          }
        })
      );

      // ----- Infinite skills logo marquee -----
      if (skillsTrackRef.current && !reduced) {
        gsap.to(skillsTrackRef.current, {
          xPercent: -50,
          repeat: -1,
          duration: 28,
          ease: "none",
        });
      }

      // ----- Gradient blob follows the cursor with an idle pulse -----
      const cursor = blobRef.current!;
      gsap.set(cursor, { xPercent: -50, yPercent: -50, x: 15, y: 0 });
      if (!reduced) {
        gsap.to(cursor, {
          scale: 1.08,
          duration: 4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });

      const onDocMouseMove = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };
      document.addEventListener("mousemove", onDocMouseMove);

      return () => {
        aboutIO?.disconnect();
        document.removeEventListener("visibilitychange", onVisChange);
        document.removeEventListener("mousemove", onDocMouseMove);
        window.removeEventListener("resize", onWindowResize);
        textContainer.removeEventListener("mousemove", handleMouseMove);
        textContainer.removeEventListener("mouseenter", handleMouseEnter);
        textContainer.removeEventListener("mouseleave", handleMouseLeave);
        textContainer.removeEventListener("mouseenter", onSkillsEnter);
        textContainer.removeEventListener("mouseleave", onSkillsLeave);
        if (aboutRafId) cancelAnimationFrame(aboutRafId);
        aboutInView = false;
        if (renderer) {
          planeMesh?.geometry.dispose();
          planeMesh?.material.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        }
      };
    },
    { scope: sectionRef }
  );

  // In-page anchors scroll via GSAP (CSS smooth scrolling is off — it breaks
  // ScrollTrigger position measurements)
  const handleContactAnchor = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    gsap.to(window, {
      scrollTo: { y: "#contactPage", autoKill: true },
      duration: prefersReduced() ? 0 : 1,
      ease: "custom",
    });
  };

  return (
    <section className="aboutSection" ref={sectionRef}>
      <SectionLabel text="02 — About" />
      {/* Gradient */}
      <div className="blob" ref={blobRef}></div>
      <div id="textContainer" ref={textContainerRef}></div>
      <h2 className="about-title">
        <span className="change-text about-title-display" ref={titleRef}>
          Creative Developer
        </span>
      </h2>

      <div className="skillsContainer">
        <div className="descriptionContainer">
          <p className="about-bio" ref={bioRef}>
            A Filipino creative developer turning bold visions into elite,
            immersive web experiences.
          </p>
          <a href="#contactPage" onClick={handleContactAnchor}>
            Let&apos;s Create Together
            <span>
              <img src="/images/arrow.png" alt="" />
            </span>
          </a>
        </div>
        <div className="myskillsContainer">
          <p>my skills</p>
          <div
            className="skills-marquee"
            aria-label="Skills: React, Next.js, Angular, Node, Java, JavaScript, WordPress, Shopify, Figma, Photoshop"
          >
            <div className="skills-track" aria-hidden="true" ref={skillsTrackRef}>
              {[...SKILLS, ...SKILLS].map((s, i) => (
                <img src={`/images/skills/${s}.png`} alt="" key={`${s}-${i}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

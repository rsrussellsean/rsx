//work JS
gsap.registerPlugin(
  ScrollTrigger,
  CustomEase,
  SplitText,
  ScrambleTextPlugin,
  ScrollToPlugin,
  Observer
);

const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// Global Scroll Progress Track
gsap.to(".scroll-progress", {
  width: "100%",
  ease: "none",
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  },
});

window.addEventListener("load", function () {
  const slides = gsap.utils.toArray(".slide");
  const activeSlideImages = gsap.utils.toArray(".active-slide img");

  const intro = document.querySelector(".intro");
  const outro = document.querySelector(".outro");
  const container = document.querySelector(".workContainer");
  const slider = document.querySelector(".slider");
  const workListContainer = document.querySelector(".workListContainer");

  let workCtx; // We will hold the GSAP context here to easily revert the whole 3D container
  let slideTitleSplits = [];

  function initAnimatedView() {
    // Revert any leftover SplitText from a previous init (context doesn't track them)
    slideTitleSplits.forEach((s) => s.revert());
    slideTitleSplits = [];

    workCtx = gsap.context(() => {
      // Dynamically set container height based on slides
      const totalSlides = slides.length;
      const vhPerSlide = 60; // adjust as needed
      container.style.height = `${totalSlides * vhPerSlide}vh`;

      // Pre-build one setter bundle per slide — zero tween allocation per tick
      const setters = slides.map((slide, index) => {
        gsap.set(slide, { clearProps: "all" });
        if (activeSlideImages[index]) {
          gsap.set(activeSlideImages[index], { clearProps: "all" });
        }
        gsap.set(slide, { xPercent: -50, yPercent: -50 });

        const img = slide.querySelector(".slide-img img");
        if (img) gsap.set(img, { scale: 1.15 });

        const title = slide.querySelector(".slide-copy p:first-child");
        let titleTween = null;
        if (title && !prefersReduced) {
          const split = SplitText.create(title, { type: "chars" });
          slideTitleSplits.push(split);
          titleTween = gsap.from(split.chars, {
            opacity: 0,
            yPercent: 40,
            stagger: 0.02,
            duration: 0.6,
            ease: "power3.out",
            paused: true,
          });
        }

        return {
          z: gsap.quickSetter(slide, "z", "px"),
          rotateY: gsap.quickSetter(slide, "rotateY", "deg"),
          opacity: gsap.quickSetter(slide, "opacity"),
          bgOpacity: activeSlideImages[index]
            ? gsap.quickSetter(activeSlideImages[index], "opacity")
            : null,
          imgY: img ? gsap.quickSetter(img, "yPercent") : null,
          dir: slide.offsetLeft < window.innerWidth / 2 ? 1 : -1,
          titleTween,
        };
      });

      const applyProgress = () => {
        const zIncrement = progressProxy.p * 13000;
        setters.forEach((s, index) => {
          const z = -12000 + index * 1500 + zIncrement;
          s.z(z);
          // Tilt toward viewport center while approaching, flatten at the camera
          s.rotateY(s.dir * gsap.utils.clamp(-4, 4, (-z / 3000) * 4));
          // Fade in while approaching, fade out as the slide flies past the
          // camera — past ~600px it crosses the CSS perspective eye-plane and
          // renders as a giant distorted fragment
          const fadeIn = gsap.utils.mapRange(-3500, -1500, 0, 1, z);
          const fadeOut = gsap.utils.mapRange(150, 450, 1, 0, z);
          s.opacity(gsap.utils.clamp(0, 1, Math.min(fadeIn, fadeOut)));
          // Background image hands off as its slide passes the camera
          if (s.bgOpacity) {
            s.bgOpacity(
              gsap.utils.clamp(0, 1, gsap.utils.mapRange(600, 100, 0, 1, z))
            );
          }
          if (s.imgY) s.imgY(gsap.utils.clamp(-6, 6, -z / 1500));
          if (s.titleTween) {
            if (z > -1500 && z < 500) {
              s.titleTween.play();
            } else {
              s.titleTween.reverse();
            }
          }
        });
      };

      const progressProxy = { p: 0 };
      const progressTo = gsap.quickTo(progressProxy, "p", {
        duration: 0.6,
        ease: "power3.out",
        onUpdate: applyProgress,
      });

      applyProgress();

      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => progressTo(self.progress),
      });
    }, container);
  }

  // List view reveals: one code path for both scroll and toggle entrance
  let listCtx;

  function initListReveals() {
    listCtx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set(".list-item", { opacity: 1, y: 0 });
        return;
      }
      ScrollTrigger.batch(".list-item", {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.06,
            overwrite: true,
          }),
      });
    }, workListContainer);
  }

  // Init the 3D scroll animations on load
  initAnimatedView();

  // Toggle View Logic for Work Section
  const btnAnimated = document.getElementById("btn-animated-view");
  const btnList = document.getElementById("btn-list-view");
  const toggleThumb = document.querySelector(".toggle-thumb");

  function moveThumb(btn, animate = true) {
    if (!toggleThumb) return;
    gsap.to(toggleThumb, {
      x: btn.offsetLeft,
      width: btn.offsetWidth,
      duration: animate && !prefersReduced ? 0.45 : 0,
      ease: "power3.inOut",
    });
  }

  function setActiveButton(activeBtn, inactiveBtn) {
    activeBtn.classList.add("active");
    activeBtn.setAttribute("aria-pressed", "true");
    inactiveBtn.classList.remove("active");
    inactiveBtn.setAttribute("aria-pressed", "false");
    moveThumb(activeBtn);
  }

  if (btnAnimated && btnList) {
    btnList.addEventListener("click", () => {
      // Don't do anything if already active
      if (btnList.classList.contains("active")) return;

      setActiveButton(btnList, btnAnimated);
      localStorage.setItem("rsx-work-view", "list");
      document.querySelector(".nav2")?.classList.add("is-hidden");

      // Cleanup: revert the GSAP context to kill triggers & clear inline styles
      if (workCtx) {
        workCtx.revert();
      }

      // Hide 3D view containers, show List view
      gsap.to([container, slider], {
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          container.style.display = "none";
          slider.style.display = "none";
          workListContainer.style.display = "flex";

          gsap.fromTo(
            workListContainer,
            { opacity: 0 },
            { opacity: 1, duration: 0.4 }
          );

          ScrollTrigger.refresh();
          initListReveals();
        },
      });
    });

    btnAnimated.addEventListener("click", () => {
      if (btnAnimated.classList.contains("active")) return;

      setActiveButton(btnAnimated, btnList);
      localStorage.setItem("rsx-work-view", "animated");
      document.querySelector(".nav2")?.classList.remove("is-hidden");

      // Hide List view, show 3D view
      gsap.to(workListContainer, {
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          if (listCtx) {
            listCtx.revert();
          }
          workListContainer.style.display = "none";
          container.style.display = "block";
          slider.style.display = "block";

          gsap.fromTo(
            [container, slider],
            { opacity: 0 },
            { opacity: 1, duration: 0.4 }
          );

          // Re-initialize 3D ScrollTriggers
          initAnimatedView();
          ScrollTrigger.refresh();
        },
      });
    });

    // Restore persisted view choice; position the thumb either way
    if (localStorage.getItem("rsx-work-view") === "list") {
      btnList.click();
    } else {
      moveThumb(btnAnimated, false);
    }
  }
});

// Wheel-down over the hero nudges to the work section — only while actually
// at the top of the page, so it can never hijack scrolling later
document.querySelector(".intro-wrapper").addEventListener(
  "wheel",
  (e) => {
    if (
      e.deltaY > 50 &&
      window.scrollY < 10 &&
      !document.body.classList.contains("no-scroll")
    ) {
      gsap.to(window, {
        scrollTo: { y: "#work", autoKill: true },
        duration: 1,
        ease: "custom",
      });
    }
  },
  { passive: true }
);

// Font shuffle animation
const subHeaders = [
  "forging ahead with elite web designs.",
  "top-notch web design components.",
  "take the fast lane to mastery.",
  "bring your projects to life, quicker than ever.",
];

const items = document.querySelectorAll("#item-1, #item-2, #item-3, #item-4");
const placeholder = document.querySelector(".placeholder");
const subheader = document.querySelector("#subheader");

function changeColors() {
  gsap.to(".containerShuffle", { backgroundColor: "white", duration: 0.5 });
  gsap.to(".placeholder, nav, footer, p", {
    color: "#000",
    duration: 0.5,
  });
}

function revertColors() {
  gsap.to(".containerShuffle", { backgroundColor: "#000", duration: 0.5 });
  gsap.to(".placeholder, nav, footer, p", {
    color: "#fff",
    duration: 0.5,
  });
}
items.forEach((item) => {
  item.addEventListener("mouseover", changeColors);
  item.addEventListener("mouseout", revertColors);
});

function animateScale(element, scaleValue) {
  gsap.fromTo(
    element,
    { scale: 1 },
    { scale: scaleValue, duration: 2, ease: "power1.out" }
  );
}

function scrambleTo(finalText) {
  if (prefersReduced) {
    placeholder.textContent = finalText;
    return;
  }
  gsap.to(placeholder, {
    duration: 1.1,
    scrambleText: {
      text: finalText,
      chars: "upperCase",
      speed: 0.4,
    },
    ease: "none",
    overwrite: "auto",
  });
}

function updatePlaceholderText(event) {
  const newText = event.target.textContent.toUpperCase();
  const itemIndex = Array.from(items).indexOf(event.target);
  const newSubHeaderText = subHeaders[itemIndex].toUpperCase();

  subheader.textContent = newSubHeaderText;
  animateScale(placeholder, 1.25);
  scrambleTo(newText);
}

function restPlaceholderText() {
  const defaultText = "VISION";
  const defaultSubHeaderText = "From";

  subheader.textContent = defaultSubHeaderText;
  animateScale(placeholder, 1.25);
  scrambleTo(defaultText);
}

items.forEach((item) => {
  item.addEventListener("mouseover", updatePlaceholderText);
  item.addEventListener("mouseout", restPlaceholderText);
});

function heroTextReveal() {
  if (prefersReduced) return;
  const split = SplitText.create("#subheader", {
    type: "lines",
    mask: "lines",
  });
  gsap.from(split.lines, {
    yPercent: 100,
    duration: 0.9,
    stagger: 0.08,
    ease: "power4.out",
    onComplete: () => split.revert(),
  });
}

const customEase = CustomEase.create("custom", ".87,0,.13,1");
const counter = document.getElementById("counter");

// Always show intro-wrapper no matter what
const introWrapper = document.querySelector(".intro-wrapper");
if (introWrapper) {
  introWrapper.style.display = "block";
  introWrapper.style.opacity = "1";
  introWrapper.style.visibility = "visible";
}

// Check if URL has #work
const isDirectToWork = window.location.hash === "#work";

const finishPreloader = () => {
  document.body.classList.remove("no-scroll");
  document.dispatchEvent(new CustomEvent("rsx:loaded"));
};

if (isDirectToWork || prefersReduced) {
  // Skip the intro: set final states, unlock scroll immediately
  gsap.set(".loadingContainer", {
    scale: 1,
    rotation: 0,
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  });
  gsap.set(".hero", {
    opacity: 1,
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  });
  gsap.set(".progress-bar", { opacity: 0 });
  finishPreloader();
} else {
  // Compressed preloader (~3s total): strip opens, counter runs, full reveal
  document.body.classList.add("no-scroll");

  gsap.set(".loadingContainer", {
    scale: 0,
    rotation: -20,
  });

  gsap
    .timeline({
      defaults: { ease: customEase },
      onComplete: finishPreloader,
    })
    .to(
      ".hero",
      { clipPath: "polygon(0% 45%, 25% 45%, 25% 55%, 0% 55%)", duration: 0.8 },
      0.2
    )
    .to(
      ".hero",
      { clipPath: "polygon(0% 45%, 100% 45%, 100% 55%, 0% 55%)", duration: 1.2 },
      1.0
    )
    .to(".progress-bar", { width: "100vw", duration: 1.2 }, 1.0)
    .to(counter, { innerHTML: 100, duration: 1.2, snap: { innerHTML: 1 } }, 1.0)
    .to(
      ".loadingContainer",
      {
        scale: 1,
        rotation: 0,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 0.8,
      },
      2.2
    )
    .to(
      ".hero",
      { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 0.8 },
      2.2
    )
    .to(".progress-bar", { opacity: 0, duration: 0.3 }, 2.3)
    .add(() => {
      scrambleTo("VISION");
      heroTextReveal();
    }, 2.3);
}

// Scroll hint: appears once the preloader finishes, fades on first scroll
const scrollHint = document.querySelector(".scroll-hint");
if (scrollHint && !prefersReduced) {
  gsap.set(scrollHint, { autoAlpha: 0 });

  document.addEventListener(
    "rsx:loaded",
    () => {
      gsap.to(scrollHint, { autoAlpha: 1, duration: 0.6 });
      gsap.to(scrollHint, {
        opacity: 0.35,
        duration: 1.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.6,
      });
    },
    { once: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      gsap.to(scrollHint, { autoAlpha: 0, duration: 0.4, overwrite: true });
    },
    { once: true, passive: true }
  );
}

// About me JS
const textContainer = document.getElementById("textContainer");
let easeFactor = 0.02;
let scene, camera, renderer, planeMesh;
let mousePosition = { x: 0.5, y: 0.5 };
let targetMousePosition = { x: 0.5, y: 0.5 };
let prevPosition = { x: 0.5, y: 0.5 };

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

function createTextTexture(text, font, size, color, fontWeight = "100") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const canvasWidth = window.innerWidth * 2;
  const canvasHeight = window.innerHeight * 2;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.fillStyle = color || "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // const fontSize = size || Math.floor(canvasWidth * 2);
  const fontSize = size || 600; // sets font size to 200px
  //font color
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
  // ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = fontSize * 0.005;

  for (let i = 0; i < 3; i++) {
    ctx.strokeText(text, 0, 0);
  }

  ctx.fillText(text, 0, 0);

  return new THREE.CanvasTexture(canvas);
}
function initializeScene(texture) {
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
  let shaderUniforms = {
    u_mouse: { type: "v2", value: new THREE.Vector2() },
    u_prevMouse: { type: "v2", value: new THREE.Vector2() },
    u_texture: { type: "t", value: texture },
  };

  planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: shaderUniforms,
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
  const newTexture = createTextTexture(
    "RUSSELL",
    "MADERegular",
    null,
    "transparent",
    "100"
  );

  planeMesh.material.uniforms.u_texture.value = newTexture;
}

// Lifecycle: lazy-init when the about section nears the viewport, render only
// while it's in view and the tab is visible
let aboutSceneInit = false;
let aboutInView = false;
let aboutRafId = null;

function renderAboutFrame() {
  if (!aboutInView || document.hidden) {
    aboutRafId = null;
    return;
  }
  aboutRafId = requestAnimationFrame(renderAboutFrame);

  mousePosition.x += (targetMousePosition.x - mousePosition.x) * easeFactor;
  mousePosition.y += (targetMousePosition.y - mousePosition.y) * easeFactor;

  planeMesh.material.uniforms.u_mouse.value.set(
    mousePosition.x,
    1.0 - mousePosition.y
  );

  planeMesh.material.uniforms.u_prevMouse.value.set(
    prevPosition.x,
    1.0 - prevPosition.y
  );

  renderer.render(scene, camera);
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

const aboutSection = document.querySelector(".aboutSection");
if (textContainer && aboutSection) {
  if (prefersReduced || typeof THREE === "undefined") {
    showRussellFallback();
  } else {
    new IntersectionObserver(
      (entries) => {
        aboutInView = entries[0].isIntersecting;
        if (aboutInView && !document.hidden) {
          document.fonts.ready.then(resumeAboutScene);
        }
      },
      { rootMargin: "100% 0px" }
    ).observe(aboutSection);

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && aboutInView) resumeAboutScene();
    });
  }
}

textContainer.addEventListener("mousemove", handleMouseMove);
textContainer.addEventListener("mouseenter", handleMouseEnter);
textContainer.addEventListener("mouseleave", handleMouseLeave);

function handleMouseMove(event) {
  easeFactor = 0.04;
  let rect = textContainer.getBoundingClientRect();
  prevPosition = { ...targetMousePosition };

  targetMousePosition.x = (event.clientX - rect.left) / rect.width;
  targetMousePosition.y = (event.clientY - rect.top) / rect.height;
}

function handleMouseEnter(event) {
  easeFactor = 0.02;
  let rect = textContainer.getBoundingClientRect();

  mousePosition.x = targetMousePosition.x =
    (event.clientX - rect.left) / rect.width;
  mousePosition.y = targetMousePosition.y =
    (event.clientY - rect.top) / rect.height;
}

function handleMouseLeave() {
  easeFactor = 0.02;
  targetMousePosition = { ...prevPosition };
}

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  if (!renderer) return;
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera.left = -1;
  camera.right = 1;
  camera.top = 1 / aspectRatio;
  camera.bottom = -1 / aspectRatio;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  reloadTexture();
}

// About section reveals — split only after fonts load so masks measure correctly
document.fonts.ready.then(() => {
const aboutTitleEl = document.querySelector(".change-text");
if (aboutTitleEl && !prefersReduced) {
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
      trigger: ".aboutSection",
      start: "top 75%",
      end: "top 30%",
      scrub: true,
    },
  });

  gsap.from(".about-title-serif", {
    autoAlpha: 0,
    yPercent: 60,
    duration: 0.9,
    ease: "power4.out",
    scrollTrigger: { trigger: ".aboutSection", start: "top 70%", once: true },
  });
}

const aboutBio = document.querySelector(".about-bio");
if (aboutBio && !prefersReduced) {
  const bioSplit = SplitText.create(aboutBio, { type: "lines", mask: "lines" });
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
}); // end fonts.ready (about reveals)

// Infinite skills logo marquee
const skillsTrack = document.querySelector(".skills-track");
if (skillsTrack && !prefersReduced) {
  gsap.to(skillsTrack, {
    xPercent: -50,
    repeat: -1,
    duration: 28,
    ease: "none",
  });
}

// Cursor Optimization using gsap.quickTo for true 60fps performance
var cursor = document.querySelector(".blob");

// Keep the blob centered on its translation point and give it an idle pulse
gsap.set(cursor, { xPercent: -50, yPercent: -50, x: 15, y: 0 });
if (!prefersReduced) {
  gsap.to(cursor, {
    scale: 1.08,
    duration: 4,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
}

let xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" }),
    yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });

document.addEventListener("mousemove", function (e) {
  xTo(e.clientX);
  yTo(e.clientY);
});

const skills = document.querySelector("#textContainer");
const text = document.querySelector(".change-text");

skills.addEventListener("mouseenter", () => {
  text.classList.add("animate-font");
});
skills.addEventListener("mouseleave", () => {
  text.classList.remove("animate-font");
});

// Contact Page
const wrapper = document.querySelector(".tracker");
const emoji = document.querySelector(".emoji");
const emojiFace = document.querySelector(".emoji-face");

const moveEvent = (e) => {
  const emojiRect = emoji.getBoundingClientRect();

  const relX = e.clientX - (emojiRect.left + emojiRect.width / 2);
  const relY = e.clientY - (emojiRect.top + emojiRect.height / 2);

  // Reduced displacement for subtler movement
  const emojiMaxDisplacement = 20;
  const emojiFaceMaxDisplacement = 30;

  const emojiDisplacementX = (relX / emojiRect.width) * emojiMaxDisplacement;
  const emojiDisplacementY = (relY / emojiRect.height) * emojiMaxDisplacement;

  const emojiFaceDisplacementX =
    (relX / emojiRect.width) * emojiFaceMaxDisplacement;
  const emojiFaceDisplacementY =
    (relY / emojiRect.height) * emojiFaceMaxDisplacement;

  gsap.to(emoji, {
    x: emojiDisplacementX,
    y: emojiDisplacementY,
    ease: "power3.out",
    duration: 0.3,
  });

  gsap.to(emojiFace, {
    x: emojiFaceDisplacementX,
    y: emojiFaceDisplacementY,
    ease: "power3.out",
    duration: 0.3,
  });
};

const leaveEvent = () => {
  gsap.to([emoji, emojiFace], {
    x: 0,
    y: 0,
    ease: "power3.out",
    duration: 0.6,
  });
};

wrapper.addEventListener("mousemove", moveEvent);
wrapper.addEventListener("mouseleave", leaveEvent);

// Contact entrance reveals — split only after fonts load
document.fonts.ready.then(() => {
  const contactTitle = document.querySelector(".contact-title p");
  if (!contactTitle || prefersReduced) return;

  const ctSplit = SplitText.create(contactTitle, {
    type: "lines",
    mask: "lines",
  });
  gsap.from(ctSplit.lines, {
    yPercent: 100,
    duration: 0.9,
    stagger: 0.08,
    ease: "power4.out",
    scrollTrigger: {
      trigger: ".contact-container",
      start: "top 70%",
      once: true,
    },
  });

  gsap.from(".emoji", {
    scale: 0.6,
    autoAlpha: 0,
    duration: 0.9,
    ease: "back.out(1.4)",
    scrollTrigger: { trigger: ".contactSection", start: "top 60%", once: true },
  });
});

// Magnetic send button
const sendBtn = document.querySelector(".sendButton");
if (
  sendBtn &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !prefersReduced
) {
  const btnX = gsap.quickTo(sendBtn, "x", { duration: 0.4, ease: "power3" });
  const btnY = gsap.quickTo(sendBtn, "y", { duration: 0.4, ease: "power3" });

  sendBtn.addEventListener("mousemove", (e) => {
    const rect = sendBtn.getBoundingClientRect();
    btnX((e.clientX - (rect.left + rect.width / 2)) * 0.35);
    btnY((e.clientY - (rect.top + rect.height / 2)) * 0.35);
  });

  sendBtn.addEventListener("mouseleave", () => {
    gsap.to(sendBtn, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.4)",
      overwrite: true,
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Check if EmailJS is loaded
  if (typeof emailjs === "undefined") {
    console.error(
      "EmailJS is not loaded. Please include the EmailJS script before this one."
    );
    return;
  }

  // Initialize EmailJS with your public key
  emailjs.init("yJzaHnW-3TbbFF3Hh");

  // Get the contact form
  const contactForm = document.getElementById("contact-form");

  if (!contactForm) {
    console.error("Contact form not found.");
    return;
  }

  // Handle form submission
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("Submit event triggered.");

    // Validate email input before sending
    const email = this.elements["from_email"].value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
      });
      console.log("Invalid email:", email);
      return; // Stop form submission if email is invalid
    }

    // Show sending modal
    Swal.fire({
      title: "Sending message...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Send the form using EmailJS
    emailjs.sendForm("service_5l54kff", "template_qw7shd8", this).then(
      function () {
        Swal.fire({
          icon: "success",
          title: "Message sent successfully!",
          confirmButtonText: "OK",
        });
        console.log("EmailJS sendForm success.");
        contactForm.reset();
      },
      function (error) {
        Swal.fire({
          icon: "error",
          title: "Failed to send message",
          text: "Please try again later.",
        });
        console.error("EmailJS error:", error);
      }
    );
  });
});

// ---------- Global polish: cursor, marquee, labels, footer ----------

// Work links expand the cursor ring into a "View" badge
document.querySelectorAll(".slide a, .list-item").forEach((el) => {
  el.setAttribute("data-cursor", "view");
});

// Custom cursor (desktop pointer devices only, additive to native cursor)
if (
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !prefersReduced
) {
  document.body.classList.add("has-cursor");
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");

  const dotX = gsap.quickTo(cursorDot, "x", { duration: 0.12, ease: "power3" });
  const dotY = gsap.quickTo(cursorDot, "y", { duration: 0.12, ease: "power3" });
  const ringX = gsap.quickTo(cursorRing, "x", { duration: 0.5, ease: "power3" });
  const ringY = gsap.quickTo(cursorRing, "y", { duration: 0.5, ease: "power3" });

  document.addEventListener("mousemove", (e) => {
    dotX(e.clientX);
    dotY(e.clientY);
    ringX(e.clientX);
    ringY(e.clientY);
  });

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("[data-cursor='view']")) {
      cursorRing.classList.add("is-view");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest("[data-cursor='view']")) {
      cursorRing.classList.remove("is-view");
    }
  });
}

// Velocity-reactive marquee
const marqueeTrack = document.querySelector(".marquee-track");
if (marqueeTrack && !prefersReduced) {
  const marqueeTween = gsap.to(marqueeTrack, {
    xPercent: -50,
    repeat: -1,
    duration: 22,
    ease: "none",
  });

  let marqueeSettle;
  ScrollTrigger.create({
    trigger: ".marquee",
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const boost = gsap.utils.clamp(-4, 4, self.getVelocity() / 300);
      marqueeTween.timeScale(1 + Math.abs(boost));
      gsap.to(marqueeTrack, {
        skewX: gsap.utils.clamp(-6, 6, boost * 1.5),
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });

      clearTimeout(marqueeSettle);
      marqueeSettle = setTimeout(() => {
        gsap.to(marqueeTween, {
          timeScale: 1,
          duration: 1.2,
          ease: "power2.out",
        });
        gsap.to(marqueeTrack, {
          skewX: 0,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      }, 120);
    },
  });
}

// Fade the fixed brand statement out once the carousel is scrolled past
// (it otherwise floats over the marquee / later sections)
const nav2El = document.querySelector(".nav2");
if (nav2El) {
  ScrollTrigger.create({
    trigger: ".workSection",
    start: "bottom 70%",
    onEnter: () => nav2El.classList.add("is-past"),
    onLeaveBack: () => nav2El.classList.remove("is-past"),
  });
}

// Section label reveals
gsap.utils.toArray(".section-label").forEach((label) => {
  const rule = label.querySelector(".rule");
  const text = label.querySelector("p");
  if (prefersReduced) return;

  gsap
    .timeline({
      scrollTrigger: { trigger: label, start: "top 85%", once: true },
    })
    .from(rule, {
      scaleX: 0,
      duration: 0.8,
      ease: "power3.inOut",
    })
    .from(text, { autoAlpha: 0, x: -10, duration: 0.5 }, "-=0.3");
});

document.querySelectorAll(".slide a").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault(); // prevent immediate navigation

    const href = this.getAttribute("href");
    const overlay = document.getElementById("black-transition");

    // Animate black div
    overlay.style.top = "0";

    // Navigate after animation
    setTimeout(() => {
      window.location.href = href;
    }, 800); // matches the CSS transition duration
  });
});

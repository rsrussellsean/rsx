"use client";

// Work section: 3D z-scrub carousel <-> list view toggle.
// Direct port of the original script.js work block — the carousel math,
// quickSetter scrub and the revert-before-reinit guards are frozen behavior.
import { useRef, type MouseEvent as ReactMouseEvent } from "react";
import { gsap, useGSAP, ScrollTrigger, SplitText, prefersReduced } from "@/lib/gsap";
import { WORKS } from "@/lib/works-data";
import SectionLabel from "./SectionLabel";
import ListHoverDistortion from "./ListHoverDistortion";

export default function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const nav2Ref = useRef<HTMLElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const btnAnimatedRef = useRef<HTMLButtonElement>(null);
  const btnListRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReduced();
      const container = containerRef.current!;
      const slider = sliderRef.current!;
      const workListContainer = listRef.current!;
      const slides = gsap.utils.toArray<HTMLElement>(".slide", slider);
      const activeSlideImages = gsap.utils.toArray<HTMLElement>(
        ".active-slide img",
        container
      );

      let workCtx: gsap.Context | undefined;
      let listCtx: gsap.Context | undefined;
      let slideTitleSplits: SplitText[] = [];

      function initAnimatedView() {
        // Rapid toggling can queue overlapping fade onCompletes; never let two
        // contexts (and their ScrollTriggers) exist at once
        if (workCtx) workCtx.revert();

        // Revert any leftover SplitText from a previous init (context doesn't track them)
        slideTitleSplits.forEach((s) => s.revert());
        slideTitleSplits = [];

        workCtx = gsap.context(() => {
          // Dynamically set container height based on slides
          const totalSlides = slides.length;
          const vhPerSlide = 60;
          container.style.height = `${totalSlides * vhPerSlide}vh`;

          // Pre-build one setter bundle per slide — zero tween allocation per tick
          const setters = slides.map((slide, index) => {
            gsap.set(slide, { clearProps: "all" });
            if (activeSlideImages[index]) {
              gsap.set(activeSlideImages[index], { clearProps: "all" });
            }
            gsap.set(slide, { xPercent: -50, yPercent: -50 });

            const img = slide.querySelector<HTMLElement>(".slide-img img");
            if (img) gsap.set(img, { scale: 1.15 });

            const title = slide.querySelector<HTMLElement>(
              ".slide-copy p:first-child"
            );
            let titleTween: gsap.core.Tween | null = null;
            if (title && !reduced) {
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
              z: gsap.quickSetter(slide, "z", "px") as (v: number) => void,
              rotateY: gsap.quickSetter(slide, "rotateY", "deg") as (
                v: number
              ) => void,
              opacity: gsap.quickSetter(slide, "opacity") as (
                v: number
              ) => void,
              bgOpacity: activeSlideImages[index]
                ? (gsap.quickSetter(activeSlideImages[index], "opacity") as (
                    v: number
                  ) => void)
                : null,
              imgY: img
                ? (gsap.quickSetter(img, "yPercent") as (v: number) => void)
                : null,
              dir: slide.offsetLeft < window.innerWidth / 2 ? 1 : -1,
              titleTween,
            };
          });

          const progressProxy = { p: 0 };

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
      function initListReveals() {
        if (listCtx) listCtx.revert();
        listCtx = gsap.context(() => {
          if (reduced) {
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

      // Init the 3D scroll animations on mount
      initAnimatedView();

      // Toggle View Logic
      const btnAnimated = btnAnimatedRef.current!;
      const btnList = btnListRef.current!;
      const toggleThumb = thumbRef.current!;
      const nav2 = nav2Ref.current;

      function moveThumb(btn: HTMLButtonElement, animate = true) {
        gsap.to(toggleThumb, {
          x: btn.offsetLeft,
          width: btn.offsetWidth,
          duration: animate && !reduced ? 0.45 : 0,
          ease: "power3.inOut",
        });
      }

      function setActiveButton(
        activeBtn: HTMLButtonElement,
        inactiveBtn: HTMLButtonElement
      ) {
        activeBtn.classList.add("active");
        activeBtn.setAttribute("aria-pressed", "true");
        inactiveBtn.classList.remove("active");
        inactiveBtn.setAttribute("aria-pressed", "false");
        moveThumb(activeBtn);
      }

      const showListView = () => {
        if (btnList.classList.contains("active")) return;

        setActiveButton(btnList, btnAnimated);
        localStorage.setItem("rsx-work-view", "list");
        nav2?.classList.add("is-hidden");

        // Cleanup: revert the GSAP context to kill triggers & clear inline styles
        if (workCtx) workCtx.revert();

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
      };

      const showAnimatedView = () => {
        if (btnAnimated.classList.contains("active")) return;

        setActiveButton(btnAnimated, btnList);
        localStorage.setItem("rsx-work-view", "animated");
        nav2?.classList.remove("is-hidden");

        gsap.to(workListContainer, {
          opacity: 0,
          duration: 0.4,
          onComplete: () => {
            if (listCtx) listCtx.revert();
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
      };

      btnList.addEventListener("click", showListView);
      btnAnimated.addEventListener("click", showAnimatedView);

      // Restore persisted view choice; position the thumb either way
      if (localStorage.getItem("rsx-work-view") === "list") {
        showListView();
      } else {
        moveThumb(btnAnimated, false);
      }

      // Fade the fixed brand statement out once the carousel is scrolled past
      // (it otherwise floats over the marquee / later sections)
      if (nav2) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "bottom 70%",
          onEnter: () => nav2.classList.add("is-past"),
          onLeaveBack: () => nav2.classList.remove("is-past"),
        });
      }

      // Trigger positions depend on image-free layout, but refresh once the
      // full page (images, fonts) has loaded to be safe
      const onLoad = () => ScrollTrigger.refresh();
      if (document.readyState !== "complete") {
        window.addEventListener("load", onLoad, { once: true });
      }

      return () => {
        btnList.removeEventListener("click", showListView);
        btnAnimated.removeEventListener("click", showAnimatedView);
        window.removeEventListener("load", onLoad);
        slideTitleSplits.forEach((s) => s.revert());
        workCtx?.revert();
        listCtx?.revert();
      };
    },
    { scope: sectionRef }
  );

  // Carousel links navigate through the black overlay sweep
  const handleSlideClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href")!;
    const overlay = document.getElementById("black-transition");
    if (overlay) overlay.style.top = "0";
    setTimeout(() => {
      window.location.href = href;
    }, 800); // matches the CSS transition duration
  };

  return (
    <section className="workSection" id="work" ref={sectionRef}>
      <SectionLabel text="01 — Work" />
      <nav className="nav2" ref={nav2Ref}>
        <div className="logo">
          <p id="toLogo">To</p>
          <img className="logoImage" src="/images/elite1.png" alt="RSX elite logo" />
        </div>
      </nav>

      <div className="work-view-toggle">
        <span className="toggle-thumb" aria-hidden="true" ref={thumbRef}></span>
        <button
          id="btn-animated-view"
          className="active"
          aria-pressed="true"
          ref={btnAnimatedRef}
        >
          Animated
        </button>
        <button id="btn-list-view" aria-pressed="false" ref={btnListRef}>
          List
        </button>
      </div>

      <div className="workContainer" ref={containerRef}>
        {/* One background per slide, same order as the .slider slides */}
        <div className="active-slide" aria-hidden="true">
          {WORKS.map((w) => (
            <img key={w.slug} src={w.homeImage} alt="" decoding="async" />
          ))}
        </div>
      </div>

      <div className="slider" ref={sliderRef}>
        {WORKS.map((w, i) => (
          <div className="slide" id={`slide-${i + 2}`} key={w.slug}>
            <div className="slide-copy">
              <p>{w.title}</p>
              <p className="index">{w.est}</p>
            </div>
            <div className="slide-img">
              <a
                href={`/works/${w.slug}/`}
                data-cursor="view"
                onClick={handleSlideClick}
              >
                <img
                  src={w.homeImage}
                  alt={w.homeAlt}
                  loading={i === WORKS.length - 1 ? undefined : "lazy"}
                  fetchPriority={i === WORKS.length - 1 ? "high" : undefined}
                  decoding="async"
                />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* List View */}
      <div
        className="workListContainer"
        style={{ display: "none" }}
        ref={listRef}
      >
        {WORKS.map((w) => (
          <a
            href={`/works/${w.slug}/`}
            className="list-item"
            style={{ textDecoration: "none" }}
            data-cursor="view"
            key={w.slug}
          >
            <div className="item-img">
              <img src={w.homeImage} alt={w.title} loading="lazy" />
            </div>
            <div className="item-copy">
              <p>{w.title}</p>
              <p className="index">{w.est}</p>
            </div>
          </a>
        ))}
      </div>

      <ListHoverDistortion listRef={listRef} />
    </section>
  );
}

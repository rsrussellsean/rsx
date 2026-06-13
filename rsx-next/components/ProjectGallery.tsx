"use client";

// Project page: wheel/click/touch-driven minimap gallery with a lerped
// indicator and blurred backdrop. The scrub mechanic is a frozen port of
// works/*/script.js; the editorial chrome + transitions are the redesign.
import { useEffect, useRef } from "react";
import { gsap, prefersReduced } from "@/lib/gsap";
import { WORKS, type Work } from "@/lib/works-data";

const pad = (n: number) => String(n).padStart(2, "0");

export default function ProjectGallery({ work }: { work: Work }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);
  const bgBlurRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const index = WORKS.findIndex((w) => w.slug === work.slug);

  // Sweep the black overlay over, flag the home page to reveal-from-black, then
  // hard-navigate (full reload is intentional — works.css restyles globals).
  function triggerExit(href: string) {
    const overlay = overlayRef.current;
    if (overlay) overlay.style.top = "0";
    try {
      sessionStorage.setItem("rsx-returning", "1");
    } catch {}
    setTimeout(() => {
      window.location.href = href;
    }, 800); // matches the CSS overlay transition duration
  }

  // Escape is a quick, discoverable way back to the work section
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") triggerExit("/#work");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Editorial entrance — staggers the chrome in over the CSS container fade.
  // Pure y/opacity (no SplitText) to sidestep the hero's kerning-snap issue.
  useEffect(() => {
    if (prefersReduced()) return;
    const ctx = gsap.context(() => {
      // Text chrome rises in (no base transform → yPercent is safe)
      gsap.from(
        [
          ".project-eyebrow",
          ".project-index",
          ".project-title",
          ".project-est",
          ".visit-info",
          ".project-nav a",
        ],
        {
          yPercent: 18,
          autoAlpha: 0,
          duration: 1,
          ease: "custom",
          stagger: 0.07,
          delay: 0.2,
          clearProps: "transform,opacity,visibility",
        }
      );
      // The preview + minimap are CSS-centered via translate(); fade only so
      // GSAP doesn't fight their centering transform during the intro.
      gsap.from([".img-preview", ".minimap"], {
        autoAlpha: 0,
        duration: 1.1,
        ease: "custom",
        delay: 0.45,
        clearProps: "opacity,visibility",
      });
    }, containerRef);
    return () => ctx.revert();
  }, [work.slug]);

  useEffect(() => {
    const container = containerRef.current!;
    const items = itemsRef.current!;
    const indicator = indicatorRef.current!;
    const previewImage = previewRef.current!;
    const bgBlur = bgBlurRef.current!;
    const itemElements = Array.from(
      items.querySelectorAll<HTMLElement>(".item")
    );
    const itemImages = itemElements.map(
      (el) => el.querySelector("img") as HTMLImageElement
    );

    let isHorizontal = window.innerWidth < 900;
    let dimensions = { itemSize: 0, containerSize: 0, indicatorSize: 0 };

    let maxTranslate = 0;
    let currentTranslate = 0;
    let targetTranslate = 0;
    let isClickMove = false;
    let currentImageIndex = 0;
    const activeImageOpacity = 0.3;

    function lerp(start: number, end: number, factor: number) {
      return start + (end - start) * factor;
    }

    function updateDimensions() {
      isHorizontal = window.innerWidth < 900;
      if (isHorizontal) {
        dimensions = {
          itemSize: itemElements[0].getBoundingClientRect().width,
          containerSize: items.scrollWidth,
          indicatorSize: indicator.getBoundingClientRect().width,
        };
      } else {
        dimensions = {
          itemSize: itemElements[0].getBoundingClientRect().height,
          containerSize: items.getBoundingClientRect().height,
          indicatorSize: indicator.getBoundingClientRect().height,
        };
      }
      return dimensions;
    }

    dimensions = updateDimensions();
    maxTranslate = dimensions.containerSize - dimensions.indicatorSize;

    function snapToClosest() {
      let index = Math.round(-targetTranslate / dimensions.itemSize);
      index = Math.min(Math.max(index, 0), itemElements.length - 1);

      targetTranslate =
        -index * dimensions.itemSize +
        (dimensions.indicatorSize - dimensions.itemSize) / 2;
      targetTranslate = Math.min(0, Math.max(targetTranslate, -maxTranslate));
    }

    function getItemInIndicator() {
      itemImages.forEach((img) => {
        img.style.opacity = "1";
      });

      const indicatorStart = -currentTranslate;
      const indicatorEnd = indicatorStart + dimensions.indicatorSize;

      let maxOverlap = 0;
      let selectedIndex = 0;

      itemElements.forEach((item, index) => {
        const itemStart = index * dimensions.itemSize;
        const itemEnd = itemStart + dimensions.itemSize;

        const overlapStart = Math.max(indicatorStart, itemStart);
        const overlapEnd = Math.min(indicatorEnd, itemEnd);
        const overlap = Math.max(0, overlapEnd - overlapStart);

        if (overlap > maxOverlap) {
          maxOverlap = overlap;
          selectedIndex = index;
        }
      });

      itemImages[selectedIndex].style.opacity = String(activeImageOpacity);
      return selectedIndex;
    }

    function updatePreviewImage(index: number) {
      if (currentImageIndex !== index) {
        currentImageIndex = index;
        const targetSrc = itemImages[index].getAttribute("src")!;

        previewImage.classList.remove("animate");
        previewImage.setAttribute("src", targetSrc);
        void previewImage.offsetWidth; // trigger reflow
        previewImage.classList.add("animate");
        bgBlur.style.backgroundImage = `url('${targetSrc}')`;
      }
    }

    let rafId: number;
    function animate() {
      // Smaller lerp factor for smoother, slower animation
      const lerpFactor = isClickMove ? 0.03 : 0.04;

      currentTranslate = lerp(currentTranslate, targetTranslate, lerpFactor);

      if (Math.abs(currentTranslate - targetTranslate) > 0.01) {
        const transform = isHorizontal
          ? `translateX(${currentTranslate}px)`
          : `translateY(${currentTranslate}px)`;
        items.style.transform = transform;

        const activeIndex = getItemInIndicator();
        updatePreviewImage(activeIndex);
      } else {
        isClickMove = false;
      }

      rafId = requestAnimationFrame(animate);
    }

    let isScrolling = false;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrolling) return; // prevent spamming scrolls

      isScrolling = true;

      let index = Math.round(-targetTranslate / dimensions.itemSize);
      if (e.deltaY > 0) {
        index += 1;
      } else {
        index -= 1;
      }

      index = Math.max(0, Math.min(index, itemElements.length - 1));

      targetTranslate =
        -index * dimensions.itemSize +
        (dimensions.indicatorSize - dimensions.itemSize) / 2;
      targetTranslate = Math.min(0, Math.max(targetTranslate, -maxTranslate));

      setTimeout(() => {
        isScrolling = false;
      }, 600);
    };
    container.addEventListener("wheel", onWheel, { passive: false });

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (isHorizontal) {
        touchStartY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isHorizontal) {
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;

        const delta = deltaY * 0.1; // slower scroll for smoother feel
        const scrollVelocity = Math.min(Math.max(delta, -10), 10);

        targetTranslate = Math.min(
          Math.max(targetTranslate - scrollVelocity, -maxTranslate),
          0
        );

        touchStartY = touchY;
        e.preventDefault();
      }
    };
    const onTouchEnd = () => {
      snapToClosest();
    };
    container.addEventListener("touchstart", onTouchStart);
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);

    const itemClickHandlers = itemElements.map((item, index) => {
      const handler = () => {
        isClickMove = true;
        targetTranslate =
          -index * dimensions.itemSize +
          (dimensions.indicatorSize - dimensions.itemSize) / 2;

        targetTranslate = Math.min(0, Math.max(targetTranslate, -maxTranslate));
      };
      item.addEventListener("click", handler);
      return handler;
    });

    const onResize = () => {
      dimensions = updateDimensions();
      maxTranslate = dimensions.containerSize - dimensions.indicatorSize;

      targetTranslate = Math.min(Math.max(targetTranslate, -maxTranslate), 0);
      currentTranslate = targetTranslate;

      const transform = isHorizontal
        ? `translateX(${currentTranslate}px)`
        : `translateY(${currentTranslate}px)`;
      items.style.transform = transform;
    };
    window.addEventListener("resize", onResize);

    itemImages[0].style.opacity = String(activeImageOpacity);
    bgBlur.style.backgroundImage = `url('${previewImage.getAttribute("src")}')`;
    rafId = requestAnimationFrame(animate);

    // Entrance + scroll lock
    const onLoad = () => {
      container.classList.add("loaded");
      document.body.style.overflow = "hidden";
    };
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      itemElements.forEach((item, i) =>
        item.removeEventListener("click", itemClickHandlers[i])
      );
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onLoad);
      document.body.style.overflow = "";
    };
  }, [work.slug]);

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    triggerExit(e.currentTarget.getAttribute("href")!);
  };

  return (
    <>
      <div className="bg-blur" ref={bgBlurRef}></div>
      <div className="dark-overlay"></div>
      {/* Exit sweep — mirrors the home page's #black-transition */}
      <div className="work-transition" ref={overlayRef} aria-hidden="true"></div>

      <div className="container" ref={containerRef}>
        {/* Full page loads on purpose: this route's CSS restyles body/p/nav
            globally, so client-side navigation would leak it onto the home page */}
        <nav className="project-nav">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="project-brand" data-cursor="view" onClick={handleBack}>
            RSX
          </a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/#work"
            className="project-back"
            data-cursor="view"
            onClick={handleBack}
          >
            <span className="back-arrow" aria-hidden="true">
              &larr;
            </span>
            <span>Back to Work</span>
          </a>
        </nav>

        <div className="project-eyebrow" aria-hidden="true">
          <span className="project-eyebrow-rule"></span>
          <span className="project-eyebrow-label">Selected Work</span>
        </div>

        <div className="project-info">
          <p className="project-index">
            {pad(index + 1)} <span>/ {pad(WORKS.length)}</span>
          </p>
          <h1 className="project-title">{work.pageTitle}</h1>
          <p className="project-est">{work.est}</p>
          {work.visitUrl && (
            <div className="visit-info">
              <a
                href={work.visitUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="view"
              >
                <span>Visit the site</span>
                <span className="visit-arrow" aria-hidden="true">
                  &#8599;
                </span>
              </a>
            </div>
          )}
        </div>

        <div className="img-preview">
          <img src={work.gallery[0]} alt="" ref={previewRef} />
        </div>

        <div className="minimap">
          <div className="indicator" ref={indicatorRef}></div>
          <div className="items" ref={itemsRef}>
            {work.gallery.map((src) => (
              <div className="item" key={src}>
                <img src={src} alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

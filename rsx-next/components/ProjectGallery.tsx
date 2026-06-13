"use client";

// Project page: wheel/click/touch-driven minimap gallery with a lerped
// indicator and blurred backdrop. Direct port of works/*/script.js.
import { useEffect, useRef } from "react";
import type { Work } from "@/lib/works-data";

export default function ProjectGallery({ work }: { work: Work }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);
  const bgBlurRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <div className="bg-blur" ref={bgBlurRef}></div>
      <div className="dark-overlay"></div>

      <div className="container" ref={containerRef}>
        <nav>
          {/* Full page loads on purpose: this route's CSS restyles body/p/nav
              globally, so client-side navigation would leak it onto the home page */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">RSX</a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/#work">
            <span>
              <img src="/images/arrowleft.png" alt="" />
            </span>
            <span> Back to Work</span>
          </a>
        </nav>

        <div className="site-info">
          <p>
            <span>{work.pageTitle}</span>
          </p>
          {work.visitUrl && (
            <div className="visit-info">
              <a href={work.visitUrl} target="_blank" rel="noopener noreferrer">
                Visit the site
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

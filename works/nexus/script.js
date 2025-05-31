const container = document.querySelector(".container");
const items = document.querySelector(".items");
const indicator = document.querySelector(".indicator");
const itemElements = document.querySelectorAll(".item");
const previewImage = document.querySelector(".img-preview img");
const itemImages = document.querySelectorAll(".item img");

let isHorizontal = window.innerWidth < 900;
let dimensions = {
  itemSize: 0,
  containerSize: 0,
  indicatorSize: 0,
};

let maxTranslate = 0;
let currentTranslate = 0;
let targetTranslate = 0;
let isClickMove = false;
let currentImageIndex = 0;
const activeImageOpacity = 0.3;

function lerp(start, end, factor) {
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
    img.style.opacity = 1;
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

  itemImages[selectedIndex].style.opacity = activeImageOpacity;
  return selectedIndex;
}

function updatePreviewImage(index) {
  if (currentImageIndex !== index) {
    currentImageIndex = index;
    const targetItem = itemElements[index].querySelector("img");
    const targetSrc = targetItem.getAttribute("src");

    previewImage.classList.remove("animate");
    previewImage.setAttribute("src", targetSrc);
    void previewImage.offsetWidth; // trigger reflow
    previewImage.classList.add("animate");
  }
}

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

  requestAnimationFrame(animate);
}

let isScrolling = false;

container.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    if (isScrolling) return; // prevent spamming scrolls

    isScrolling = true;

    let index = Math.round(-targetTranslate / dimensions.itemSize);
    if (e.deltaY > 0) {
      index += 1; // scroll down/next
    } else {
      index -= 1; // scroll up/previous
    }

    index = Math.max(0, Math.min(index, itemElements.length - 1));

    targetTranslate =
      -index * dimensions.itemSize +
      (dimensions.indicatorSize - dimensions.itemSize) / 2;
    targetTranslate = Math.min(0, Math.max(targetTranslate, -maxTranslate));

    setTimeout(() => {
      isScrolling = false;
    }, 600); // time to wait before allowing another scroll
  },
  { passive: false }
);

let touchStartY = 0;
container.addEventListener("touchstart", (e) => {
  if (isHorizontal) {
    touchStartY = e.touches[0].clientY;
  }
});

container.addEventListener(
  "touchmove",
  (e) => {
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
  },
  { passive: false }
);

container.addEventListener("touchend", () => {
  snapToClosest();
});

itemElements.forEach((item, index) => {
  item.addEventListener("click", () => {
    isClickMove = true;
    targetTranslate =
      -index * dimensions.itemSize +
      (dimensions.indicatorSize - dimensions.itemSize) / 2;

    targetTranslate = Math.min(0, Math.max(targetTranslate, -maxTranslate));
  });
});

window.addEventListener("resize", () => {
  dimensions = updateDimensions();
  maxTranslate = dimensions.containerSize - dimensions.indicatorSize;

  targetTranslate = Math.min(Math.max(targetTranslate, -maxTranslate), 0);
  currentTranslate = targetTranslate;

  const transform = isHorizontal
    ? `translateX(${currentTranslate}px)`
    : `translateY(${currentTranslate}px)`;
  items.style.transform = transform;
});

itemImages[0].style.opacity = activeImageOpacity;
updatePreviewImage(0);
animate();

// bg blur
const bgBlur = document.querySelector(".bg-blur");
const imgPreview = document.querySelector(".img-preview img");

// Observe changes to the preview image's src
const observer = new MutationObserver(() => {
  const src = imgPreview.getAttribute("src");
  bgBlur.style.backgroundImage = `url('${src}')`;
});

// Start observing changes to the src attribute
observer.observe(imgPreview, { attributes: true, attributeFilter: ["src"] });

// Set initial background
bgBlur.style.backgroundImage = `url('${imgPreview.getAttribute("src")}')`;

window.addEventListener("load", () => {
  document.querySelector(".container").classList.add("loaded");
  document.body.style.overflow = "hidden"; // disables scroll
});

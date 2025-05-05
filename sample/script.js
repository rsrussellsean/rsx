const placeholder = document.querySelector(".placeholder");
const subheader = document.querySelector("#subheader");
const zoomedImage = document.querySelector("#zoomed-image");

let scrollProgress = 0;

function updateZoomEffect() {
  scrollProgress =
    window.scrollY /
    (document.documentElement.scrollHeight - window.innerHeight);

  // Zoom in the "Vision" text
  gsap.to(placeholder, { scale: 1 + scrollProgress * 1.5, duration: 0.2 });

  // Zoom in the image
  gsap.to(zoomedImage, { scale: 1 + scrollProgress * 1.5, duration: 0.2 });
}

// Attach the scroll event listener
window.addEventListener("scroll", updateZoomEffect);

function restPlaceholderText() {
  const defaultText = "VISION";
  const defaultSubHeaderText = "From";

  subheader.textContent = defaultSubHeaderText;
  animateScale(placeholder, 1.25);
  shuffleLetters(defaultText);
}

window.onload = () => {
  restPlaceholderText(); // triggers the initial shuffle
};

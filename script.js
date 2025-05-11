// slides.forEach((slide, index) => {
//   ScrollTrigger.create({
//     trigger: container,
//     start: "top top",
//     end: "bottom bottom",
//     scrub: true,
//     onUpdate: (self) => {
//       const progress = self.progress;
//       const zIncrement = progress * 22500;

//       const currentZ = -13500 + index * 1500 + zIncrement;

//       let opacity;

//       if (currentZ > -1500) {
//         opacity = 1;
//       } else if (currentZ > -2800) {
//         opacity = 0.5;
//       } else {
//         opacity = 0;
//       }

//       slide.style.opacity = opacity;
//       slide.style.transform = `translateX(-50%) translateY(-50%) translateZ(${currentZ}px)`;

//       gsap.to(activeSlideImages[index], {
//         opacity: currentZ < 100 ? 1 : 0,
//         duration: 1.5,
//         ease: "power3.out",
//       });
//     },
//   });
// });

gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", function () {
  const slides = gsap.utils.toArray(".slide");
  const activeSlideImages = gsap.utils.toArray(".active-slide img");

  const intro = document.querySelector(".intro");
  const outro = document.querySelector(".outro");
  const container = document.querySelector(".container");

  // Dynamically set container height based on slides + intro + outro
  const totalSlides = slides.length;
  const vhPerSlide = 70; // adjust as needed
  container.style.height = `${totalSlides * vhPerSlide}vh`;

  slides.forEach((slide, index) => {
    ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const zIncrement = progress * 22500;
        const currentZ = -13500 + index * 1500 + zIncrement;
        // const currentZ = -6000 + index * 1500 + zIncrement;

        // Efficiently update styles using GSAP
        gsap.to(slide, {
          opacity: currentZ > -1500 ? 1 : currentZ > -2800 ? 0.5 : 0,
          xPercent: -50,
          yPercent: -50,
          z: currentZ,
          duration: 0.1,
          ease: "none",
        });

        gsap.to(activeSlideImages[index], {
          opacity: currentZ < 100 ? 1 : 0,
          duration: 0.5,
          ease: "power3.out",
        });
      },
    });
  });
});

document.querySelector(".intro-wrapper").addEventListener("wheel", (e) => {
  if (e.deltaY > 50) {
    document
      .querySelector(".main-content")
      .scrollIntoView({ behavior: "smooth" });
  }
});

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

function wrapLetters(text) {
  placeholder.innerHTML = "";
  [...text].forEach((letter) => {
    const span = document.createElement("span");
    span.style.filter = "blur(8px)";
    span.textContent = letter;
    placeholder.appendChild(span);
  });
}

function animateBlurEffect() {
  const letters = placeholder.children;
  let index = 0;

  function clearNextLetter() {
    if (index < letters.length) {
      gsap.to(letters[index], { filter: "blur(0px)", duration: 0.5 });
      index++;

      if (index < letters.length) {
        setTimeout(clearNextLetter, 100);
      }
    }
  }

  setTimeout(clearNextLetter, 0);
}

function shuffleLetters(finalText) {
  placeholder.innerHTML = "";

  // Wrap each character in a span
  finalText.split("").forEach((char) => {
    const span = document.createElement("span");
    span.textContent = char;
    placeholder.appendChild(span);
  });

  const letters = placeholder.children;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let steps = 20;

  for (let i = 0; i < letters.length; i++) {
    let currentStep = 0;
    const originalChar = finalText[i];
    letters[i].style.filter = "blur(8px)";
    gsap.to(letters[i], {
      filter: "blur(0px)",
      delay: 0.5 + i * 0.05,
      duration: 3,
    });

    const interval = setInterval(() => {
      if (currentStep < steps) {
        letters[i].textContent =
          chars[Math.floor(Math.random() * chars.length)];
        currentStep++;
      } else {
        clearInterval(interval);
        letters[i].textContent = originalChar;
      }
    }, 40 + i * 10); // offset by index to create staggered animation
  }

  animateBlurEffect();
}

function updatePlaceholderText(event) {
  const newText = event.target.textContent.toUpperCase();
  const itemIndex = Array.from(items).indexOf(event.target);
  const newSubHeaderText = subHeaders[itemIndex].toUpperCase();

  subheader.textContent = newSubHeaderText;
  animateScale(placeholder, 1.25);
  shuffleLetters(newText);
}

function restPlaceholderText() {
  const defaultText = "VISION";
  const defaultSubHeaderText = "From";

  subheader.textContent = defaultSubHeaderText;
  animateScale(placeholder, 1.25);
  shuffleLetters(defaultText);
}

items.forEach((item) => {
  item.addEventListener("mouseover", updatePlaceholderText);
  item.addEventListener("mouseout", restPlaceholderText);
});

window.onload = () => {
  restPlaceholderText(); // triggers the initial shuffle
};

// From animation
gsap.from("#subheader", {
  delay: 2.5,
  y: 50,
  opacity: 0,
  duration: 0.5, // snappy duration
  ease: "power4.out", // sharp easing
});

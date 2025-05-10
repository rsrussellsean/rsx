gsap.registerPlugin(ScrollTrigger);

// Image 2 animation
gsap.fromTo(
  "#img2 img",
  { scale: 0 },
  {
    scale: 1,
    ease: "power4.out",
    duration: 1,
    scrollTrigger: {
      trigger: ".spacer",
      start: "top top",
      end: "20% top",
      scrub: 0.5,
    },
  }
);

// Image 3 animation
// gsap.fromTo(
//   "#img3 img",
//   { scale: 0 },
//   {
//     scale: 1,
//     ease: "power3.out",
//     duration: 1,
//     scrollTrigger: {
//       trigger: ".spacer",
//       start: "10% top",
//       end: "40% top",
//       scrub: 0.2,
//     },
//   }
// );

// Handle the "VISION" text animation
const subHeaders = [
  "forging ahead with elite web designs.",
  "top-notch web design components.",
  "take the fast lane to mastery.",
  "bring your projects to life, quicker than ever.",
];

const placeholder = document.querySelector(".placeholder");
const subheader = document.querySelector("#subheader");

function animateScale(element, scaleValue) {
  gsap.fromTo(
    element,
    { scale: 1 },
    { scale: scaleValue, duration: 2, ease: "power1.out" }
  );
}

function shuffleLetters(finalText) {
  placeholder.innerHTML = "";

  finalText.split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    if (char === "O") span.classList.add("focus-o"); // Mark the "O"
    placeholder.appendChild(span);
  });

  const letters = placeholder.children;
  const chars = "ABCDEFHIJKLMNOPQRSTUVXYZ";
  let steps = 20;

  for (let i = 0; i < letters.length; i++) {
    let currentStep = 0;
    const originalChar = finalText[i];
    letters[i].style.filter = "blur(8px)";
    gsap.to(letters[i], {
      filter: "blur(0px)",
      delay: 0.5 + i * 0.05,
      duration: 2,
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
    }, 40 + i * 10);
  }
}

// Start animation with "VISION"
shuffleLetters("VISION");

// Revert the text back
function resetText() {
  shuffleLetters("VISION");
}

setTimeout(resetText, 1000); // Add timeout if needed for smooth transition

// Show "VISION" only when image 1 is active
ScrollTrigger.create({
  trigger: ".spacer",
  start: "top top",
  end: "5% top",
  onUpdate: (self) => {
    const header = document.querySelector(".header");
    if (self.progress < 0.33) {
      gsap.to(header, { autoAlpha: 1, duration: 0.5, ease: "power1.out" });
    } else {
      gsap.to(header, { autoAlpha: 0, duration: 0.5, ease: "power1.out" });
    }
  },
});

gsap.from("#subheader", {
  delay: 3.5,
  y: 50,
  opacity: 0,
  duration: 0.5, // snappy duration
  ease: "power4.out", // sharp easing
});

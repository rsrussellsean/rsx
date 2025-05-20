// import gsap from "gsap";
// import CustomEase from "gsap/CustomeEase";
gsap.registerPlugin(CustomEase);

const customEase = CustomEase.create("custom", ".87,0,.13,1");
const counter = document.getElementById("counter");

gsap.set(".video-container", {
  scale: 0,
  rotation: -20,
});

gsap.to(".hero", {
  clipPath: "polygon(0% 45%, 25% 45%, 25% 55%, 0% 55%)",
  duration: 1.5,
  ease: customEase,
  delay: 1,
});

gsap.to(".hero", {
  clipPath: "polygon(0% 45%, 100% 45%, 100% 55%, 0% 55%)",
  duration: 2,
  ease: customEase,
  delay: 3,

  onStart: () => {
    gsap.to(".progress-bar", {
      width: "100vw",
      duration: 2,
      ease: customEase,
    });

    gsap.to(counter, {
      innerHTML: 100,
      duration: 2,
      ease: customEase,
      snap: { innerHTML: 1 },
    });
  },
});

gsap.to(".hero", {
  clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  duration: 1,
  ease: customEase,
  delay: 5,

  // make video appear after loading
  onStart: () => {
    gsap.to(".video-container", {
      scale: 1,
      rotation: 0,
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      ease: customEase,
    });

    // Call the shuffle animation here
    shuffleLetters("VISION");

    gsap.to(".progress-bar", {
      opacity: 0,
      duration: 0.3,
    });

    // gsap.to(".logo", {
    //   left: 0,
    //   tranform: "translateX(0%)",
    //   duration: 1.25,
    //   ease: customEase,

    //   onStart: () => {
    //     gsap.to(".char.anim-out h1", {
    //       y: "100%",
    //       duration: 1,
    //       stagger: -0.75,
    //       ease: customEase,
    //     });

    //     gsap.to(".char.anim-in h1", {
    //       x: "-1200%",
    //       duration: 1,
    //       ease: customEase,
    //       delay: 0.25,
    //     });
    //   },
    // });
  },
});

// gsap.to([".header span", ".coordinates span"], {
//   y: "0%",
//   duration: 1,
//   stagger: 0.125,
//   ease: "power3.out",
//   delay: 5.75,
// });

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
      gsap.to(letters[index], { filter: "blur(3px)", duration: 0.5 });
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
  let steps = 15;

  for (let i = 0; i < letters.length; i++) {
    let currentStep = 0;
    const originalChar = finalText[i];
    letters[i].style.filter = "blur(5px)";
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

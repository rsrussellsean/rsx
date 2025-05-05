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
  gsap.to(".container", { backgroundColor: "#000", duration: 0.5 });
  gsap.to(".placeholder, nav, footer, p", { color: "#fff", duration: 0.5 });
}

function revertColors() {
  gsap.to(".container", { backgroundColor: "#e3e3e3", duration: 0.5 });
  gsap.to(".placeholder, nav, footer, p", { color: "#000", duration: 0.5 });
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

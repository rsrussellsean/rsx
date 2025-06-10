//work JS
gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", function () {
  const slides = gsap.utils.toArray(".slide");
  const activeSlideImages = gsap.utils.toArray(".active-slide img");

  const intro = document.querySelector(".intro");
  const outro = document.querySelector(".outro");
  const container = document.querySelector(".workContainer");

  // Dynamically set container height based on slides + intro + outro
  const totalSlides = slides.length;
  const vhPerSlide = 60; // adjust as needed
  // const vhPerSlide = container / totalSlides;

  container.style.height = `${totalSlides * vhPerSlide}vh`;

  slides.forEach((slide, index) => {
    ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: 2,
      onUpdate: (self) => {
        const progress = self.progress;
        // const zIncrement = progress * 12500;
        // decrease this for height and less scrolls
        // const zIncrement = progress * 15000;
        const zIncrement = progress * 13000;

        // const currentZ = -13500 + index * 1500 + zIncrement;
        // const currentZ = -6000 + index * 1500 + zIncrement;

        //adjust this to closer the currentz when scrolling
        const currentZ = -10500 + index * 1500 + zIncrement;

        // Efficiently update styles using GSAP
        gsap.to(slide, {
          opacity: currentZ > -1500 ? 1 : currentZ > -2800 ? 0.5 : 0,
          xPercent: -50,
          yPercent: -50,
          z: currentZ,
          duration: 1, // Slightly longer for smoothness
          ease: "power4.out", // Smoother easing
        });

        gsap.to(activeSlideImages[index], {
          opacity: currentZ < 100 ? 1 : 0,
          duration: 0.5,
          ease: "power4.out",
        });
      },
    });
  });
});

document.querySelector(".intro-wrapper").addEventListener("wheel", (e) => {
  if (e.deltaY > 50) {
    document
      .querySelector(".workSection")
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
  let steps = 12;

  for (let i = 0; i < letters.length; i++) {
    let currentStep = 0;
    const originalChar = finalText[i];
    letters[i].style.filter = "blur(5px)";
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
  animateSubheader();
};

function animateSubheader(delay = 6.5) {
  gsap.from("#subheader", {
    delay: delay,
    y: 50,
    opacity: 0,
    duration: 0.5,
    ease: "power4.out",
  });
}

// Disable scroll initially
// document.body.classList.add("no-scroll");

gsap.registerPlugin(CustomEase);

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

if (!isDirectToWork) {
  // Normal animation flow with loading
  document.body.classList.add("no-scroll");

  gsap.set(".loadingContainer", {
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
    onStart: () => {
      gsap.to(".loadingContainer", {
        scale: 1,
        rotation: 0,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: customEase,
      });

      shuffleLetters("VISION");

      gsap.to(".progress-bar", {
        opacity: 0,
        duration: 0.3,
      });
    },
    onComplete: () => {
      document.body.classList.remove("no-scroll");
    },
  });
} else {
  // If user lands directly in #work, skip animation, set final states

  // Enable scrolling immediately
  document.body.classList.remove("no-scroll");

  // Set loadingContainer visible and at final scale/rotation
  gsap.set(".loadingContainer", {
    scale: 1,
    rotation: 0,
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  });

  // Set hero clipPath to final state
  gsap.set(".hero", {
    opacity: 1,
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  });

  // gsap.fromTo(
  //   ".hero",
  //   { opacity: 0 },
  //   { opacity: 1, duration: 2, ease: "power4.out" }
  // );

  // Set progress bar invisible
  gsap.set(".progress-bar", {
    opacity: 0,
  });
}

// Redirect to homepage on refresh
window.addEventListener("load", () => {
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    window.location.href = "/rsx";
  }
});

window.onload = () => {
  if (!isDirectToWork) {
    restPlaceholderText();
    animateSubheader();
  }
};

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
  renderer.setPixelRatio(window.devicePixelRatio);

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

initializeScene(
  createTextTexture("RUSSELL", "MADERegular", null, "transparent", "100")
);

function animateScene() {
  requestAnimationFrame(animateScene);
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

animateScene();
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
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera.left = -1;
  camera.right = 1;
  camera.top = 1 / aspectRatio;
  camera.bottom = -1 / aspectRatio;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  reloadTexture();
}

var cursor = document.querySelector(".blob");

document.addEventListener("mousemove", function (e) {
  var x = e.clientX;
  var y = e.clientY;
  cursor.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
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

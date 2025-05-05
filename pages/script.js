gsap.registerPlugin(ScrollTrigger);

// Image 2 animation
gsap.fromTo(
  "#img2 img",
  { scale: 0 }, // Start from scale 0
  {
    scale: 1, // Scale to 1
    ease: "power3.out", // Smoother easing function
    duration: 1, // Add duration for smoothness
    scrollTrigger: {
      trigger: ".spacer", // Trigger on the spacer div
      start: "top top", // When the top of the spacer hits the top of the viewport
      end: "33% top", // When 33% of the spacer has scrolled past the top of the viewport
      scrub: 1, // Smoothly sync with scroll position
      markers: false, // Optional: set to true to see scroll triggers for debugging
      onEnter: () => console.log("Entering"), // Optional: can be used for debugging or adding other effects
      onLeave: () => console.log("Leaving"), // Optional
      onEnterBack: () => console.log("Entering Back"), // Optional
      onLeaveBack: () => console.log("Leaving Back"), // Optional
    },
  }
);

// Image 3 animation
gsap.fromTo(
  "#img3 img",
  { scale: 0 }, // Start from scale 0
  {
    scale: 1, // Scale to 1
    ease: "power3.out", // Smoother easing function
    duration: 1, // Add duration for smoothness
    scrollTrigger: {
      trigger: ".spacer", // Trigger on the spacer div
      start: "33% top", // When 33% of the spacer has scrolled past the top of the viewport
      end: "66% top", // When 66% of the spacer has scrolled past the top of the viewport
      scrub: 1, // Smoothly sync with scroll position
      markers: false, // Optional
      onEnter: () => console.log("Entering"), // Optional
      onLeave: () => console.log("Leaving"), // Optional
      onEnterBack: () => console.log("Entering Back"), // Optional
      onLeaveBack: () => console.log("Leaving Back"), // Optional
    },
  }
);

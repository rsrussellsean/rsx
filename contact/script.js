// scroll transition
// document.addEventListener("DOMContentLoaded", function () {
//   gsap.to(".sticky", {
//     scrollTrigger: {
//       trigger: ".sticky",
//       start: "top top",
//       end: () =>
//         "+=" +
//         (window.innerHeight +
//           document.querySelector(".website-content").offsetHeight * 0.5),
//       scrub: 1,
//       pin: true,
//     },
//     y: 250,
//     scale: 0.75,
//     rotation: -15,
//     ease: "power3.out",
//   });

//   gsap.fromTo(
//     ".website-content",
//     { x: -100, scale: 0.3, rotation: 15 },
//     {
//       scrollTrigger: {
//         trigger: ".website-content",
//         start: "top 200%",
//         end: "top 50%",
//         scrub: 1,
//       },
//       x: 0,
//       scale: 1,
//       rotation: 0,
//       ease: "power3.out",
//     }
//   );
// });

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

// Initialize EmailJS with your public key
emailjs.init("yJzaHnW-3TbbFF3Hh");

// Handle form submission
document
  .getElementById("contact-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("Submit event triggered.");

    // Validate email input before sending
    const email = this.elements["from_email"].value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      console.log("Invalid email:", email);
      return; // STOP form submission here if email is invalid
    }

    alert("Sending message...");

    // Log current form values
    const formData = new FormData(this);
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      emailjs.sendForm("service_5l54kff", "template_qw7shd8", this).then(
        function () {
          alert("Message sent successfully!");
          console.log("EmailJS sendForm success.");
          document.getElementById("contact-form").reset();
        },
        function (error) {
          alert("Failed to send message. Please try again later.");
          console.error("EmailJS error:", error);
        }
      );
    } catch (err) {
      alert("Unexpected error occurred.");
      console.error("Unexpected error:", err);
    }
  });

//   // Initialize EmailJS with your public key
// emailjs.init("yJzaHnW-3TbbFF3Hh");

// // Handle form submission
// document
//   .getElementById("contact-form")
//   .addEventListener("submit", function (e) {
//     e.preventDefault();
//     console.log("Submit event triggered.");

//     // Validate email input before sending
//     const email = this.elements["from_email"].value.trim();
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (!emailRegex.test(email)) {
//       Swal.fire({
//         icon: "error",
//         title: "Invalid Email",
//         text: "Please enter a valid email address.",
//       });
//       console.log("Invalid email:", email);
//       return; // STOP form submission if email invalid
//     }

//     Swal.fire({
//       title: "Sending message...",
//       allowOutsideClick: false,
//       didOpen: () => {
//         Swal.showLoading();
//       },
//     });

//     // Log current form values
//     const formData = new FormData(this);
//     for (let [key, value] of formData.entries()) {
//       console.log(`${key}: ${value}`);
//     }

//     try {
//       emailjs.sendForm("service_5l54kff", "template_qw7shd8", this).then(
//         function () {
//           Swal.fire({
//             icon: "success",
//             title: "Message sent successfully!",
//           });
//           console.log("EmailJS sendForm success.");
//           document.getElementById("contact-form").reset();
//         },
//         function (error) {
//           Swal.fire({
//             icon: "error",
//             title: "Failed to send message",
//             text: "Please try again later.",
//           });
//           console.error("EmailJS error:", error);
//         }
//       );
//     } catch (err) {
//       Swal.fire({
//         icon: "error",
//         title: "Unexpected error occurred",
//       });
//       console.error("Unexpected error:", err);
//     }
//   });

"use client";

// Contact section: social flip-links, eye/mouth emoji tracker, EmailJS form
// with SweetAlert2 flows, magnetic send button and the closing marquee band.
// EmailJS semantics are identical to the original script.js.
import { useRef, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";
import { gsap, useGSAP, ScrollTrigger, SplitText, prefersReduced } from "@/lib/gsap";
import SectionLabel from "./SectionLabel";

const SOCIALS = [
  { label: "Instagram", url: "https://www.instagram.com/rsrussellsean/" },
  { label: "Facebook", url: "https://www.facebook.com/russellsean.gonzalve/" },
  { label: "Linkedin", url: "https://www.linkedin.com/in/russell-sean-gonzalve/" },
  { label: "Github", url: "https://github.com/rsrussellsean" },
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackerRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const emojiFaceRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (context, contextSafe) => {
      const reduced = prefersReduced();
      const wrapper = trackerRef.current!;
      const emoji = emojiRef.current!;
      const emojiFace = emojiFaceRef.current!;

      // ----- Emoji tracker follows the cursor -----
      const moveEvent = (e: MouseEvent) => {
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

      // ----- Entrance reveals — split only after fonts load -----
      document.fonts.ready.then(
        contextSafe!(() => {
          const contactTitle = sectionRef.current?.querySelector(
            ".contact-title p"
          );
          if (!contactTitle || reduced) return;

          const ctSplit = SplitText.create(contactTitle, {
            type: "lines",
            mask: "lines",
          });
          gsap.from(ctSplit.lines, {
            yPercent: 100,
            duration: 0.9,
            stagger: 0.08,
            ease: "power4.out",
            scrollTrigger: {
              trigger: ".contact-container",
              start: "top 70%",
              once: true,
            },
          });

          gsap.from(emoji, {
            scale: 0.6,
            autoAlpha: 0,
            duration: 0.9,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 60%",
              once: true,
            },
          });
        })
      );

      // ----- Magnetic send button -----
      const sendBtn = sendBtnRef.current!;
      let onBtnMove: ((e: MouseEvent) => void) | null = null;
      let onBtnLeave: (() => void) | null = null;
      if (
        window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        !reduced
      ) {
        const btnX = gsap.quickTo(sendBtn, "x", { duration: 0.4, ease: "power3" });
        const btnY = gsap.quickTo(sendBtn, "y", { duration: 0.4, ease: "power3" });

        onBtnMove = (e: MouseEvent) => {
          const rect = sendBtn.getBoundingClientRect();
          btnX((e.clientX - (rect.left + rect.width / 2)) * 0.35);
          btnY((e.clientY - (rect.top + rect.height / 2)) * 0.35);
        };
        onBtnLeave = () => {
          gsap.to(sendBtn, {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.4)",
            overwrite: true,
          });
        };
        sendBtn.addEventListener("mousemove", onBtnMove);
        sendBtn.addEventListener("mouseleave", onBtnLeave);
      }

      // ----- Velocity-reactive marquee -----
      const marqueeTrack = marqueeTrackRef.current!;
      let marqueeSettle: ReturnType<typeof setTimeout> | undefined;
      if (!reduced) {
        const marqueeTween = gsap.to(marqueeTrack, {
          xPercent: -50,
          repeat: -1,
          duration: 22,
          ease: "none",
        });

        ScrollTrigger.create({
          trigger: ".marquee",
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const boost = gsap.utils.clamp(-4, 4, self.getVelocity() / 300);
            marqueeTween.timeScale(1 + Math.abs(boost));
            gsap.to(marqueeTrack, {
              skewX: gsap.utils.clamp(-6, 6, boost * 1.5),
              duration: 0.3,
              ease: "power2.out",
              overwrite: "auto",
            });

            clearTimeout(marqueeSettle);
            marqueeSettle = setTimeout(
              contextSafe!(() => {
                gsap.to(marqueeTween, {
                  timeScale: 1,
                  duration: 1.2,
                  ease: "power2.out",
                });
                gsap.to(marqueeTrack, {
                  skewX: 0,
                  duration: 0.8,
                  ease: "power2.out",
                  overwrite: "auto",
                });
              }),
              120
            );
          },
        });
      }

      // Initialize EmailJS with the public key
      emailjs.init("yJzaHnW-3TbbFF3Hh");

      return () => {
        wrapper.removeEventListener("mousemove", moveEvent);
        wrapper.removeEventListener("mouseleave", leaveEvent);
        if (onBtnMove) sendBtn.removeEventListener("mousemove", onBtnMove);
        if (onBtnLeave) sendBtn.removeEventListener("mouseleave", onBtnLeave);
        clearTimeout(marqueeSettle);
      };
    },
    { scope: sectionRef }
  );

  // Handle form submission — same validation, modals and EmailJS call
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current!;

    const email = (
      form.elements.namedItem("from_email") as HTMLTextAreaElement
    ).value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
      });
      return;
    }

    Swal.fire({
      title: "Sending message...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    emailjs.sendForm("service_5l54kff", "template_qw7shd8", form).then(
      function () {
        Swal.fire({
          icon: "success",
          title: "Message sent successfully!",
          confirmButtonText: "OK",
        });
        form.reset();
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
  };

  return (
    <section className="contactSection" id="contactPage" ref={sectionRef}>
      <SectionLabel text="03 — Contact" />
      <div className="contactContainer">
        <section className="sticky">
          <div className="trackerContainer">
            <div className="tracker" ref={trackerRef}>
              <div className="contactHeader">
                {SOCIALS.map((s) => (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={s.label}
                  >
                    <span className="top">{s.label}</span>
                    <span className="bottom">{s.label}</span>
                  </a>
                ))}
              </div>

              <div className="emoji" ref={emojiRef}>
                <div className="emoji-face" ref={emojiFaceRef}>
                  <div className="eyes">
                    <img src="/images/contact/eye.svg" alt="" />
                    <img src="/images/contact/eye.svg" alt="" />
                  </div>
                  <div className="mouth-wrapper">
                    <div className="mouth"></div>
                  </div>
                </div>
              </div>

              <div className="contact-container">
                <div className="contact-title">
                  <p>Let&apos;s Create Together</p>
                </div>

                <form
                  id="contact-form"
                  className="contact-form"
                  ref={formRef}
                  onSubmit={handleSubmit}
                >
                  <div className="form-group">
                    <label htmlFor="field-to">TO</label>
                    <textarea
                      id="field-to"
                      name="to_email"
                      placeholder="russell.sean.rs@gmail.com"
                      readOnly
                      defaultValue="russell.sean.rs@gmail.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="field-from">FROM</label>
                    <textarea
                      id="field-from"
                      name="from_email"
                      placeholder="Your email address."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="field-subject">SUBJECT</label>
                    <textarea
                      id="field-subject"
                      name="subject"
                      placeholder="Choose a reason for your message."
                      required
                      defaultValue="Let's Create Together"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="field-message">MESSAGE</label>
                    <textarea
                      id="field-message"
                      name="message"
                      placeholder="Drop me a line with your name and details here, and I'll get back to you."
                      required
                      className="messageTextarea"
                    />
                  </div>

                  <button type="submit" className="sendButton" ref={sendBtnRef}>
                    Send your message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track" ref={marqueeTrackRef}>
          <span>Available for freelance — Creative Developer — Cebu, PH —&nbsp;</span>
          <span>Available for freelance — Creative Developer — Cebu, PH —&nbsp;</span>
        </div>
      </div>
    </section>
  );
}

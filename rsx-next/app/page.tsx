import Hero from "@/components/Hero";
import WorkSection from "@/components/WorkSection";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <WorkSection />
      <div id="black-transition"></div>
      <div className="scroll-container">
        <About />
        <Contact />
      </div>
    </>
  );
}

import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { FlowShift } from "@/components/sections/FlowShift";
import { Capabilities } from "@/components/sections/Capabilities";
import { Calculator } from "@/components/sections/Calculator";
import { Process } from "@/components/sections/Process";
import { Portfolio } from "@/components/sections/Portfolio";
import { Manifesto } from "@/components/sections/Manifesto";
import { Testimonials } from "@/components/sections/Testimonials";
import { Pricing } from "@/components/sections/Pricing";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { showPortfolio, showPricing } from "@/lib/content";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <FlowShift />
      <Capabilities />
      <Calculator />
      <Process />
      {/* Fora do ar enquanto os cases forem inventados — ver `showPortfolio`. */}
      {showPortfolio && <Portfolio />}
      <Manifesto />
      <Testimonials />
      {/* Fora do ar enquanto o preço for "sob consulta" — ver `showPricing`. */}
      {showPricing && <Pricing />}
      <ContactCTA />
    </>
  );
}

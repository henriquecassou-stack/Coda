import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Capabilities } from "@/components/sections/Capabilities";
import { Process } from "@/components/sections/Process";
import { Portfolio } from "@/components/sections/Portfolio";
import { Manifesto } from "@/components/sections/Manifesto";
import { Testimonials } from "@/components/sections/Testimonials";
import { Pricing } from "@/components/sections/Pricing";
import { ContactCTA } from "@/components/sections/ContactCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Capabilities />
      <Process />
      <Portfolio />
      <Manifesto />
      <Testimonials />
      <Pricing />
      <ContactCTA />
    </>
  );
}

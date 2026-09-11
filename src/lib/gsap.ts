"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Trigger positions are computed against fallback-font metrics on first
  // paint; once the real webfonts swap in, text reflows (headings especially)
  // and can shift where every "top 8x%" trigger and the Process pin's
  // distance actually land. Recalculate once real metrics are in.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger, SplitText };

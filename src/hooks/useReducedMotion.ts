"use client";

import { useEffect, useState } from "react";
import { onReducedMotionChange, prefersReducedMotion } from "@/lib/motion-tokens";

/** True when the OS is set to reduce motion. Always false during SSR. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => prefersReducedMotion());

  useEffect(() => onReducedMotionChange(setReduced), []);

  return reduced;
}

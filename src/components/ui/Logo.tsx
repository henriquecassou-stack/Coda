"use client";

import { useId } from "react";

type LogoProps = {
  className?: string;
  /** When true, exposes a ref-able path for the preloader's draw-on animation. */
  animatable?: boolean;
};

/**
 * The CODA mark: a "<" formed by a single ribbon of light that folds once.
 * Pure SVG so it scales, recolors and animates without a raster asset.
 */
export function Logo({ className, animatable }: LogoProps) {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      role="img"
      aria-label="CODA"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="205" y1="40" x2="95" y2="205" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4f0" />
          <stop offset="52%" stopColor="#3d5cff" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Fold shadow — the underside of the ribbon peeking through the inner elbow */}
      <path
        d="M112 108 C124 116 124 132 112 140 C102 146 92 142 88 132 C84 122 90 112 100 108 C104 106 108 106 112 108Z"
        fill="#1c2340"
      />

      {/* The ribbon itself, drawn as one stroked polyline so the fold reads as a
          continuous material and the whole mark can be path-drawn on load. */}
      <path
        id={animatable ? "coda-logo-path" : undefined}
        d="M188 46 L82 120 L188 194"
        stroke={`url(#${gradientId})`}
        strokeWidth="46"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

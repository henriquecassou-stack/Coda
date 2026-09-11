# MOTION.md

Source of truth for motion on the CODA site. Read before adding or changing animation; update the ledger after.

## Brief
- **Site / subject:** CODA — institutional site for an AI-automation + website studio.
- **Audience:** Small/medium business owners deciding who builds their automations and their site; technical enough to notice sloppy execution.
- **Feel (3 adjectives):** Precise, confident, futuristic.
- **References / the moment to remember:** The logo — a "<" formed by a ribbon of light folding once — becomes the physical metaphor for every animated reveal on the site.

## Motion concept
> A signal travels down a straight trace at full speed, then folds once, cleanly, exactly like the ribbon in the CODA mark — no bounce, no drift, just a precise change of direction. Content on the page behaves the same way: it arrives fast and flat, then locks into place.

**Dials**
- Tempo: Snappy-to-moderate for UI and entrances (200–700ms); linear/scrub for anything tied to scroll position.
- Energy: Critically damped — no overshoot anywhere except the single magnetic CTA button (tiny, deliberate spring), which is the one place the brand allows a moment of "play."
- Direction: Consistent axis. Text and panels rise from below (mirrors the ribbon's upward fold in the logo). Decorative trace lines always run bottom-left → top-right, the same diagonal as the logo's fold.
- Material: Light traveling on a circuit trace / a folded ribbon of light — thin gradient strokes that draw themselves, flat panels with a subtle specular sheen, never soft or organic (no blur-drift blobs, no elastic wobble).
- Density: Restrained. One loud moment per section, generous negative space, never more than one medium-or-louder animation running at once.

**Techniques that fit the concept:** masked line reveals, path/line draws, clip-path wipes, scroll-scrubbed progress rails, grid/list staggers, number counters, magnetic CTA, FLIP-style plan highlight.

**Techniques that don't fit (and why):** blurred gradient blobs drifting behind sections (too organic — the brand is precise, not ambient), bouncy/springy entrances (reads as playful-consumer, not tech-premium), endless logo marquees (generic), full custom cursor replacement (adds latency risk and fights touch devices) — used only as a contained glow inside portfolio cards instead.

## Tokens
Implemented in: `src/app/globals.css` (CSS custom properties) and `src/lib/motion-tokens.ts` (JS/GSAP mirror).

| Token | Value | Used for |
|---|---|---|
| --dur-instant | 120ms | press feedback, toggles |
| --dur-fast | 220ms | hovers, small UI |
| --dur-base | 400ms | most UI transitions |
| --dur-slow | 700ms | section entrances |
| --dur-slower | 1000ms | large type/image reveals |
| --dur-epic | 1600ms | preloader ribbon draw, hero assembly only |
| --ease-enter | power3.out (cubic-bezier(.165,.84,.44,1)) | arriving |
| --ease-exit | power2.in (cubic-bezier(.55,.055,.675,.19)) | leaving |
| --ease-move | power2.inOut (cubic-bezier(.645,.045,.355,1)) | on-screen movement |
| --ease-spring | back.out(1.3), used only on magnetic CTA | one playful arrival |
| --ease-scrub | linear | scroll-linked (scroll provides the easing) |
| --shift-sm / md / lg | 8px / 24px / 64px | travel distances |
| stagger tight / base / loose | 0.02s / 0.06s / 0.12s | chars / words-icons / cards |

## Tools
- CSS: Tailwind v4 utilities + custom properties for tokens; native `@media (prefers-reduced-motion: reduce)`.
- JS library: GSAP 3.15 (free SplitText, DrawSVGish via manual stroke-dashoffset, Flip) + `@gsap/react` `useGSAP` hook + `ScrollTrigger`.
- Smooth scroll: no — native scroll kept intact; ScrollTrigger reads native scroll. (Lenis would fight trackpad/keyboard expectations and isn't needed for this concept.)
- WebGL: no — the hero's "automation" visual is a lightweight Canvas2D signal/node network (cheap, no Three.js dependency), matching "canvas leve" from the brief and the precision-over-spectacle concept.

## Choreography map

| Section | Layer | Technique (family) | Trigger | Tempo | Reduced-motion version | Notes / motif |
|---|---|---|---|---|---|---|
| Preloader | Signature | Ribbon path draw (F.28) | Load | Epic (≤1.5s), once per session | Skips straight to instant crossfade | Motif #1 — the mark folds itself once |
| Hero | Signature | Masked line reveal headline (A.1) + Canvas2D signal-node backdrop (G-lite) | Load | Slow, staggered base | Lines fade in with no mask animation; canvas static/paused | Trace lines run bottom-left→top-right |
| Serviços | Section | Icon scale-fade (D-lite) + contextual slide-in (left block from left, right block from right) | Scroll-enter, once | Base | Opacity-only crossfade | |
| Como funciona | Signature | Pinned storytelling timeline + scroll progress rail (C.14 + C.17) | Pin + scrub, ≤3vh | Scrub = linear | No pin; steps stack as a static list, rail fills on enter instead of scrub | Motif #2 — the rail is the ribbon line, growing |
| Portfólio | Section | Clip-path wipe reveal on enter (B.8) + inner parallax (B.9) + cursor glow (E.27, hover-fine only) | Scroll-enter + pointer | Base/fast | No parallax, static image, no glow | |
| Prova social | Section | Stacking/crossfade cards (C.16-lite) | Click/auto (pausable) | Base | Instant swap, no crossfade motion | Autoplay pauses on hover/focus and respects reduced motion (no autoplay) |
| Planos | Section | Loose stagger reveal + recommended-card pulse highlight | Scroll-enter, once | Base | Opacity-only, no pulse loop (single glow, then stops) | |
| CTA final / Contato | Signature-ish | Magnetic button (E.23) + input label float + underline draw (H.37) + ribbon trace closes | Pointer / focus | Fast | No magnetic follow, standard focus ring | Motif #3 — ribbon trace reappears once, closing the loop |
| Global | Supporting | Underline draw on links, press scale on buttons, mobile menu curtain | Hover/tap | Fast | Same everywhere, opacity/scale only |

## Motifs
- **The ribbon fold** (bottom-left → top-right diagonal, single clean fold): appears in the preloader (drawn), in "Como funciona" (as the progress rail), and once more in the final CTA (closing trace). Never a fourth time — three is the rhythm.
- **Rise-and-lock**: every section-level entrance moves content up into place and stops dead (no settle/overshoot) — the "arrival" half of the signal metaphor.

## Technique ledger
Everything implemented so far. Check before choosing a technique so repetition is intentional.

| Date | Page / component | Technique # (catalog) | File(s) | Notes |
|---|---|---|---|---|
| 2026-09-11 | Preloader | F.28 Path draw | `src/components/ui/Preloader.tsx` | Session-gated via sessionStorage |
| 2026-09-11 | Hero headline | A.1 Masked line reveal | `src/components/sections/Hero.tsx` | GSAP SplitText by line |
| 2026-09-11 | Hero backdrop | G-lite Canvas2D network | `src/components/canvas/SignalCanvas.tsx` | Pauses under reduced motion / off-screen |
| 2026-09-11 | Serviços cards | Contextual slide-in + icon scale-fade | `src/components/sections/Services.tsx` | |
| 2026-09-11 | Como funciona | C.14 + C.17 Pinned timeline + progress rail | `src/components/sections/Process.tsx` | Pin height capped ~2.4vh |
| 2026-09-11 | Portfólio cards | B.8 + B.9 wipe + parallax, E.27 cursor glow | `src/components/sections/Portfolio.tsx` | |
| 2026-09-11 | Prova social | C.16-lite stacking crossfade | `src/components/sections/Testimonials.tsx` | |
| 2026-09-11 | Planos | Stagger + FLIP-style highlight | `src/components/sections/Pricing.tsx` | |
| 2026-09-11 | CTA/Contato | E.23 Magnetic button, H.37 underline draw | `src/components/sections/ContactCTA.tsx` | |

## Decisions and lessons
- Skipped a full custom cursor: adds input latency risk and breaks on touch; used a contained pointer-glow inside portfolio cards instead, gated to `(hover: hover) and (pointer: fine)`.
- Skipped Lenis/smooth-scroll: the concept is about precision, not glide — native scroll fits better and avoids syncing overhead with ScrollTrigger.
- All entrance animations are set up with GSAP `from()`/`autoAlpha` at runtime so content is visible if JS fails to load (no-JS safety). Static Tailwind `opacity-0` was tried first on card grids and removed — it hides content permanently if JS never runs, which violates the no-JS-safety rule.
- "Como funciona" crossfade initially overlapped for the full scrub unit (both steps readable at once). Fixed by splitting each unit into a 60% hold + 40% crossfade, so adjacent steps never fight for attention mid-scroll.
- Hero headline at `13vw` clipped the word "CONSTRUÍMOS" on narrow phones (single unbreakable word wider than the masked, overflow-hidden line). Reduced to `10.5vw` with `break-words` as a safety net.
- Mobile nav was a short dropdown with a solid background, but the header itself is `position: fixed`, so it never pushed page content down — the hero showed through below the panel. Changed to a full-viewport fixed overlay with body-scroll lock while open.

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
- Energy: Critically damped — no overshoot anywhere except the magnetic CTA button and, as of the 2026-09-11 louder pass, the custom cursor's own spring-back — both read as "the signal briefly overshoots its lock, then settles," not generic bounce.
- Direction: Consistent axis. Text and panels rise from below (mirrors the ribbon's upward fold in the logo). Decorative trace lines always run bottom-left → top-right, the same diagonal as the logo's fold.
- Material: Light traveling on a circuit trace / a folded ribbon of light — thin gradient strokes that draw themselves, flat panels with a subtle specular sheen, never soft or organic (no blur-drift blobs, no elastic wobble).
- Density: **Layered, not restrained** (revised 2026-09-11 — see below). One scroll-triggered *section* moment at a time, as before, but continuous *ambient/supporting* layers (cursor, card tilt, inertial scroll) are now allowed to run underneath without counting against that budget — they respond to the user's own input rather than competing for attention on their own schedule.

**Techniques that fit the concept:** masked line and char reveals, path/line draws, clip-path wipes, scroll-scrubbed progress rails, grid/list staggers, number counters, magnetic CTA, FLIP-style plan highlight, inertial (Lenis) scroll, a signal-shaped custom cursor, pointer-tilt panels.

**Techniques that don't fit (and why):** blurred gradient blobs drifting behind sections (too organic — the brand is precise, not ambient), bouncy/springy entrances (reads as playful-consumer, not tech-premium), endless logo marquees (generic).

## 2026-09-11 — louder tier (client: "one of the best websites, a lot of animations")
The client asked for a full tier up from the initial restrained pass. Rather than abandon the concept, the density dial moved and two prior exclusions were reconsidered and re-justified against the *same* metaphor instead of dropped for generic reasons:

- **Custom cursor** (previously excluded: "adds latency risk and fights touch devices") — reconsidered because a cursor that literally *is the signal* (a dot at the exact pointer position, a trailing ring, states that fill/label over interactive targets) is the metaphor made literal, not decoration. Kept every original guardrail: hover-fine only, off under reduced motion, `display:none` by default (no-JS-safe — native cursor is the fallback), and explicitly restored the native cursor over `input/textarea/select` (the one rule the catalog calls non-negotiable). See `src/components/ui/CustomCursor.tsx`.
- **Smooth/inertial scroll** (previously excluded: "the concept is about precision, not glide") — reconsidered as "the signal travels the trace with weight" rather than glide-for-its-own-sake. Lenis, synced to `gsap.ticker` per the gsap-scrolltrigger skill's own integration recipe so the Process pin doesn't jitter; off entirely under reduced motion (native scroll is the fallback, not a degraded Lenis). See `src/components/ui/SmoothScroll.tsx`.

New additions that didn't require reconsidering anything (straightforwardly fit already-approved technique families):
- **3D pointer-tilt** on Services/Portfolio/Pricing cards — "the panel catches the signal's light," a literal reading of the "specular sheen" material dial that was already in the brief. Small angle (6°), hover-fine only, off under reduced motion. `src/lib/tilt.ts`.
- **Character-level hero reveal** — the plain headline lines now cascade in char-by-char (GSAP SplitText); the highlighted line keeps its existing whole-block mask reveal so the "lock" moment (chars flutter in, then the key phrase drops into place as one piece) reads as an intentional two-part beat, not a style switch mid-headline.
- **Mouse-reactive hero canvas** — the signal-node network now has a pointer-repulsion field (nodes part around the cursor within ~130px) and the whole canvas drifts a few px toward the pointer; both are purely proximity-driven (no independent loop to pause) and gated to hover-fine + no-preference.

Deliberately still **not** added, even at this louder tier: an endless marquee, blob drift, or a second WebGL/shader layer — those would be volume without a reason tied to the metaphor, which is the actual anti-pattern the skill warns about, not "too much motion" as a number.

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

New, as of the louder-tier pass — implemented as plain constants at their call site rather than CSS vars, since they're consumed only by JS/Canvas math, not styled elements:

| Constant | Value | Used for | Where |
|---|---|---|---|
| tilt max angle | 6° | Services / Portfolio / Pricing card tilt | `attachTilt(el, 6)` calls |
| cursor dot lag | 0.1s | the dot tracks the literal pointer position | `CustomCursor.tsx` |
| cursor ring lag | 0.35s | the ring trails, reads as "signal catching up" | `CustomCursor.tsx` |
| canvas repulsion radius | 130px | node network parting around the cursor | `SignalCanvas.tsx` |
| canvas parallax range | ±18px | whole backdrop drift toward pointer | `Hero.tsx` |
| Lenis lerp | 0.1 | scroll inertia smoothing factor | `SmoothScroll.tsx` |

## Tools
- CSS: Tailwind v4 utilities + custom properties for tokens; native `@media (prefers-reduced-motion: reduce)`.
- JS library: GSAP 3.15 (SplitText, DrawSVGish via manual stroke-dashoffset, Flip available but unused) + `@gsap/react` `useGSAP` hook + `ScrollTrigger`.
- Smooth scroll: **yes, as of 2026-09-11** — Lenis (`lenis` npm package), synced to `gsap.ticker`, off under reduced motion. `src/components/ui/SmoothScroll.tsx`.
- Custom cursor: **yes, as of 2026-09-11** — vanilla `quickTo`-driven dot+ring, `src/components/ui/CustomCursor.tsx`. Hover-fine + no-preference only.
- 3D tilt: **yes, as of 2026-09-11** — shared `attachTilt()` helper in `src/lib/tilt.ts`, applied per-card inside each section's existing `canHover` block.
- WebGL: still no — the hero's "automation" visual stays a lightweight Canvas2D signal/node network (now with pointer repulsion), matching "canvas leve" from the brief. A second, heavier visual layer wasn't judged to add more than the interaction-driven techniques above.

## Choreography map

| Section | Layer | Technique (family) | Trigger | Tempo | Reduced-motion version | Notes / motif |
|---|---|---|---|---|---|---|
| Preloader | Signature | Ribbon path draw (F.28) | Load | Epic (≤1.5s), once per session | Skips straight to instant crossfade | Motif #1 — the mark folds itself once |
| Hero | Signature | Char-split cascade (A.1 variant) on plain lines + whole-block mask on the highlight line + Canvas2D signal-node backdrop with pointer repulsion (G-lite) | Load + pointer | Slow, tight stagger for chars | Lines fade in with no split/mask animation; canvas static, no repulsion | Trace lines run bottom-left→top-right; canvas drifts toward pointer (hover-fine only) |
| Serviços | Section | Icon scale-fade (D-lite) + contextual slide-in (left block from left, right block from right) | Scroll-enter, once | Base | Opacity-only crossfade | |
| Capacidades | Section | Asymmetric bento-grid stagger (fade+scale) + number counters (D-lite variant) + pointer-tilt | Scroll-enter, once + pointer | Slow / slower for counters | Opacity-only, counters set straight to final value | New 2026-09-11 (layout-inspiration pass); Linear-style bento sizing, not a new technique family |
| Como funciona | Signature | Pinned storytelling timeline + scroll progress rail (C.14 + C.17) | Pin + scrub, ≤3vh | Scrub = linear | No pin; steps stack as a static list, rail fills on enter instead of scrub | Motif #2 — the rail is the ribbon line, growing |
| Portfólio | Section | Clip-path wipe reveal on enter (B.8) + inner parallax (B.9) + cursor glow (E.27, hover-fine only) | Scroll-enter + pointer | Base/fast | No parallax, static image, no glow | |
| Editorial break | Signature | Full-bleed masked line reveal + scale-lock (A.1 variant, larger scale) | Scroll-enter, once | Slower | Opacity-only, no scale | New 2026-09-11; no card, no grid — deliberate rhythm-breaker between Portfólio and Prova social, Obys-style poster type |
| Prova social | Section | Stacking/crossfade cards (C.16-lite) | Click/auto (pausable) | Base | Instant swap, no crossfade motion | Autoplay pauses on hover/focus and respects reduced motion (no autoplay) |
| Planos | Section | Loose stagger reveal + recommended-card pulse highlight | Scroll-enter, once | Base | Opacity-only, no pulse loop (single glow, then stops) | |
| CTA final / Contato | Signature-ish | Magnetic button (E.23) + input label float + underline draw (H.37) + ribbon trace closes | Pointer / focus | Fast | No magnetic follow, standard focus ring | Motif #3 — ribbon trace reappears once, closing the loop |
| Global | Supporting | Underline draw on links, press scale on buttons, mobile menu curtain | Hover/tap | Fast | Same everywhere, opacity/scale only |
| Global | Ambient (new) | Custom cursor (dot+ring, states over links/cards) | Pointer, continuous | Instant/base lag | Off — native cursor | Hover-fine only; never over form fields |
| Global | Ambient (new) | Inertial (Lenis) scroll | Scroll, continuous | lerp 0.1 | Off — native scroll | Synced to `gsap.ticker`; anchor links use `lenis.scrollTo` |
| Serviços / Portfólio / Planos cards | Supporting (new) | 3D pointer-tilt (E.25) | Pointer | Base | Off | Panels "catch the signal's light" |

## Motifs
- **The ribbon fold** (bottom-left → top-right diagonal, single clean fold): appears in the preloader (drawn), in "Como funciona" (as the progress rail), and once more in the final CTA (closing trace). Never a fourth time — three is the rhythm.
- **Rise-and-lock**: every section-level entrance moves content up into place and stops dead (no settle/overshoot) — the "arrival" half of the signal metaphor.
- **The cursor is the signal** (new): the same dot-then-ring language that describes every reveal now has a literal, continuous presence following the user's own pointer — the metaphor made persistent rather than only appearing at scroll/load moments.

## Technique ledger
Everything implemented so far. Check before choosing a technique so repetition is intentional.

| Date | Page / component | Technique # (catalog) | File(s) | Notes |
|---|---|---|---|---|
| 2026-09-11 | Preloader | F.28 Path draw | `src/components/ui/Preloader.tsx` | Session-gated via sessionStorage |
| 2026-09-11 | Hero headline | A.1 Masked line reveal | `src/components/sections/Hero.tsx` | GSAP SplitText by line |
| 2026-09-11 | Hero backdrop | G-lite Canvas2D network | `src/components/canvas/SignalCanvas.tsx` | Pauses under reduced motion / off-screen |
| 2026-09-11 | Serviços cards | Contextual slide-in + icon scale-fade | `src/components/sections/Services.tsx` | |
| 2026-09-11 | Como funciona | C.14 + C.17 Pinned timeline + progress rail | `src/components/sections/Process.tsx` | Pin height capped ~2.4vh |
| 2026-09-11 | Portfólio cards | B.8 clip-path wipe (scroll-enter) + B.9 parallax + E.27 cursor glow | `src/components/sections/Portfolio.tsx` | Wipe replaced a fade-and-rise on 2026-09-11 (audit) |
| 2026-09-11 | Prova social | C.16-lite stacking crossfade | `src/components/sections/Testimonials.tsx` | |
| 2026-09-11 | Planos | Stagger + FLIP-style highlight | `src/components/sections/Pricing.tsx` | |
| 2026-09-11 | CTA/Contato | E.23 Magnetic button, H.37 underline draw | `src/components/sections/ContactCTA.tsx` | |
| 2026-09-11 | Global | C.17 Scroll progress indicator | `src/components/ui/ScrollProgress.tsx` | Thin gradient bar, always-on, pinned to `<body>` |
| 2026-09-11 | Nav (header) | Load-in stagger | `src/components/layout/Header.tsx` | Logo, links, CTA fade+rise once on mount |
| 2026-09-11 | All section headings | A.1 Masked line reveal | `Services.tsx`, `Process.tsx`, `Portfolio.tsx`, `Testimonials.tsx`, `Pricing.tsx`, `ContactCTA.tsx` | Extends the hero technique to every section transition, once each |
| 2026-09-11 | Portfólio artwork | B.9 Inner parallax | `src/components/sections/Portfolio.tsx` | Scroll-scrubbed only, no independent loop |
| 2026-09-11 | Planos feature lists | Tight stagger reveal | `src/components/sections/Pricing.tsx` | |
| 2026-09-11 | Footer columns | Loose stagger reveal | `src/components/layout/Footer.tsx` | Converted to a client component for this |
| 2026-09-11 | Global | Inertial scroll (Lenis) | `src/components/ui/SmoothScroll.tsx` | Synced to `gsap.ticker`; off under reduced motion; intercepts `a[href^="#"]` for `lenis.scrollTo` |
| 2026-09-11 | Global | Custom cursor (E.24) | `src/components/ui/CustomCursor.tsx`, cursor styles in `globals.css` | Dot+ring, `link`/`view` states via `data-cursor`; restores native cursor over form fields |
| 2026-09-11 | Serviços / Portfólio / Planos cards | 3D pointer-tilt (E.25) | `src/lib/tilt.ts`, called from each section | 6° max, hover-fine + no-preference only |
| 2026-09-11 | Hero headline | Char-split cascade (A.1 variant, GSAP SplitText) | `src/components/sections/Hero.tsx` | Plain lines only — see "Decisions and lessons" for why the gradient line was kept as a whole-block reveal |
| 2026-09-11 | Hero backdrop | Pointer repulsion + backdrop parallax | `src/components/canvas/SignalCanvas.tsx`, `Hero.tsx` | Nodes part within ~130px of cursor; whole canvas drifts ±18px toward pointer |
| 2026-09-11 | Capacidades | Bento-grid stagger (fade+scale) + number counters | `src/components/sections/Capabilities.tsx` | 5-cell asymmetric grid (lg/md/wide/full); counters skip straight to final value under reduced motion |
| 2026-09-11 | Editorial break | A.1 masked line reveal + scale-lock | `src/components/sections/Manifesto.tsx` | New section between Portfólio and Prova social; no card/grid, full-bleed centered type |

## 2026-09-11 — layout-inspiration pass
Ran the `layout-inspiration-research` skill against AI-automation and dev-studio sites outside Brazil (US, Europe, Japan-influenced conventions) before adding new sections, so the additions would bring in genuinely new layout patterns rather than more of the existing card-grid vocabulary. Findings and what was borrowed:
- **Asymmetric bento grids** are the dominant 2026 B2B SaaS pattern (Linear: mixed cell sizes, some text-only, some with a UI fragment, creating rhythm a uniform grid doesn't). Added as **Capacidades**, a new section between Serviços and Como funciona: a 5-cell grid (one large 2×2 stat cell, two 1×1 cells, one wide integrations strip, one full-width closer) instead of another uniform card row. Two of the cells use a number-counter technique (already on the "fits the concept" list in this file but never actually implemented until now).
- **Big editorial type breaks** (Obys: a single oversized full-bleed statement used as a rhythm-breaker between conventional sections) — added as a new, uncarded section between Portfólio and Prova social: two short lines, masked-reveal-and-lock like every other heading on the site, but at Signature-tier scale and duration since it's meant to read as a pause, not another card section.
- Considered but **not** added this pass (deferred, not rejected): outcome-stat badges on portfolio cards (basement.studio-style) and a dense/progressive FAQ accordion (Japanese web-design convention of disclosed density) — client chose to ship the two above first.
- Both additions reuse existing technique families (fade+scale already used on Footer; A.1 masked reveal already used on every section heading) rather than introducing new motion vocabulary, per the "reduce monotony, don't multiply technique count" lesson from the earlier audit pass.

## 2026-09-11 — differentiation & quality-floor pass (`unbelievable-websites` skill)
Ran the skill's generic-AI-tell checklist against the live site (screenshots + DOM audit, not just re-reading the code). Found the site had drifted into some of the exact patterns the skill warns about, despite each individual addition being deliberate in isolation:
- **Every section had an identical ALL-CAPS tracked-out eyebrow** (9 instances: Hero, Serviços, Capacidades, Como funciona, Portfólio, editorial break, Prova social, Planos, Contato) — this is explicitly named as a generic-AI tell, and having it on literally everything is what made it read as templated rather than as one recurring wayfinding device. Removed it from **Capacidades** (the bold stat heading already fully explains the section) and the **editorial break** (an eyebrow above a poster contradicts the "no card, no grid, minimal chrome" intent already documented for that section — it was an oversight, not a considered choice, that one was still there). Kept it on the 6 sections where it's genuine functional wayfinding tied to a nav item. `data-eyebrow` GSAP targeting was removed alongside the markup in both files — leaving it in would have reintroduced the exact "scoped selector finds nothing" bug just fixed in Portfolio/Pricing.
- **Capacidades' bento cells used the identical bordered-rounded-3xl-card CSS as Serviços' cards** — same template, different grid, which is the "same template kit" failure mode Step 6 calls out directly. Changed the cells to a flat, borderless `rounded-2xl` surface (`bg-white/[0.035]`, no border) so they read as data tiles distinct from Serviços' bordered content cards, rather than the same component reused.
- **Real contrast audit** (WCAG, not eyeballing): `--color-fg-faint` (#5c5c68) measured ~3.0:1 against both background tokens — below the 4.5:1 AA minimum for normal text — and it's used at `text-xs` in 10 places, including the contact form's field labels (NOME, E-MAIL, MENSAGEM, etc.) and all footer text. Bumped to `#82828e` (~5.1–5.4:1 on both backgrounds), keeping the same cool-grey hue and staying visibly dimmer than `--color-fg-muted` so the text hierarchy is unchanged.
- Palette and uppercase-heading style were **not** changed — both were explicit in the original brief, and the skill's "generic dark + accent" tell is a default to avoid only when nothing specific calls for it; here the client specified it.

## 2026-09-11 — "more animation on scroll" pass
User asked for more motion while scrolling. Added, in order of restraint:
1. A global scroll-progress bar (supporting-layer, always tied to scroll position — never an independent loop, so it needs no separate pause control).
2. Section-heading masked reveal on every remaining section (previously only the hero had this) — the single highest-value addition, since it gives every section transition its own moment.
3. Real inner parallax on portfolio artwork (was documented in this file but never implemented — now it is).
4. Stagger reveals on pricing feature lists and footer columns (previously these appeared as inert parts of their parent's fade).
5. A small nav load-in on first paint.
Deliberately **not** added: ambient background trace-lines drifting behind Services/Pricing — read as too close to the "blurred gradient blob" anti-pattern for the marginal gain; skipped to keep the density budget (≤1 medium-or-louder animation per viewport) intact.

## 2026-09-11 — audit pass (`scripts/audit-motion.mjs`)
Ran the skill's audit against `src/`. 0 errors, 0 warnings, 2 info:
- **Monotony** (15 fade-and-rise entrances across 9 files): eyebrows staying uniform fade+y across sections is intentional (supporting-layer consistency, motion-design.md §4). Reduced actual repetition by switching Portfolio's scroll-enter card reveal to a clip-path wipe (was fade+y, and didn't match its own B.8 documentation) and Footer's column reveal to fade+scale instead of fade+y.
- **Infinite animation** (`Hero.tsx` scroll cue, `repeat:-1`): already compliant — it's created only inside the `(prefers-reduced-motion: no-preference)` matchMedia branch (never runs under reduced motion) and is paused via `ScrollTrigger` `onLeave`/resumed on `onEnterBack` whenever the hero scrolls out of view. No change needed.

## Decisions and lessons
- **Superseded 2026-09-11:** the two entries below (skip cursor, skip Lenis) were the calls made at the initial restrained tier. The client asked for a louder tier; both were reconsidered and added — see "2026-09-11 — louder tier" above for the reasoning, not just a reversal. Left here for history:
  - ~~Skipped a full custom cursor: adds input latency risk and breaks on touch~~ — kept the touch/latency guardrails (hover-fine gate, no-JS-safe default-hidden) but replaced the portfolio-only glow with a site-wide cursor.
  - ~~Skipped Lenis/smooth-scroll: the concept is about precision, not glide~~ — added with `lerp: 0.1` (a light touch, not heavy glide) and the exact ScrollTrigger-sync recipe from the gsap-scrolltrigger skill so the Process pin doesn't jitter.
- The portfolio's old pointer-glow (`--spot-x`/`--spot-y` radial gradient) is kept alongside the new cursor "view" state — they read as the same idea at two scales (a small glow inside the card, a bigger dot outside it), not a duplicate effect.
- Char-splitting the *highlighted* hero line was considered and rejected: `background-clip: text` for the brand gradient is set on that line's own span, and SplitText wrapping each character in its own span would break the gradient (each char span would need its own computed `background-position` slice to keep the gradient continuous — a real, doable technique, but not worth the fragility for one short phrase). The highlighted line keeps its original whole-block mask reveal; only the three plain lines got the char-cascade upgrade.
- SplitText runs synchronously at mount rather than waiting on `document.fonts.ready` — the char reveal only animates `yPercent`/`autoAlpha` (no per-character width/position measurement), so a fallback-font metrics mismatch at split time isn't visually load-bearing the way it would be for the gradient-slicing technique above. Accepted trade-off; revisit if a FOUT-related glitch is ever actually reported.
- Caught by the mobile screenshot pass: SplitText's per-character mask boxes measure a hair wider in aggregate than the same text as one run, which pushed "CONSTRUÍMOS" past the line width at 390px and broke it mid-word ("CONSTRUÍM" / "OS") — the exact failure `break-words` exists to catch, just triggered somewhere new. Fixed by only char-splitting at `window.innerWidth >= 640`; narrower viewports keep the whole-line reveal, which was already proven safe. This is why the skill's verification step says to actually look at mobile, not just reason about it.
- All entrance animations are set up with GSAP `from()`/`autoAlpha` at runtime so content is visible if JS fails to load (no-JS safety). Static Tailwind `opacity-0` was tried first on card grids and removed — it hides content permanently if JS never runs, which violates the no-JS-safety rule.
- "Como funciona" crossfade initially overlapped for the full scrub unit (both steps readable at once). Fixed by splitting each unit into a 60% hold + 40% crossfade, so adjacent steps never fight for attention mid-scroll.
- Hero headline at `13vw` clipped the word "CONSTRUÍMOS" on narrow phones (single unbreakable word wider than the masked, overflow-hidden line). Reduced to `10.5vw` with `break-words` as a safety net.
- Mobile nav was a short dropdown with a solid background, but the header itself is `position: fixed`, so it never pushed page content down — the hero showed through below the panel. Changed to a full-viewport fixed overlay with body-scroll lock while open.
- **Found during a full-site health check (2026-09-11), not the original build:** Portfolio's and Pricing's `[data-eyebrow]` / `[data-heading-line] > span` reveals never fired — `useGSAP({ scope: rootRef })` auto-scopes selector-text queries to `rootRef.current`'s subtree, but `rootRef` was attached to the inner cards grid in both files while the eyebrow/heading sat in a sibling div above it, outside that subtree. GSAP logged "target not found" and silently skipped the tween (no-JS-safety meant the text was just always visible, not broken-looking, which is exactly why it went unnoticed by eye). Fixed by moving `ref={rootRef}` to the outer `<section>`, matching Services/Capabilities. Caught only by actually reading the browser console during a Playwright pass, not by screenshots — a reminder that a silently-skipped animation looks identical to a successful one in a static screenshot.

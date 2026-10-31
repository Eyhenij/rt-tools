---
name: interface-review-principles
description: The principles an interface review judges by — accessibility, layout, writing, typography and UI polish, each as numbered rules with exact values. Load during an interface review, after the core skill, to judge a finding and to word its fix. The run order and the report form are not here — that is interface-review; the recipes with code are in interface-review-surfaces, -motion, -icons and -performance.
---

# The five domains of an interface review

## When to use

- An interface review is running by `interface-review`, and a finding needs the rule it breaks.
- A fix is worded, and the exact value the principle prescribes is needed.

The domains go in the review order. A finding is assigned to the domain that owns the underlying
rule.

## Accessibility

Accessibility is not a compliance checkbox bolted on at the end; it is the floor for interface
craft. Most of it is free if you use the platform: native elements ship with keyboard support, real
labels announce themselves, and a visible focus ring is one CSS rule. When unsure, prefer the
platform default over a custom rebuild, and remove ARIA rather than add it.

1. **Native elements first.** The first rule of ARIA: don't use ARIA when a native element exists.
   `<button>` for actions, `<a href>` for navigation (it must support Cmd/Ctrl/middle-click), never
   `<div onClick>`. No ARIA is better than bad ARIA.
2. **Visible focus rings.** Style `:focus-visible`, not bare `:focus`, so keyboard users get a ring
   and mouse users usually don't. Prefer the browser's unmodified focus indicator. If the design
   needs a custom ring, use a project focus token or another explicit color and verify the complete
   indicator against every adjacent color it crosses; `currentColor` is acceptable only after the
   same check. Use at least a `2px` solid perimeter or an equivalent visible area. Never use
   `outline: none` without a verified replacement, and preserve system colors in forced-colors mode.
3. **Full keyboard support.** Every pointer interaction needs a keyboard path, following the ARIA APG
   patterns: Escape closes overlays, arrow keys move within composite widgets (tabs, menus,
   listboxes), Tab moves between widgets, Enter and Space activate. Only `tabindex="0"` (join the
   natural tab order) and `tabindex="-1"` (programmatic focus), never positive values, which break
   the natural order. Composite widgets use roving tabindex: the active item is `0`, all others `-1`.
4. **Trap and restore focus.** Modals set `inert` on the background content, move focus inside on
   open, and return focus to the trigger on close. Add `overscroll-behavior: contain` so background
   content doesn't scroll.
5. **Minimum hit area.** WCAG 2.5.8's Level AA baseline is a 24×24 CSS-pixel target or one of its
   defined spacing, equivalent-control, inline, user-agent, or essential exceptions. For easier
   activation, aim for 44×44px in touch contexts and 40×40px in desktop interfaces when density
   permits. Extend with a pseudo-element if the visible element should stay smaller. Never let
   extended hit areas overlap.
6. **Label and type every control.** Every input gets a `<label for>` or wrapping `<label>`; a
   placeholder is never a label, and label and control share one hit target: no dead zones between a
   checkbox and its text. Add `autocomplete` with a meaningful `name`, and the correct `type` and
   `inputmode` for the keyboard. Never block paste; users paste passwords and one-time codes.
7. **Accessible names everywhere.** Icon-only buttons need a descriptive `aria-label`. Visible label
   text must appear in the accessible name. Decorative elements get `aria-hidden="true"`, never on a
   focusable element.
8. **Don't rely on color alone.** Status needs a redundant cue: icon, text, or underline alongside
   the color. Determine which WCAG contrast requirement applies from the content and state, then
   measure the rendered foreground/background pair. When contrast fails, report the pair and the
   requirement it misses; do not change the project's colors unless asked.
9. **Honor prefers-reduced-motion.** Wrap motion in `@media (prefers-reduced-motion: no-preference)`
   so it is opt-in. Under reduced motion, replace slides and scales with opacity crossfades; kill
   parallax and autoplay entirely. Independent of the preference: autoplaying media needs a visible
   pause control, and toasts carrying actions or errors stay until dismissed.

## Layout

Layout communicates before a single word is read: position, spacing, and alignment carry hierarchy
on their own, and generous space beats decoration. A good layout also survives stress: resize it,
translate it, mirror it for RTL, and it should still hold together.

1. **Group with space, not lines.** Negative space is the primary grouping tool; background shapes
   second; separator lines last, only where space alone can't carry the structure. The gap between
   groups must be at least 2× the gap within a group (`8px` intra-group → `16px`+ inter-group), or
   the grouping reads as noise.
2. **Keep controls distinct from content.** Interactive elements must look interactive: a background
   shape, a border, or a consistent placement zone. Never style a control identically to adjacent
   static text.
3. **Align to shared edges.** Pick alignment edges and stick to them; every stray edge reads as
   noise. Use one project spacing step for each level of subordination (`16px` is a useful default).
   Use logical properties (`padding-inline-start`, `margin-inline-end`) for direction-dependent
   layout; reserve physical left/right for genuinely physical geometry.
4. **Order by importance.** The most important content sits near the top and the leading edge;
   reading order flows top-to-bottom, leading-to-trailing. Think in leading/trailing, not left/right.
5. **Breathing room between targets.** Without an established density system, start with `12px`
   between adjacent bordered or filled controls and `24px` of clearance around borderless text- and
   icon-only controls. Compact layouts may use less when the hit areas above do not overlap and the
   controls remain visually distinct.
6. **Hold structure until it breaks.** Breakpoints come from the content, not device presets. Keep
   the expanded layout as long as it genuinely fits and collapse late; prefer container queries for
   component-level adaptation. Test the smallest and largest sizes first.
7. **Plan for growth and clipping.** Plan for substantial and language-dependent string growth
   rather than relying on a universal percentage: no fixed widths or heights on text containers, and
   let rows wrap. Never park critical actions where resizing or scrolling clips them; keep them
   reachable in the normal flow or stable chrome appropriate to the product.

## Writing

Clear and brief beats clever, consistency beats variety, and the best error message is the
interaction redesigned so the error can't happen. Preserve intentional brand character when it
remains clear and appropriate to the stakes: treat a difference from generic plain language as a
finding only when it creates inconsistency, ambiguity, translation risk, or an inappropriate tone.

1. **One voice, flexible tone.** The product has one voice, established by its existing system
   rather than invented during a local edit. Keep terms consistent: if it's "Archive" in the menu,
   it isn't "Move to storage" in the toast. Tone flexes with the stakes:

   | Context | Tone |
   | --- | --- |
   | Success, onboarding, empty states | Warm, can be light |
   | Routine actions, settings | Neutral, minimal |
   | Errors, destructive confirmations | Calm, plain, zero playfulness |
   | Data loss, security | Serious, explicit |

2. **Plain words over clever ones.** Choose easily understood words and delete every word that isn't
   needed. No idioms, colloquialisms, or humor that won't translate. Skip unnecessary gender:
   "Subscribers can post recipes", not "each subscriber can post his or her recipes". Match the input
   device: "tap" on touch, "click" with a pointer, "select" when both are possible. Never build
   sentences by concatenating fragments around variables (`"You have " + n + " new messages"`); word
   order changes per language, so use full templated strings with proper pluralization.
3. **Verb-first buttons.** Button labels start with a verb naming the specific action: "Send", "Save
   draft", "Delete project". Never "OK!", "Let's go!", or bare "Yes"/"No" on consequential actions.
   Confirmation buttons repeat the consequence so the dialog is answerable without reading the body:
   "Delete this project?" offers `Delete project` and `Cancel`, not `Yes` and `No`.
4. **Links describe their destination.** Link text makes sense out of context; screen-reader users
   navigate by a list of the page's links. "Read the billing docs", never "Click here" (which also
   fails the device-verb rule on touch), and never a bare "Learn more" when several appear on one
   page. Suffix each: "Learn more about exports".
5. **One capitalization policy.** Pick title case or sentence case per element type (all buttons, all
   headings) and apply it consistently; sentence case is the safer default: calmer, no per-word case
   rules, localizes cleanly. "Save Changes" beside "Discard changes" reads as sloppiness.
6. **Errors say how to fix, next to where it broke.** An error is an instruction, adjacent to the
   failing field:

   | Bad | Good |
   | --- | --- |
   | That password is too short | Choose a password with at least 8 characters |
   | Invalid name | Use only letters for your name |
   | Oops! Something went wrong. | Unable to save. Check your connection and try again. |

   No blame, no "oops", no exclamation marks. Phrase hints positively ("Use only letters", not
   "Don't use numbers or symbols") and show them before the mistake, not after. If the same error
   keeps firing for many users, redesign the interaction instead of rewording it.
7. **Empty states point forward.** An empty state says what this place is and how to fill it, with
   one clear next action:

   ```html
   <!-- Bad: a shrug -->
   <p>No results.</p>

   <!-- Good: orientation plus a next step -->
   <p class="font-medium">No projects yet</p>
   <p class="text-sm text-zinc-500">Projects keep your tasks and files together.</p>
   <button class="mt-4">Create a project</button>
   ```

   Search and filter empty states name the query and offer an exit: "No results for 'quarterly'.
   Clear filters". Never park crucial persistent information in an empty state; it disappears the
   moment content exists.

## Typography

Good typography is mostly restraint. A sensible scale, comfortable spacing and enough contrast beat
any clever effect. A label, a table cell, a marketing headline and an article paragraph should not
share one set of rules.

1. **Fewer fonts, sizes and weights.** Rarely use more than three fonts. Weight and size define
   hierarchy, but overusing them hurts readability quickly. Pair for contrast, not similarity: a
   serif headline with a sans body reads as deliberate, two near-identical sans-serifs read as a
   mistake. Below `18px`, stay at weight `400`+; weights under `300` are display-only (`28px`+),
   they disappear at text sizes.
2. **Use a type scale with semantic names.** Define a small set of sizes and deviate from it as
   little as possible. Hard-coded sizes without a system break down at scale. For solo projects,
   default names like `text-sm` work fine as long as the usage rules are clear. On a team, name
   sizes by use (`text-body-sm`), not by size, so the rules stay consistent.
3. **Heading sizes descend with level.** Within a coherent page hierarchy, map heading levels to
   descending steps of the type scale: a visually subordinate heading should not accidentally
   overpower its parent. Adjacent levels may share a size toward the small end of the scale as long
   as weight or spacing keeps them distinct. Pick semantic heading elements per the accessibility
   principles above; this section controls only their visual treatment.
4. **Line-height by role.** Headings tighter, around `1.1`. Body copy `1.5` to `1.6`. Prefer unitless
   values so line-height scales with the font size; fixed values like `24px` do not. Tight
   line-height is for short text: anything that wraps to three or more lines needs at least `1.4`,
   even in height-constrained rows.
5. **Cap the measure.** Long lines make it hard for the eye to find the next line. Cap long-form text
   around 60–75 characters per line. Any unit works: `65ch` measures characters directly, and a pixel
   or rem cap is just as good: at a `16px` body size the range lands roughly between `560px` and
   `680px` depending on the font, so Tailwind's `max-w-xl` or `max-w-2xl` fit. What matters is that a
   cap exists and the resulting line length sits in range.
6. **Wrap deliberately.** `text-wrap: balance` distributes text evenly across lines: use it on
   headings. `text-wrap: pretty` avoids leaving a single short word on the final line: use it on
   descriptions. Skip both in long-form text: browsers ignore `balance` past a few lines anyway, and
   evening out a whole paragraph wastes space and makes it harder to read. `overflow-wrap:
   break-word` where long words, links or IDs could escape the container. `white-space: nowrap` on
   labels and badges where a line break looks broken.
7. **Tabular numbers on changing values.** Digits have different widths by default, so timers,
   counters and prices shift layout as they update. Apply `font-variant-numeric: tabular-nums` to any
   value that changes.
8. **Truncate without losing content.** Single line: `text-overflow: ellipsis` with `overflow:
   hidden` and `white-space: nowrap`. Multiple lines: `line-clamp`. Truncation hides content, so if
   the missing text matters, keep the full value reachable in a tooltip or expanded view.
9. **Inputs at 16px on mobile.** iOS Safari zooms the whole page when an input's text is smaller than
   `16px`. Keep input text at `16px` on mobile viewports (`text-base sm:text-sm`). Avoid the
   `maximum-scale=1` viewport meta: Safari ignores it for pinch zoom, but every other browser honors
   it and blocks zooming, which fails WCAG.

## UI polish

Great interfaces rarely come from a single thing. It's usually a collection of small details that
compound into a great experience. This section assumes an animation belongs; deciding whether it
belongs at all, and what it costs the user at its trigger frequency, is a separate question worth
asking before reaching for the recipes in `interface-review-motion`.

1. **Concentric border radius.** Outer radius = inner radius + padding. Mismatched radii on nested
   elements is the most common thing that makes interfaces feel off.
2. **Optical over geometric alignment.** When geometric centering looks off, align optically.
   Buttons with icons, play triangles, and asymmetric icons all need manual adjustment.
3. **Shadows for elevation, borders for structure.** For buttons, cards, and containers whose border
   exists only to create depth, prefer layered transparent `box-shadow` values. Keep borders that
   communicate structure or state: dividers, layout separators, and selected or focus states.
4. **Interruptible animations.** Use CSS transitions for interactive state changes: they can be
   interrupted mid-animation. Reserve keyframes for staged sequences that run once.
5. **Split and stagger enter animations.** For an infrequent staged entrance where sequence helps
   communicate hierarchy, break content into semantic chunks and stagger them by ~100ms instead of
   animating one container. Confirm the entrance is infrequent enough to earn a stagger; anything
   the user triggers often should not stagger at all.
6. **Subtle exit animations.** Use a small fixed `translateY` instead of full height. Exits should be
   softer than enters. Use `ease-out` for both enter and exit transitions.
7. **Contextual icon animations.** Animate icons with `opacity`, `scale`, and `blur` instead of
   toggling visibility. Use exactly these values: scale from `0.25` to `1`, opacity from `0` to `1`,
   blur from `4px` to `0px`. If the project has `motion` or `framer-motion` in `package.json`, match
   that package's import path (or the established nearby imports when both exist) and use
   `transition: { type: "spring", duration: 0.3, bounce: 0 }`; bounce must always be `0`. If no
   motion library is installed, keep both icons in the DOM (one absolute-positioned) and cross-fade
   with CSS transitions using `cubic-bezier(0.2, 0, 0, 1)`; this gives both enter and exit
   animations without any dependency.
8. **Image outlines.** Add a subtle `1px` outline with low opacity to images for consistent depth.
   The color must be pure black in light mode (`oklch(0 0 0 / 0.1)`) and pure white in dark mode
   (`oklch(1 0 0 / 0.1)`), never a near-black like slate, zinc, or any tinted neutral. A tinted
   outline picks up the surface color underneath it and reads as dirt on the image edge.
9. **Scale on press.** A subtle `scale(0.96)` on click gives buttons tactile feedback. Always use
   `0.96`. Never use a value smaller than `0.95`: anything below feels exaggerated. Add a `static`
   prop to disable it when motion would be distracting.
10. **Skip animation on page load.** Use `initial={false}` on `AnimatePresence` to prevent enter
    animations on first render. Verify it doesn't break intentional entrance animations.
11. **Never use `transition: all`.** Always specify exact properties: `transition-property: scale,
    opacity`. Tailwind's `transition-transform` covers `transform, translate, scale, rotate`.
12. **Use `will-change` sparingly.** Only for `transform`, `opacity`, `filter`, the properties the
    GPU can composite. Never use `will-change: all`. Only add when you notice first-frame stutter.
13. **Match icon stroke to text weight.** An icon next to text carries the text's optical weight:
    `1.5px` stroke beside regular (400) text, `2px` beside semibold (600). One stroke weight per icon
    set; never mix libraries on one surface.
14. **One SVG, recolored per state.** Icons use `currentColor` and get their states (hover, selected,
    disabled) from CSS color and opacity, never from separate assets. Outline variant is the
    default; fill variant marks the active state.

| Mistake | Fix |
| --- | --- |
| Same border radius on closely nested parent and child | Calculate `outerRadius = innerRadius + padding` |
| Icons look off-center | Adjust optically with padding or fix SVG directly |
| Border used only to fake elevation | Use layered `box-shadow` with transparency; keep structural and state borders |
| Jarring staged entrance or contextual exit | Stagger infrequent entrances and keep context-preserving exits subtle |
| Stateful icon or toggle animates its default state on page load | Add `initial={false}` to that `AnimatePresence`; preserve intentional page entrances |
| `transition: all` on elements | Specify exact properties |
| First-frame animation stutter | Add `will-change: transform` (sparingly) |
| Hairline icon beside bold text | Match the stroke width to the text weight |
| Separate icon assets per state | One `currentColor` SVG, states via CSS |
| Filled icons everywhere | Outline as default, fill only for the active state |

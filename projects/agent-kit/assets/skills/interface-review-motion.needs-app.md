---
name: interface-review-motion
description: Recipes for motion in an interface review — interruptible transitions against keyframes, split and staggered entrances, subtle exits, contextual icon animations with exact values, scale on press, skipping animation on page load — with CSS, Tailwind and Motion code. Load when a finding about an animation is worded or implemented. Whether an animation belongs at all and reduced motion are in interface-review-principles; transition properties and will-change in interface-review-performance.
---

# Animations

Interruptible animations, enter/exit transitions, contextual icon animations and scale on press.

## When to use

- A finding of `interface-review` is about an animation that cannot be interrupted, a jarring
  entrance or exit, an icon that pops instead of animating, or press feedback.

Everything here assumes the animation belongs. Whether it belongs at all — what it costs the user at
its trigger frequency, and whether it should be shortened, made one-sided, or deleted — is a
separate question, and the answer defaults to no. Honoring `prefers-reduced-motion` is covered by the
accessibility principles in `interface-review-principles`; apply it to every animation here.

## Interruptible animations

Users change intent mid-interaction. If animations aren't interruptible, the interface feels broken.

| | CSS Transitions | CSS Keyframe Animations |
| --- | --- | --- |
| **Behavior** | Interpolate toward latest state | Run on a fixed timeline |
| **Interruptible** | Yes, retargets mid-animation | No, restarts from beginning |
| **Use for** | Interactive state changes (hover, toggle, open/close) | Staged sequences that run once (enter animations, loading) |
| **Duration** | Fixed; retargets the value mid-flight, not the timeline | Fixed timeline, restarts from the beginning |

```css
/* Good: interruptible transition for a toggle */
.drawer {
  transform: translateX(-100%);
  transition: transform 200ms ease-out;
}
.drawer.open {
  transform: translateX(0);
}
/* Clicking again mid-animation smoothly reverses, no jank */

/* Bad: keyframe animation for interactive element */
.drawer.open {
  animation: slideIn 200ms ease-out forwards;
}
/* Closing mid-animation snaps or restarts, feels broken */
```

**Rule:** Always prefer CSS transitions for interactive elements. Reserve keyframes for one-shot
sequences.

## Enter animations: split and stagger

Use this pattern for infrequent staged entrances where sequence helps communicate hierarchy, such as
the first load of a page hero, success state, or empty state. Break a large container into semantic
chunks and animate each individually. Stagger only where the entrance is infrequent; anything the
user triggers often should animate as one container, or not at all.

1. **Split** into logical groups (title, description, buttons)
2. **Stagger** with ~100ms delay between groups
3. **For titles**, consider splitting into individual words with ~80ms stagger
4. **Combine** `opacity`, `blur`, and `translateY` for the enter effect

```tsx
// Motion (Framer Motion): staggered enter
const item = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

function PageHeader() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.h1 variants={item}>Welcome</motion.h1>
      <motion.p variants={item}>A description of the page.</motion.p>
      <motion.div variants={item}>
        <Button>Get started</Button>
      </motion.div>
    </motion.div>
  );
}
```

```css
/* CSS-only stagger */
.stagger-item {
  opacity: 0;
  transform: translateY(12px);
  filter: blur(4px);
  animation: fadeInUp 400ms ease-out forwards;
}

.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 100ms; }
.stagger-item:nth-child(3) { animation-delay: 200ms; }

@keyframes fadeInUp {
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
```

## Exit animations

Exit animations should be softer and less attention-grabbing than enter animations. The user's focus
is moving to the next thing; don't fight for attention.

```tsx
// Subtle exit (recommended): small fixed translateY indicates direction without drama
<motion.div
  exit={{
    opacity: 0,
    y: -12,
    filter: "blur(4px)",
    transition: { duration: 0.15, ease: "easeOut" },
  }}
>
  {content}
</motion.div>

// Full exit, when spatial context is important (a card returning to a list, a drawer closing)
<motion.div
  exit={{
    opacity: 0,
    x: "-100%",
    transition: { duration: 0.2, ease: "easeOut" },
  }}
>
  {content}
</motion.div>
```

```css
/* Good: subtle exit */
.item-exit {
  opacity: 0;
  transform: translateY(-12px);
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}

/* Bad: dramatic exit that steals focus */
.item-exit {
  opacity: 0;
  transform: translateY(-100%) scale(0.5);
  transition: all 400ms ease-out;
}

/* Sometimes correct: remove immediately when motion adds no context */
.item-exit {
  display: none;
}
```

- Use a small fixed `translateY` (e.g., `-12px`) instead of the full container height.
- Keep some directional movement to indicate where the element went.
- Exit duration should be shorter than enter duration (150ms vs 300ms).
- Use a subtle exit when it preserves spatial context. Remove immediately when motion adds no
  information, the interaction repeats frequently, or reduced motion is requested.

## Contextual icon animations

When icons appear or disappear contextually (on hover, on state change), animate them with
`opacity`, `scale`, and `blur` rather than just toggling visibility.

This example uses the `motion` package. If the project instead has `framer-motion`, import the same
APIs from `"framer-motion"`; never mix an installed package with the other package's import path.

```tsx
import { AnimatePresence, motion } from "motion/react";

function IconButton({ isActive, icon: Icon }) {
  return (
    <button>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={isActive ? "active" : "inactive"}
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
```

If the project doesn't use Motion (Framer Motion), keep both icons in the DOM and cross-fade them
with CSS transitions. Because neither icon unmounts, both enter and exit animate smoothly. One icon
is absolutely positioned on top of the other: the entering icon scales up from `0.25` while the
exiting icon scales down to `0.25`, both with opacity and blur.

```tsx
function IconButton({ isActive, ActiveIcon, InactiveIcon }) {
  const swap = "transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]";
  const shown = "scale-100 opacity-100 blur-0";
  const hidden = "scale-[0.25] opacity-0 blur-[4px]";
  return (
    <button>
      <div className="relative">
        <div className={cn("absolute inset-0 flex items-center justify-center", swap, isActive ? shown : hidden)}>
          <ActiveIcon />
        </div>
        <div className={cn(swap, isActive ? hidden : shown)}>
          <InactiveIcon />
        </div>
      </div>
    </button>
  );
}
```

The non-absolute icon (InactiveIcon) defines the layout size. The absolute icon (ActiveIcon)
overlays it without affecting flow.

| | Motion (Framer Motion) | CSS transitions (both icons in DOM) |
| --- | --- | --- |
| **Enter animation** | Yes | Yes |
| **Exit animation** | Yes (via `AnimatePresence`) | Yes (cross-fade, icon never unmounts) |
| **Spring physics** | Yes | No, use `cubic-bezier(0.2, 0, 0, 1)` as approximation |
| **When to use** | Project already uses `motion` or `framer-motion` | No motion dependency, or keeping bundle small |

**Rule:** Check the project's `package.json`. Import from `"motion/react"` when `motion` is
installed, or from `"framer-motion"` when `framer-motion` is installed. If both exist, follow the
imports already used by the component or its nearest peers. If neither is present, use the CSS
cross-fade pattern; don't add a dependency just for icon transitions.

| Animate | Don't animate |
| --- | --- |
| Icons that appear on hover (action buttons) | Static navigation icons |
| State change icons (play → pause, like → liked) | Decorative icons |
| Icons in contextual toolbars | Icons that are always visible |
| Loading/success state indicators | Icon labels (text next to icon) |

**Important:** Always use exactly these values for contextual icon animations; do not deviate:

- `scale`: `0.25` → `1` (never use `0.5` or `0.6`)
- `opacity`: `0` → `1`
- `filter`: `"blur(4px)"` → `"blur(0px)"`
- `transition`: `{ type: "spring", duration: 0.3, bounce: 0 }`; **bounce must always be `0`**, never
  `0.1` or any other value

## Scale on press

A subtle scale-down on click gives buttons tactile feedback. Always use `scale(0.96)`. Never use a
value smaller than `0.95`: anything below feels exaggerated. Use CSS transitions for
interruptibility, so that if the user releases mid-press, it smoothly returns. Not every button needs
this: add a `static` prop to the button component that disables the scale effect when the motion
would be distracting.

```css
.button {
  transition-property: scale;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

.button:active {
  scale: 0.96;
}
```

```tsx
// Tailwind
<button className="transition-transform duration-150 ease-out active:scale-[0.96]">Click me</button>

// Motion
<motion.button whileTap={{ scale: 0.96 }}>Click me</motion.button>

// Static prop pattern
const tapScale = "active:not-disabled:scale-[0.96]";

function Button({ static: isStatic, className, children, ...props }) {
  return (
    <button
      className={cn("transition-transform duration-150 ease-out", !isStatic && tapScale, className)}
      {...props}
    >
      {children}
    </button>
  );
}

<Button>Click me</Button>           {/* scales on press */}
<Button static>Submit</Button>       {/* no scale */}
```

## Skip animation on page load

Use `initial={false}` on `AnimatePresence` to prevent enter animations from firing on first render.
Elements that are already in their default state shouldn't animate in on page load, only on
subsequent state changes.

```tsx
// Good: icon doesn't animate in on mount, only on state change
<AnimatePresence initial={false} mode="popLayout">
  <motion.span
    key={isActive ? "active" : "inactive"}
    initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
  >
    <Icon />
  </motion.span>
</AnimatePresence>
```

Works well for: icon swaps, toggles, tabs, segmented controls: anything that has a default state on
page load.

Don't use `initial={false}` when the component relies on its `initial` prop to set up a first-time
enter animation, like a staggered page hero or a loading state. In those cases, removing the initial
animation skips the entire entrance.

```tsx
// Bad: initial={false} would skip the staggered page enter entirely
<AnimatePresence initial={false}>
  <motion.div initial="hidden" animate="visible" variants={...}>
    ...
  </motion.div>
</AnimatePresence>
```

Verify the component still looks right on a full page refresh before applying this.

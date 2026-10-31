---
name: interface-review-motion-states
description: Recipes for animated state changes in an interface review: contextual icon swaps with exact values, scale on press, no animation on page load, with CSS, Tailwind and Motion code. Load when such a finding is worded or fixed. Entrances and exits are in interface-review-motion.
---
<!-- rt-kit v0.33.1 · skills/interface-review-motion-states.needs-app.md · f7056abf9ad1 · правится надстройкой, не здесь -->

# Animated state changes

Contextual icon animations, scale on press and skipping animation on page load. Interruptible
animations, entrances and exits are in `interface-review-motion`; its scope applies here too.

## When to use

- A finding of `interface-review` is about an icon that pops instead of animating, missing press
  feedback, or a toggle that animates its default state on page load.

## Contextual Icon Animations

When icons appear or disappear contextually (on hover, on state change), animate them with
`opacity`, `scale`, and `blur` rather than just toggling visibility.

### Motion Example

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

### CSS Transition Approach (No Motion)

If the project doesn't use Motion (Framer Motion), keep both icons in the DOM and cross-fade them
with CSS transitions. Because neither icon unmounts, both enter and exit animate smoothly.

The trick: one icon is absolutely positioned on top of the other. Toggling state cross-fades them:
the entering icon scales up from `0.25` while the exiting icon scales down to `0.25`, both with
opacity and blur.

```tsx
function IconButton({ isActive, ActiveIcon, InactiveIcon }) {
  return (
    <button>
      <div className="relative">
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "transition-[opacity,filter,scale] duration-300",
            "ease-[cubic-bezier(0.2,0,0,1)]",
            isActive
              ? "scale-100 opacity-100 blur-0"
              : "scale-[0.25] opacity-0 blur-[4px]"
          )}
        >
          <ActiveIcon />
        </div>
        <div
          className={cn(
            "transition-[opacity,filter,scale] duration-300",
            "ease-[cubic-bezier(0.2,0,0,1)]",
            isActive
              ? "scale-[0.25] opacity-0 blur-[4px]"
              : "scale-100 opacity-100 blur-0"
          )}
        >
          <InactiveIcon />
        </div>
      </div>
    </button>
  );
}
```

The non-absolute icon (InactiveIcon) defines the layout size. The absolute icon (ActiveIcon)
overlays it without affecting flow.

### Choosing Between Motion and CSS

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

### When to Animate Icons

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

## Scale on Press

A subtle scale-down on click gives buttons tactile feedback. Always use `scale(0.96)`. Never use a
value smaller than `0.95`: anything below feels exaggerated. Use CSS transitions for
interruptibility, so that if the user releases mid-press, it smoothly returns.

Not every button needs this. Add a `static` prop to your button component that disables the scale
effect when the motion would be distracting.

### CSS Example

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

### Tailwind Example

```tsx
<button className="transition-transform duration-150 ease-out active:scale-[0.96]">
  Click me
</button>
```

### Motion Example

```tsx
<motion.button whileTap={{ scale: 0.96 }}>
  Click me
</motion.button>
```

### Static Prop Pattern

Extract the scale class into a variable and conditionally apply it based on a `static` prop:

```tsx
const tapScale = "active:not-disabled:scale-[0.96]";

function Button({ static: isStatic, className, children, ...props }) {
  return (
    <button
      className={cn(
        "transition-transform duration-150 ease-out",
        !isStatic && tapScale,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Usage
<Button>Click me</Button>           {/* scales on press */}
<Button static>Submit</Button>       {/* no scale */}
```

## Skip Animation on Page Load

Use `initial={false}` on `AnimatePresence` to prevent enter animations from firing on first render.
Elements that are already in their default state shouldn't animate in on page load, only on
subsequent state changes.

### When It Works

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

### When It Breaks

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

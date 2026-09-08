# The narrow screen is decided in one place

## The context

The kit asked the application about the narrow screen: a mandatory input `isMobile` stood at a dozen
and a half components and was passed down the tree from one to another. The application at that
measured the width as it could, the kit had no opinion of its own, and one forgotten `[isMobile]` in
the middle of the tree was enough for half of a table to count the screen wide and half — narrow.

The second source is the styles. A part of the mobile look already lived in media queries by
`$device-*`, a part was put by a modifier from the template by the same input. The thresholds
coincided by accident, not by an agreement: the media query looked at its own, the application at
whatever it wanted.

The task #120.

## The accepted decisions

1. **The sign of a narrow screen is given by the kit, not by the application.** It is measured by
   `BreakpointService` from `@rt-tools/core` — a service that was already in the tree and was already
   used. Its threshold, `max-width: 599px`, coincides with `media-breakpoint-down(vars.$device-xs)`.
2. **The input `isMobile` stays, but not mandatory and taken out of use.** A value passed by the
   application is above the measurement: an application that draws the kit in a narrow panel on a wide
   screen goes on working. Rejected: to remove the input at once — that way the consumer breaks
   without a transition. The transition ended by the task RT-302: the input is removed, and the
   section "The input is removed" below says what that means for the consumer.
3. **The look is decided by CSS, the behaviour by the service.** The size, the padding and the layout
   are declared by a media query; to the condition in the template is left what CSS does not do:
   another branch of the tree, a switched-off hint, another handler.

## What counts as done

- Not a single component of the kit passes the sign of a narrow screen to another component of the
  kit.
- The sizes and the layout of the narrow screen do not depend on whether the application gave the
  input or not.
- The agreement is written by the rule `styling-bem`, the section "The narrow screen".

---

## The device

In a component:

```typescript
readonly #breakpoints: BreakpointService = inject(BreakpointService);

/** The screen is narrow: the value of the input if the application gave it, otherwise the measurement of the kit. */
protected readonly narrow: Signal<boolean> = computed(() => this.isMobile() ?? !!this.#breakpoints.isMobile());
```

The service is declared without a root area, so every component injecting it names it in its own
`providers`. The skip is seen neither by the build, nor by the types, nor by the specs — only by the
drawing, which falls with `NG0201`.

In the styles the threshold is the same, but written past the code:

```scss
@include mixins.media-breakpoint-down(vars.$device-xs) {
    visibility: visible;
}
```

A rule acting only on a wide screen is declared by a query upward (`media-breakpoint-up`), not
cancelled by a second rule downward: the cancelling leaves in the file two places where one question
is decided.

## What changed at the consumer

- **`[isMobile]` is no longer mandatory.** An application that passed it loses nothing.
- **The button of the copying in a cell of a table** is shown on a narrow screen by a media query, not
  by a modifier from the template.
- **The moving of the pagination into a column** stayed an answer to the lack of width under the full
  list of the pages and does not spread to the narrow screen — there is no list there at all.
- **Three user properties of the pagination are renamed**: `-container-mobile-gap`,
  `-paging-mobile-margin` and `-size-toggle-selector-mobile-margin` became `-container-clipped-gap`,
  `-paging-clipped-margin` and `-size-toggle-selector-clipped-margin`. The names lied: the rules under
  them act above the mobile threshold, not below it.
- **`RtuiTableComponent` and `RtuiDynamicListComponent` give outward `narrow` instead of `isMobile`**
  — the same name stands in the contract `ITableComponent`.

## The check

```bash
pnpm exec nx run-many -t lint typecheck test build --all --parallel
pnpm run lint:styles
pnpm run test:visual
```

The snapshots of the showcase are taken on a wide screen and say nothing about the narrow one: the
window of the browser on macOS does not narrow below 606px, and the threshold `599px` is not reached
through it. The narrow look is measured by the driver of the showcase — the technique is written in
`.claude/skills/browser-verification/implementation.md`.

## The input is removed

The transitional input lived from the task #120 to RT-302 and is removed in a major release of the
kit. By a work of its own, not by the same turn — because the removal breaks the public contract of
seventeen components, and its price was found out after the measurement of the kit showed itself
working.

- **`narrow` reads only the service.** There is no overriding by the input any more, and no bands of
  widths where the kit and the application count the screen differently.
- **The mobile stories of the showcase show the narrow look by the frame of the shot.** The input was
  the only way to show it on a wide window; now the narrow look is given by the width of the window of
  the show itself — the frame is declared in the setting of the show by the name `narrow` and is taken
  knowingly narrower than the threshold.
- **A narrow panel on a wide screen is still not told apart by the kit.** The argument the input was
  left by has not gone anywhere; it is closed by container queries, not by a second source of the
  sign.

<!-- rt-kit v0.28.0 · pitfalls/styling-bem.md · e576a3bde799 · правится надстройкой, не здесь -->
# Styling — cold part

Pitfalls: traps already stepped on. Loaded not with the rule but on demand — an ordinary
decision does not need it.

The rule is `styling-bem`; the articles that hold the law stand there.

## Pitfalls

- **`rtElem` without an `rtBlock` ancestor crashes rendering at runtime** — build and lint are
  silent.
- **A projected node has no ancestor block.** `rtElem` takes the block name by injection from the
  nearest ancestor **by the place of the template declaration**, not by the place of insertion:
  an element the screen declares in its own template and hands into another component's
  projection looks for `rtBlock` in its own template and does not find it. Rendering fails at
  runtime, build and lint are green. The class on such a node is hung by a rule on the kit's
  selector in the shared layout layer, not by the directive.
- **An element with `backdrop-filter` or its own `z-index` locks its descendants into its own
  layer.** A sticky header with blur is the most frequent case: the layer number of what lies
  inside it is compared not with neighbours on the page but only with neighbours inside the
  header, and the bottom panel covers the open drawer together with its button. This is checked
  with `elementFromPoint` at the button's centre: build, lint and a screenshot show a whole page
  here.
- **Component styles do not reach a node moved out to `<body>`.** The library puts the preview
  and the drag placeholder there, and the component's rules are scoped by attribute: the file
  looks working and paints nothing. Such rules are declared in the application's shared layer.
  Neither the build, nor lint, nor the "class without a rule" check sees this: there is no such
  class in the template at all, and it can lie there for several tasks in a row.
- **A token name is checked by nothing.** A reference to a nonexistent token builds, passes
  stylelint and the class-without-a-rule check, and the property silently takes the inherited
  value: the rule looks written and paints nothing. This is caught only by measurement in the
  browser, and names are taken from the kit's declarations, not from a guess at what the token
  should have been called.
- **`rtBlock` on `<ng-container>` sets no class at all:** the node is a comment, and it only
  declares the block name to descendants. The screen's block class is hung by the host through
  `host: { class: … }`.
- **`justify-content: center` in a flex container with `overflow-x` pushes the first items beyond
  zero scroll** — there is no way to scroll to them. In scrollable strips —
  `justify-content: safe center`.
- **Do not put `scrollbar-gutter: stable` on the root:** the reserve for the scrollbar narrows the
  containing block for `position: fixed`, and a popup aligned to the right edge lands a reserve's
  width to the left of its button.
- **`& + :host` is invalid:** from inside a component the neighbouring host cannot be reached. The
  separator between repeated hosts is `:host(:not(:first-of-type))`.
- **`[attr.aria-disabled]` gives no visual state:** the browser styles `:disabled`, but not
  `aria-*` attributes. Every `aria-disabled` gets a rule `[aria-disabled='true']`.
- **Form elements do not inherit the typeface from `body`:** the browser gives `button`, `input`,
  `select` and `textarea` a font of their own. Inheritance is switched on globally — it must not
  be reset.
- **stylelint disable comments are not placed.** Selectors are combined by nesting.
- **Moving styles adds no new declarations** — only existing ones are relocated.

---
name: rt-tools-styling
kind: rule
law: frontend-application
description: This tree's rule about kit styling: the narrow-screen threshold, tokens and theme handles, the dark theme, the cascade layer, building the styling layer. Take it on any edit of a kit's *.scss together with styling-bem: that one speaks by the law's technique, this one by the tree's names.
---

# Kit styling — what is this tree's own

This tree's rule under the law `docs/constitution/frontend-application.md`. The technique the law
is held by in general is the rule `styling-bem`; here is what the package cannot know: this
tree's tokens and theme handles, the narrow-screen threshold, the cascade layers and the order of
building the styling layer. Both rules are read together — the gate demands them as a pair.

## When to use

- A kit's `*.scss` or a template of its component is edited.
- A token, a theme handle or a cascade layer is started or renamed.
- A divergence of the dark theme, of the contrast or of the narrow-screen threshold is being
  sorted out.

## How the law applies here

The sections below are this tree's articles: the law's technique is named by the rule
`styling-bem`, here are the names, numbers and layers the package cannot know.

- **The narrow screen.** The threshold is one for the whole kit, and it is written down twice: by a
  media query in the styles and by a query to the breakpoints service in the code. Diverging, they
  give a band of widths where the markup is already mobile and the styling is not yet.
    - **The narrow-screen sign is given by the kit's service, and it has no second source.** The
      input the application passed it by is gone: two sources of one sign diverged silently — a
      value passed once stayed stronger than the measurement and held the kit's look however much
      the window changed. So the kit does not tell a narrow panel on a wide screen apart, and it
      has no technique for that yet other than container queries.
    - **The size and layout of the narrow screen are declared by a media query, not by a condition
      in the template.** A condition in the template that sets a modifier for the sake of different
      paddings is styling that rode into the code.
    - **What stays behind a condition in the template is what CSS does not do:** a different branch
      of the tree, a switched-off hint, a different handler.
    - **A rule that acts only on a wide screen is declared by a media query upwards rather than
      cancelled by a second rule downwards.** A cancellation leaves two places in the file where
      one question is decided.
    - **A conclusion about the narrow view is backed by a measurement on both sides of the
      threshold.** A condition in the template and a media query drift apart silently: the modifier
      keeps being set while the rules under it have already moved.
    - **The threshold comes in three kinds, and the frame catches only one.** A media query by the
      window width is switched by the snapshot's frame; a query by the container width and the
      threshold from the breakpoints service do not depend on the frame at all. Before a snapshot
      it is named which kind of threshold the component has: a frame at a window width will never
      fire for a container threshold, and that looks like the absence of a rule rather than like a
      miss of the check.

- **Styling is taken as a token.** The second kit's check is `pnpm run check:tokens-styles`. It
  calls stylelint with its own config (`tools/stylelint-tokens.config.mjs`) over the set
  `projects/ui-kit-v2/src/lib/**/*.scss` and matches the findings against the accepted list
  `tools/tokens-styles-allowlist.json`.
    - **The rules are hung by their own config, not by the shared one.** `lint:styles` goes over
      all of `projects/**` with `--max-warnings 0`, and stylelint has no accepted list: switch them
      on there and what has accumulated turns red the same day, after which the rule is removed
      instead of being fixed.
    - **The accepted list is a file of its own.** `tools/styles-allowlist.json` and
      `tools/check-styles.mjs` are busy with the check of layout classes, are laid out by the
      package and are not edited in place.
    - **A list entry is a file and a value, without a line number.** A line moves with any
      reformatting, and the list would turn red on edits that never happened.
    - **The list only shrinks.** An entry nothing in the styles answers to any more fails the run:
      the fix removes both the place and the list line.
    - **The rule judges colour and the properties of padding, rounding, font size and border width;
      sizes as numbers — `width`, `height`, `inline-size`, `outline` — it does not judge at all.**
      That is not a gap in the check but its boundary. The kit already has scales for sizes — the
      dimensions `--rt-size-*` and the control heights `--rt-control-height-*` — but the check does
      not yet take judging them on: switched on the same day, it would turn red in a hundred places
      where a size as a number is set not by controls but by strips, icons and table cells.
      Widening the set is work of its own.

    - **The check's set is the components' styles, and the styling layer is not in it.** It does not
      see a literal in a scale or in an assignment at all: six transparent shades repeating the
      colour codes of their steps as channel triples were found by reading, not by a run. A green
      run means "the components' styles are clean", not "no literals are left".

- **Between a step and a place stands the component's own property.** It is judged by that same
  check — `pnpm run check:tokens-styles`: the rule `declaration-property-value-disallowed-list`
  stands in the same config, and the findings go into the same accepted list. No second list of
  what has accumulated is started.
    - **The property is declared in the block's root, and its default value is the step that stood
      in that place.** The look does not move by a pixel from the move, and a diverged frame reads
      as a defect of the edit rather than a reason to re-take it.
    - **The name is derived from the block name — `--rt-<block>-<what>`.** Where the block already
      carries the name of a family of assignments (`--rt-nav-panel-*` on the header's submenu), it
      is taken rather than the file name. A name is not started after the place of use.
    - **A modifier reassigns the property instead of repeating the declaration of a CSS property.**
      The plate's seven kinds of rounding became seven lines instead of seven `border-radius` rules.
    - **Four families are judged: rounding, shadow, border width and duration.** Padding, font size
      and dimensions stay on the steps, and that is the rule's boundary rather than a gap: the role
      of a padding is not named in one word, and a property for it would come out named after the
      place rather than after the role.
    - **The rule does not judge the declaration of one's own property — and that is the only lawful
      kind of step in a component's styles.** The target name is selected by the expression
      `^(?!--)`; a ban on the declaration itself would cancel the whole technique.
    - **The right-hand side of one's own property declaration is judged by nothing.**
      `--rt-btn-radius: 10px` passed both the literal gate and this rule, though it is the step
      `lg`: the gate judges `border-radius`, not the declaration of one's own property. It is
      caught by reading.
    - **A part the browser takes out of the block's subtree declares the property on itself.** A
      panel in an overlay, a menu and a dragged row live outside the block, and a declaration from
      its root does not reach them. Nine frames diverged silently and showed a panel without a
      shadow until the cause was found.
    - **The styles linter demands an empty line after the block of declarations and forbids one
      inside it.** `declaration-empty-line-before` and `custom-property-empty-line-before` together
      mean: the block of one's own properties goes solid, then exactly one empty line.
    - **A consumer overrides the property by a rule of the same target and greater force.** The
      declaration lives on the block itself and beats everything that came by inheritance from
      above.

- **A query about the size of a box is asked of a box whose size does not come from its content.**
  The sign that opens such a query also contains the element in both directions: an element whose
  height comes from what the consumer put inside it collapses to nothing under it, and the frame
  comes out empty rather than red. The host of a component that wraps the consumer's content is
  therefore never the container; a part of the component sized by its own placement is — an overlay
  pinned to the host by all four edges measures by the host whatever stands inside it.
    - **A query does not reach the box of its own container, so the room around the inner part is
      given to that part.** Written as a padding of the container, it stays at its full value while
      everything the query reassigns has already shrunk — and on a low box the padding alone eats
      all the room there was. The room moves onto the inner part as its own offset from the
      container's edges, and then the query reaches it.
    - **What the query reassigns is the component's own properties, not the rules themselves.** The
      default of each is the step that stood in that place, so the look does not move by a pixel
      where the query does not fire, and a diverged frame means the query fired where it should not
      have.

- **State outweighs styling.**
    - **The state block stands below every styling variant and palette of the same block.** Being
      disabled, loading and read-only cancel the fill, the outline and the label colour; the
      reverse never happens. The specificity of one block's modifiers is equal, and rules of equal
      force are sorted out by the order in the file — a state written above a styling variant loses
      to it silently.
    - **Specificity is not raised instead of moving.** Raised, it beats what was not meant to be
      beaten too: the size, the rounding and the properties a consumer sets from outside.
    - **A losing state is caught by nothing.** Neither the build, nor the styles linter, nor a
      showcase frame tells it from what was intended: a disabled text button got a grey fill it has
      in no other state, and that stood in all eighteen cells of its matrix until people came with
      their eyes.
    - **Styling without a background gets no background from being disabled.** A fill that appears
      only in the disabled look reads as a highlight rather than as unavailability: what stays is a
      muted label and a calm border.

- **The block class and the block directive.**
    - **`rtElem` in a template demands a `BlockDirective` in the injector, and the block class on
      the host is not enough for it.** `host: { class: BEM_BLOCK }` draws the class and starts no
      directive: the component builds, the typecheck and the linter stay silent, and the very first
      consumer gets `NG0201` when the template comes up. The class stays on the host — the
      directive is given by `<ng-container rtBlock="…">` embracing the markup: it draws nothing and
      provides an owner for `rtElem`.
    - **A component raised by no spec and by no story does not show this error.** It is visible only
      where the component is drawn — so the set of showings is the check.

- **A kit rule lives in a cascade layer.** The check is `pnpm run check:cascade-layer`. It reads the
  second kit's component styles and the styling layer, judges the wrapper and the order of the
  sublayers; the accepted list is `tools/cascade-layer-allowlist.json`.
    - **A component's styles file is declared in the sublayer `rt-kit.components` whole.** There is
      one wrapper per file: a second one leaves part of the rules outside while the file looks
      wrapped. A new file is started wrapped at once — one that arrived past the layer works, fails
      nothing and is visible only by eye at a consumer who has nothing left to override it with.
    - **A rule arguing with a layerless rule of a foreign library is declared outside the layer and
      says so next to itself.** A layerless rule is stronger than any layered one regardless of
      specificity, and the order of layers does not change that: inside a layer such a rule loses
      silently — the look at a consumer with layers diverges from the look at one who takes the
      ready-made CSS. Outside the layer goes exactly the disputed pair of properties, the styling
      stays in the layer, and next to it stands an explanation naming the foreign rule: without it
      the next reader puts what was taken out back. The explanation at that is machine-readable:
      the word `rt-layer-outside` in it tells a deliberate move out from the miss "part of the file
      rode past the brace", and a rule after the wrapper without that word fails the cascade layer
      check. That exactly the disputed part was taken out, and not half the file, the check does not
      judge — that is held by a probe of its own over the built CSS.
    - **Outside the wrapper only `@use`, `@forward` and `@import` are lawful.** Sass demands them at
      the start of the file and fails the build on a declaration driven inside the block.
    - **The order of the sublayers is declared in advance — `@layer rt-kit.vendor, rt-kit.base,
      rt-kit.components;`.** A sublayer not named in advance takes its place in the cascade by its
      first appearance, and they appear in the order of loading: Angular injects a component's
      styles as a separate block, and it can outrun the base.
    - **Declarations on the page root do not go into the layer.** Repainting the brand is held by
      the order: the consumer declares their own scale after `tokens.css` and wins. Having ridden
      into the layer, the declaration takes that possibility away from them.
    - **Foreign CSS that the kit fixes is included in the bottom sublayer `vendor`.** A layer puts
      the kit's rules below everything declared outside a layer — not only below the application
      but below such a library too. The text editor's theme, included past the sublayer, began
      winning over the kit, and the editor's panel rebuilt itself silently; five showcase frames
      caught it, and at a consumer nobody would have. The technique is an import with the sublayer
      name: `@import 'quill/dist/quill.snow.css' layer(rt-kit.vendor);`
    - **The kit does not insist on its own with an exclamation mark.** The last word belongs to the
      application, and a kit rule arguing with it by importance cancels the very thing the layer was
      started for. Two such rules in the table were removed together with the creation of the layer.
    - **The layer wrapper changes the rasterisation of text in the overlay's composite layer.** The
      layout does not move at that: forty header nodes over twenty-two properties matched to the
      thousandth, while the frame diverged by 0.11% on a one-pixel shift of the text. A frame in
      such a case is re-taken, and the conclusion "the layout moved" is made by a measurement, not
      by the share of the divergence.

- **A styling preset is a second layer of assignments, not a second scale and not a theme.** The kit
  has one scale of steps and one set of assignment names; a preset rewrites the values of the
  assignments and touches neither. Rewriting a step repaints the dark theme too — it refers to those
  same steps — and a name absent from the base set would live under the preset flag alone, leaving a
  dead reference on a page without the flag. The build refuses both.
  <!-- rt-when: *.scss *.css *.mjs -->

- **The preset flag is an attribute or a class on the page root or on a container, and the kit does
  not switch it in code.** That is what tells a preset from a theme: the theme has a kit service
  that remembers the choice, the preset has none — the application sets the flag. A preset scoped to
  a container is what lets two presets stand side by side on one page.
  <!-- rt-when: *.scss *.css *.html -->

- **The dark theme wins over a preset, and it wins by the order in the file, not by specificity.**
  Both flags sit on the same root with equal specificity, so the preset rule is emitted before the
  dark theme's. A preset declared after it would silently repaint the dark theme with light values.
  <!-- rt-when: *.scss *.css *.mjs -->

- **A preset's silence about a colour is named as a reason, and the silence that needs no reason is
  derived rather than written by hand.** A colour name the preset does not mention keeps the base
  colour, and in the source a deliberate sharing looks exactly like a forgotten name — both are a
  missing line. Most such names need nothing said: a name whose whole value is a reference to a name
  the preset does rewrite follows the preset through that reference. A hand-written mark on those
  outlives the reference — replace it with a colour, and the mark states the opposite of the truth.
  So the reference is followed to the end by the check, and only what is left after that carries a
  reason next to it in the source.
  <!-- rt-when: *.mjs -->

- **A transition takes names of its own instead of borrowing two neighbouring roles.** A colour name
  says a role, not a paint, and two roles are free to meet on one paint in one look and part in
  another — each right in its own place. A gradient between them is then a flat fill, and nothing
  sees it: the build assembles it, the styles linter judges the properties, and a still frame shows a
  flat fill as a lawful one. What answers is the resolution of every end in every look.
  <!-- rt-when: *.scss *.css *.mjs -->

- **The readability threshold is counted in every look the kit can be drawn in, not in the two
  themes.** A preset is a second layer of assignments and the dark theme is stronger than it, so a
  kit with one preset has four looks, not three: a name the dark theme answers keeps the dark colour
  under the preset, a name it stays silent about takes the preset's. The fourth look is therefore
  not a repetition of the second, and it is the only place where those two rules meet. What was
  below the threshold on the day the look started being counted stands in the accepted list by name,
  with its number and its reason, and the list may only shrink.
  <!-- rt-when: *.mjs *.mdx -->

## What of the law is not here

The agreement of the media query with the breakpoints service is counted by nothing: the threshold
is written down twice, and they drift apart silently — that is held by a measurement on both sides
of the threshold.

The liveness of a token is checked by a search over the tree rather than by the build: a dead
token builds on a par with a live one and is visible only to whoever asks.

## Patterns

- `rt-tools-styling-tokens` — tokens and theme handles, the dark theme's contrast, building the
  styling layer.

---
name: rt-tools-storybook
kind: rule
law: verifiability
description: This tree's rule about the showcase: the Test*Component wrapper, story typing, environment decorators, controls, the state-coverage contract in the second showcase. Take it when creating or editing any story or showcase page. The pattern is rt-tools-storybook-story.
---

# Storybook

A rule under the "Law on verifiability", the section about showing a visible state.

## How the law applies here

- **Each kit has a showcase of its own, and they share nothing.** No config, no port, no naming
  conventions: the kits are kept apart deliberately, and a technique taken from one turns out
  wrong on the other silently.
- **A story targets the wrapper, not the kit's component.** The component's input is a signal, and
  there is nothing to bind the showcase's changeable value to it with; the wrapper holds the
  demonstration state and does not travel into the package.
- **A component is covered when every input axis is shown at every value at once.** An existing
  control one could reach a value by is not coverage: a divergence visible on a combination is
  seen neither by the author of the edit nor by the reviewer.
- **Axes are crossed only where they visibly affect one another.** The full cartesian product is
  rejected: on a button that is over a thousand cells.
- **An axis that cannot be shown is declared with a reason.** A silent gap looks exactly like
  coverage.
- **A story that draws an empty collection is not coverage.** First plausible data, then the
  matrix.
- **The arg-driven page is called `Playground` everywhere, and a family without one names its
  reason.** Called by two names, it is found at an unfamiliar family by guessing: the kit stood
  with twenty-two families calling it `Default` and sixty calling it `Playground`. The name is one,
  and a family that cannot have such a page — its content arrives as projected templates, and the
  showcase substitutes values rather than markup — is told from a family that simply lacks it only
  by reading. So the reason is written twice: in words on the family's overview page, and in the
  list the count reads, so that the sum is checked by a command and not from memory.
- **A component is counted apart from its family, and a component the family shows is not
  covered by that.** A family reaches the showcase by an overview page and a stories folder.
  Everything inside it then counts as shown, including a component that is the subject of no
  story and gets into a frame only inside a neighbour's wrapper. The two counts diverged by
  thirty where the family count was green.
- **A component shown inside a neighbour's story is named, not left to be guessed.** A pair
  belongs in one frame — a projected hint against a string one — and pulled apart it shows
  neither side against the other. Which story shows it is written down, so that the day the
  neighbour's story is rewritten the count says so.
- **A styling preset wraps the whole matrix as a pair of halves; it never becomes an axis inside
  it.** A preset is a second layer of assignments over the same markup and the same sizes. Crossed
  with an axis it doubles every cell, and two halves of one row then read as two values of that
  axis instead of one showing under two sets.
- **The pair belongs to every story of a family the preset touches, not to one story of the ten.**
  A single preset story shows the pair on the values it picked itself, and every other axis of that
  component stays shown in one set: a preset repainting the pressed look, the loading look or the
  round shape has nowhere to be seen.
- **The halves wrap by the width of their own content, not by a threshold in a length unit.** A
  grid of fixed columns cuts a wide matrix at the same column in both halves at once, and a
  clipping equal on both sides reads as intended rather than as a defect.
- **A component that does not give its width to its host collapses in a half, and the row cell is
  then given a width by name.** The half is twice as narrow as the page, and a host whose content
  lies outside its own box reports nothing to shrink by: the cells keep their place, the content
  slides onto the neighbour, and the frame is whole and green. The cure is the row's own cell width,
  not a threshold on the pair.
- **A showing of one instance asks the pair for the width of its half.** Standing alone, such a
  showing took the width of the page, and the half shrinks its content to its own width: the
  pagination host measured eight points and drew the collapsed form instead of the numbers, the
  header drew a stub of a hundred and sixty instead of a bar. It is asked by name, because the half
  shrinks deliberately — a bare button stretched across it would look unlike the same button in the
  matrix next door.
- **A showing that gets no pair says why, in the markup next to it.** Three reasons are lawful: the
  second half doubles a listing and adds no sighting, the showing carries the frame root itself and
  the pair would take it away, or the component is pinned to the window and leaves the half whole.
  The last one costs both halves at once: they stay empty, and the two instances lie one over the
  other outside the frame. Left silent, such a showing is indistinguishable from one the wave
  forgot.
- **A component pinned to the window needs a box that is its containing block, and a relative box
  is not one.** Such a component counts its place from the window whatever stands above it in the
  markup: the sheet drew itself across the whole window and put its panel a point below the bottom
  edge, while the box it was written into kept two points of width and one dashed line in the frame.
  The box becomes a containing block by a property of its own, and the one chosen also clips — so it
  replaces the box's clipping rather than standing next to it. Raising the node into a layer of its
  own does the same and costs the rasterisation of every label in the frame.
- **A component that takes its size from its parent is given one by a box of the showing, not by a
  rule on its block class.** Such a component measures by its content where nothing sizes it: the
  chat came out 37 points tall in a cell of 352 and left loose pieces in the frame — an empty-state
  pill, an input field, two bubbles — with no frame of a chat anywhere. Where the host is declared
  `display: contents`, the rule does not even reach: the height lands on a host that is no box, it
  measures 0 by 0, and the content spills into the cell and is cut by its edge. The box takes the
  height instead, because the host between them is not a box; the frame then takes its full height
  from the box. Its width goes to the whole cell for the same reason a single instance asks the
  pair for the width of its half.
- **The surface under such a component is the box too, when the component takes its background
  from the consumer.** Drawn on the page ground, it reads as loose parts rather than a component
  with a boundary, and no frame says where it ends. In the showing the consumer is the box.
- **The width of a cell is measured again the day the component learns to shrink into it.** Until
  then the component kept the width of its content and the number on the cell only fenced the
  neighbours; with a declared fate for what does not fit it takes exactly that number, and one
  chosen for the former behaviour leaves the text gone. In a cell of 272 the large card of a file
  with three buttons drew the icon and the badge and no name at all — the frame is whole and green,
  and the showing says nothing about what the component is for. The number comes from a measurement
  of the widest cell of that matrix, not from one width for the whole family: a row of one button
  and a row of three need different ones.
- **A component whose height comes from the window is shown inside a box that clips.** The shot
  widens the window to what is drawn, and such a component grows with it: one frame came out seven
  thousand points tall under a box of two hundred and ninety. The box is the screen of the showing,
  and its clipping is what makes it one; the component's own rule is not overridden — for an
  application it is right.
- **The grid is drawn by the shared showing harness, not by the markup of every story.**
  Otherwise the same thing is shown in seventy ways and diverges at the first edit.
- **A provider without which the component does not come up stands in `preview.ts`, not as one
  story's decorator.** A local decorator fixes the story it was written in and leaves the matrix
  of that same component failing — the defect is then half known and repeats anyway.
- **A template-level story shows a whole screen, and the coverage contract does not apply to it
  either.** A screen has neither input axes nor states in the component's sense: it is assembled
  from the kit's ready-made components and shows how a page comes out of them — the paddings, the
  order of the blocks, the panels opened by an address. There is nothing to demand `Playground`,
  `States` and `Themes` from it for, and instead it shows the looks it has itself: a list with
  records, an empty list, a read refusal. The level stands last in `storySort`, the files lie in
  `src/showcase/templates/`, and the wrapper is next to its story, in `stories/component/`.
- **A link between the showcase's pages dies with a rename of a section.** The address is not a path
  in the tree: it comes from the page's title. So the address check does not see such a link. A dead
  one looks exactly like a live one. The page is drawn whole, and the miss shows only to whoever
  pressed it. Laying the sections out by the levels of atomic design killed every link of the kit at
  once, 346 of them, and nothing turned red. The addresses are derived by the showcase's own helper.
  A rule written out next to the check diverges on the first title with a capital letter in the
  middle of a word.
- **A link to a family that has not migrated is not written at all.** An address that will exist some
  day reads the same as a dead one. No rename cures it. Such a family is named in words, with the
  number of the task that brings it.
- **The demonstration state one screen's stories differ by is declared by a story decorator, not
  in `preview.ts`.** The article about a provider speaks of something else: there it is the
  injector without which the component does not come up at all, and declared on one story it
  leaves all the others failing. Here it is the other way round: such a declaration has a default,
  the screen comes up without it, and a story differs from its neighbour by exactly that.

**Two kits, two independent showcases.** They share no config, no port and no conventions beyond
`@storybook/angular` itself. Check which package you are in before copying anything across.

|                  | `@rt-tools/ui-kit`            | `@rt-tools/ui-kit-v2`                                    |
| ---------------- | ----------------------------- | -------------------------------------------------------- |
| Config           | `projects/ui-kit/.storybook/` | `projects/ui-kit-v2/.storybook/`                         |
| Port             | 6006                          | 6007                                                     |
| Command          | `pnpm run storybook:ui-kit-v1` | `pnpm run storybook:ui-kit-v2`                           |
| Wrapper prefix   | `Test*Component`              | `TestRt*Component`                                       |
| Global providers | per-story `applicationConfig` | `preview.ts` (zoneless, storage, icons, labels, theme toolbar) |
| Story set        | `Default` + ad-hoc variants   | fixed set — see the coverage contract below              |

Everything from here to the ui-kit-v2 section describes **`@rt-tools/ui-kit`**.

Storybook 10 with `@storybook/angular`. Config lives in
`projects/ui-kit/.storybook/`; stories are discovered from
`../src/**/*.stories.@(js|jsx|mjs|ts|tsx)` and docs from `../docs/**/*.mdx`.

```bash
pnpm run storybook:ui-kit-v1        # nx run @rt-tools/ui-kit:storybook — port 6006
pnpm run build-storybook:ui-kit-v1  # dist/storybook/@rt-tools/ui-kit
```

## What `preview.ts` already gives

`projects/ui-kit-v2/.storybook/preview.ts` declares this globally, and there is no need to repeat
it by a story decorator:

| what                                       | what for                                                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `provideZonelessChangeDetection()`         | the kit is built without a zone                                                                           |
| `provideHttpClient()`                      | `rt-icon` goes for its sprite by it                                                                       |
| `provideRouter([])`                        | the kit's links demand a router in the injector                                                           |
| `provideRtStorage()`                       | the kit's services that remember the user's choice                                                        |
| `provideRtIDBStorage()`                    | the table keeps the column settings in IndexedDB and injects the service as a field: without the provider the table does not come up at all — `NG0201` and empty markup instead of rows |
| `provideRtIcons('/icons')`                 | the address of the icon set                                                                               |
| `provideRtKitLabels({ translator, locale })` | the kit's labels — the Russian set lies next to the showcase, in `showcase-labels.ru.ts`                 |
| `registerLocaleData(localeRu)`             | not a provider but a module-level call: without it any `DatePipe` fails with `Missing locale data for "ru"` and draws emptiness instead of the feed |

The list is complete. A provider needed for the sake of one story is appended here rather than left
in its decorator: the next matrix of that same component comes up without it already.

- Icons are served by `staticDirs` from `src/assets/icons` to `/icons`; `rt-icon`
  fetches them over HTTP and inlines a sprite.
- The theme toolbar writes `<html data-theme>` — the same attribute `ThemeService`
  sets in an application, so the showcase renders what a consumer gets.
- Sidebar order is fixed by `storySort`: `Foundation` (Design Tokens: Overview,
  Colors, Semantic, Spacing, Theming) → `Atoms` → `Molecules` → `Organisms` → `Templates` → the rest.
- **A story title starts with the atomic design level, not with a shared section.** There are four
  levels — atoms, molecules, organisms, templates — and between the level and the component name
  stands an optional subject group: buttons, form fields, navigation, data, files, dialog, side
  panel, table, correspondence, desktop, frame. There is no shared root above the levels, and the
  order of sections is set by `storySort` — alphabetically molecules would stand before organisms.

- **The level follows from what the component is made of, not from how complex it feels.** There is
  one sign, and it is asked of the component itself: what is it assembled from.

    | Level         | Sign                                                                                          | Examples                          |
    | ------------- | --------------------------------------------------------------------------------------------- | --------------------------------- |
    | **Atoms**     | assembled from no other component of the kit — there is nothing left to take apart            | button, icon, input, spinner      |
    | **Molecules** | assembled from atoms and solves one task; opens no overlay and does not live by a record list | labelled field, tabs, card        |
    | **Organisms** | a self-contained piece of a screen: opens an overlay, holds its own state or lives by records  | table, dialog, side panel         |
    | **Templates** | a whole screen out of ready components; it has no input axes at all                            | desktop, list page                |

    A disputed case is decided top down: opens an overlay or lives by records — an organism, even if
    there is little markup in it; neither of those, but another kit component stands inside — a
    molecule; no kit inside — an atom. The number of inputs, the file length and "it is a simple
    component after all" are not signs: by them the same component lands at different levels with
    two authors, and a diverged level drags a rename of the references behind it.

- **A child part stands in its parent's group; the level is given to it by that same sign of
  composition.** A dialog's header next to the dialog, a menu item next to the menu — and most often
  it is the same level: a part of a whole is assembled no more complexly than the whole. But an
  assembling component legitimately stands a step above its part — a notification note is an atom, a
  stack of notes above the page is a molecule — and the group stays shared at that. A diverged group
  is the miss itself: the part is lost in the list where it is looked for next to the whole.
- **A snapshot reference's name is the title's slug, so the level moves together with it.**
  Relaying the title without renaming the references leaves 445 files no story answers to: the run
  re-takes everything, and the directory audit turns red on each.

## State-coverage contract

Under law `docs/constitution/verifiability.md` (the section about showing a visible state) and ADR
`docs/adr/0002-ui-kit-v2-state-coverage.md`. A component is covered when **every input axis is
shown at every value**, not when a control exists that could reach it.

Required per component — a missing entry is a defect, not a preference:

| Story / page       | What it must show                                                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Overview` (MDX)   | Purpose, when to use / when not to use, axis tables, states table, accessibility, theming, related components, and a hand-written input/output table. `compodoc` is deliberately off — `tools/verify-ui-kit-v2-docs.cjs` is what keeps that table honest. |
| `Playground`       | The single arg-driven story. One name for the whole kit — see the article about it below.                                                                                                                                                                  |
| one story per axis | Every value of that axis, laid out at once and labelled.                                                                                                                                                                                                  |
| `States`           | `default`, `hover`, `focus-visible`, `active`, `disabled`, plus `loading` / `readonly` where the component has them.                                                                                                                                      |
| `Themes`           | Light and dark side by side.                                                                                                                                                                                                                              |

Rules that decide what goes in a matrix:

- **Cross axes only when they visually interact.** `theme × appearance` earns a
  grid because the pair changes how each reads; `size × theme` does not. The full
  cartesian product is explicitly rejected — see ADR 0002 decision 3.
- **An axis you cannot show is declared, not skipped.** Say so in `Overview` with
  the reason; a silent gap looks exactly like coverage.
- **Wrap the matrix in the pair of preset halves; never make the preset an axis.** A preset
  leaves the markup and the sizes alone, so crossed with an axis it only doubles the cells.
- **The pair goes on every story of a touched family, not on one of them.** A lone `Presets`
  story leaves every other axis shown in one set.

- **A story that renders an empty collection is not coverage.** Ten stories
  currently pass an empty array and paint nothing (`UI-KIT-V2-ISSUES.md` §2.3);
  seed a realistic fixture instead.
- **A foundation-level story lives next to the showing harness rather than in a component's
  folder, and the coverage contract does not apply to it.** It shows a technique shared by the
  whole kit — it has neither input axes nor states, and there is nothing to demand `Playground`,
  `States` and `Themes` from it for. The title starts with the Foundation section, the file lies in
  `src/showcase/stories/`, and the wrapper next to it, in `component/`. The Foundation pages at
  that stay in `projects/ui-kit-v2/docs/`: Angular does not raise MDX, and there is nothing to show
  a live component from a page with.
- **A wrapper that overrides the component's own property removes the encapsulation.** The
  component declares the property on its block's root, and the root is drawn by the kit's template
  — a rule with the encapsulation attribute never reaches it, and the override silently changes
  nothing.

## Gotchas

- **Demonstration data is invented rather than taken from the machine it was written on.** A
  person's name, their mail address, the name of their establishment get into the showing
  unnoticed — the hand writes what is before the eyes — and the showcase is read by everyone who
  takes the package, while in a snapshot reference that name lies as a picture no grep will find.
  An invented name costs exactly the same and belongs to nobody.
- **The showcase config is checked by neither the linter nor the package typecheck — only by its
  build.** `.storybook` is excluded from ESLint, and `main.ts` additionally carries
  `/* eslint-disable */`; `nx run @rt-tools/ui-kit-v2:typecheck` does not see that folder at all.
  `process.env.RT_SNAPSHOT_RUN` instead of `process.env['RT_SNAPSHOT_RUN']` passed `check:all`
  whole and was refused only by `pnpm run build-storybook:ui-kit-v2`. An edit in `.storybook/` is
  confirmed by a showcase build, not by a sweeping run of the checks.
- **An icon font of the first showcase is declared in `.storybook/preview-head.html`, not in a
  showcase stylesheet.** The font file lies in the tree and is served by the showcase itself. A
  `@font-face` in `storybook.scss` arrives later than the page head, and the paint probe catches the
  frame before the font. The class rule next to the family repeats the whole set the other families
  carry there: `font-size: 24px`, `line-height: 1`, `letter-spacing`, `text-transform`, `display`,
  `white-space`, the ligatures and smoothing. A class with the family alone takes the host's font
  size and line height, and the icons shift inside their buttons. No frame catches the shift while
  the references are taken with it; the owner found it by eye.
- **The first showcase's Material Symbols file is a subset by icon names, and a glyph outside it
  draws a stray shape, not the word.** A story naming a new glyph gets it only after the subset is
  fetched again with the whole old list of names plus the new one. The ligatures of the old and the
  new file are compared before the replacement: a name lost from the list breaks a neighbour's frame
  silently.
- `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/` uses a misspelled
  `strories/` folder. It is matched by the `../src/**` glob and works; leave it
  unless you are deliberately renaming it (both the stylelint ignore and any
  tooling reference the typo).
- Token/theming documentation is MDX in `projects/ui-kit/docs/` (`DesignTokens.mdx`,
  `Theming.mdx`, `TokenColors.mdx`, …), not stories. Adding a token → update the
  matching MDX page and `projects/ui-kit/src/styles/TOKENS.md`.
- `console.log` in a wrapper needs an explicit `// eslint-disable-next-line no-console`
  (`no-console` is `error` repo-wide).

## Patterns

- `rt-tools-storybook-story` — a ready-made story: the wrapper, the typing, the controls, the
  state matrix, the snapshot parameters of the second showcase.

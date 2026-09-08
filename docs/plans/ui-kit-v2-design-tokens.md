# The design of the second kit: the layers, the gates and the brand

## The context

The second kit has a three-layer layout of the design — the scales, the appointments, the properties
of a component — and it is described on the pages of the showcase. It is held at that only by memory:
the rules `color-no-hex` and `rt-tools/no-hardcoded-design-tokens` are hung in `stylelint.config.js`
on the first kit, and on the second — not. Nothing stands behind that apart from the order in which
the kits were written, and exactly what accumulates without a check has accumulated.

The measurements as of 2026-08-12 over `projects/ui-kit-v2/src/lib/**/*.scss`:

| What                                                            | How many |
| --------------------------------------------------------------- | -------- |
| Files of styles in the set                                      | 87       |
| Pixel literals, outside media queries                           | 208      |
| Codes of a colour there too                                     | 44       |
| `--rt-*` used and declared nowhere                              | 33       |
| Addresses to them, of them without a spare value                | 55 / 5   |
| Files declaring properties of their own                         | 13       |
| Steps in the scale of the neutral                               | 21       |
| The colour overrides of the dark theme against the appointments | 30 / 40  |

Apart from the number, there are three places where the device is broken. `--rt-color-disabled` and
`--rt-color-on-disabled` are declared nowhere, and a switched-off button refers to them with the spare
value `#d1d5db` — that is, it is painted by a code of a colour past the dark theme. The colour of the
mark is substituted straight into the appointments (`_semantic.scss`, the lines 24, 31, 34) and
repeated by four triples of channels in the transparent shades, so the blue cannot be changed without
breaking its decorative uses. The styles of the kit are global — this kit has
`ViewEncapsulation.None` — and the cascade is fenced by nothing.

The sample of the device is PrimeNG: three levels of the tokens, a pair "the light one and the dark
one" in one node, a pinpoint override of the properties instead of `::ng-deep`. It does not become a
dependency: neither the library of the themes nor its format of the presets travels into the kit.

The grill of the request lay as the record RT-381-tokens-spec-scope.md — its term ran out, and it can
be found by the name of the file in the history. The product agreement is merged into the spec of the
domain `docs/specs/ui-kit-v2/` by the last work of the line: there is no directory "proposed" any
more, the numbers of the scenarios were not changed.

**The line is closed on 2026-08-13.** All ten positions are passed; open stayed the `Q-7` of the spec
— nine names common to the two kits — and it is created as a task of its own RT-391.

## The accepted decisions

1. **The leak is closed before the tidying.** The checks are switched on over the whole set at once,
   and what is accumulated leaves for the list of what is accepted — the same as is already done for
   the BEM classes. Otherwise `--max-warnings 0` turns red on two hundred places on the very first day,
   and the check is removed instead of the fixing.
2. **The names of the tokens are removed and renamed freely.** The consumer code is still one and is
   edited together with the kit. As soon as a second consumer comes, the same moving will become a
   breaking change with a note about the transition — until that moment no layer of aliases is created.
3. **The brand is declared by a line 50…900.** The consumer owns the shades wholly; the kit derives the
   appointments from the line and counts the transparent shades from it instead of repeating a code of
   a colour.
4. **The contrast is counted by a machine, the threshold 4.5:1.** The comments in the scales, counted
   by hand, become checkable. The pairs below the threshold are either fixed or stand as an exception
   with a reason.
5. **A component after an edit looks the same.** The snapshots of the showcase stay green; a diverged
   frame means either a defect or an edit of the look named aloud. One such is named — the switched-off
   button.
6. **The rule `styling-bem` is appended by an override**, not by an edit of the file in
   `.claude/skills/`: what is laid out by the package is not edited in place. The wording is "a
   component declares properties of its own when it is set from outside", not "always": a rule broken
   on the day of its release by 65 files of 78 stops being kept within a month.
7. **The source of the tokens in an object is the last task, not the first.** To generate a
   twenty-one-step scale with holes means to nail down by code the very disorder the line is created for.

## What counts as done

- The linter refuses a code of a colour and a size as a number in the styles of a component of the
  second kit; what is accumulated stands by name in the list of what is accepted, and the list only
  shrinks.
- A token the kit refers to is either declared by the layer of the design or named a handle of the
  consumer; a reference to a token of the kit goes without a spare value.
- The dark theme answers every colour appointment of the light one — by an override or by a named
  reason why the colour is common.
- A pair "the colour of a text and its ground" holds a contrast not below 4.5:1, and this is confirmed
  by a run.
- The consumer repaints the kit by a declaration of the line of the brand over `tokens.css` and does
  not fork the kit — confirmed by a measurement in the browser on a page of the showcase.
- 493 reference snapshots are green, apart from the reshoots named by name.

## The order of the tasks

The positions go one after another: each rests on the previous one, and they cannot be parallelised —
the fifth, the sixth and the seventh edit the same three files of the design.

| №   | Task   | About what                                                                                                                                                                                                            | Depends on |
| --- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | RT-381 | The spec of the design is decided through: the forks are closed, the boundaries of the set are named, the measurements are retaken by the named set                                                                   | —          |
| 2   | RT-382 | The gate of the literals on the styles of the second kit and the list of what is accepted                                                                                                                             | 1          |
| 3   | RT-383 | The gate of the graph of the tokens: declared, a handle of the consumer or a dead reference                                                                                                                           | 1          |
| 4   | RT-384 | The gate of the completeness of the dark theme and the counter of the contrast                                                                                                                                        | 1, 3       |
| 5   | RT-385 | The brand by a line 50…900; the appointments and the ring of the focus take it                                                                                                                                        | 3, 4       |
| 6   | RT-272 | The dead references are removed, `--rt-color-disabled` is created, the declarations moved from the root; the switched-off state of the button stops losing to the design                                              | 3, 5       |
| 7   | RT-386 | The scales and the appointments are brought to the canon: the literals out of the appointments, the summary of the scale of the neutral, the off-grid paddings removed, a common scale of the heights of the controls | 2, 6       |
| 8   | RT-274 | The properties of a component of its own as a setting API — where it is set from outside                                                                                                                              | 7          |
| 9   | RT-387 | `@layer rt-kit`: a rule of the application wins over a rule of the kit without a count of the specificity                                                                                                             | 8          |
| 10  | RT-388 | The source of the tokens in an object: the generation of SCSS, CSS and the types from one place                                                                                                                       | 7, 9       |

**Why such an order.** The first four positions move not a single pixel — they edit the spec, the
config of the linter and the checks, and they roll back by the removal of the checks. The fifth and the
sixth change what is visible and demand a reshoot of the references, so they go after the gates already
guard the tree. The seventh rests on the gate of the literals: without it the summary of the scale
would drift back. The ninth is put after the eighth, because a layer of the cascade makes sense where
the consumer already has something to set the component by instead of beating it by the specificity.

## Pitfalls

- **`tools/styles-allowlist.json` and the command `check:styles` must not be taken.** They are held by
  the check of the BEM classes laid out by the package (`tools/check-styles.mjs`, the header "it is
  edited by an override, not here"), and its records are bare names of the classes. The gate of the
  literals creates a file of its own and a name of its own for the command.
- **A threshold of the width as a number in `@media` is not counted a literal.** The custom properties
  of CSS do not work in media queries, the threshold is taken by a variable of the preprocessor from
  `_breakpoints.scss` — otherwise two dozen places are obliged to break the rule on the day it is
  switched on.
- **The dark answers live not only in the mixin.** Six files of components declare them themselves,
  with a bare `[data-theme='dark']`; a check of the completeness reading only `:root` will not see them.
- **Nine names are declared by both kits with different values at the root of the page.** The one
  plugged in later wins. The fixing touches the released first kit and does not enter the boundaries of
  the line — today's coincidences leave for the list of what is accepted, a new one fells the run.
- **`@layer` changes the look at the consumer silently.** The only position of the line that is learned
  of not by an error of the build but by the eyes after an update. The reference snapshots will not
  catch this: the showcase has no foreign overrides.

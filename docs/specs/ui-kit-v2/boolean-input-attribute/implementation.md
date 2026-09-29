# What it is carried out by — a boolean input of the kit and the bare attribute

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

The agreement is written before the code, so the second column names where the carrying out will
stand. Until the code is written the lines say so outright: a line pointing at a symbol that is not
there yet lies no less than a missing one.

- **A boolean input of a kit component accepts the bare attribute as truth.** — Every boolean input of the kit declares `transform: booleanAttribute`; the sheet's input is the one this was found on — `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.ts:open`; scenario `SC-UKV-235`
- **A required boolean input takes the bare attribute the same as an optional one.** — `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.ts:open` is required and carries the transform; so does `projects/ui-kit-v2/src/lib/components/toast/rt-toast.component.ts:expanded`, the other required one; scenario `SC-UKV-134`
- **An input that is boolean only in its declared type is not one.** — The list of what is named apart is `tools/boolean-inputs-allowlist.json`, and the check reads it. Two inputs stand in it: `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts:pressed` — pressed, not pressed, not said, and `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.ts:checked` — chosen, not chosen, not said; scenario `SC-UKV-135`
- **The requirement is held by a check, not by the memory of whoever adds an input.** — `tools/check-boolean-inputs.mjs:inputsOf` reads the declarations, and the check stands in the push gate set and in the pipeline as the step «Boolean inputs of kit two»; scenario `SC-UKV-136`

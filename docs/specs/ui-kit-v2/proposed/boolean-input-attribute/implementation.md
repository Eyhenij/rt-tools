# What it is carried out by — a boolean input of the kit and the bare attribute

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

The agreement is written before the code, so the second column names where the carrying out will
stand. Until the code is written the lines say so outright: a line pointing at a symbol that is not
there yet lies no less than a missing one.

- **A boolean input of a kit component accepts the bare attribute as truth.** — **Not carried out yet.** The sheet's input is the one this was found on. `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.ts:open` declares a boolean input with no transform. Whether the rest of the kit stands the same is the open question `Q-1`; scenario `SC-UKV-133`
- **A required boolean input takes the bare attribute the same as an optional one.** — **Not carried out yet.** The sheet's input is required, and that is exactly why the consumer is forced to write it; scenario `SC-UKV-134`
- **An input that is boolean only in its declared type is not one.** — **Not carried out yet.** The list of what is named apart does not exist. It is started by the work that brings this agreement, together with the check; scenario `SC-UKV-135`
- **The requirement is held by a check, not by the memory of whoever adds an input.** — **Not carried out yet.** No check of the tree reads the kit's input declarations at all. `tools/verify-ui-kit-v2-docs.cjs` matches the overview tables against the inputs and says nothing about their transforms; scenario `SC-UKV-136`

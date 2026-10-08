# What it is carried out by — the prompt suggestion

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

- **The card is a button with the question on the left and an arrow on the right edge.** — `projects/ui-kit-v2/src/lib/components/prompt-suggestion/rt-prompt-suggestion.component.scss:rt-prompt-suggestion` — `justify-content: space-between` over the full width. Scenario `SC-UKV-747`
- **A press reports the text of the question out.** — `projects/ui-kit-v2/src/lib/components/prompt-suggestion/rt-prompt-suggestion.component.ts:onClick` — the output `picked`. Scenario `SC-UKV-748`
- **A disabled card cannot be pressed.** — `projects/ui-kit-v2/src/lib/components/prompt-suggestion/rt-prompt-suggestion.component.ts:disabled` — bound to the native `disabled` of the button. Scenario `SC-UKV-749`

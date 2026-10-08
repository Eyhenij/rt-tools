# What it is carried out by — the run status of the assistant

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

- **The mark shows the state: a spinner while the run works, a green check when done, a muted cross when stopped, a red exclamation when failed.** — `projects/ui-kit-v2/src/lib/components/ai-run-status/rt-ai-run-status.component.ts:mark` — `MARKS` maps the state to the icon and its colour; `running` draws `rt-spinner` in the template. Scenario `SC-UKV-735`
- **While the run works, a highlight runs across the label, and with reduced motion the label is muted and still.** — `projects/ui-kit-v2/src/lib/components/ai-run-status/rt-ai-run-status.component.scss:rt-ai-run-status-shimmer` — the modifier `--state--running` of the label and the reduced-motion query. Scenario `SC-UKV-736`
- **A stopped label is muted, a failed label is red, a done label has the text colour.** — `projects/ui-kit-v2/src/lib/components/ai-run-status/rt-ai-run-status.component.scss:__label` — the modifiers by state. Scenario `SC-UKV-737`
- **The meta stands right of the label in the small muted text and is not drawn when empty.** — `projects/ui-kit-v2/src/lib/components/ai-run-status/rt-ai-run-status.component.ts:meta` — the template draws the element only when it is not empty. Scenario `SC-UKV-738`
- **With steps, the whole line is a button that opens and closes the list of steps.** — `projects/ui-kit-v2/src/lib/components/ai-run-status/rt-ai-run-status.component.ts:onToggle` — `toggleLabel` gives the tooltip, `isOpen` gives `aria-expanded` and the chevron. Scenario `SC-UKV-739`
- **Without steps, the line cannot be opened and is announced as a status.** — `projects/ui-kit-v2/src/lib/components/ai-run-status/rt-ai-run-status.component.ts:hasSteps` — the template draws a `role="status"` row without a button. Scenario `SC-UKV-740`
- **The steps are the kit's timeline, and the state of the list is given and read by the consumer.** — `projects/ui-kit-v2/src/lib/components/ai-run-status/rt-ai-run-status.component.ts:expanded` — a model; the list is `rt-timeline`. Scenario `SC-UKV-741`

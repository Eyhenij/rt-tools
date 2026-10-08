# What it is carried out by — the value with a copy button

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

- **The value stands on a plate, and the label left of it is drawn only when given.** — `projects/ui-kit-v2/src/lib/components/copy-value/rt-copy-value.component.ts:label` — the template draws the label only when it is not empty. Scenario `SC-UKV-742`
- **A press puts exactly the value into the clipboard and reports it out.** — `projects/ui-kit-v2/src/lib/components/copy-value/rt-copy-value.component.ts:onCopy` — `Clipboard.copy` and the output `copiedValue`. Scenario `SC-UKV-743`
- **After a copy the button shows a check and «Copied» for two seconds, then «Copy» again.** — `projects/ui-kit-v2/src/lib/components/copy-value/rt-copy-value.component.ts:copied` — `iconName` and `actionLabel` follow it, the timer resets it. Scenario `SC-UKV-744`
- **The consumer can give the button its own label at rest.** — `projects/ui-kit-v2/src/lib/components/copy-value/rt-copy-value.component.ts:copyLabel` — `actionLabel` takes it before the kit label. Scenario `SC-UKV-745`
- **A long value is cut with an ellipsis, and the button stays visible.** — `projects/ui-kit-v2/src/lib/components/copy-value/rt-copy-value.component.scss:__value` — the value shrinks with `min-inline-size: 0`, the button does not. Scenario `SC-UKV-746`

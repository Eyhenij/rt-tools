# What it is carried out by — the message field of the kit

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

- **The composer is a capsule with a round attach button on the left and a round send button on the right.** — `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/rt-message-composer.component.ts:openPicker` — the paperclip calls it; both buttons are `rt-icon-button` with the rounding `full` in the template. Scenario `SC-UKV-480`
- **The capsule is fully rounded on one row and takes the 20px step when it is taller.** — `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/rt-message-composer.component.ts:tall` — the height of the text, the files and the formatting mode; the modifier reassigns the rounding. Scenario `SC-UKV-481`
- **The text grows from `minRows` to `maxRows` rows, and the buttons stay at the bottom.** — `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/rt-message-composer.component.ts:maxRows` — passed to the autosize of the text; the row aligns to its end. Scenario `SC-UKV-482`
- **The send button is off while there is no content, and spins while sending.** — `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/rt-message-composer.component.ts:canSend` — the button is off by it and takes `loading` from `sending`. Scenario `SC-UKV-483`
- **At rest the capsule has the fill and the border of the kit's fields; in focus it has the surface, the focus border and the ring.** — `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/rt-message-composer.component.scss:focus-within` — the values are the `--rt-input-*` assignments of the fields. Scenario `SC-UKV-484`
- **A disabled composer is pale and takes nothing.** — `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/rt-message-composer.component.ts:capsuleMods` — the pale modifier; the form is switched off by the effect in the constructor. Scenario `SC-UKV-485`
- **Enter sends, Shift + Enter breaks the line, and the hint says so when `hint` is on.** — `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/rt-message-composer.component.ts:onKeydown` — the hint line is drawn by the input `hint`. Scenario `SC-UKV-486`
- **Picked and dropped files stand inside the capsule above the row as small file cards.** — `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/rt-message-composer.component.ts:removeFile` — the cards stand in the capsule; `submit` sends and clears them. Scenario `SC-UKV-487`
- **In the formatting mode the rich editor with its toolbar stands in place of the text.** — `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/rt-message-composer.component.ts:formatting` — the template draws the editor in the capsule by it. Scenario `SC-UKV-488`

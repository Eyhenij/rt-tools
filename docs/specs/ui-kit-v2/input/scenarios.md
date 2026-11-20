# Scenarios — the field of input

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were not
changed at the merge: the titles of the tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-55 — the type of address goes away onto the native field

Given the type of address is named to the field
When the field is drawn
Then the native field is declared to the browser by the same type

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-56 — the former types work as before

Given text, password, mail and time are named to the field in turn
When the field is drawn
Then the native field is declared by the same type that was named

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-1116 — a value longer than the field ends with an ellipsis

Given a field narrower than its hint
When the field is drawn
Then the hint ends with an ellipsis at the right edge of the field

Не покрыто: the spec environment computes no layout, and truncation is a matter of the field's
styles. The promise is held by the frame of the story Molecules/ServiceBlock/Panel `Phone`, where
the hints of the three key fields are longer than the fields.

### SC-UKV-1541 — the prefix stands before the value and does not enter it

Given a field with the prefix «site.ru/team/»
When the person types `my-page`
Then the prefix stands before the typed text, and the form gets `my-page`

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input-affixes.spec.ts`.

### SC-UKV-1542 — the suffix follows the typed text, not the right edge

Given a field with the suffix `.site.ru` and the hint `имя-команды`
When the field is empty, then the person types `my-team`
Then the suffix stands right after the hint, then right after `my-team`, and the form gets `my-team`

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input-affixes.spec.ts` — the order of the
nodes and the hidden copy of the text that sizes the field. The distance on the screen was measured
live in the story Molecules/Forms/FieldExtras `Affixes`: zero between the value and the suffix.

### SC-UKV-1543 — a field without the two inputs stays as it was

Given a field with neither a prefix nor a suffix
When the field is drawn
Then it has no fixed text, no hidden copy and no description

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input-affixes.spec.ts`.

### SC-UKV-1544 — the field is described by its fixed text

Given a field with a prefix and a suffix
When a screen reader reads the field
Then the field is described by both texts, and the texts themselves are hidden from the reader

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input-affixes.spec.ts`.

### SC-UKV-1548 — the label on the border of an empty field with fixed text stays raised

Given an empty field with a label on the border and a prefix or a suffix
When the field is drawn without focus
Then the label stands raised on the border rather than over the fixed text

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input-affixes.spec.ts` — the field carries
the class the rules of the raised label read.

### SC-UKV-1549 — a hidden password with a suffix is sized by its dots

Given a password field with a suffix
When the person types `пароль`
Then the hidden copy that sizes the field holds six dots, not the typed characters

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input-affixes.spec.ts`.

### SC-UKV-1550 — a press on the fixed text puts the caret next to it

Given a field with a prefix, a suffix and the value `page`, the caret in the middle
When the person presses the suffix, then the prefix
Then the caret stands at the end of the value, then at its start

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input-affixes.spec.ts`.

### SC-UKV-1545 — a read-only field shows the value with its fixed text

Given a read-only field with a prefix and a suffix
When it holds `my-page`, then nothing
Then it reads «site.ru/team/my-page/», and a dash when it is empty

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input-affixes.spec.ts`.

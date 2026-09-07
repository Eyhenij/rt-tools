# reuse-first — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. A separate file because the rule speaks by
technique and travels between repositories whole, while everything below is true only here and
goes stale at every renaming.

Here the tree is itself the source of look: the rule looks inside the kit. "Take the ready-made"
means leaning on a neighbouring component, on a field base or on a CDK primitive instead of
starting a second one just like it next to it.

## What it is called here

- **In the rule** — Here
- **the source of look** — the kit itself: `@rt-tools/ui-kit` with the prefix `rtui-` or `@rt-tools/ui-kit-v2` with the prefix `rt-`
- **a base class** — the form-field base and the route side-panel base in the second kit
- **a store base** — `BaseStoreService`, `BaseAsyncStoreService` from `@rt-tools/store`
- **the shared message bus** — the notification bus of the second kit in `projects/ui-kit-v2/src/lib/platform/`
- **the shared layout layer** — `projects/<kit>/src/styles/`
- **a one-off departure** — the marker `native-ok` on the same line — it is lifted by the reinvention guard

## Where it lives

- **the first kit's components** — `projects/ui-kit/src/lib/ui-kit/` — buttons, table, dialog, panel, notification, file uploaders and the rest
- **the second kit's components** — `projects/ui-kit-v2/src/lib/components/`
- **the form-field base** — `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.ts`
- **the route side-panel base** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts`
- **the shared functions and types** — `projects/utils/src/lib/`
- **the directives, tokens and storages** — `projects/core/src/lib/`
- **the reinvention guard** — `.claude/hooks/reuse-first-guard.sh`, the samples — in `.claude/rt-kit/project.sh`
- **the package sign bundles** — `tools/signals/` — a file per rt-tools package; they are read by `tools/signals.mjs`
- **the tree's own signs** — `.claude/rt-kit/signals.json`, declared by the key `reuse.signals` in `.claude/rt-kit/checks.json`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **The source of look is chosen by application, not by habit.** — **Not checked by anything.** There are no applications in the tree, and the choice goes between the two kits: the first has the prefix `rtui-` and a token set of its own, the second `rt-` and its own. They share no code.
- **A value of an integration is taken the same way as the neighbouring value of the same integration.** — **Not checked by anything.** A value hardcoded into the code is syntactically sound: the lint, the build and the duplicate audit stay silent. The tree's closest integration is the browser profile keys in `.claude/rt-kit/browser-device-id`, and there are no hardcoded values next to them.
- **Work starts with reading the ready-made, not with a blank file.** — **Not checked by anything.** Reading leaves no trace in the tree. The neighbouring kit folder is read whole — `projects/ui-kit/src/lib/ui-kit/` and `projects/ui-kit-v2/src/lib/components/`.
- **A restriction invented on the spot is checked by a search over the tree before it becomes an argument.** — **Not checked by anything.** A restriction lives in reasoning, not in a file: a search that never happened leaves no trace. It is held by the argument "it may not be done this way", said to the owner, naming the command it was checked by.
- **One's own primitive and one's own base are created only with the owner's explicit approval.** — **Not checked by anything.** The owner's word is invisible to a machine. Both bases of the second kit were started by a decision written down in `docs/adr/`.
- **The record edit panel inherits the shared base, not its own markup.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:RtRouteAsideComponent` — the shared route side-panel base; the form fields — `rt-form-control.base.ts`.
- **Success and failure are reported by the shared bus, not by one's own markup on the screen.** — `projects/ui-kit-v2/src/lib/platform/notification-bus.service.ts:NotificationBus` — the bus of the second kit; in the first the same role is held by `snack-bar`.
- **An inline message is lawful where the record edit panel stays open after a failure.** — **Not checked by anything.** The place of showing is invisible from the code: both the bus and the ready-made message component look like a call; held by reading
- **The departure marker is set after reading the inventory of the ready-made, and what was read is named next to it.** — **Not checked by anything.** The uniformity guard reads the marker itself and does not judge the explanation next to it
- **A check is not taken off the gate so that the push goes through.** — `.claude/rt-kit/project.sh:rt_push_checks` — the gate suite names the check by a line; a removed line is visible by reading the profile edit, but is refused by nothing
- **A component is declared in three files: `.ts`, `.html`, `.scss`.** — `tools/check-reuse.mjs:SIGNALS` — a template and styles inside the decorator stand as a sign of bypassing the ready-made; the file triple is kept in every component of both kits.
- **A screen component outside the kit has an empty styles file by default.** — Not applicable: there are no screens here. The closest is that a component's styles file holds only its own differences, while the shared part leaves for the kit's styles layer.
- **The ready-made is extended, not cloned next to it.** — `tools/check-dupes.mjs:known` — a sample written a second time is found by the duplicate check. Merging the button variants into one `rtui-button` is that same technique, done by hand.
- **What accumulated before the guard is counted by the full check, and the list may only not grow.** — `tools/check-reuse.mjs:known` — the debt snapshot from `tools/reuse-allowlist.json`, and the audit goes over the whole file.
- **Signs are declared by the tree, not hardcoded in the check.** — `tools/signals.mjs:loadSignals` — the declared bundles and the tree's own signs on top of them; what is declared stands in `.claude/rt-kit/checks.json`, key `reuse`.
- **The second value of the same integration follows its own kind, not its neighbour in the file.** — `.claude/rt-kit.json:intake` — both halves of the link with the intake are declared by the tree config: the address by the key `intake`, the token by the key `token`, and the second is made the same way as the first.

## What else is worth knowing when reading the code

- The reinvention guard reads two sources at once: the declared sign bundles — the same ones the
  sweeping check takes — and the tree profile function `rt_reinvented_in` in
  `.claude/rt-kit/project.sh`. In the profile only what cannot be expressed as data stays: a sign
  that depends on the file's place in the tree. Today there is one sample there — the host in the
  second kit's styles.
- The tree's own signs lie in `.claude/rt-kit/signals.json`: a foreign spec runner, a relative
  path through `projects/*` instead of an alias, the input and output decorators instead of the
  reactive ones.
- Of the package bundles this tree declares only `angular`: it writes the kits rather than
  consuming them, and their bundles would advise calling the kit on the kit's own files.
- The bridge to Material is a deliberate exception, not a reinvention: it is gathered into one
  styles file so that a version bump is read in one place.
- Moving code does not count as reinvention: a line that already lay in the tree changes its
  indent on the move while staying the same code.

## What this is checked by

- The reinvention guard on an edit — it refuses before the line is written.
- `pnpm exec nx lint @rt-tools/<package>` — the rules of the BEM directives and modifiers catch
  part of the hand-made markup.
- The showcase: a new variant shown next to the ready-made usually turns out to be its repetition.

# reuse-first — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. A separate file because the rule speaks by
technique and travels between repositories whole, while everything below is true only here and
goes stale at every renaming.

The tree stands on both sides of this rule at once. It writes the look — two kits under
`projects/` — and it consumes it. The admin panel of the receiver is assembled from the second kit,
and its screens are an ordinary consumer. Inside a kit "take the ready-made" means leaning on a
neighbouring component, on a field base or on a CDK primitive. On a screen it means taking the kit
component and not drawing it again.

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
- **the screens that consume the second kit** — `libs/message-bus-admin/*/feature/*` and `apps/message-bus-admin/`
- **the shared layout layer of the admin panel** — `apps/message-bus-admin/src/styles/`
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

- **The source of look is chosen by application, not by habit.** — `.claude/rt-kit/checks.json:reuse` — the bundle of the second kit is declared with the area it holds over. That area is the admin panel of the receiver. There the source of look is `@rt-tools/ui-kit-v2`. The first kit has the prefix `rtui-`, the second `rt-`; they share no code, and no screen takes both.
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
- **A screen component outside the kit has an empty styles file by default.** — **Not checked by anything.** An empty styles file is counted by nothing. A screen that declared its own layout is told from one that applied the shared layer only by reading. The screens lie in `libs/message-bus-admin/*/feature/*`, the layout they apply — in `apps/message-bus-admin/src/styles/`.
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
- Of the package bundles this tree declares two. `angular` goes over the whole tree, `ui-kit-v2`
  over the area `apps/message-bus-admin` and `libs/message-bus-admin`. The area is not a detail
  here. The tree writes the second kit as well, and a bundle declared without an area would advise
  calling the kit on the kit's own files: the sign is right and pointed the wrong way. The bundles
  of the first kit, of the core, of the storage and of the utilities are not declared for the same
  reason — outside their own packages they have no consumer yet.
- The signs of a bundle name a native control, an overlay and a layout of one's own. A whole piece
  drawn by hand in place of a ready-made component is named by none of them. What was drawn instead
  of the ready-made chat of the kit was seen neither by the guard nor by the sweeping check. That is
  the boundary of the signs rather than a miss in them.
- The bridge to Material is a deliberate exception, not a reinvention: it is gathered into one
  styles file so that a version bump is read in one place.
- Moving code does not count as reinvention: a line that already lay in the tree changes its
  indent on the move while staying the same code.

## How the three uncounted numbers are asked

The rule names three articles no check counts, and each is a number about this tree. A number
written down goes stale by itself, so here stands the way to ask it — and what today's answer is.

```bash
# fields of the application against the ready-made base of the kit
grep -rl "extends RtFormControlBase" projects libs apps --include="*.ts" | wc -l
# a message shown by one's own markup instead of the ready-made component and the bus
grep -rn 'role="alert"' projects libs apps --include="*.html"
# consumers of the ready-made message component
grep -rl "<rt-message" libs apps --include="*.html" | wc -l
```

On 21 September 2026 the answers were: nine components inherit the base; the alert role stands in
one place, and that place is the markup of the ready-made component itself; eight screens of the
admin panel call the ready-made message. A divergence between these lines and the answer of a
command is read in favour of the command.

## What this is checked by

- The reinvention guard on an edit — it refuses before the line is written.
- `pnpm exec nx lint @rt-tools/<package>` — the rules of the BEM directives and modifiers catch
  part of the hand-made markup.
- The showcase: a new variant shown next to the ready-made usually turns out to be its repetition.

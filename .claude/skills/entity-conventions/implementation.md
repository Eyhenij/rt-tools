# entity-conventions — what is this tree's own

The names and bindings of this tree, next to the rule `SKILL.md`.

There is not one record-editing panel here, and there will be none: cargo is read, not edited —
the receiver takes it from trees. There is one writing panel, and it creates a record rather
than editing one: the invitation-issuing panel in the invitations section. There are three
detail panels, one per cargo section, and all of them stand on the same kit base as an editing
panel: a route in the `ro` outlet, reading the record by the identifier from the address,
closing by navigation. So the articles about writing are held by the issuing panel alone, while
the other panels are true by the letter of the base.

## What it is called here

- **In the rule** — Here
- **an aside with `outlet: 'ro'`** — the same; the side panel component itself is `rt-aside` from `@rt-tools/ui-kit-v2`
- **`RtRouteAsideComponent<T>`** — the same: a directive without a selector in the kit, `rt-route-aside.base.ts`
- **`BaseListStoreService`** — there is no such thing here; the closest is `BaseAsyncStoreService` from `@rt-tools/store`
- **`runMutation`** — the same — a method of the base
- **`pristineSignal(control)`** — the same — from that same base
- **`openRelated`** — the same — a method of the base
- **an entity store** — `<entity>.store.ts` in `<domain>/data-access` — two per cargo section

## Where it lives

- **the shared route panel base** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts`
- **the side panel** — `projects/ui-kit-v2/src/lib/components/aside/`
- **the store bases** — `projects/store/src/lib/` — `BaseStoreService`, `BaseAsyncStoreService`
- **the notification bus** — `projects/ui-kit-v2/src/lib/platform/notification-bus.service.ts`
- **the sign-in store** — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts` — sign-in, not an entity
- **the shared list-store base** — `libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts`
- **the section stores** — `libs/message-bus-admin/postmortems/data-access/`, `.../proposals/data-access/`, `.../summaries/data-access/` — the list and the record apart
- **the detail panels** — `libs/message-bus-admin/postmortems/feature/details-aside/`, `.../proposals/feature/details-aside/`, `.../summaries/feature/details-aside/`
- **the panel that creates a record** — `libs/message-bus-admin/invites/feature/create-aside/` — issuing an invitation: the name field, `runMutation`, showing the code
- **the end-to-end panel specs** — `apps/message-bus-admin-e2e/src/postmortems-list.spec.ts`, `apps/message-bus-admin-e2e/src/sections.spec.ts`, `apps/message-bus-admin-e2e/src/invites-list.spec.ts`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **The aside opens by a route in the `ro` outlet, not by a service call.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:RtRouteAsideComponent` — the kit base reads the record by the identifier from the address and closes by navigation. All three admin panels open by a route — `libs/message-bus-admin/postmortems/shell/src/lib/postmortems.routes.ts:postmortemsRoutes`, and the move into the panel comes from the shared screen mechanics: `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:openDetails`.
- **Saving goes through `runMutation`, and the panel hands the base the mutation stream and the keys.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:runMutation` — busyness, clearing the former error, the success toast and the closing are held by the base. One panel of the tree calls it — `libs/message-bus-admin/invites/feature/create-aside/src/lib/admin-invite-create-aside.component.ts:submit`, and it does not ask the base to close: the code is visible only in an open panel.
- **The mutation stream must give a value or an error.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:submitting` — the writing sign is taken down by the stream's answer; an empty stream would leave it raised forever, and there would be nothing left to close the panel with.
- **A mutation ends with a re-read list, not with a sent request.** — The admin panel does not edit cargo at all; it has two mutations, and both are over an invitation — issuing and revoking. Both end with a re-read list: `libs/message-bus-admin/invites/data-access/src/lib/invites.store.ts:issue` and `:revoke` call `libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts:retry` on the answer, not on the sent request.
- **The store answers with a stream: success is a value, refusal is a stream error.** — The section stores answer with signals rather than a stream, and lawfully: a reading store returns nothing to its caller — the screen looks at `rows`, `pending` and `fault` (`libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts:AdminListStoreBase`). The sign-in store — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts:AuthStore` — answers half otherwise, and lawfully: sign-in returns nothing because it has an action source and `exhaustMap`, and a second press of the button starts no second request; the result is read by the signals `session` and `fault`. A stream is the answer of `restore` and `signOut` — they are called by the guard and the shell, not by a form. A stream with a value is also the answer of issuing an invitation — `libs/message-bus-admin/invites/data-access/src/lib/invites.store.ts:issue`: the code arrives in the answer, and the panel has nowhere else to take it from. There is no boolean answer anywhere in the tree.
- **Names come from the entity, not from the domain.** — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts:signIn` — next to it `signOut` and `restore`: the domain name stands in the store name, and there is nothing to repeat it with in the methods.
- **The unsaved-edits guard is set by the panel itself, on all four closing paths.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:guardUnsavedChanges` — the four closing paths are held by the kit base; the panel starts no check of its own. Not one admin panel sets it. The detail panels have no edits at all; the invitation-issuing panel has one field, and the only thing unsaved in it is a name typed and not issued.
- **Leaving the panel goes through `openRelated`, not through an own `router.navigate`.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:openRelated` — absolute commands leave the `ro` outlet in the address, and the router rejects the navigation silently.
- **The record is read by the identifier from the address as the full model, not taken from the list.** — `libs/message-bus-admin/postmortems/data-access/src/lib/postmortem.store.ts:PostmortemStore` — the panel reads the record by its own operation with the identifier from the address instead of taking the row from the list: the review text is not in the row at all. The model levels — `libs/message-bus-admin/postmortems/util/src/lib/postmortem.model.ts:IPostmortem`.

## What else is worth knowing when reading the code

- The shared list-store base is this tree's own here — `AdminListStoreBase` in
  `common/core/data-access`, not `BaseListStoreService` from the rule: it stands on the kit's
  `BaseAsyncStoreService` and knows exactly what a reading list needs — the page, the busyness
  and the kind of refusal.
- The sign-in store keeps no entity, and the rule does not act on it: the gate takes the whole
  subtree `libs/message-bus-admin/auth/` into the shared rules — a branch in
  `.claude/rt-kit/gate-map.sh`.
- The panel base lives in the kit written by this same tree. An edit a panel lacks goes into the
  base, not into the panel: a second panel with mechanics of its own diverges from the first
  silently.
- An action with a busyness of its own does not go through the base — it has its own sign; there
  is no such action in the tree yet.

## What this is checked by

- `pnpm exec nx test @rt-tools/ui-kit-v2` — the specs of the route panel base: `runMutation`,
  `openRelated`, the pristine form, the four closing paths.
- `pnpm exec nx test message-bus-admin-auth-util` — the specs of parsing a sign-in refusal.
- `pnpm exec nx run message-bus-admin-e2e:e2e` — the end-to-end suite: the panel opens on a click
  on a row, a closed one gives the list back as it was, and about a record that does not exist
  the panel says so.
- The rule gate demands this rule on the admin panel stores and on the editing panels — a branch
  in `.claude/rt-kit/gate-map.sh`.

# permissions — what is this tree's own

The names and bindings of this tree, next to the rule `SKILL.md`.

There are no rights here. No roles, no presets, no overrides, no ownerships: the owner's word —
they are not to be taken into this work. So only half the rule acts — the half about declaring
access on an operation and about refusing whoever did not introduce themselves. The other half,
about adding up rights, has nothing to be bound to, and that is written down as a line rather than
as emptiness: an empty line a month later is indistinguishable from a forgotten one.

The receiver's operations are Nest controllers over HTTP, not Connect procedures. The access
declaration at that is arranged exactly as the rule demands: a mark on the class or on the
operation, one check for the whole application, closed by default.

## What it is called here

- **In the rule** — Here
- **a Connect procedure** — an operation of a Nest controller; the shared check stands as `APP_GUARD`
- **a right ("resource and action")** — there is no such thing here: no rights are started in the tree
- **`@RequiresPermission('…')`** — there is no such thing here
- **`@RequiresAuth('reason')`** — `@SessionOperation()` — closed by a person's sign-in
- **`@PublicProcedure('reason')`** — `@PublicOperation()` — the reason is not passed as an argument, it stands as a comment
- **`@OptionalAuthProcedure('reason')`** — there is no such thing here: an operation gives a guest and a signed-in person nothing different
- **— (the rule has no fourth kind)** — `@TreeOperation()` — closed by a tree token: taking in cargo and editing its state
- **a preset, an override** — there is no such thing here
- **`Code.Unauthenticated`** — the framework's `UnauthorizedException` — the answer 401
- **`Code.PermissionDenied`** — there is no such thing here: there is nothing to divide the signed-in by
- **the sign-in interceptor** — `AccessGuard` — one check for both ways of introducing oneself
- **the admin panel route guard** — `sessionGuard`

## Where it lives

- **the access declaration** — `libs/message-bus-api/access/util/src/lib/operation-access.ts`
- **the access check** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts`
- **putting the check on everything** — `libs/message-bus-api/access/feature/src/lib/access.module.ts`
- **the sign-in, the sign-out and the answer about the signed-in person** — `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts`
- **the count of failed attempts** — `libs/message-bus-api/accounts/feature/src/lib/login-attempts.service.ts`
- **the cookie and the sign-in value** — `libs/message-bus-api/accounts/util/src/lib/session-cookie.util.ts`, `session-token.util.ts`
- **the admin panel route guard** — `libs/message-bus-admin/auth/shell/src/lib/session.guard.ts`
- **the sign-in state in the admin panel** — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **Every procedure declares its access by a decorator, and there is exactly one declaration.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts:AccessGuard` — the mark is read from the operation and from the class at once, `getAllAndOverride`. An undeclared operation answers nobody. A second declaration cannot come about: the mark is one, and a second one replaces the first rather than adding to it.
- **There are four kinds of access: by a right, to any signed-in person, public and public with a read of the sign-in.** — Here there are three, and they are different: `libs/message-bus-api/access/util/src/lib/operation-access.ts:TOperationAccess` — `public`, `tree`, `session`. "By a right" is absent for want of rights. "Public with a read of the sign-in" is absent for want of anything to show a signed-in person beyond a guest. Third here comes the tree token, which the rule does not know at all.
- **A user's rights are the preset's rights with their overrides applied over them.** — Not applicable: there are no rights in the tree. Everything an operation is closed by is listed in `libs/message-bus-api/access/util/src/lib/operation-access.ts:OPERATION_ACCESS` — the set is closed, and there is no place for a right in it.
- **A person has one role per ownership, and the storage holds that.** — Not applicable: there are neither roles nor ownerships in the schema. Everything the storage knows about a signed-in person is read by `libs/message-bus-api/accounts/data-access/src/lib/account.queries.ts:findSessionByHash` — the account, the sign-in expiry and the disabled sign.
- **A right the role says nothing about counts as not given.** — Not applicable: there is nothing to add up. The default is the same here and stands a tier higher — `libs/message-bus-api/access/feature/src/lib/access.guard.ts:AccessGuard`, the `default` branch. An operation that declared no access is refused rather than let through.
- **A signed-in person's rights are read on every call rather than taken from the issued sign-in.** — `libs/message-bus-api/accounts/util/src/lib/session-token.util.ts:sessionTokenHash` — the cookie holds a random value. The decision is made by the record from the storage, found by its hash on every request.
- **An account that no longer exists opens no calls that require a sign-in.** — `libs/message-bus-api/accounts/util/src/lib/session-token.util.ts:sessionAlive` — by that same read an expired and a revoked sign-in are refused. A disabled account is refused by `access.guard.ts` on the `disabledAt` sign.
- **The counter and the advertising signals are switched on by the guest's answer, not by the presence of a key in the settings.** — Not applicable: neither the receiver nor the admin panel has a visit counter or advertising. One operation is open to a guest here — the liveness probe, `apps/message-bus/src/app/health/health.controller.ts:HealthController`.
- **A public procedure that creates a record is closed by a rate limiter as well.** — `libs/message-bus-api/accounts/feature/src/lib/login-attempts.service.ts:LoginAttemptsService` — the count of failures in a row; the answer's delay is computed by `libs/message-bus-api/accounts/util/src/lib/login-delay.util.ts:loginDelayMs`. The key here is the account name rather than the client: of the two public operations the one worth watching is the sign-in, and the liveness probe creates nothing.
- **A request without a sign-in is refused as unauthenticated, and a sign-in without a right as permission denied.** — Here there is one answer out of the two: `libs/message-bus-api/access/feature/src/lib/access.guard.ts:AccessGuard` answers `UnauthorizedException` in every branch. Nor can there be a second — the signed-in are not divided. The refusal deliberately does not name what did not match: by the difference of answers one could check what exists.
- **The right is checked by an interceptor before the procedure body.** — `libs/message-bus-api/access/feature/src/lib/access.module.ts:AccessModule` — the check is put as `APP_GUARD`, that is, before any handler and over the whole application at once.
- **Being public is declared with a reason.** — Here it is otherwise: `libs/message-bus-api/access/util/src/lib/operation-access.ts:PublicOperation` accepts no arguments, and the reason stands as a comment on the operation. There are two public operations — the liveness probe and the sign-in itself — and both have their argument in a comment rather than in the signature.
- **A menu item and a section address are closed by one declaration.** — Not applicable in the shape it is written in: everything is closed at once rather than per item. `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:ADMIN_MENU` names no rights, and the guard stands on the closed branch whole.
- **Until the rights are received the admin panel hides nothing.** — There is nothing to hide: the menu is the same for every signed-in person. The closest in meaning is `libs/message-bus-admin/auth/shell/src/lib/session.guard.ts:sessionGuard`: it waits for the receiver's answer rather than deciding by the tab's memory. Checked by a click: `apps/message-bus-admin-e2e/src/sign-in.spec.ts` — someone not signed in sees the sign-in screen instead of an empty section, and a dropped sign-in leads to the sign-in rather than showing a refusal.

## What else is worth knowing when reading the code

- One check for both ways of introducing oneself is deliberate. Two global checks in a row would
  mean a request with a tree token reaches the reading of cargo if the second one forgot to
  refuse.
- A tree token does not count as a sign-in even when valid: it opens the intake of its own tree,
  not the reading of everyone's cargo. The reverse is true too — the sign-in cookie does not open
  the cargo intake.
- The admin panel's sign-in lives by the receiver's cookie rather than by a storage of its own in
  the browser: the cookie is unavailable to scripts, so the admin panel asks the receiver "who
  signed in" instead of reading it at home.
- The default "closed" is held not by an agreement but by the check having no branch "nothing is
  declared — let through". Removing that branch would open every new operation outward silently.

## What this is checked by

- `pnpm exec nx test message-bus-api-access-feature` — the specs of the access check: an
  undeclared operation, a foreign token, an expired sign-in, a disabled account.
- `pnpm exec nx test message-bus-api-accounts-feature` — the sign-in specs: a valid and an invalid
  pair, signing out, the count of attempts.
- `pnpm exec nx run message-bus-admin-e2e:e2e` — the end-to-end suite: signing in by the screen,
  the refusal without a sign-in and the same refusal text for a wrong pair and for an unknown name.
- The rule gate demands this rule on the receiver's access guard and on the admin panel's route
  guard — branches in `.claude/rt-kit/gate-map.sh`.

# permissions — what is this tree's own

The names and bindings of this tree, next to the rule `SKILL.md`.

There are rights here: a closed set of them, a role that holds a set whole, and pointed edits over
the role. What the tree has not got is ownerships — there is one intake and one set of sections, so
a person has one role, not one per ownership. Where the rule speaks of an ownership, the line says
so and names what is here instead: an empty line a month later is indistinguishable from a
forgotten one.

The receiver's operations are Nest controllers over HTTP, not Connect procedures. The access
declaration at that is arranged exactly as the rule demands: a mark on the class or on the
operation, one check for the whole application, closed by default.

## What it is called here

- **In the rule** — Here
- **a Connect procedure** — an operation of a Nest controller; the shared check stands as `APP_GUARD`
- **a right ("resource and action")** — the pair as a string: `postmortems:manage`, `roles:manage`; the set is closed by the code
- **`@RequiresPermission('…')`** — `@RequiresRight('…')` — the right is taken from the closed set, not written as a string
- **`@RequiresAuth('reason')`** — `@SessionOperation()` — closed by a person's sign-in
- **`@PublicProcedure('reason')`** — `@PublicOperation()` — the reason is not passed as an argument, it stands as a comment
- **`@OptionalAuthProcedure('reason')`** — there is no such thing here: an operation gives a guest and a signed-in person nothing different
- **— (the rule has no fourth kind)** — `@TreeOperation()` — closed by a tree token: taking in cargo and editing its state
- **a preset, an override** — a role and a pointed edit over it: a role is a named set, an edit is one right given or taken away from one person
- **`Code.Unauthenticated`** — the framework's `UnauthorizedException` — the answer 401
- **`Code.PermissionDenied`** — the framework's `ForbiddenException` — the answer 403
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
- **the sign-in state in the admin panel and the rights of the signed-in person** — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts`
- **the closed set of rights and the addition of a role with the edits over it** — `libs/message-bus-common/src/lib/rights.ts`
- **the role and the pointed edits in the storage** — `prisma/schema.prisma` — the models `Role` and `AccountPermission`
- **the page of roles and the panel of a person's access** — `libs/message-bus-admin/accounts/feature/roles-list/`, `libs/message-bus-admin/accounts/feature/role-aside/`, `libs/message-bus-admin/accounts/feature/access-aside/` — both closed by `roles:manage`; the receiver side is `libs/message-bus-api/accounts/feature/src/lib/roles.controller.ts` and `accounts-access.controller.ts`, the agreement `docs/specs/message-bus/roles-page/`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **Every procedure declares its access by a decorator, and there is exactly one declaration.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts:AccessGuard` — the mark is read from the operation and from the class at once, `getAllAndOverride`. An undeclared operation answers nobody. A second declaration cannot come about: the mark is one, and a second one replaces the first rather than adding to it.
- **There are four kinds of access: by a right, to any signed-in person, public and public with a read of the sign-in.** — There are four here too, and one of them is another: `libs/message-bus-api/access/util/src/lib/operation-access.ts:TOperationAccess` — `public`, `tree`, `session`, `permission`. "Public with a read of the sign-in" is absent for want of anything to show a signed-in person beyond a guest; in its place stands the tree token, which the rule does not know at all.
- **A user's rights are the preset's rights with their overrides applied over them.** — `libs/message-bus-common/src/lib/rights.ts:rightsOf` — a pure addition: the set of the role, then the pointed edits over it. A name outside the closed set is discarded on both sides — `isRight` next to it.
- **A person has one role per ownership, and the storage holds that.** — `prisma/schema.prisma:Role` — one role on the account, and there are no ownerships here to divide it by: the intake is one. There is nothing to add up either, and that is what the article is about.
- **A right the role says nothing about counts as not given.** — `libs/message-bus-common/src/lib/rights.ts:hasRight` — the set holds what is given, and silence about a right is an answer, not a gap. The same default stands a tier higher, in the `default` branch of `access.guard.ts`: an operation that declared no access is refused rather than let through.
- **A signed-in person's rights are read on every call rather than taken from the issued sign-in.** — `libs/message-bus-api/accounts/data-access/src/lib/account.queries.ts:findAccountRights` — the check asks the storage for the role and the edits at every call. The cookie holds a random value and says only who came — `libs/message-bus-api/accounts/util/src/lib/session-token.util.ts:sessionTokenHash`.
- **An account that no longer exists opens no calls that require a sign-in.** — `libs/message-bus-api/accounts/util/src/lib/session-token.util.ts:sessionAlive` — by that same read an expired and a revoked sign-in are refused. A disabled account is refused by `access.guard.ts` on the `disabledAt` sign.
- **The counter and the advertising signals are switched on by the guest's answer, not by the presence of a key in the settings.** — Not applicable: neither the receiver nor the admin panel has a visit counter or advertising. One operation is open to a guest here — the liveness probe, `apps/message-bus/src/app/health/health.controller.ts:HealthController`.
- **A public procedure that creates a record is closed by a rate limiter as well.** — `libs/message-bus-api/accounts/feature/src/lib/login-attempts.service.ts:LoginAttemptsService` — the count of failures in a row; the answer's delay is computed by `libs/message-bus-api/accounts/util/src/lib/login-delay.util.ts:loginDelayMs`. The key here is the account name rather than the client: of the two public operations the one worth watching is the sign-in, and the liveness probe creates nothing.
- **A request without a sign-in is refused as unauthenticated, and a sign-in without a right as permission denied.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts:AccessGuard` — the first refusal is `UnauthorizedException`, the second `ForbiddenException`: one is cured by signing in, the other is not. Neither names what did not match, the right included: by the difference of answers one could read what exists and what rights a foreign account holds.
- **The right is checked by an interceptor before the procedure body.** — `libs/message-bus-api/access/feature/src/lib/access.module.ts:AccessModule` — the check is put as `APP_GUARD`, that is, before any handler and over the whole application at once.
- **Being public is declared with a reason.** — Here it is otherwise: `libs/message-bus-api/access/util/src/lib/operation-access.ts:PublicOperation` accepts no arguments, and the reason stands as a comment on the operation. There are two public operations — the liveness probe and the sign-in itself — and both have their argument in a comment rather than in the signature.
- **A menu item and a section address are closed by one declaration.** — `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:IAdminMenuItem` — the right stands at the item, and `libs/message-bus-admin/auth/shell/src/lib/section-access.ts:sectionRightGuard` reads it from there. The guard stands on the children of the closed branch: on the branch itself it would run once per page load and would not see moves between sections.
- **Until the rights are received the admin panel hides nothing.** — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts:allows` — until the answer about the signed-in person arrives, the rights are unknown rather than empty, and neither the menu nor the guard by a right hides anything by them. The route guard next to it waits for that same answer rather than deciding by the tab's memory — `libs/message-bus-admin/auth/shell/src/lib/session.guard.ts:sessionGuard`; checked by a click in `apps/message-bus-admin-e2e/src/sign-in.spec.ts`.

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
  undeclared operation, a foreign token, an expired sign-in, a disabled account, and an operation
  closed by a right — a sign-in with it, without it and with no role at all.
- `pnpm exec nx test message-bus-api-access-util` — the addition of a role with the pointed edits
  and the marks the declaration by a right sets.
- `pnpm exec nx test message-bus-api-accounts-feature` — the sign-in specs: a valid and an invalid
  pair, signing out, the count of attempts.
- `pnpm exec nx run message-bus-admin-e2e:e2e` — the end-to-end suite: signing in by the screen,
  the refusal without a sign-in and the same refusal text for a wrong pair and for an unknown name.
- The rule gate demands this rule on the receiver's access guard and on the admin panel's route
  guard — branches in `.claude/rt-kit/gate-map.sh`.

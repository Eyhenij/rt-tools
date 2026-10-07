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
- **the sign-in interceptor** — `AuthGuard` of `@rt-tools/auth-server` for the token of a person, and `AccessGuard` of the intake for the tree token: a request passes when both agree
- **the admin panel route guard** — `rtAuthGuard` of `@rt-tools/auth-angular`

## Where it lives

- **the access declaration** — `libs/message-bus-api/access/util/src/lib/operation-access.ts`
- **the access check** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts`
- **putting the check on everything** — `libs/message-bus-api/access/feature/src/lib/access.module.ts`
- **the token check, the rights in it and the start audit of the declarations** — `projects/auth-server/src/lib/auth-server.module.ts`, connected in `apps/message-bus/src/app/app.module.ts` with the options read by `projects/auth-server/src/lib/env-options.ts`
- **the admin panel route guard** — `rtAuthGuard` of `@rt-tools/auth-angular`, `projects/auth-angular/src/lib/auth.guards.ts`
- **the sign-in state in the admin panel and the rights of the signed-in person** — `libs/message-bus-admin/common/container/data-access/src/lib/auth.store.ts`
- **the closed set of rights** — `libs/message-bus-common/src/lib/rights.ts`

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
- **A signed-in person's rights are read on every call rather than taken from the issued sign-in.** — `projects/auth-server/src/lib/auth.guard.ts:canActivate` — **narrower** than the article: the rights are read from the access token of the call, not from the storage. The token lives minutes, so a right taken away in Keycloak acts with the next token rather than with the next call.
- **An account that no longer exists opens no calls that require a sign-in.** — `projects/auth-server/src/lib/token-verifier.ts:callerOf` — **narrower** than the article: Keycloak issues no new token to a removed or disabled person, and the token already issued is accepted until its term ends.
- **The counter and the advertising signals are switched on by the guest's answer, not by the presence of a key in the settings.** — Not applicable: neither the receiver nor the admin panel has a visit counter or advertising. One operation is open to a guest here — the liveness probe, `apps/message-bus/src/app/health/health.controller.ts:HealthController`.
- **A public procedure that creates a record is closed by a rate limiter as well.** — `libs/message-bus-api/trees/feature/src/lib/enroll.controller.ts:enroll` — the enrolment of a tree counts the attempts of a client by `RateLimitService` and refuses beyond the limit. The sign-in and its limit live in Keycloak.
- **A request without a sign-in is refused as unauthenticated, and a sign-in without a right as permission denied.** — `projects/auth-server/src/lib/auth.guard.ts:AuthGuard` — the first refusal is `UnauthorizedException`, the second `ForbiddenException`: one is cured by signing in, the other is not. Neither names what did not match, the right included.
- **The right is checked by an interceptor before the procedure body.** — `projects/auth-server/src/lib/auth-server.module.ts:AuthServerModule` — the token check is put as `APP_GUARD`, and the tree check of `libs/message-bus-api/access/feature/src/lib/access.module.ts:AccessModule` stands next to it the same way: both run before any handler.
- **Being public is declared with a reason.** — Here it is otherwise: `libs/message-bus-api/access/util/src/lib/operation-access.ts:PublicOperation` accepts no arguments, and the reason stands as a comment on the operation. The public operations are the liveness probe, the enrolment of a tree and the operations of the chat widget, and all have their argument in a comment rather than in the signature.
- **A menu item and a section address are closed by one declaration.** — `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:IAdminMenuItem` — the right stands at the item, and `libs/message-bus-admin/common/container/data-access/src/lib/section-access.ts:sectionRightGuard` reads it from there. The guard stands on the children of the closed branch: on the branch itself it would run once per page load and would not see moves between sections.
- **Until the rights are received the admin panel hides nothing.** — `libs/message-bus-admin/common/container/data-access/src/lib/auth.store.ts:allows` — until Keycloak names the person, the rights are unknown rather than empty, and neither the menu nor the guard by a right hides anything by them. The start of the admin panel waits for the silent check of Keycloak, so a signed-in person has their rights from the first route.

## What else is worth knowing when reading the code

- There are two checks, and a request passes only when both agree. The token of a person is
  checked by the entry module, the tree token by the check of the intake; every mark sets the
  declaration of both, so a tree operation is open for the module and closed for the intake.
- A tree token does not count as a sign-in even when valid: it opens the intake of its own tree,
  not the reading of everyone's cargo. The reverse is true too — the token of a person does not
  open the cargo intake.
- The admin panel signs in through Keycloak and carries the access token in the `Authorization`
  header; the intake keeps no sign-in of its own.
- The default "closed" is held not by an agreement but by the check having no branch "nothing is
  declared — let through". Removing that branch would open every new operation outward silently.

## What this is checked by

- `pnpm exec nx test message-bus-api-access-feature` — both checks together on the marks of the
  application: a tree token, a token of a person, an undeclared operation and an operation closed
  by a right — a token with it, without it and with no client role at all.
- `pnpm exec nx test message-bus-api-access-util` — the addition of a role with the pointed edits
  and the marks the declaration by a right sets.
- `pnpm exec nx run message-bus-admin-e2e:e2e` — the end-to-end suite: signing in by the screen,
  the refusal without a sign-in and the same refusal text for a wrong pair and for an unknown name.
- The rule gate demands this rule on the receiver's access guard and on the admin panel's route
  guard — branches in `.claude/rt-kit/gate-map.sh`.

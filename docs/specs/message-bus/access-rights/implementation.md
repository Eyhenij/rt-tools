# A right, a role and the check that reads them — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the
code, or the code holds what the spec is silent about.

- **A right is the pair "resource and action", and the set of rights is closed.** — `libs/message-bus-common/src/lib/rights.ts:RIGHTS`
- **The rights of a person are the client roles of the bus client in their access token.** — `projects/auth-contract/src/lib/caller.ts:callerFromClaims`
- **A right the token does not carry counts as not given.** — `projects/auth-contract/src/lib/caller.ts:hasPermission`
- **A person without client roles has no rights at all.** — `projects/auth-contract/src/lib/caller.ts:callerFromClaims`
- **The set of rights reaches Keycloak at the start of the intake.** — `apps/message-bus/src/app/app.module.ts:AppModule` — the set `RIGHTS` goes to `projects/auth-server/src/lib/env-options.ts:authOptionsFromEnv` and from there to `projects/auth-server/src/lib/catalog-sync.ts:syncPermissionCatalog`
- **An operation declares its access by one of four marks.** — `libs/message-bus-api/access/util/src/lib/operation-access.ts:RequiresRight`
- **The rights are read from the access token of the call.** — `projects/auth-server/src/lib/auth.guard.ts:canActivate`
- **A request without a sign-in is refused as unauthenticated, and a sign-in without a right as permission denied.** — `projects/auth-server/src/lib/auth.guard.ts:AuthGuard`
- **A refusal by a right does not name which right was missing.** — `projects/auth-server/src/lib/auth.guard.ts:AuthGuard`
- **A token of a tree carries no rights and opens no operation declared by a right.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts:AccessGuard`
- **The admin panel reads the rights of the person from their token.** — `libs/message-bus-admin/common/container/data-access/src/lib/auth.store.ts:AuthStore` — the rights are the permissions of the caller `@rt-tools/auth-angular` read from the token
- **Until the rights are received the admin panel hides nothing.** — `libs/message-bus-admin/common/container/data-access/src/lib/auth.store.ts:allows`
- **A menu item carries the right that opens its section, and the address is closed by that same declaration.** — `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:IAdminMenuItem`
- **An item whose right the signed-in person does not hold is not drawn.** — `libs/message-bus-admin/common/container/feature/src/lib/admin-container.component.ts:sections`
- **The address of a closed section does not open by a direct link either.** — `libs/message-bus-admin/common/container/data-access/src/lib/section-access.ts:sectionRightGuard`
- **A person to whom no section is open sees the admin panel without sections, with their name and the way out.** — `libs/message-bus-admin/common/container/feature/src/lib/admin-no-sections.component.ts:AdminNoSectionsComponent`
- **The root of the admin panel leads into the first section open to the person, not into the first of the list.** — `libs/message-bus-admin/common/container/data-access/src/lib/section-access.ts:firstOpenSectionPath`
- **The operations a section lives by are closed by the read right of that section.** — `libs/message-bus-api/postmortems/feature/src/lib/postmortems-read.controller.ts:PostmortemsReadController` — the same declaration stands on the reading of the proposals, of the summaries and of the invitations; the issuing and the revocation of an invitation are closed by the right of editing that section
- **The set of rights is declared once and read by both sides.** — `libs/message-bus-common/src/lib/rights.ts:RIGHTS`
- **A right taken away closes the section on the next move, not on the next sign-in.** — `libs/message-bus-admin/common/container/data-access/src/lib/section-access.ts:sectionRightGuard`

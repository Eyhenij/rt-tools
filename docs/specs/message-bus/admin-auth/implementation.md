# The entry into the admin application — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **Not a single operation gives the cargo without an entry.** — `projects/auth-server/src/lib/auth.guard.ts:AuthGuard`
- **A person signs in through Keycloak, and the intake keeps neither a password check nor an entry of its own.** — `apps/message-bus/src/app/app.module.ts:AppModule` — the intake takes the shared entry module and serves no operation of the entry
- **A request of a person carries the access token of the bus client in the `Authorization` header.** — `projects/auth-server/src/lib/token-verifier.ts:KeycloakTokenVerifier`
- **A token of a tree does not open the admin application, and the entry of a person does not open the intake of the cargo.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts:canActivate`
- **Every operation declares its way of access openly.** — `libs/message-bus-api/access/util/src/lib/operation-access.ts:OPERATION_ACCESS`
- **The intake does not start while one of its operations declares no access.** — `projects/auth-server/src/lib/access-audit.ts:undeclaredAccess`
- **The admin application asks the intake where to sign in.** — `apps/message-bus/src/app/entry/entry-settings.controller.ts:EntrySettingsController`
- **An account is created, changes its password and is switched off from the screens.** — `libs/message-bus-api/accounts/feature/src/lib/accounts-manage.controller.ts:create`
- **The name of an account is taken by one person, and the case is not told apart in it.** — `libs/message-bus-api/accounts/util/src/lib/account-name.util.ts:accountNameKey`
- **A person sent to the entry from the address of a section lands after the entry where they were going.** — `projects/auth-angular/src/lib/auth.guards.ts:rtAuthGuard` — Keycloak returns the person to the address the guard sent them from
- **The name of an account is unique by the brought-to form.** — `prisma/schema.prisma:Account`
- **The password lies only as a hash.** — `prisma/schema.prisma:Account`

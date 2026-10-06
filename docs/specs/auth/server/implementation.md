# The server of the entry module — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec.

- **An operation without an access declaration stops the application at start.** — `projects/auth-server/src/lib/access-audit.ts:undeclaredAccess`
- **An operation with two access declarations stops the application at start.** — `projects/auth-server/src/lib/access-audit.ts:undeclaredAccess`
- **A token is accepted only from the realm, within its term and for the client of this admin.** — `projects/auth-server/src/lib/token-verifier.ts:KeycloakTokenVerifier`
- **A call without an accepted token is refused as not signed in, a call without the right as not allowed.** — `projects/auth-server/src/lib/auth.guard.ts:AuthGuard`
- **A refusal does not name the missing right or what in the token did not match.** — `projects/auth-server/src/lib/auth.guard.ts:AuthGuard`
- **The catalog sync creates the roles Keycloak lacks and removes none.** — `projects/auth-server/src/lib/catalog-sync.ts:syncPermissionCatalog`
- **A Connect procedure is checked by the same token check as a controller.** — `projects/auth-server/src/lib/connect-access.ts:KeycloakTokenVerifier` — the interceptor calls the class the guard calls
- **A missing realm setting stops the start and is named.** — `projects/auth-server/src/lib/env-options.ts:authOptionsFromEnv`
- **The catalog goes to Keycloak only when the environment holds the secret of the sync client.** — `projects/auth-server/src/lib/env-options.ts:authOptionsFromEnv`

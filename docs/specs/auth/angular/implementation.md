# The client of the entry module — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec.

- **The tokens live only in the memory of the page.** — `projects/auth-angular/src/lib/auth.config.ts:keycloakInitOptions`
- **The entry uses the code flow with PKCE.** — `projects/auth-angular/src/lib/auth.config.ts:keycloakInitOptions`
- **After a reload the session comes back through the silent check, without a password.** — `projects/auth-angular/src/lib/auth.config.ts:keycloakInitOptions`
- **The caller is read by the contract for the client of the admin.** — `projects/auth-angular/src/lib/auth.service.ts:RtAuthService`
- **The token goes only to a recipient the application named.** — `projects/auth-angular/src/lib/token-recipient.ts:isTokenRecipient`
- **A token that expires within thirty seconds is refreshed before the request.** — `projects/auth-angular/src/lib/auth.service.ts:MIN_VALIDITY_SECONDS`
- **An answer 401 refreshes the token and repeats the request once.** — `projects/auth-angular/src/lib/auth.interceptor.ts:rtAuthInterceptor`
- **A route that needs an entry sends a person who is not signed in to Keycloak.** — `projects/auth-angular/src/lib/auth.guards.ts:rtAuthGuard`
- **A route that needs rights names whether all or any are needed.** — `projects/auth-angular/src/lib/auth.guards.ts:rtPermissionGuard`
- **A block shown by a right appears and disappears when the rights change.** — `projects/auth-angular/src/lib/if-permission.directive.ts:RtIfPermissionDirective`
- **The current organization goes in a header the application named, and no value means no header.** — `projects/auth-angular/src/lib/auth.service.ts:requestHeaders`
- **The exit ends the session in Keycloak, not only on the page.** — `projects/auth-angular/src/lib/auth.service.ts:logout`

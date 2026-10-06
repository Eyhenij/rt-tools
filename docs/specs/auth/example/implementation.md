# The example admin — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec.

- **The example admin opens only to a person who entered through Keycloak.** — `apps/auth-example-admin/src/app/example.routes.ts:EXAMPLE_ROUTES`
- **The list of records is shown to a reader, the form of a new record only to an editor.** — `apps/auth-example-admin/src/app/records/records.page.html:rtIfPermission`
- **The example server refuses a call without the right with 403, whatever the screen shows.** — `apps/auth-example-api/src/app/records.controller.ts:RecordsController`
- **A token near its end is refreshed without a new entry.** — `apps/auth-example-admin/src/app/example.config.ts:EXAMPLE_CONFIG`
- **Sign out ends the session in Keycloak.** — `apps/auth-example-admin/src/app/records/records.page.ts:RecordsPage`
- **The token of the example client lives forty seconds on the stand.** — `deploy/auth/realm/rt.json:lifespan` — the attribute `access.token.lifespan` of the client `rt-example-admin`

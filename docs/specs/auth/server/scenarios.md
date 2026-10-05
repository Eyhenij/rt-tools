# Scenarios — the server of the entry module

The identifier goes at the start of the test title, followed by a dash.

### SC-AUTH-11 — an operation without a declaration stops the start

Given a controller with an operation that declares no access
When the application starts
Then the start fails and names the operation

### SC-AUTH-12 — an operation with two declarations stops the start

Given an operation declared both open and open by a right
When the application starts
Then the start fails and names the operation

### SC-AUTH-13 — a token of another client, issuer or key is refused

Given tokens signed by a foreign key, issued by another realm, expired, or issued to another client
When each calls an operation open to anyone signed in
Then each is refused as not signed in

### SC-AUTH-14 — not signed in and not allowed are two refusals

Given a call without a token and a call with a token that lacks the right
When each calls an operation open by a right
Then the first is refused as not signed in, the second as not allowed, and neither names the right

### SC-AUTH-15 — the caller reaches the operation

Given a token with the right of this client
When it calls the operation open by that right
Then the operation runs and reads the caller with the rights of this client

### SC-AUTH-16 — the catalog sync adds and never removes

Given Keycloak holds one right of the catalog and one right the catalog lacks
When the sync runs
Then the missing right is created, the extra one stays and is named in the log

### SC-AUTH-17 — a Connect procedure is checked the same way

Given a Connect procedure open by a right
When it is called without a token, with a token without the right and with the right
Then the answers are unauthenticated, permission denied and the result

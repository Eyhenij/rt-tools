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

Coverage: partial — the test calls the interceptor with a hand-made request. The tree has no Connect server to send a real one through.

### SC-AUTH-69 — a missing realm setting stops the start

Given a server started without `AUTH_ISSUER` or `AUTH_CLIENT_ID`
When the options of the entry module are read
Then the start stops and names every missing variable; with both set and no sync secret the catalog
is not sent

### SC-AUTH-70 — the sync secret sends the catalog to the realm of the issuer

Given a server started with `AUTH_SYNC_SECRET`
When the options of the entry module are read
Then the catalog goes to the realm named by the issuer through `rt-catalog-sync` or the client named
by `AUTH_SYNC_CLIENT_ID`; an issuer that is not a realm address stops the start

### SC-AUTH-71 — the browser part gets the realm and the client of the server

Given a server set up with an issuer and a client
When the settings for the browser part are asked
Then they name the Keycloak address and the realm of that issuer and the same client

### SC-AUTH-72 — the keys are read by the address the environment names

Given a server whose environment names the issuer the browser sees and a key set address of its own
When the options of the entry module are read
Then the tokens are checked against that issuer, and the keys are read by the named address

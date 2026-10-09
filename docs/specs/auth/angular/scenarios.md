# Scenarios — the client of the entry module

The identifier goes at the start of the test title, followed by a dash.

### SC-AUTH-26 — the adapter starts with PKCE, the silent check and no storage

Given the configuration of an admin
When the package starts the adapter
Then it asks for PKCE S256 and the silent check, and gives the adapter no token to restore

### SC-AUTH-27 — the caller has the rights of the admin client only

Given a token with roles in two clients
When the adapter reports the entry
Then the caller holds the rights of the configured client and none of the other

### SC-AUTH-28 — the token goes only to a named recipient

Given an admin that named its API address
When it sends a request to its API and to a foreign address
Then only the request to its API carries the token

### SC-AUTH-29 — a token close to its end is refreshed before the request

Given a signed-in person
When a request to the API leaves
Then the adapter is asked to refresh a token that expires within thirty seconds

### SC-AUTH-30 — an answer 401 is repeated once with a fresh token

Given an API that answers 401 once and then 200
When a request leaves
Then the token is refreshed and the repeat carries the fresh token and gets 200

### SC-AUTH-31 — a second 401 sends the person to the entry

Given an API that answers 401 every time
When a request leaves
Then it is repeated once, the person is sent to the entry and the request ends with 401

### SC-AUTH-32 — an answer Unauthenticated of Connect is repeated once

Given a Connect service that refuses with Unauthenticated once and then answers
When a call leaves
Then the token is refreshed and the repeat carries the fresh token

### SC-AUTH-33 — a route that needs an entry sends a stranger to Keycloak

Given a person who is not signed in
When they open a route that needs an entry
Then the route does not open and the entry is asked with the address of the route

### SC-AUTH-34 — a route that needs rights names all or any

Given a caller with one of two rights and an address for a refusal
When they open a route that needs all of them and a route that needs any
Then the first leads to the address for a refusal and the second opens

### SC-AUTH-35 — a block shown by a right follows the rights

Given a block shown by a right the caller does not have
When a refreshed token brings the right
Then the block appears without a reload

### SC-AUTH-36 — the organization goes in the named header

Given an admin that named the header of the organization
When a request leaves with an organization chosen and with none
Then the first carries the header with the value and the second carries no header

### SC-AUTH-37 — the exit goes through Keycloak

Given a signed-in person
When they leave
Then the adapter is asked to end the session with the return address of the admin

### SC-AUTH-76 — a silent check that never answers does not hold the start

Given Keycloak that does not answer the silent check
When the package starts the adapter
Then the admin starts after the limit with nobody signed in

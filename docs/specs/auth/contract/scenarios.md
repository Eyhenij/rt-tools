# Scenarios — the contract of the entry module

The identifier goes at the start of the test title, followed by a dash.

### SC-AUTH-6 — a string of the right shape is a right, another is not

Given strings with one colon, two colons, a space, an upper letter and an empty part
When each is checked as a right
Then only the one with two lowercase parts and one colon is a right

### SC-AUTH-7 — the caller gets the rights of the named client only

Given a token with roles in two clients
When the caller is read for one of them
Then the caller has the rights of that client and none of the other

### SC-AUTH-8 — a role of another shape is dropped

Given a token whose client roles hold Keycloak roles and rights
When the caller is read
Then only the rights remain

### SC-AUTH-9 — the catalog builds every right once

Given resources with their actions, one action named twice
When the catalog is built
Then it holds each right `resource:action` once, in the order declared

### SC-AUTH-10 — a check of several rights says all or any

Given a caller with one of two rights
When all are asked and when any is asked
Then the first answer is no and the second is yes

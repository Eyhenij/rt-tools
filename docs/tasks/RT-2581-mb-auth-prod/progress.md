# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 4 — The server of Keycloak
- **Done:** the grill, the plan; the production realm, the composition and the dump of Keycloak; the workflow is written; the bus composition passes the entry variables
- **Next step:** create the droplet in the DigitalOcean console
- **Uncommitted:** no
- **Waiting for the owner:** the sign-in to the DigitalOcean console in the browser — the password is entered by the owner only
- **PR:** not open yet

## Steps

- [>] 1.1 The droplet is created with Docker and the deploy account
- [ ] 1.2 The name auth.message-bus.dev points to the droplet
- [x] 2.1 The realm file takes its production values from the environment
- [x] 2.2 The production composition raises Keycloak, its database and the proxy
- [x] 2.3 The database of Keycloak is dumped daily
- [ ] 3.1 The workflow deploys Keycloak to its droplet
- [ ] 3.2 Keycloak answers in production
- [x] 4.1 The production composition of the bus passes the entry variables
- [ ] 4.2 The guide names the Keycloak node and the order of the bus deploy

## Decisions along the way

- **The verification of stage 4 runs the compose check with the required variables set.** With an
  empty environment file the check refuses on every required variable of the bus, including those
  this work does not touch. Affected stage of the plan: 4.
- **The dump of Keycloak uses the dump script of the bus with `DUMP_NAME=auth`.** One script for
  both nodes; the prefix of the file is the only difference. Affected stage of the plan: 2.

## Sessions

### 2026-10-07

- The branch is taken from RT-2582, the card moved to in progress, the grill and the plan written.
- The production stack of Keycloak was raised locally: the realm applied with the substitutions,
  Keycloak took about 670 MB. The first apply refused on the roles of the example client; the
  builder now drops them. The realm builder test: 11 ok.

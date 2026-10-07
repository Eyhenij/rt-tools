# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — The deploy of Keycloak
- **Done:** the droplet, the name, the node environment, Keycloak answers in production; the realm, the composition, the dump, the bus variables, the guide
- **Next step:** the first run of «Deploy Auth» after the epic reaches the main branch
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The droplet is created with Docker and the deploy account
- [x] 1.2 The name auth.message-bus.dev points to the droplet
- [x] 2.1 The realm file takes its production values from the environment
- [x] 2.2 The production composition raises Keycloak, its database and the proxy
- [x] 2.3 The database of Keycloak is dumped daily
- [>] 3.1 The workflow deploys Keycloak to its droplet
- [x] 3.2 Keycloak answers in production
- [x] 4.1 The production composition of the bus passes the entry variables
- [x] 4.2 The guide names the Keycloak node and the order of the bus deploy

## Decisions along the way

- **The verification of stage 4 runs the compose check with the required variables set.** With an
  empty environment file the check refuses on every required variable of the bus, including those
  this work does not touch. Affected stage of the plan: 4.
- **The dump of Keycloak uses the dump script of the bus with `DUMP_NAME=auth`.** One script for
  both nodes; the prefix of the file is the only difference. Affected stage of the plan: 2.

- **The first rollout went by hand with the steps of the workflow.** GitHub registers a manual run
  only from the main branch, and the epic is not merged yet. The same rsync, schedule, `up --wait`
  and realm apply ran from the work machine; the workflow file itself is checked by its first run
  after the merge. Its secrets are set. Affected stage of the plan: 3.
- **The node secrets were born on the node.** A local copy for the transfer and for the bus
  environment lies in `~/.config/rt-auth-prod.env`, mode 600. Affected stage of the plan: 1.

## Sessions

### 2026-10-07

- The branch is taken from RT-2582, the card moved to in progress, the grill and the plan written.
- The production stack of Keycloak was raised locally: the realm applied with the substitutions,
  Keycloak took about 670 MB. The first apply refused on the roles of the example client; the
  builder now drops them. The realm builder test: 11 ok.
- The droplet `104.248.159.82` (2 GB, Singapore) got Docker, the account `deploy`, a 2 GB swap and
  a firewall; `auth.message-bus.dev` points to it.
- Keycloak answers at `https://auth.message-bus.dev/realms/rt`: the issuer matches, the cargo
  client gets a token with the five bus roles by the production secret, the stand secret is
  refused. Memory of the node: 1.1 GB used of 2.

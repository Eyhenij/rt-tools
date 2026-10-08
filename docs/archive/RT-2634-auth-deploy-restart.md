# Grill

## The owner request

> вмержил, выкатывай тему на прод

## What the tree already has

- `.github/workflows/deploy-auth.yml` builds the theme JAR, copies it to `providers` on the node and
  calls `docker compose up -d --wait --remove-orphans`.
- `deploy/auth/prod/docker-compose.prod.yml` mounts `providers` into Keycloak as a volume.
- The run of 8 October 2026 on `97c1c1fe5` was green, and the production login page still served the
  bundle with the old chevron pattern `[\s«‹<]`: Keycloak was not recreated and kept the theme it
  loaded at start.

## Questions and answers

No question: the owner ordered the rollout, and the cause is visible in the served bundle.

## Decisions

- **The rollout recreates Keycloak after the stack is up** — `up -d` recreates only a container whose
  settings changed, and a file in a volume is not a setting. Rejected: a checksum of the JAR in the
  compose labels — one more place to keep in step for the same result.
- **The rollout ends with a check that the served theme is the built one** — the health check reads
  the realm and is green with any theme. The check compares the served `main.js` with the built one.

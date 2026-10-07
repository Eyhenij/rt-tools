# Plan

**Task:** RT-2581 · **Branch:** RT-2581-mb-auth-prod
**Behaviour:** unchanged — the owner chose to put Keycloak on its own server and move the bus to it; the edit touches the deploy and the realm file, not the code of the applications

## Task footprint

| What  | Where                                                                  |
| ----- | ---------------------------------------------------------------------- |
| Specs | `docs/specs/auth/`, `docs/specs/message-bus/`                          |
| Laws  | `docs/constitution/delivery.md`, `docs/constitution/verifiability.md`  |
| Rules | `.claude/skills/git-workflow/`, `.claude/skills/browser-verification/` |
| Code  | `deploy/auth/`, `docker-compose.prod.yml`, `.github/workflows/`        |
| Texts | `docs/PROD.md`, `docs/plans/message-bus-auth.md`                       |

## What counts as done

- Keycloak answers in production at `https://auth.message-bus.dev/realms/rt` from its own droplet.
- The realm `rt` there holds the bus clients with production addresses and secrets from the
  environment.
- Keycloak is deployed by its own workflow, and its database is dumped daily.
- The production compose of the bus passes the entry variables, and the guide names the order of
  the bus deploy with the transfer of people.

## Stages

### 1. The server of Keycloak

- **Steps:**
    1. The droplet is created with Docker and the deploy account
    2. The name auth.message-bus.dev points to the droplet
- **Readiness sign:** `ssh auth docker version` answers, and `dig +short auth.message-bus.dev` names
  the droplet address.
- **Verified by:** `ssh auth 'docker compose version'` — the line «Docker Compose version».

### 2. The production composition of Keycloak

- **Steps:**
    1. The realm file takes its production values from the environment
    2. The production composition raises Keycloak, its database and the proxy
    3. The database of Keycloak is dumped daily
- **Readiness sign:** the stand applies the realm file with its defaults as before.
- **Verified by:** `pnpm run check:auth-stand` — the line about a ready stand.

### 3. The deploy of Keycloak

- **Steps:**
    1. The workflow deploys Keycloak to its droplet
    2. Keycloak answers in production
- **Readiness sign:** the issuer in the discovery document is the production address.
- **Verified by:** `curl -s https://auth.message-bus.dev/realms/rt/.well-known/openid-configuration` — the field `issuer` equals `https://auth.message-bus.dev/realms/rt`.

### 4. The bus goes to production Keycloak

- **Steps:**
    1. The production composition of the bus passes the entry variables
    2. The guide names the Keycloak node and the order of the bus deploy
- **Readiness sign:** the production composition passes the check of the compose file.
- **Verified by:** `docker compose -f docker-compose.prod.yml --env-file /dev/null config -q` — exit code zero.

## What this work does not do

- Does not deploy the bus itself: the deploy runs after the epic is merged, by the order in the
  guide, after the export of people.
- Does not create realms of other products: each product keeps its realm file in its own
  repository.
- Does not add organizations from the token, rights from the application or the scrypt hash to
  the packages: a separate epic.

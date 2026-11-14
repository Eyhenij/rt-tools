# The end-to-end suite of the entry module

A person goes through the example admin, Keycloak and the example server: the entry, a wrong
password, the refresh of the token, the exit and the rights on the screen and on the server.

- The scenarios — `docs/specs/auth/example/scenarios.md`, SC-AUTH-47…52.
- Run: `pnpm exec nx run auth-example-e2e:e2e`. The stand is raised by the suite itself: Keycloak by
  `pnpm run serve:auth`, the people of the stand anew, the production builds of the example on
  ports 3410 and 4410.
- The suite does not raise Keycloak a second time when the stand is current
  (`stand/auth-fresh.mjs`). Current means all of these: Keycloak is healthy, mounts the theme
  archive of this tree and started after the archive, the compose file and the realm file were last
  written; the realm import finished after those edits; the counter numbers and the admin port match
  the running stand. Otherwise `pnpm run serve:auth` runs as before. Keycloak reads its theme only at
  start, and that call does not restart it while its compose configuration is unchanged: a stand
  that started before the archive was written keeps the earlier theme until Keycloak restarts.
  Scenarios: `tools/tests/auth-stand-fresh.test.sh`.
- The suite takes no frames and runs the browser of the machine. The first time it is installed by
  `pnpm exec playwright install chromium`.

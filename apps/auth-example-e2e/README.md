# The end-to-end suite of the entry module

A person goes through the example admin, Keycloak and the example server: the entry, a wrong
password, the refresh of the token, the exit and the rights on the screen and on the server.

- The scenarios — `docs/specs/auth/proposed/example-admin/scenarios.md`, SC-AUTH-47…52.
- Run: `pnpm exec nx run auth-example-e2e:e2e`. The stand is raised by the suite itself: Keycloak by
  `pnpm run serve:auth`, the people of the stand anew, the production builds of the example on
  ports 3410 and 4410.
- The suite takes no frames and runs the browser of the machine. The first time it is installed by
  `pnpm exec playwright install chromium`.

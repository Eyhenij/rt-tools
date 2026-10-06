# The example admin of the entry module

An Angular admin that connects `@rt-tools/auth-angular` and the second kit the way an application
does. A person enters through Keycloak and sees the records of the example server. The form of a
new record is shown only to a person with the right to write.

- What the example does and which scenarios check it — `docs/specs/auth/example/spec.md`.
- The server it calls — `apps/auth-example-api`; the dev server proxies `/api` to port 3210.
- Build: `pnpm exec nx build auth-example-admin`, output — `dist/apps/auth-example-admin`.
- Start on one's own machine: `pnpm run serve:auth`, then `pnpm exec nx serve auth-example-admin`
  on port 4210. The realm client `rt-example-admin` returns the person only to that port.

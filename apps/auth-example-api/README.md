# The example server of the entry module

A NestJS server that connects `@rt-tools/auth-server` the way an admin server does. It keeps the
records of the example admin in memory. The list needs the right `example:read`, a new record the
right `example:write`. The end-to-end suite of the module runs a person through it on the stand.

- What the example does and which scenarios check it — `docs/specs/auth/example/spec.md`.
- Build: `pnpm exec nx build auth-example-api`, output — `dist/apps/auth-example-api`.
- Start: `AUTH_ISSUER` and `AUTH_CLIENT_ID` name the realm and the client. Without them the
  server does not start. `PORT` is 3210 when not given.

```bash
AUTH_ISSUER=http://localhost:58080/realms/rt AUTH_CLIENT_ID=rt-example-admin node dist/apps/auth-example-api/main.js
```

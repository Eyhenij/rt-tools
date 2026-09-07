## The run

A section of this tree: there is one end-to-end suite — the intake admin panel, the runner target
`message-bus-admin-e2e`.

```bash
pnpm run serve:stand                       # production builds on 3310 and 4310, its own seeded database
pnpm exec nx e2e message-bus-admin-e2e     # against the raised stand
```

The stand raises the receiver, the admin panel and the database for itself: it takes no working
ports, and the run does not touch the data of the working database. The suite takes the admin
panel address from `E2E_ADMIN_PORT` and the receiver one from `E2E_API_PORT`; the defaults stand
in `apps/message-bus-admin-e2e/stand/stand.mjs`.

There is no site and no rendering server in this tree, so the lines of the pattern about them are
not carried out here.

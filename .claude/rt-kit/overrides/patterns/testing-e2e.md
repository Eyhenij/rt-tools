## The run in this tree

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

The set before a push raises every stand on the names of its working copy. The function
`rt_stand_env` of the tree profile derives the ports and `COMPOSE_PROJECT_NAME` from the path of the
copy, so two copies run at once and neither touches the Keycloak of the other. It overrides what
the session environment holds: settings copied between copies pin one value for all of them.
`RT_STAND_KEEP=1` keeps the environment for one run on a port a foreign process holds. A manual run
takes the defaults, and those stay what the documents name.

There is no site and no rendering server in this tree, so the lines of the pattern about them are
not carried out here.

The receiver counts a client that has no visitor sign yet by its address, read from
`x-forwarded-for`, and takes no more than `CHAT_RATE_LIMIT` requests per minute from it. Each widget test in
`apps/message-bus-admin-e2e/src/chat-widget.spec.ts` sets its own address through
`page.setExtraHTTPHeaders`, and a new widget test does the same.

# The transfer of the bus people to Keycloak — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The export reads the people of production before the deploy.** — `tools/bus-people-transfer.mjs:readProduction` — one read-only query over `ssh message-bus` and `docker compose exec db psql`
- **The rights of a person are the rights of their role with their edits over it.** — `tools/bus-people-transfer.lib.mjs:rightsOf`
- **A disabled account and the service account of the cargo triage do not move.** — `tools/bus-people-transfer.lib.mjs:transferOf`
- **An account without an address in the address book refuses the export whole.** — `tools/bus-people-transfer.lib.mjs:transferOf`
- **The export writes no password.** — `tools/bus-people-transfer.lib.mjs:transferOf` — a record carries the address and the roles only
- **The operator column gets the Keycloak key of the same person.** — `tools/bus-people-transfer.lib.mjs:rekeySql`
- **A person the realm does not know refuses the rewrite whole.** — `tools/bus-people-transfer.lib.mjs:rekeySql`
- **The report of the rewrite counts the rows the database changed.** — `tools/bus-people-transfer.lib.mjs:rekeyReport`

# The entry module — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence.

- **The stand is raised by one command and is ready when the command returns.** — `deploy/auth/compose.yml:healthcheck` — every service declares its health, and the raising script in the root package waits for it and for the realm loader to exit with code 0
- **The realm, its clients and roles are applied from a file in the repository at every start.** — `deploy/auth/compose.yml:IMPORT_CACHE_ENABLED`
- **The stand takes no port another stand on the machine already holds.** — `deploy/auth/compose.yml:ports`
- **The stand sends mail to a local catcher, not out.** — `deploy/auth/realm/rt.json:smtpServer`
- **The example client uses the code flow with PKCE and does not accept a password grant.** — `deploy/auth/realm/rt.json:directAccessGrantsEnabled`
- **The stand is checked by a command that asks it, not by a look at the console.** — `tools/auth-stand-check.mjs:scenario`
- **The stand offers the entry through Google only when the keys of the owner lie in its environment.** — `deploy/auth/compose.yml:RT_GOOGLE_ENABLED`

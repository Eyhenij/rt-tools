## What of the law is not here

**A merge into the main branch rolls nothing out to production.** `.github/workflows/deploy.yml`
has one trigger — `workflow_dispatch` — and the rollout is started by hand. Everything the rule
says about a merge as the start of a rollout does not apply to this tree: a merged edit reaches
production when someone presses the start, and not a minute earlier.

The price for this has already been paid. Production lagged the main branch by 476 commits, four
migrations of the cargo-analysis epic were never applied to it, and the columns the receiver
expected were physically absent from the tables. This read as a broken receiver — because the
rule promised production that travels by itself.

```bash
# what is actually rolled out: the last successful rollout and its commit
GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) command gh run list \
    --workflow=deploy.yml --status=success --limit 1 --json headSha,createdAt
# by how much production lags the main branch
git rev-list --count <sha of the rollout>..origin/main
```

From here comes the boundary of the work queue audit too. It asks the last run of the main
branch, and a run of the main branch says nothing about production: a merge does not move it. The
divergence of 476 commits was exactly what the audit stayed silent about.

The state of production is invisible to a machine in the rest as well: whether production answers
with the build it rolled out nobody asks. This is held by whoever rolled it out.

The completeness of the registry cleanup is counted by nothing: the script keeps the last three
shas, and a miss in its selection shows only when the server's disk has run out.

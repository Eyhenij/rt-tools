## The age of the cache guarantees no space

A section of this tree: the runner lives on the owner's machine, and the cleanup after a run
stands in the pipeline itself.

A threshold by age frees what piled up yesterday, and the space runs out from what piled up today.
In one session the cache grew by twenty-one gigabytes, and a cleanup by day freed ninety-five
megabytes — the next run stopped on a lack of space. So the cache has two limiters, not one:

```bash
docker builder prune --force --filter until=24h        # yesterday's cache belongs to nobody
docker builder prune --force --max-used-space 10GB     # a size limit, regardless of age
```

The limit stands in one place — the step «Убрать за прогоном» in `.github/workflows/ci.yml` — and
is revised there if the builds get heavier.

Someone else's is not cured by this: thirteen gigabytes were held by a volume of an outside
project on the same machine, and a run has no right to remove it. The only thing it can do is
refuse in time and clearly.

## A lack of space is named by the step that can see it

A section of this tree.

Space that ran out brings down not the step that ate it but the one that needed it next: the stand
database goes into an endless restart, and it is the end-to-end suite that turns red — a list of
red screens on a branch that touched not a line of code. On that face the run was restarted twice
and the cause looked for in the edit.

So the stand asks the database by a health probe before the suite itself and, having waited in
vain, refuses with its log and the occupied space:

```bash
db=$(docker compose ps -q db)                                        # the name is assembled from the directory
docker inspect --format '{{.State.Health.Status}}' "$db"             # healthy or nothing
docker logs --tail 20 "$db"                                          # this goes into the refusal
docker system df                                                     # and this
```

The incident analysis is the record «2026-08-19-red-run-blamed-on-a-busy-machine» in the intake.

# The node and the delivery — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

Three rules of the road have two places named. The real one is the config of the proxy, but a name of
a file without an extension the check of the anchors does not recognise at all and counts such a line
an empty binding; named second is the same config by the line it gets into the image of the road by.

- **The intake answers only over a protected connection.** — `deploy/Caddyfile:http`, into the image it is put by `deploy/message-bus-web.Dockerfile:Caddyfile`
- **The certificate is issued and renewed by the proxy itself.** — `docker-compose.prod.yml:message-bus-caddy-data`
- **Outward the node opens only the two ports of the road.** — `docker-compose.prod.yml:ports`
- **The admin application and the intake answer from one name.** — `deploy/Caddyfile:reverse_proxy`, into the image it is put by `deploy/message-bus-web.Dockerfile:Caddyfile`
- **The address of a section of the admin application opens by a direct link.** — `deploy/Caddyfile:try_files`, into the image it is put by `deploy/message-bus-web.Dockerfile:Caddyfile`
- **The node raises a ready image, it does not build it at its own place.** — `docker-compose.prod.yml:image`
- **The image on the node is recognised by the sha of the commit, not by a moving tag.** — `docker-compose.prod.yml:IMAGE_TAG`
- **The migrations are rolled before the intake starts answering.** — `docker-compose.prod.yml:depends_on`
- **The rollout starts by the hand of a person, not by a merge.** — `.github/workflows/deploy.yml:workflow_dispatch`
- **The rollout ends with the probe of liveness, not with the raising of the containers.** — `.github/workflows/deploy.yml:health`
- **After a successful probe the node keeps the three last sha.** — `deploy/prune-images.sh:KEEP`
- **The cleaning picks the images by the name of its own registry, not by the age.** — `deploy/prune-images.sh:REFERENCE`
- **The storage lies on a named volume, not inside a container.** — `docker-compose.prod.yml:volumes`
- **The containers come up by themselves after a restart of the node.** — `docker-compose.prod.yml:restart`
- **The dump is taken and loaded by one command each.** — `deploy/dump.sh:DUMPS`
- **A loaded dump brings back both the digest and the validity of the issued tokens.** — `deploy/dump.sh:compose`
- **The loading of a dump is checked on a one-off database next to it, not on the live one.** — `deploy/dump.sh:probe` — the fingerprint is counted by `fingerprint`, the name of the one-off database is `PROBE_NAME`; scenario SC-MB-95
- **The dump is taken by a schedule once a day, and the schedule is set by the rollout.** — `.github/workflows/deploy.yml:crontab` — the line of the schedule lies in `deploy/dump.crontab`; scenario SC-MB-286
- **The seven last dumps live on the node, and they outlive a rollout.** — `deploy/dump.sh:KEEP_DUMPS` — the protection of the directory of the dumps is held by `.github/workflows/deploy.yml:dumps`; scenario SC-MB-286
- **The address of the intake in the settings of a tree is the name, not the local machine.** — `.claude/rt-kit.json:intake`
- **The build of the intake refuses when there is no client of the storage.** — `apps/message-bus/src/build/storage-client.check.mjs:storageClientFailure`
- **The refusal names both the reason and the fix.** — `apps/message-bus/src/build/storage-client.check.mjs:GENERATE_COMMAND`
- **The check goes before the compilation.** — `apps/message-bus/webpack.config.mjs:failure`
- **The decision lives as a pure function, and the config of the build calls it.** — `apps/message-bus/src/build/storage-client.check.mjs:STORAGE_CLIENT_ENTRY`
- **The pipeline builds the intake, and a refusal of the build fells the run.** — `.github/workflows/ci.yml:affected`

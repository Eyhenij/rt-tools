# Plan — the saved settings of rt-data-table under the kit's key

**Draft:** `docs/specs/ui-kit-v2/proposed/data-table-config-registry-key/`

## Done sign

`rt-data-table` reads and writes its settings under `rt.data-table.config.<key>`, an old record is
copied under it and kept, a reset removes both; scenarios SC-UKV-1109…1112 are green, the former
tests of the service are green, the screen does not change.

## Footprint

- `projects/ui-kit-v2/src/lib/platform/storage-keys.enum.ts` — a new prefix.
- `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.ts` — the key, the
  copy, the reset.
- `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.spec.ts` — tests.
- `docs/specs/ui-kit-v2/table-full-port/` — the agreement merges here; the rule about reading under
  the same key is rewritten.

## Rules of the agreement and their stages

| Rule                             | Stage | Check       |
| -------------------------------- | ----- | ----------- |
| writes under the kit key         | 1     | SC-UKV-1111 |
| an old record is copied and kept | 1     | SC-UKV-1109 |
| the kit key wins                 | 1     | SC-UKV-1110 |
| a reset removes both             | 1     | SC-UKV-1112 |

## Stages

### Stage 1 — the key and the copy

1. The prefix in the registry
2. The service reads, copies, writes and resets by the kit key
3. Tests of the four scenarios, former tests brought to the new key

Readiness: the service spec is green, the kit typecheck is green.

### Stage 2 — closing

1. The agreement merged into `table-full-port`
2. The kit tests, lint and the visual gate
3. The folder taken apart, the PR into the RT-2866 branch

Readiness: the push set is green.

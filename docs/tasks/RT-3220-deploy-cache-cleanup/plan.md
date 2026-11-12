# Plan

**Task:** RT-3220 · **Branch:** RT-3220-deploy-cache-cleanup
**Behaviour:** unchanged — the owner ordered a revision of the package texts and their bindings, «По семьям законов, правки сразу»; application code is not touched

## Points

- **A:** two delivery rules say more than the tree does. The image build of the rollout leaves the
  builder cache on the shared machine. The waiting term for a fresh package version is not written
  in the tree. The commit hook formats every staged file, and the rule `dependencies` has no check.
- **This task reaches:** the image build of the rollout removes the builder cache by the same script
  as the check workflow; the term is written in the install settings; the commit hook formats only
  what the linter reads; the rule `dependencies` has a check in the push set.
- **Sign:** the report of the rules graph lists no rule under «Rules nothing executes»; the
  companions of `deploy-flow` and `dependencies` carry no «carried out in part» on these articles.
  The owner sees it in the PR body.
- **Milestone G of the epic:** a new version of `@rt-tools/agent-kit` on npm carries the revised
  texts of the four families.
- **Metric:** нет: a repair — the companions named bindings the tree did not have.

## Task footprint

| What       | Where                                                         |
| ---------- | ------------------------------------------------------------- |
| Workflows  | `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`    |
| Script     | `deploy/prune-builder.sh` — new                               |
| Install    | `pnpm-workspace.yaml`, `package.json`, `.husky/pre-commit`    |
| Check      | `tools/check-dependencies.mjs` and its test — new             |
| Companions | `.claude/skills/deploy-flow/`, `.claude/skills/dependencies/` |
| Specs      | `docs/specs/agent-kit/`                                       |

## What counts as done

- The image build job of the rollout calls the cleanup script after itself, on failure too.
- The companions of `deploy-flow` and `dependencies` no longer say «carried out in part» or «Not
  checked» on the three articles of the task.
- `npm run graph:rules` leaves the section «Rules nothing executes» without `dependencies`.

## What the work does not do

- It does not run the rollout workflow: a manual start from a branch is the owner's step.
- It does not reformat the texts the hook no longer touches.

## Stages

### 1. Cleanup after the image build

- **Steps:**
    1. Write the builder cleanup script with the age and the size limits
    2. Call the script from the cleanup step of the check workflow
    3. Call the script from the image build job of the rollout workflow
- **Readiness sign:** both workflows call one script, and the script passes the shell syntax check.
- **Verified by:** `bash -n deploy/prune-builder.sh` — exits 0;
  `grep -c 'prune-builder.sh' .github/workflows/ci.yml .github/workflows/deploy.yml` — prints 1 for
  each file.

### 2. The term and the formatter

- **Steps:**
    1. Write the waiting term into the install settings
    2. Leave the commit hook with the staged-files runner alone and narrow its formatter paths
    3. Write the check of the dependencies rule and its test
    4. Add the check to the push set
- **Readiness sign:** the check exits 0 on the tree and its test passes.
- **Verified by:** `node tools/check-dependencies.mjs` — exits 0;
  `bash tools/tests/check-dependencies.test.sh` — prints no failed case.

### 3. Companions and closing

- **Steps:**
    1. Rewrite the three bindings in the companions of both rules
    2. Rebuild the rules graph and its report
    3. Run the two review rounds and fix what they name
    4. Run the push gate
    5. Take the task folder apart into the archive
- **Readiness sign:** the report lists no rule nothing executes.
- **Verified by:** `npm run graph:rules` — the report section «Rules nothing executes» carries the
  count 0; `npm run check:specs` — exits 0.

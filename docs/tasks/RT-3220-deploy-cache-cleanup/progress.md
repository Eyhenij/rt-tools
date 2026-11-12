# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Companions and closing
- **Done:** stages 1 and 2; the companions are rewritten; two review rounds are run and their findings fixed
- **Next step:** the push gate
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write the builder cleanup script with the age and the size limits
- [x] 1.2 Call the script from the cleanup step of the check workflow
- [x] 1.3 Call the script from the image build job of the rollout workflow
- [x] 2.1 Write the waiting term into the install settings
- [x] 2.2 Leave the commit hook with the staged-files runner alone and narrow its formatter paths
- [x] 2.3 Write the check of the dependencies rule and its test
- [x] 2.4 Add the check to the push set
- [x] 3.1 Rewrite the three bindings in the companions of both rules
- [x] 3.2 Rebuild the rules graph and its report
- [x] 3.3 Run the two review rounds and fix what they name
- [>] 3.4 Run the push gate
- [ ] 3.5 Take the task folder apart into the archive

## Decisions along the way

- **The rule `dependencies` gets a check of its own.** The rules graph counts a rule as executed
  only by a file of code named in its companion, and a setting in the manifest is no such file.
  Affected stage of the plan: 2.
- **The check also stands as a step of the check workflow.** A check that lives in the push set alone
  is not run for a PR opened past the session. Affected stage of the plan: 2.
- **The formatter of staged files takes linted extensions in the whole tree, not under `src` alone.**
  The hook line it replaces formatted every staged file, and the code linter reads `tools/` too.
  Affected stage of the plan: 2.
- **The image selection by sha stays on the node alone.** The rollout build pushes its images straight
  to the registry, so the build machine holds none to select from. Affected stage of the plan: 1.
- **The cleanup script lies in `.github/scripts/`, not in `deploy/`.** The rollout copies `deploy/`
  to the node whole, and the node has no builder. The plan names the former address in its
  footprint and in the sign of stage 1. Affected stage of the plan: 1.
- **The rollout calls the cleanup once, by a task of its own after both image builds.** A step inside
  each build would remove the cache of the second image between the two. Affected stage of the
  plan: 1.
- **The formatter of staged files is bound by directory too.** The first review showed that no lint
  run reads `tools/` outside the linter's own rules, so the decision above about the whole tree is
  withdrawn. Affected stage of the plan: 2.
- **What the review found outside the task is filed as RT-3264 and RT-3265.** The push set leaves
  its images on the machine; the manual formatter command takes texts. Affected stage of the
  plan: 3.
- **The rollout cleanup takes the default builder, not the named one.** The second review read the
  log of the last rollout: the build declares `message-bus-builder` and builds through the default
  builder, and the cache of the named one is empty. Which builder the rollout uses is task RT-3264.
  Affected stage of the plan: 1.
- **The done-sign about the companions is met for `dependencies` and not for `deploy-flow`.** The
  companion of `deploy-flow` says the article is carried out for the build cache alone: the images
  of the rollout and of the push set stay on the machine. The owner is told so in the PR body.
  Affected stage of the plan: 3.
- **Templates and the files the linter skips by name stay with the formatter.** No linter checks
  their formatting; taking them out would leave templates without any form. The choice is the
  executor's and is shown to the owner in the PR body. Affected stage of the plan: 2.
- **Three texts outside the footprint are edited:** the description of production, the tree section
  of the pattern `git-workflow-docker` and a new tree section of the rule `dependencies`. All three
  spoke of what this work changed. The plan names `docs/specs/agent-kit/` in its footprint; the only
  edit there is one scenario about the release journal. Affected stage of the plan: 3.
- **Both review rounds ran on another model than the roles are set to.** The usual one refused by
  its usage limit on the first call. Affected stage of the plan: 3.

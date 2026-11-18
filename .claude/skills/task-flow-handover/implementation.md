# task-flow-handover — what is its own here

The bindings of this tree for the part `task-flow-handover` of the work-conduct rule, next to its `SKILL.md`.
The names of the course of work and the rest of what is its own here are in the companion of
`task-flow`.

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section «How the law applies
here».

- **After opening the PR, the executor tells the owner the number, what it waits for and what comes next.** — **Not checked.** The guards judge files and commands, not the text of the reply to the owner; what is said in the correspondence leaves no trace in the tree
- **A request to merge never comes before the work is checked.** — `.claude/hooks/git-guard-draft-ready.sh:run_verdict` — the turn does not end while a branch with its folder taken apart stands as a draft with a green run on the PR tip
- **The task folder is taken apart by the last commit before the PR opens, not after approval.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_delivery_open_folder` — opening a request is refused while the branch carries `docs/tasks/<branch>`; after the tidying the work conduct guard takes the plan from the branch history — `.claude/hooks/facts-flow.sh:rt_flow_folder_archived`
- **The cheap closing step goes before the costly one, and the run — after the merge.** — **Not checked.** The order of steps inside a branch is invisible to a machine: it reads the commits, not the order in which they were made. It is held by the order of the work closing pattern
- **The agreement merges into the domain spec by one of the last commits of the branch, before the PR opens.** — `tools/check-specs.mjs:ripe` — what is ready to merge is listed by `npm run check:specs`
- **The folder of a closed task is taken apart, not moved whole.** — `tools/check-board.mjs:numberFromTaskDir` — a folder left with a closed task is found by the work queue audit
- **Opening the PR and lifting the draft are refused while the branch carries its task folder.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_delivery_open_folder` — the tier on `gh pr create`, the second line on `gh pr merge`; the task directory is `docs/tasks`, the main branch `main`
- **A branch that removed the folder adds a record to the archive.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_folder_was_in_branch` — the archive directory here is `docs/archive/`
- **The bypass is the line `Task-folder-skip: <reason>` in the PR or in the command itself.** — `.claude/hooks/git-guard-delivery.sh:folder_skip_re`, the PR body — `.claude/rt-kit/defaults/project.sh:rt_report_body_default`
- **A PR that waits for a run opens as a draft, and one that waits for nothing opens ready.** — `.claude/hooks/git-guard-delivery-pipeline.sh:rt_delivery_pull_draft` — reads the bases of the `pull_request` trigger from `.github/workflows/ci.yml`, the file the push gate names, and judges a draft opened on a base the pipeline does not wake for; the technique is the pattern `git-workflow-pr`
- **Closed work is reviewed by the rules in the background, right after the PR, and its findings wait for the owner.** — `projects/agent-kit/src/lib/proposals.ts:readProposals` — what lies in `.claude/rt-kit/proposals/` leaves only by the call `agent-kit propose`. Starting the review role is a move of the executor and leaves no trace in the tree; the technique is the command `/skill-curator`

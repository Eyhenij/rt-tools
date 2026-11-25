# Every state of the tree keeps a lawful move

**Status:** in force · **Revision:** 2026-11-16 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/guards/spec.md`
**Laws:** `work-conduct`, `verifiability`
**Procedures:** none

## Why

The package carries eighty-two shell hooks and two model hooks. Each was written for one case and
knows nothing of its neighbours' refusals. A refusal names a move, and that move may itself be
refused by another hook in the same state: the executor then walks from one refusal to the next and
finds no way out. Nothing in the tree could show that from every state at least one move is allowed.

The subdomain describes every hook by one decision table: the facts of the tree and an action give
«allow», «deny» or «ask the owner». A walk over the states proves that no state is left without an
allowed move, and a conformance pass runs each hook on the facts of its row, so the table cannot
drift from the hooks it describes.

## Terminology

- **A fact** — one thing of the tree a hook judges: the branch kind, a plan on disk, a rule loaded,
  a fresh browser choice. A fact has a closed set of values.
- **An area** — a group of facts judged together by one family of hooks: delivery, the course of
  work, the rules gate, the browser, the turn, storage.
- **A state** — one combination of the values of the facts of one area.
- **An action** — a tool call of a given class: a commit, a push, an edit of application code, the
  end of a turn, a question to the owner.
- **A decision** — «allow», «deny» or «ask»; a hook that adds context only decides «allow».
- **The named move** — the action a refusal tells the executor to take instead.
- **A dead state** — a state in which no action of the area is allowed.
- **An ask-only state** — a state in which the only allowed action is a question to the owner.
- **A chain** — a pair of rows where the named move of one hook's refusal is denied by another hook
  in the same state.
- **A helper** — a file of the hooks directory that hooks into no agent event; it decides nothing.
- **A model hook** — a hook whose decision a model takes by meaning; the table does not walk it.

### What it is called in the interface

Not applicable: the table has no screen. The executor meets its decisions as hook refusals and as
the permission window of the host.

## Rules

- **Every hook of the package has a row in the table or a mark.** A deciding hook has a row per
  decision; a helper and a model hook carry a mark with its kind.
- **A row matches the hook it describes.** The hook run on a fixture of the row's facts gives the
  row's decision; a helper run on the fixtures refuses nothing.
- **A probe runs its hook as the session sees it.** The variables of the pipeline, `CI` and
  `GITHUB_ACTIONS`, do not reach the hook: a hook that passes everything on the pipeline would make
  the sweep there disagree with the table. Today only `CI` is read by a hook; `GITHUB_ACTIONS` is
  dropped with it so that a hook that starts to read it is still judged as the session sees it.
- **No state is dead.** In every state of every area at least one action is allowed.
- **A refusal names a move the table allows in the same state.** A refusal whose named move is
  denied there is a chain, and a chain is a defect, not a description.
- **An ask-only state is named apart.** A question to the owner is a lawful move only while no hook
  denies the question itself; each such state has a case where the question passes.
- **Chains are derived from the table, not written by hand.** Each derived chain is a scenario of
  this subdomain and a case of its test.
- **An edit of any hook selects the test of the table before a push.**
- **The decider answers as the table says.** It takes the hook, the action and the facts, and gives
  the decision, the named move and the refusal text of the matching row. A decider that fails or is
  absent lets the action through.
- **The action of a call is computed in one place.** A hook that judges every edit names no action;
  the decider takes the first class of the call the hook has a row for, or the hook's own action
  when no class fits.
- **A fact has one place that computes it.** The branch, the fresh base, the window, the loaded
  rules and the conversation record are computed by shared functions, not by each hook anew.

## What is out of scope

- Rewiring the hooks to take their decision from the table and removing the files left without code
  of their own — task RT-3355.
- The hooks of a consumer tree outside the package.
- The decisions of model hooks: a model judges by meaning, and a walk has nothing to enumerate.

## Contract

Not applicable: the table is read by a command of the package, not served by a procedure.

### Refusal codes

Not applicable.

## Data

The table and its walk live in the package checks; the inventory below is the state of the hooks on
the day the table was written. The kind here describes the file; the table counts as deciding only
a hook with a decision, and marks a context hook and a git-side hook as helpers.

| Hook | Event | Kind | Facts judged | Actions answered | Decisions |
| --- | --- | --- | --- | --- | --- |
| `ask-judge.md` | PreToolUse AskUserQuestion (agent hook, by its text) | model | question_already_answered, progress_names_next_step, rule_answers_question, question_bypasses_check, option_weakens_check | AskUserQuestion | block (`ok:false`) / allow |
| `browser-device-id.sh` | — | helper | device_id_configured | — | — (one stderr line when unset) |
| `browser-guard-device-id.sh` | Pre+Post mcp__claude-in-chrome__select_browser | guard | device_id_configured, device_id_matches; Post writes browser_selected_fresh | mcp:browser-select | deny (exit 2); Post: state write |
| `browser-guard-no-asking.sh` | PreToolUse AskUserQuestion | guard | device_id_configured, question_picks_browser | AskUserQuestion | deny (exit 2) |
| `browser-guard-no-listing.sh` | PreToolUse mcp__claude-in-chrome__(list_connected_browsers\|switch_browser) | guard | device_id_configured | mcp:browser-list, mcp:browser-switch | deny (exit 2) |
| `browser-guard-no-other-drivers.sh` | PreToolUse mcp__playwright__.*\|mcp__chrome-devtools__.*\|plugin variants\|Bash\|webstorm terminal/tool | guard | device_id_configured, other_driver_used | mcp:playwright, mcp:chrome-devtools, Bash:browser-launch | deny (exit 2) |
| `browser-guard-require-select.sh` | PreToolUse mcp__claude-in-chrome__.* | guard | device_id_configured, browser_selected_fresh | mcp:browser (all but list/switch/select) | deny |
| `commit-msg.sh` | git commit-msg hook (no rt-hook) | guard·git | commit_msg_valid | git:commit | block (commitlint exit code) |
| `conscience-guard.sh` | Stop | guard | conscience_role_off, stop_hook_active, conscience_repeat_found, repeat_dealt_with | Stop | block |
| `constitution-index.sh` | SessionStart startup\|resume\|compact\|clear | guard·ctx | laws_present | SessionStart | context-only |
| `deny-tail.sh` | — | helper | gate_rule_pending (read for the named move) | — | — |
| `dev-server-guard.sh` | PreToolUse Bash\|webstorm terminal/run_configuration/tool | guard | dev_server_launch, stands_raised_by_session, stand_port_taken | Bash:dev-server, mcp:webstorm-run-config | deny (exit 2) |
| `dispatch.sh` | — (dispatcher) | helper | — | — | — (passes the first deny/block on) |
| `docs-guard.sh` | PreToolUse Edit\|Write\|MultiEdit\|NotebookEdit\|Bash\|webstorm | guard | law_edit, doc_pair_present, docs_skip_declared, law_anchor_touched | Edit:law, Edit:law-override, Bash:git-commit | ask / deny |
| `end-conversation-guard.sh` | PreToolUse .*EndConversation.* | guard | end_conversation_tool | EndConversation | deny (always) |
| `epic-over.sh` | — | helper | epic_over | — | — |
| `epic-stop-guard.sh` | PreToolUse Bash\|webstorm | guard | takes_new_work, epic_over | Bash:task-new, Bash:git-branch-create (task-shaped) | ask |
| `exam-guard.sh` | PreToolUse Edit\|Write\|MultiEdit\|create_new_file\|Bash\|webstorm terminal | guard | exam_role_off, path_exam_free, exam_passed, exam_after_pr_passed, exam_skip_declared | Edit:any-non-free, Bash:file-write, Bash:gh-pr-ready | deny |
| `flow-step-guard.sh` | PreToolUse Edit\|Write\|MultiEdit\|Bash | guard | flow_step_measured (engine `task-flow-script.mjs guard`) | Edit:plan/progress, Bash:flow-files | deny |
| `git-guard-delivery-body.sh` | — (tier of delivery) | helper | pr_body_complete | Bash:gh-pr-create | deny (via git-guard-delivery) |
| `git-guard-delivery-conflict.sh` | — (tier of delivery) | helper | takes_new_work, own_pr_conflicting, neighbour_pr_conflicting | Bash:task-new, Bash:task-move-in-progress, Bash:git-branch-create, Bash:gh-pr-create | deny / context (via git-guard-delivery) |
| `git-guard-delivery-draft.sh` | — (tier of delivery) | helper | pr_reviewed, pr_conflicting, task_folder_in_branch | Bash:gh-pr-ready | deny (via git-guard-delivery) |
| `git-guard-delivery-epic.sh` | — (tier of delivery) | helper | task_in_epic, epic_branch_unique_remote, base_has_epic_tip, epic_has_main_tip, pr_base_is_epic, branch_has_epic_tip, epic_folders_left | Bash:git-branch-create, Bash:gh-pr-create | deny (via git-guard-delivery) |
| `git-guard-delivery-folder.sh` | — (tier of delivery) | helper | task_folder_in_branch, archive_gained, draft_spec_merged, folder_skip_declared | Bash:gh-pr-create, Bash:gh-pr-ready, Bash:gh-pr-merge | deny (via git-guard-delivery) |
| `git-guard-delivery-identity.sh` | — (tier of delivery) | helper | pr_author_is_reviewer, token_answers_foreign | Bash:gh-pr-create | deny (via git-guard-delivery) |
| `git-guard-delivery-merge.sh` | — (tier of delivery) | helper | pr_tip_run_green | Bash:gh-pr-merge | deny (via git-guard-delivery) |
| `git-guard-delivery-merged.sh` | — (tier of delivery) | helper | branch_pr_merged | Bash:git-push | deny (via git-guard-delivery) |
| `git-guard-delivery-pipeline.sh` | — (tier of delivery) | helper | pr_draft_base_wakes_pipeline | Bash:gh-pr-create --draft | deny (via git-guard-delivery) |
| `git-guard-delivery-signature.sh` | — (tier of delivery) | helper | worktree_email_declared, commits_signed_declared | Bash:git-commit, Bash:git-push, Bash:git-branch-create | deny (via git-guard-delivery) |
| `git-guard-delivery-task.sh` | — (tier of delivery) | helper | task_exists, task_open, task_on_board, task_assigned, task_numbered, task_column | Bash:git-branch-create, Bash:git-push, Bash:gh-pr-create | deny (via git-guard-delivery) |
| `git-guard-delivery-tree.sh` | — (tier of delivery) | helper | command_in_foreign_tree | — | — |
| `git-guard-delivery.sh` | PreToolUse Bash\|webstorm terminal/tool | guard | branch_is_task_branch, task_exists, task_open, task_on_board, task_assigned, task_column_taken, base_has_main_tip, branch_has_main_tip, pr_title_numbered, pr_author_not_reviewer; the tier facts above | Bash: branch, commit, push, PR create/ready/merge, task:new, task:move | deny / context |
| `git-guard-discard.sh` | PreToolUse Bash\|webstorm | guard | tree_dirty, discard_declared | Bash:git-reset-hard, Bash:git-checkout--, Bash:git-restore, Bash:git-clean-f | deny |
| `git-guard-main.sh` | PreToolUse Bash\|webstorm | guard | branch_is_main | Bash:git-commit | deny |
| `git-guard-no-verify.sh` | PreToolUse Bash\|webstorm | guard | hooks_skipped | Bash:git-commit, Bash:git-push | deny |
| `git-guard-push-ahead.sh` | — (run by hand/agent) | helper | tree_dirty, push_adds_commits, push_node_pinned; writes push_marks_green | — | — (exit codes to its caller) |
| `git-guard-push-marks.sh` | — | helper | push_marks_green, tree_dirty, push_adds_commits | — | — |
| `git-guard-push-ready.sh` | — (sourced by the run ahead) | helper | branch_has_epic_tip, branch_has_main_tip, epic_folders_left | — | — (lines to its caller) |
| `git-guard-push-tests.sh` | PreToolUse Bash\|webstorm\|mcp__terminal__run_in_terminal | guard | push_plain_single, push_from_session_copy, push_adds_commits, push_node_pinned, push_marks_green, tree_dirty | Bash:git-push, mcp:terminal-push | deny |
| `git-guard-tree-assignment.sh` | — (tier of delivery) | helper | copy_assignment_ok, assigned_epic_open | Bash:git-branch-create | deny (via git-guard-delivery) |
| `glossary-load.sh` | SessionStart startup\|resume\|compact\|clear | guard·ctx | glossary_present | SessionStart | context-only |
| `guard-note.sh` | — | helper | — | — | — |
| `handoff-entry-guard.sh` | PreToolUse Edit\|Write\|MultiEdit\|Bash\|webstorm | guard | session_from_handoff, rule_loaded (task-flow, read from the transcript) | Edit:any, Bash:file-write | deny |
| `handoff-write.sh` | PreCompact .* | helper (no decision) | — (writes the handover) | — | — |
| `handover-mark.sh` | PostToolUse Bash | helper (no decision) | — | — | — |
| `hook-input.sh` | — | helper | — | — | — |
| `lint-after-edit.sh` | PostToolUse Edit\|Write\|MultiEdit\|Bash\|create_new_file | guard·ctx | lint_findings | Edit:any, Bash:file-write | context-only |
| `main-run-context.sh` | SessionStart startup\|resume\|compact\|clear | guard·ctx | main_run_state | SessionStart | context-only |
| `metric-marks.sh` | — | helper | — | — | — |
| `metric-send-start.sh` | SessionStart / Stop / SessionEnd | helper (no decision) | — | — | — |
| `observe.sh` | — | helper | — | — | — |
| `override-write-guard.sh` | PreToolUse Write\|Bash\|webstorm | guard | override_exists_nonempty | Write:override, Bash:overwrite (>, tee, cp, mv) | deny |
| `owner-corrections.sh` | UserPromptSubmit | helper (no decision) | — | — | — |
| `pre-push.sh` | git pre-push hook (no rt-hook) | guard·git | push_sends_head_commit, push_node_pinned, push_marks_green, push_adds_commits | git:push | block (exit 1) |
| `profile-check.sh` | — | helper | — | — | — |
| `prose-style-guard.sh` | PreToolUse Edit\|Write\|MultiEdit\|Bash\|webstorm | guard | prose_clean (only .md in the tree, not docs/tasks, not docs/archive) | Edit:md, Bash:md-write | deny |
| `pull-outcomes.sh` | — | helper | — | — | — |
| `push-ahead-call-guard.sh` | PreToolUse Bash (run_in_background) | guard | push_ahead_code_visible | Bash:push-ahead-run | deny |
| `push-set.sh` | — | helper | push_node_pinned, push_marks_green | — | — |
| `push-sign.sh` | — | helper | push_plain_single | — | — |
| `qa-dataid-guard.sh` | PreToolUse Edit\|Write\|MultiEdit\|create_new_file\|Bash\|webstorm | guard | edit_is_app_code, qa_anchors_present | Edit:html, Bash:html-write | deny |
| `rerun-guard.sh` | PreToolUse Bash\|webstorm | guard | run_log_read | Bash:gh-run-rerun, Bash:glab-ci-retry | deny |
| `reuse-first-guard.sh` | PreToolUse Edit\|Write\|MultiEdit\|Bash\|create_new_file\|webstorm | guard | edit_is_app_code, reuse_signal_hit, departure_marker | Edit:ts/html/scss, Bash:code-write | deny |
| `role-calls.sh` | PostToolUse Agent\|Task / UserPromptSubmit / SubagentStop | helper (no decision) | — | — | — |
| `roles.sh` | — | helper | role_off | — | — |
| `rule-article.sh` | — | helper | — | — | — |
| `rule-source-guard.sh` | PreToolUse Edit\|Write\|MultiEdit\|Bash\|create_new_file\|webstorm | guard | path_laid_out, package_source_present, observations_path, rtkit_send_observe_key | Edit:laid-out, Edit:observations, Edit:rt-kit.json | deny |
| `skill-gate-layers.sh` | — | helper | (adds rule_loaded requirements by path/payload) | — | — |
| `skill-gate-rearm.sh` | SessionStart compact\|clear | guard·ctx | — (clears rule_loaded) | SessionStart | context-only |
| `skill-gate.sh` | PreToolUse Edit\|Write\|MultiEdit\|Bash\|create_new_file\|webstorm\|mcp__claude-in-chrome__.*\|mcp__figma__use_figma | guard | rule_loaded | Edit:any, Bash:any, mcp:browser, mcp:figma | deny |
| `skill-loaded.sh` | PostToolUse Skill | helper (no decision) | — (writes rule_loaded) | — | — |
| `sql-guard-parse.sh` | — (tier of sql) | helper | — | — | — |
| `sql-guard-request.sh` | — (tier of sql) | helper | — | — | — |
| `sql-guard-target.sh` | — (tier of sql) | helper | target_is_prod, target_is_scratch, conn_known, prod_read_proven | — | deny (via sql-guard) |
| `sql-guard-write.sh` | — (tier of sql) | helper | sql_is_write, write_destructive, destructive_ok_marker, migration_target_known, addressed_by_pk | — | deny / ask (via sql-guard) |
| `sql-guard.sh` | PreToolUse Bash\|mcp__webstorm__execute_sql_query\|webstorm | guard | sql_is_write, target_is_prod, target_is_scratch, conn_known, write_destructive, destructive_ok_marker, migration_target_known, addressed_by_pk, prod_read_proven | Bash:psql/prisma/pg_*, mcp:sql | deny / ask |
| `task-context-load.sh` | SessionStart startup\|resume\|compact\|clear | guard·ctx | branch_is_task_branch, task_folder_exists, task_folder_archived | SessionStart | context-only |
| `task-flow-context.sh` | — | helper | edit_is_app_code, path_laid_out | — | — |
| `task-flow-draft-guard.sh` | PreToolUse Edit\|Write\|MultiEdit\|Bash\|create_new_file\|webstorm | guard | edit_is_app_code, plan_exists, behaviour_unchanged_declared, agreement_named, agreement_exists | Edit:app-code, Bash:app-code-write | deny |
| `task-flow-guard.sh` | PreToolUse Edit\|Write\|MultiEdit\|Bash\|create_new_file\|webstorm | guard | edit_is_app_code, merge_conflict_only, branch_is_task_branch, task_folder_archived, plan_exists, progress_exists, flow_state_known, flow_state_allows_code, task_folder_committed | Edit:app-code, Edit:laid-out, Bash:app-code-write | deny |
| `tree-assignment-guard.sh` | PreToolUse Bash\|webstorm | guard | takes_new_work, creates_epic, copy_assignment_ok | Bash:task-new, Bash:task-move-in-progress | deny |
| `turn-entry-load.sh` | SessionStart startup\|resume\|compact\|clear | guard·ctx | handover_present | SessionStart | context-only |
| `turn-exit-guard.sh` | Stop | guard | read_only_role, engine_available, flow_scenario_over (engine `verdict`) | Stop | block |
| `turn-exit-role.sh` | — | helper | read_only_role | — | — |
| `script-files.sh` | — | helper | — | — | — |
| `turn-judge.md` | Stop (agent hook, by its text) | model | owner_word_is_stop, stop_hook_active, owner_word_orders_work, question_already_answered, fact_without_output, miss_admitted_no_record, proposal_ordered_not_sent | Stop | block (`ok:false`) / allow |
| `utf8.sh` | — | helper | — | — | — |
| `window-fill-guard.sh` | PostToolUse .* / PreToolUse .* | guard | window_over_warn, window_over_stop, tool_allowed_after_stop | Post: any tool; Pre: any tool except Ask/TodoWrite/Read/SendUserFile, edits of tasks/handoff/scratchpad, git/gh/task:move/check:* | context (Post) / deny (Pre) |
| `write-targets.sh` | — | helper | — | — | — |

The facts split into areas, one per family of hooks. The counts are those of the inventory; a
state is one combination of the facts of one area, so an area of forty-eight facts is walked by its
rows, not state by state. The browser area counts its table, which merged the inventory facts into
three.

- **delivery:** facts 48, states 281474976710656
- **work:** facts 41, states 2199023255552
- **browser:** facts 3, states 12
- **turn:** facts 17, states 131072
- **storage:** facts 9, states 512
- **stand:** facts 3, states 8

## Screens and states

Not applicable: no screen.

## Cross-cutting requirements

### Locales

Not applicable: the command prints English lines for the executor.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable.

## Decisions

- **The walk counts states by area, and looks for the named move in every area.** The product of the
  facts of all the hooks has no end, so states are counted per area. Areas still share facts and
  action names — the rules gate, the exam and a commit stand in several — so a refusal of one area
  is met with the denials of every area, by condition compatibility.
- **The table describes the hooks as they lie on the tip of the epic branch.** The hosting rules of
  a deferred task stay in it until that task removes them.
- **Past the stop threshold of the window, the window fill is asked first.** It refuses every move
  but the closing ones, so a refusal that names the exam or a document edit asks it before the
  others and names the closing move instead. Each such row has a twin for the state over the
  threshold.
- **A chain is written as one item per refusal.** Two rows of one hook and action differ by their
  conditions, so the item lists the rows denying the move, and the test names the fact that parts
  each pair of rows.
- **The hooks take their decision from the table through one decider.** A hook computes its facts
  and asks the decider; no hook file but the decider and the dispatcher holds a refusal path. The
  facts are computed by three helper files, one place per fact. The count of hook files: 83 before, 87 after —
  the decider and the three fact files were added, none was removed: every hook kept its call sign
  and its facts.
- **A refusal no row describes is looked for by the reverse probe.** Every hook that judges the
  named move of a refusal is asked in the facts of that refusal; the mutation sweep proves first
  that each hook answers as its rows. This closed the former Q-1.
- **The two hooks of git are guards with rows.** `pre-push.sh` and `commit-msg.sh` refuse by an exit
  code and name the move in the same text as the other guards. This closed the former Q-2.

## Open questions

None.

## History of changes

- 2026-11-16 — the subdomain was created: the hooks of the package refused one another's named
  moves, and nothing counted such pairs before a session walked into them.
- 2026-11-16 — past the stop threshold the exam and the documents guard named moves the window fill
  refuses; the window fill is now asked first, and its refusals stand in the areas «work» and
  «delivery» too.
- 2026-11-17 — the hooks decide by the table through one decider; the reverse probe and the rows of
  the two hooks of git closed both open questions.

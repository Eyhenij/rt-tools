# Scenarios — the decision table of the package hooks

A promise of the subdomain and the test that closes it. A number is issued once and never reused.

### SC-AK-1562 — every hook of the package is named by the table

Given the hooks directory of the package
When the coverage mode reads the table
Then every deciding hook has rows, every helper and model hook carries its mark, and the count of
deciding hooks equals the count of hooks with rows

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1563 — a row matches the decision of its hook

Given a row with its fixture
When the conform mode runs the hook on that fixture
Then the hook gives the decision of the row, and its refusal text holds the words of the row; a
helper subscribed to an event refuses nothing on a plain command

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1564 — no state of an area is dead

Given the rows of one area
When the walk looks for a state where every action of the area is denied
Then it finds none in the real table, and a sample table with such a state prints `dead 1`

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1565 — a refusal names a move allowed in the same state

Given a refusal row and its named move
When another row of the area denies that move where the refusal fires
Then the walk counts the pair as unnamed: the real table prints `unnamed 0`, a sample table with
such a pair prints `unnamed 1`

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1566 — a state where only the question is allowed is counted apart

Given an area that names its question action
When every other action of a state is denied and no row denies the question
Then the walk prints that state in the `ask-only` count, and a sample table prints `ask-only 1`

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1567 — every derived chain has its scenario

Given the pairs where a refusal names the action another row of the area denies
When the chains mode reads this file
Then every pair stands here by its id in backticks, and in each pair the two conditions do not meet

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1568 — an edit of any hook selects the test of the table

Given a change of one hook of the package
When the suite selection reads the changed paths
Then the test of the table is among the selected files

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1569 — a hook removed by the tree is named, not refused

Given a tree that does not lay out one hook of the package
When the coverage mode reads the table against that tree
Then it prints the hook as skipped by the tree and exits zero

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1570 — a refusal of browser-guard-device-id.sh names a move allowed where it fires

Given the area «browser» and a refusal of browser-guard-device-id.sh; skill-gate.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `browser-guard-device-id.sh:select_other:deny → skill-gate.sh:select_pinned:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1571 — a refusal of browser-guard-no-listing.sh names a move allowed where it fires

Given the area «browser» and a refusal of browser-guard-no-listing.sh; skill-gate.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `browser-guard-no-listing.sh:list_browsers:deny → skill-gate.sh:select_pinned:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1572 — a refusal of browser-guard-no-asking.sh names a move allowed where it fires

Given the area «browser» and a refusal of browser-guard-no-asking.sh; skill-gate.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `browser-guard-no-asking.sh:ask_which_browser:deny → skill-gate.sh:select_pinned:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1573 — a refusal of browser-guard-no-other-drivers.sh names a move allowed where it fires

Given the area «browser» and a refusal of browser-guard-no-other-drivers.sh; skill-gate.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `browser-guard-no-other-drivers.sh:other_driver:deny → skill-gate.sh:select_pinned:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1574 — a refusal of browser-guard-require-select.sh names a move allowed where it fires

Given the area «browser» and a refusal of browser-guard-require-select.sh; skill-gate.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `browser-guard-require-select.sh:browser_call:deny → skill-gate.sh:select_pinned:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1575 — a refusal of git-guard-main.sh names a move allowed where it fires

Given the area «delivery» and a refusal of git-guard-main.sh; skill-gate.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `git-guard-main.sh:commit:deny → skill-gate.sh:branch_create_local:deny` — rule_loaded yes against no
- `git-guard-main.sh:amend_signature:deny → skill-gate.sh:branch_create_local:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1576 — a refusal of git-guard-no-verify.sh names a move allowed where it fires

Given the area «delivery» and a refusal of git-guard-no-verify.sh; git-guard-main.sh, git-guard-delivery.sh, skill-gate.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `git-guard-no-verify.sh:commit_skip_hooks:deny → git-guard-main.sh:commit:deny` — branch_is_main no against yes
- `git-guard-no-verify.sh:commit_skip_hooks:deny → git-guard-delivery.sh:commit:deny` — branch_is_main no against yes
- `git-guard-no-verify.sh:commit_skip_hooks:deny → skill-gate.sh:commit:deny` — rule_loaded yes against no
- `git-guard-no-verify.sh:commit_skip_hooks:deny → skill-gate.sh:branch_create_local:deny` — rule_loaded yes against no
- `git-guard-no-verify.sh:commit_skip_hooks:deny → git-guard-main.sh:amend_signature:deny` — branch_is_main no against yes
- `git-guard-no-verify.sh:commit_skip_hooks:deny → skill-gate.sh:amend_signature:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1577 — a refusal of git-guard-delivery.sh names a move allowed where it fires

Given the area «delivery» and a refusal of git-guard-delivery.sh; git-guard-delivery.sh, tree-assignment-guard.sh, skill-gate.sh, git-guard-main.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `git-guard-delivery.sh:branch_create:deny → git-guard-delivery.sh:task_new:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:branch_create:deny → tree-assignment-guard.sh:task_new:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:branch_create:deny → skill-gate.sh:task_new:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:branch_create_bad_name:deny → git-guard-delivery.sh:branch_create:deny` — epic_has_main_tip yes against no
- `git-guard-delivery.sh:branch_create_bad_name:deny → skill-gate.sh:branch_create:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:branch_create_bad_name:deny → git-guard-delivery.sh:task_new:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:branch_create_bad_name:deny → tree-assignment-guard.sh:task_new:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:branch_create_bad_name:deny → skill-gate.sh:task_new:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:branch_create_stale_base:deny → git-guard-delivery.sh:branch_create:deny` — epic_has_main_tip yes against no
- `git-guard-delivery.sh:branch_create_stale_base:deny → skill-gate.sh:branch_create:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:branch_create_stale_base:deny → git-guard-delivery.sh:task_new:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:branch_create_stale_base:deny → tree-assignment-guard.sh:task_new:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:branch_create_stale_base:deny → skill-gate.sh:task_new:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:commit:deny → git-guard-main.sh:amend_signature:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:commit:deny → skill-gate.sh:amend_signature:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:commit:deny → skill-gate.sh:branch_create_local:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:push:deny → git-guard-main.sh:amend_signature:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:push:deny → skill-gate.sh:amend_signature:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:push:deny → skill-gate.sh:branch_create_local:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:push:deny → git-guard-delivery.sh:task_new:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:push:deny → tree-assignment-guard.sh:task_new:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:push:deny → skill-gate.sh:task_new:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create:deny → git-guard-delivery.sh:task_new:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:pr_create:deny → tree-assignment-guard.sh:task_new:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:pr_create:deny → skill-gate.sh:task_new:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create:deny → git-guard-delivery.sh:task_move:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:pr_create:deny → tree-assignment-guard.sh:task_move:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:pr_create:deny → skill-gate.sh:merge_base:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create:deny → git-guard-main.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create:deny → git-guard-delivery.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create:deny → skill-gate.sh:commit:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create:deny → git-guard-main.sh:amend_signature:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create:deny → skill-gate.sh:amend_signature:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_bad_title:deny → git-guard-delivery.sh:pr_create:deny` — task_in_epic no against yes
- `git-guard-delivery.sh:pr_create_bad_title:deny → skill-gate.sh:pr_create:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_bad_title:deny → git-guard-delivery.sh:task_new:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:pr_create_bad_title:deny → tree-assignment-guard.sh:task_new:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:pr_create_bad_title:deny → skill-gate.sh:task_new:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_bad_title:deny → git-guard-delivery.sh:task_move:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:pr_create_bad_title:deny → tree-assignment-guard.sh:task_move:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:pr_create_bad_title:deny → skill-gate.sh:merge_base:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_bad_title:deny → git-guard-main.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_bad_title:deny → git-guard-delivery.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_bad_title:deny → skill-gate.sh:commit:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_bad_title:deny → git-guard-main.sh:amend_signature:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_bad_title:deny → skill-gate.sh:amend_signature:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_wrong_number:deny → git-guard-delivery.sh:pr_create:deny` — task_in_epic no against yes
- `git-guard-delivery.sh:pr_create_wrong_number:deny → skill-gate.sh:pr_create:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_wrong_number:deny → git-guard-delivery.sh:task_new:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:pr_create_wrong_number:deny → tree-assignment-guard.sh:task_new:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:pr_create_wrong_number:deny → skill-gate.sh:task_new:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_wrong_number:deny → git-guard-delivery.sh:task_move:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:pr_create_wrong_number:deny → tree-assignment-guard.sh:task_move:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:pr_create_wrong_number:deny → skill-gate.sh:merge_base:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_wrong_number:deny → git-guard-main.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_wrong_number:deny → git-guard-delivery.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_wrong_number:deny → skill-gate.sh:commit:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_wrong_number:deny → git-guard-main.sh:amend_signature:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_wrong_number:deny → skill-gate.sh:amend_signature:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_draft:deny → git-guard-delivery.sh:task_new:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:pr_create_draft:deny → tree-assignment-guard.sh:task_new:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:pr_create_draft:deny → skill-gate.sh:task_new:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_draft:deny → git-guard-delivery.sh:task_move:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:pr_create_draft:deny → tree-assignment-guard.sh:task_move:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:pr_create_draft:deny → skill-gate.sh:merge_base:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_draft:deny → git-guard-main.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_draft:deny → git-guard-delivery.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_draft:deny → skill-gate.sh:commit:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_draft:deny → git-guard-main.sh:amend_signature:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_draft:deny → skill-gate.sh:amend_signature:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_wrong_base:deny → git-guard-delivery.sh:pr_create:deny` — branch_has_epic_tip yes against no
- `git-guard-delivery.sh:pr_create_wrong_base:deny → skill-gate.sh:pr_create:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_wrong_base:deny → git-guard-delivery.sh:task_new:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:pr_create_wrong_base:deny → tree-assignment-guard.sh:task_new:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:pr_create_wrong_base:deny → skill-gate.sh:task_new:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_wrong_base:deny → git-guard-delivery.sh:task_move:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:pr_create_wrong_base:deny → tree-assignment-guard.sh:task_move:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:pr_create_wrong_base:deny → skill-gate.sh:merge_base:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_wrong_base:deny → git-guard-main.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_wrong_base:deny → git-guard-delivery.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_wrong_base:deny → skill-gate.sh:commit:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_wrong_base:deny → git-guard-main.sh:amend_signature:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_wrong_base:deny → skill-gate.sh:amend_signature:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_self_review:deny → git-guard-delivery.sh:pr_create:deny` — task_in_epic no against yes
- `git-guard-delivery.sh:pr_create_self_review:deny → skill-gate.sh:pr_create:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_self_review:deny → git-guard-delivery.sh:task_new:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:pr_create_self_review:deny → tree-assignment-guard.sh:task_new:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:pr_create_self_review:deny → skill-gate.sh:task_new:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_self_review:deny → git-guard-delivery.sh:task_move:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:pr_create_self_review:deny → tree-assignment-guard.sh:task_move:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:pr_create_self_review:deny → skill-gate.sh:merge_base:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_self_review:deny → git-guard-main.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_self_review:deny → git-guard-delivery.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_self_review:deny → skill-gate.sh:commit:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_self_review:deny → git-guard-main.sh:amend_signature:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_self_review:deny → skill-gate.sh:amend_signature:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_thin_body:deny → git-guard-delivery.sh:pr_create:deny` — task_in_epic no against yes
- `git-guard-delivery.sh:pr_create_thin_body:deny → skill-gate.sh:pr_create:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_thin_body:deny → git-guard-delivery.sh:task_new:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:pr_create_thin_body:deny → tree-assignment-guard.sh:task_new:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:pr_create_thin_body:deny → skill-gate.sh:task_new:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_thin_body:deny → git-guard-delivery.sh:task_move:deny` — own_pr_conflicting no against yes
- `git-guard-delivery.sh:pr_create_thin_body:deny → tree-assignment-guard.sh:task_move:deny` — copy_assignment ok against dash
- `git-guard-delivery.sh:pr_create_thin_body:deny → skill-gate.sh:merge_base:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_thin_body:deny → git-guard-main.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_thin_body:deny → git-guard-delivery.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_thin_body:deny → skill-gate.sh:commit:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_create_thin_body:deny → git-guard-main.sh:amend_signature:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_create_thin_body:deny → skill-gate.sh:amend_signature:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_ready:deny → skill-gate.sh:set_reviewer:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_ready:deny → skill-gate.sh:merge_base:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_ready:deny → git-guard-main.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_ready:deny → git-guard-delivery.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_ready:deny → skill-gate.sh:commit:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_ready:deny → git-guard-main.sh:amend_signature:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_ready:deny → skill-gate.sh:amend_signature:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_merge:deny → git-guard-main.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_merge:deny → git-guard-delivery.sh:commit:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_merge:deny → skill-gate.sh:commit:deny` — rule_loaded yes against no
- `git-guard-delivery.sh:pr_merge:deny → git-guard-main.sh:amend_signature:deny` — branch_is_main no against yes
- `git-guard-delivery.sh:pr_merge:deny → skill-gate.sh:amend_signature:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1578 — a refusal of dev-server-guard.sh names a move allowed where it fires

Given the area «stand» and a refusal of dev-server-guard.sh; skill-gate.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `dev-server-guard.sh:raise_dev_server:deny → skill-gate.sh:check_stand:deny` — rule_loaded yes against no
- `dev-server-guard.sh:raise_static:deny → skill-gate.sh:check_stand:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1579 — a refusal of sql-guard.sh names a move allowed where it fires

Given the area «storage» and a refusal of sql-guard.sh; sql-guard.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `sql-guard.sh:destructive:deny → sql-guard.sh:write_by_pk:deny` — target local/unknown against prod
- `sql-guard.sh:write_unaddressed:deny → sql-guard.sh:write_by_pk:deny` — target local/unknown against prod
- `sql-guard.sh:db_reset:deny → sql-guard.sh:write_by_pk:deny` — target local/unknown against prod

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1580 — a refusal of turn-exit-guard.sh names a move allowed where it fires

Given the area «turn» and a refusal of turn-exit-guard.sh; window-fill-guard.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `turn-exit-guard.sh:end_turn:deny → window-fill-guard.sh:work_call:deny` — window_over_stop no against yes

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1581 — a refusal of window-fill-guard.sh names a move allowed where it fires

Given the area «turn» and a refusal of window-fill-guard.sh; skill-gate.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `window-fill-guard.sh:work_call:deny → skill-gate.sh:edit_progress:deny` — rule_loaded yes against no
- `window-fill-guard.sh:end_conversation:deny → skill-gate.sh:edit_progress:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1582 — a refusal of task-flow-guard.sh names a move allowed where it fires

Given the area «work» and a refusal of task-flow-guard.sh; skill-gate.sh, handoff-entry-guard.sh, exam-guard.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `task-flow-guard.sh:edit_code:deny → skill-gate.sh:new_task:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_code:deny → handoff-entry-guard.sh:copy_template:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_code:deny → exam-guard.sh:copy_template:deny` — exam passed against failed
- `task-flow-guard.sh:edit_code:deny → skill-gate.sh:copy_template:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_code:deny → skill-gate.sh:commit_folder:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_template:deny → skill-gate.sh:new_task:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_template:deny → handoff-entry-guard.sh:copy_template:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_template:deny → exam-guard.sh:copy_template:deny` — exam passed against failed
- `task-flow-guard.sh:edit_template:deny → skill-gate.sh:copy_template:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_template:deny → skill-gate.sh:commit_folder:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_laid_out:deny → skill-gate.sh:new_task:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_laid_out:deny → handoff-entry-guard.sh:copy_template:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_laid_out:deny → exam-guard.sh:copy_template:deny` — exam passed against failed
- `task-flow-guard.sh:edit_laid_out:deny → skill-gate.sh:copy_template:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_laid_out:deny → skill-gate.sh:commit_folder:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_source:deny → skill-gate.sh:new_task:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_source:deny → handoff-entry-guard.sh:copy_template:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_source:deny → exam-guard.sh:copy_template:deny` — exam passed against failed
- `task-flow-guard.sh:edit_source:deny → skill-gate.sh:copy_template:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_source:deny → skill-gate.sh:commit_folder:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_flow_description:deny → skill-gate.sh:new_task:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_flow_description:deny → handoff-entry-guard.sh:copy_template:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_flow_description:deny → exam-guard.sh:copy_template:deny` — exam passed against failed
- `task-flow-guard.sh:edit_flow_description:deny → skill-gate.sh:copy_template:deny` — rule_loaded yes against no
- `task-flow-guard.sh:edit_flow_description:deny → skill-gate.sh:commit_folder:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1583 — a refusal of task-flow-draft-guard.sh names a move allowed where it fires

Given the area «work» and a refusal of task-flow-draft-guard.sh; handoff-entry-guard.sh, exam-guard.sh, skill-gate.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `task-flow-draft-guard.sh:edit_code:deny → handoff-entry-guard.sh:edit_plan:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_code:deny → exam-guard.sh:edit_plan:deny` — exam passed against failed
- `task-flow-draft-guard.sh:edit_code:deny → skill-gate.sh:edit_plan:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_code:deny → handoff-entry-guard.sh:write_agreement:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_code:deny → exam-guard.sh:write_agreement:deny` — exam passed against failed
- `task-flow-draft-guard.sh:edit_code:deny → skill-gate.sh:write_agreement:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_template:deny → handoff-entry-guard.sh:edit_plan:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_template:deny → exam-guard.sh:edit_plan:deny` — exam passed against failed
- `task-flow-draft-guard.sh:edit_template:deny → skill-gate.sh:edit_plan:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_template:deny → handoff-entry-guard.sh:write_agreement:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_template:deny → exam-guard.sh:write_agreement:deny` — exam passed against failed
- `task-flow-draft-guard.sh:edit_template:deny → skill-gate.sh:write_agreement:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_laid_out:deny → handoff-entry-guard.sh:edit_plan:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_laid_out:deny → exam-guard.sh:edit_plan:deny` — exam passed against failed
- `task-flow-draft-guard.sh:edit_laid_out:deny → skill-gate.sh:edit_plan:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_laid_out:deny → handoff-entry-guard.sh:write_agreement:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_laid_out:deny → exam-guard.sh:write_agreement:deny` — exam passed against failed
- `task-flow-draft-guard.sh:edit_laid_out:deny → skill-gate.sh:write_agreement:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_source:deny → handoff-entry-guard.sh:edit_plan:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_source:deny → exam-guard.sh:edit_plan:deny` — exam passed against failed
- `task-flow-draft-guard.sh:edit_source:deny → skill-gate.sh:edit_plan:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_source:deny → handoff-entry-guard.sh:write_agreement:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_source:deny → exam-guard.sh:write_agreement:deny` — exam passed against failed
- `task-flow-draft-guard.sh:edit_source:deny → skill-gate.sh:write_agreement:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_flow_description:deny → handoff-entry-guard.sh:edit_plan:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_flow_description:deny → exam-guard.sh:edit_plan:deny` — exam passed against failed
- `task-flow-draft-guard.sh:edit_flow_description:deny → skill-gate.sh:edit_plan:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_flow_description:deny → handoff-entry-guard.sh:write_agreement:deny` — rule_loaded yes against no
- `task-flow-draft-guard.sh:edit_flow_description:deny → exam-guard.sh:write_agreement:deny` — exam passed against failed
- `task-flow-draft-guard.sh:edit_flow_description:deny → skill-gate.sh:write_agreement:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1584 — a refusal of flow-step-guard.sh names a move allowed where it fires

Given the area «work» and a refusal of flow-step-guard.sh; handoff-entry-guard.sh, exam-guard.sh, skill-gate.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `flow-step-guard.sh:shell_write_progress:deny → handoff-entry-guard.sh:edit_progress:deny` — rule_loaded yes against no
- `flow-step-guard.sh:shell_write_progress:deny → exam-guard.sh:edit_progress:deny` — exam passed against failed
- `flow-step-guard.sh:shell_write_progress:deny → skill-gate.sh:edit_progress:deny` — rule_loaded yes against no
- `flow-step-guard.sh:edit_flow_description:deny → handoff-entry-guard.sh:edit_plan:deny` — rule_loaded yes against no
- `flow-step-guard.sh:edit_flow_description:deny → exam-guard.sh:edit_plan:deny` — exam passed against failed
- `flow-step-guard.sh:edit_flow_description:deny → skill-gate.sh:edit_plan:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1585 — a refusal of rule-source-guard.sh names a move allowed where it fires

Given the area «work» and a refusal of rule-source-guard.sh; handoff-entry-guard.sh, skill-gate.sh, exam-guard.sh, task-flow-guard.sh, task-flow-draft-guard.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `rule-source-guard.sh:edit_laid_out:deny → handoff-entry-guard.sh:edit_override:deny` — rule_loaded yes against no
- `rule-source-guard.sh:edit_laid_out:deny → skill-gate.sh:edit_override:deny` — rule_loaded yes against no
- `rule-source-guard.sh:edit_laid_out:deny → skill-gate.sh:new_task:deny` — rule_loaded yes against no
- `rule-source-guard.sh:edit_laid_out:deny → handoff-entry-guard.sh:copy_template:deny` — rule_loaded yes against no
- `rule-source-guard.sh:edit_laid_out:deny → exam-guard.sh:copy_template:deny` — exam passed against failed
- `rule-source-guard.sh:edit_laid_out:deny → skill-gate.sh:copy_template:deny` — rule_loaded yes against no
- `rule-source-guard.sh:edit_laid_out:deny → skill-gate.sh:commit_folder:deny` — rule_loaded yes against no
- `rule-source-guard.sh:edit_laid_out:deny → handoff-entry-guard.sh:edit_plan:deny` — rule_loaded yes against no
- `rule-source-guard.sh:edit_laid_out:deny → exam-guard.sh:edit_plan:deny` — exam passed against failed
- `rule-source-guard.sh:edit_laid_out:deny → skill-gate.sh:edit_plan:deny` — rule_loaded yes against no
- `rule-source-guard.sh:edit_laid_out:deny → handoff-entry-guard.sh:write_agreement:deny` — rule_loaded yes against no
- `rule-source-guard.sh:edit_laid_out:deny → exam-guard.sh:write_agreement:deny` — exam passed against failed
- `rule-source-guard.sh:edit_laid_out:deny → skill-gate.sh:write_agreement:deny` — rule_loaded yes against no
- `rule-source-guard.sh:edit_laid_out:deny → task-flow-guard.sh:edit_source:deny` — folder_committed yes against no
- `rule-source-guard.sh:edit_laid_out:deny → task-flow-draft-guard.sh:edit_source:deny` — agreement waived/exists against missing
- `rule-source-guard.sh:edit_laid_out:deny → handoff-entry-guard.sh:edit_source:deny` — rule_loaded yes against no
- `rule-source-guard.sh:edit_laid_out:deny → exam-guard.sh:edit_source:deny` — exam passed against failed
- `rule-source-guard.sh:edit_laid_out:deny → skill-gate.sh:edit_source:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1586 — a refusal of override-write-guard.sh names a move allowed where it fires

Given the area «work» and a refusal of override-write-guard.sh; handoff-entry-guard.sh, skill-gate.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `override-write-guard.sh:write_override:deny → handoff-entry-guard.sh:edit_override:deny` — rule_loaded yes against no
- `override-write-guard.sh:write_override:deny → skill-gate.sh:edit_override:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

### SC-AK-1587 — a refusal of docs-guard.sh names a move allowed where it fires

Given the area «work» and a refusal of docs-guard.sh; handoff-entry-guard.sh, exam-guard.sh, skill-gate.sh deny its named moves elsewhere
When the walk meets the refusal with each denial of its move
Then the two never hold in one state, by the fact named at each chain:

- `docs-guard.sh:commit:deny → handoff-entry-guard.sh:edit_doc:deny` — rule_loaded yes against no
- `docs-guard.sh:commit:deny → exam-guard.sh:edit_doc:deny` — exam passed against failed
- `docs-guard.sh:commit:deny → skill-gate.sh:edit_doc:deny` — rule_loaded yes against no

Covered: `projects/agent-kit/tests/decision-table.test.sh`.

# The binding — the guard of the anchors

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **Any compound tag and any tag with an event binding is asked for an anchor.** — `projects/agent-kit/assets/hooks/qa-dataid-guard.sh:missing`
- **The opt-out is marked on the tag itself, not anywhere in the edit.** — `projects/agent-kit/assets/hooks/qa-dataid-guard.sh:missing`
- **A framework tag produces no document node and is not asked for an anchor.** — `projects/agent-kit/assets/hooks/qa-dataid-guard.sh:missing`
- **Only the new text of the edit is judged.** — `projects/agent-kit/assets/hooks/qa-dataid-guard.sh:added`
- **A comment is cut out before the parse.** — `projects/agent-kit/assets/hooks/qa-dataid-guard.sh:missing`
- **An opening tag is parsed whole, not line by line.** — `projects/agent-kit/assets/hooks/qa-dataid-guard.sh:missing`
- **A write by a shell command is judged the same as an edit by the tool.** — `projects/agent-kit/assets/hooks/qa-dataid-guard.sh:rt_write_targets` — the shared parse names the markup among the write targets; scenario `SC-AK-930`
- **The markup of the application alone is judged.** — `projects/agent-kit/assets/defaults/project.sh:rt_is_app_code`

The names of this tree: the anchor is the attribute `qa-dataid`, the opt-out marker is `qa-skip`, and
the paths where markup is not asked for anchors stand in `.claude/rt-kit/project.sh`.

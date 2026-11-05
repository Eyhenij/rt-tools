# The binding — the git hook before a push

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The git hook runs the gate set of the profile on every push it judges.** — `projects/agent-kit/assets/hooks/pre-push.sh:rt_push_set_run` — the profile is read from the package default and the tree override; scenarios SC-AK-1243, SC-AK-1250
- **The hook and the session guard run the set by one code.** — `projects/agent-kit/assets/hooks/push-set.sh:rt_push_set_run` — `projects/agent-kit/assets/hooks/push-set.sh:rt_push_set_profile` exports the root it is given; scenarios SC-AK-1250, SC-AK-1251, SC-AK-1252
- **A commit the session guard judged green runs no second set.** — `projects/agent-kit/assets/hooks/push-set.sh:rt_push_mark_covers` — the guard and the hook write by `projects/agent-kit/assets/hooks/push-set.sh:rt_push_mark_write`, the path is `projects/agent-kit/assets/hooks/push-set.sh:rt_push_mark_path`; scenarios SC-AK-1244, SC-AK-1254
- **The mark of green is written only for a set that judged the commit.** — `projects/agent-kit/assets/hooks/push-set.sh:rt_push_mark_write` — the count of passed checks and `git status --porcelain --untracked-files=no`; scenarios SC-AK-1252, SC-AK-1253
- **The hook lets through only a push of the tip.** — `projects/agent-kit/assets/hooks/pre-push.sh:foreign` — every ref whose commit is not the tip is named; scenarios SC-AK-1245, SC-AK-1249
- **A push that sends no commit is not judged.** — `projects/agent-kit/assets/hooks/pre-push.sh:sends` — a ref with the zero sha is a deletion and is not counted; scenario SC-AK-1247
- **The pipeline is its own gate.** — `projects/agent-kit/assets/hooks/pre-push.sh:CI` — the first line after the header; scenario SC-AK-1248
- **The hook is a package resource laid out with the other hooks.** — `projects/agent-kit/assets/hooks/pre-push.sh:hooks_dir` — a template without an `rt-hook:` header, like `projects/agent-kit/assets/hooks/commit-msg.sh`, that sources the set code from its own directory; scenarios SC-AK-1246, SC-AK-1255

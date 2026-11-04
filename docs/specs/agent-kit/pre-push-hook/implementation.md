# The binding — the git hook before a push

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The git hook runs the gate set of the profile on every push it judges.** — `projects/agent-kit/assets/hooks/pre-push.sh:rt_push_checks` — the profile is read from the package default and the tree override; scenario SC-AK-1243
- **A commit the session guard judged green runs no second set.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:green_mark` — the guard writes the tip, `projects/agent-kit/assets/hooks/pre-push.sh:mark` reads it; scenario SC-AK-1244
- **The hook lets through only a push of the tip.** — `projects/agent-kit/assets/hooks/pre-push.sh:foreign` — every ref whose commit is not the tip is named; scenario SC-AK-1245
- **A push that sends no commit is not judged.** — `projects/agent-kit/assets/hooks/pre-push.sh:sends` — a ref with the zero sha is a deletion and is not counted
- **The pipeline is its own gate.** — `projects/agent-kit/assets/hooks/pre-push.sh:CI` — the first line after the header
- **The hook is a package resource laid out with the other hooks.** — `projects/agent-kit/assets/hooks/pre-push.sh:hook` — a template without an `rt-hook:` header, like `projects/agent-kit/assets/hooks/commit-msg.sh`; scenario SC-AK-1246

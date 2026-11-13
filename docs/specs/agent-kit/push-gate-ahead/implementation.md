# Binding — the push set against its base, from its marks and ahead

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The push set is counted against the remote branch the head has the fewest commits over.** — `projects/agent-kit/assets/hooks/git-guard-push-marks.sh:rt_push_base`
- **A head that adds no commit to its base is pushed with no check run.** — `projects/agent-kit/assets/hooks/git-guard-push-marks.sh:rt_push_adds_nothing`
- **A check green on the same tree against the same base is not run again.** — `projects/agent-kit/assets/hooks/git-guard-push-marks.sh:rt_push_mark_has`
- **A mark is trusted and written only on a clean working copy.** — `projects/agent-kit/assets/hooks/git-guard-push-marks.sh:rt_push_mark_clean`
- **A mark is not written when the tree changed while the check ran.** — `projects/agent-kit/assets/hooks/git-guard-push-marks.sh:rt_push_mark_put`
- **A tree that runs its heavy steps ahead gets a refusal at once for a heavy step with no mark.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:ahead_cmd`
- **The run ahead runs the whole set, writes a mark for every green check and starts only on a clean copy.** — `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh:key_before`
- **Running ahead is declared by the tree, not by the package.** — `projects/agent-kit/assets/hooks/git-guard-push-marks.sh:rt_push_heavy_ahead`

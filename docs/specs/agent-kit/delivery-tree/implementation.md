# Binding — the tree a command runs in

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The form of a branch name is judged by the profile of the tree the command runs in.** — `projects/agent-kit/assets/hooks/git-guard-delivery-tree.sh:rt_delivery_branch_form_ok`
- **The tree of execution is taken from the command itself.** — `projects/agent-kit/assets/hooks/git-guard-delivery-tree.sh:rt_delivery_exec_dir`
- **Without a move the tree of the session answers.** — `projects/agent-kit/assets/hooks/git-guard-delivery-tree.sh:rt_delivery_branch_form_ok`
- **A tree that declared no profile is not judged by the form at all.** — `projects/agent-kit/assets/hooks/git-guard-delivery-tree.sh:rt_delivery_branch_form_ok`
- **A second working copy is for reading, and a sending call goes from the copy of the session.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:moved_root`

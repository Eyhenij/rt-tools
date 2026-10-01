# Binding — the tree a command runs in

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The form of a branch name is judged by the profile of the tree the command runs in.** — `projects/agent-kit/assets/hooks/git-guard-delivery-tree.sh:rt_delivery_branch_form_ok`
- **The tree of execution is taken from the command itself.** — `projects/agent-kit/assets/hooks/git-guard-delivery-tree.sh:rt_delivery_exec_dir`
- **Without a move the tree of the session answers.** — `projects/agent-kit/assets/hooks/git-guard-delivery-tree.sh:rt_delivery_branch_form_ok`
- **A tree that declared no profile is not judged by the form at all.** — `projects/agent-kit/assets/hooks/git-guard-delivery-tree.sh:rt_delivery_branch_form_ok`
- **A second working copy is for reading, and a sending call goes from the copy of the session.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:moved_root`
- **A second copy is told by the shared `.git` directory, not by the root.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:moved_repo`
- **A sending call in another repository is not judged by the gate of the checks.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:here_repo`
- **The task is asked of the work queue of the repository the command runs in.** — `projects/agent-kit/assets/hooks/git-guard-delivery-tree.sh:rt_delivery_task_state`
- **A second copy of the same repository is asked of the session's profile and queue.** — `projects/agent-kit/assets/hooks/git-guard-delivery-tree.sh:rt_delivery_foreign_root`
- **A request opened in another repository is judged by the branch of that repository.** — `projects/agent-kit/assets/hooks/git-guard-delivery-tree.sh:rt_delivery_current_branch`

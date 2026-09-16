## How a task of an epic closes in this tree

The `Closes #<номер>` line stays in every PR body here, whatever the base. A merge into `main` is
read by the host; a merge into an epic branch or a chain branch is read by this tree's own pipeline
`.github/workflows/close-epic-tasks.yml`: it closes the task with a comment naming the PR and the
branch. The body of such a PR says so by the first sample of the section «PR body sample» — «задача
закрывается конвейером дерева при слиянии в ветку эпика». The hand closes nothing here: a task
still open after such a merge is a red run of that pipeline, and it is read by its output.

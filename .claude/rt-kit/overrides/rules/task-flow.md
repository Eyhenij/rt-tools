## Every task goes through the delivery loop

This section is the tree's own. The package rule leads one task from the request to the merge and
names no review before the push. The owner's word of 19.11.2026 makes the loop of the rule
`task-delivery-loop` the way every task of this tree is led.

- **The rule `task-delivery-loop` is loaded as the first action of work on a task.** It stands on
  top of this rule: the states and the guards stay, the loop adds the live check and the review.
  The gate demands it on an edit of a task folder and on the delivery commands.
- **Every change of the session passes two review rounds before the push.** Each round reads the
  whole diff of the branch against its base, by fresh readers, and its confirmed findings are fixed
  in the same branch. A push and a PR without both rounds are a miss, and a task closed without
  them is reopened.
- **The loop has no exceptions.** A task of texts, a config or a tool setting goes through it like
  one with screens, and so does the task that opens an epic. The rule is loaded before the first
  command of the task, before the epic is declared and before the branch is taken.

## Every task goes through the delivery loop

Whole in `pitfalls-2.md`.

- **The rule `task-delivery-loop` is loaded as the first action of work on a task.** The gate
  demands it on an edit of a task folder or an epic plan and on delivery commands.
- **Every change passes a live check and two review rounds before the push.** Fresh readers take
  the whole diff against the base; confirmed findings are fixed in the same branch.
- **The loop has no exceptions.** Texts, configs, tools and an epic's first task too.

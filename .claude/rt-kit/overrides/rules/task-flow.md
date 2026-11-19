## Every task goes through the delivery loop

The tree's own section, by the owner's word of 19.11.2026: the package rule names no review
before the push, and the rule `task-delivery-loop` adds it on top of the states and guards here.

- **The rule `task-delivery-loop` is loaded as the first action of work on a task.** The gate
  demands it on an edit of a task folder or an epic plan and on the delivery commands.
- **Every change passes a live check and two review rounds before the push.** Fresh readers take
  the whole diff against the base; confirmed findings are fixed in the same branch.
- **The loop has no exceptions.** A task of texts, a config or a tool goes through it like one with
  screens, and so does the task that opens an epic.

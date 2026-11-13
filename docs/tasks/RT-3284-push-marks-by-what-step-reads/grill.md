# Grill

## The owner request

> исправляй это ебаное говно сейчас же

> ты сука запускаешь набор который потом повторит гейт пуша?

Said on 13.11.2026 about the set before a push that runs where it has nothing to judge.

## What the tree already has

- A green mark of a check is keyed by the check line, the tree of the head and the commit of the
  base. Any new file changes the tree, and the marks of every check are lost.
- The order of work puts text commits after the code: the task folder is taken apart by the last
  commit, the plan of an epic and the table of assignments are edited along the way.
- On 13.11.2026 the set ran green on the edit of RT-3282, then three text changes were added, and
  the set ran whole again: 16 minutes, 12 of them the guard scenarios whose code had not changed.

## Decisions

- **A check is keyed by what it reads, when the tree names that** — the package cannot know what a
  step of another tree reads, so the profile names the paths a check does not read. Rejected: a
  fixed list of text paths in the package.
- **The base stays in the key** — a step chosen by what the branch touched answers for that base
  alone. A merge of the base therefore still runs the builder steps.

## What is left unclear

- Whether a merge of the base that touches no path of a step may keep its mark: not asked, the
  builder decides what is affected by the base itself.

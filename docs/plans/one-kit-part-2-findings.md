# The findings of the review of the closed works of the epic RT-2353

The findings accumulate here while the epic "One kit, part 2" goes: the owner reads them at once when
the epic is over and says what of them is right. What they name is made into a proposal and leaves
for the package; outward without that word goes only the digest of the observations. Every next task
of the epic appends its findings here too, as a section.

The file lies next to the plan of the epic — `docs/plans/one-kit-part-2.md` — and not inside it.

## RT-2397 and RT-1881 — the review of 29 September 2026

The role of the review of a closed task, one branch with two tasks: the cropper, and the uploader
the owner put into the same branch.

`rt-tools-storybook` already held the right article about the width of one showing, and it was not
read as covering `Playground`. `ui-component-tests` says a state is checked by a frame or a
measurement, and it never says that a node's presence proves nothing. The other loaded rules took
no part in a miss.

### 1 · A `play` step that asserts presence

Address: the tree, `.claude/skills/ui-component-tests/SKILL.md`, after «A state's sign is checked
by…».

> A `play` step that asserts a node exists proves nothing about what is seen. A 2x2 box exists as
> surely as a 400x300 one. A component that draws a surface asserts its size against a lower bound,
> not its presence.

### 2 · `Playground` is a showing of one instance

Address: the tree, `.claude/skills/rt-tools-storybook/SKILL.md`, the end of the article «A showing
of one instance asks the pair for the width of its half».

> `Playground` is such a showing. A host with `width: 100%` in a flex item sized by its content
> comes out zero wide without `fill`.

### 3 · Where the owner's stop word is written

Address: the package, the refusal tail of the turn exit guard and the rule `turn-conduct`.

> The owner said to stop — then quote their word in progress:
> `- **Waiting for the owner:** «<their words>»`. The guard releases on that line and on nothing
> else.

### 4 · A stop on a later step is written at once

Address: the package, rule `task-flow`, next to «What needs the owner's word is taken from a list…».

> A stop the owner sets on a later step is written down the moment it is said. «I'll look before
> the PR» is quoted in the waiting line: it holds the delivery step and releases the exit guard.

### 5 · Image suites from a second working tree

Address: the tree, `.claude/rt-kit/overrides/rules/testing.md`, a pitfall.

> The image-based suites do not run from a working tree under the system temporary directory. The
> docker machine does not mount it, and the run ends with «браузер образа не ответил за 600
> секунд». A second working tree for them lives under the home directory.

### Not a rule matter

- The input table check does not recognise `model()`; it needs a code fix.
- The end-to-end frame of the access panel was red on the main branch and was fixed in the branch
  itself.

## RT-2349 — the review of 29 September 2026

The table card that opens a record on a narrow screen. `rt-tools-storybook` and
`rt-tools-styling` were loaded; neither named the trap below.

### 1 · A state class misses a node drawn after the resize

Address: the tree, `.claude/skills/rt-tools-storybook/SKILL.md`, next to the article about the
three kinds of threshold.

> The showcase hands out interaction states once, when the story renders. The narrow frame resizes
> the window after that, and a node the breakpoints service draws only then gets no state class. A
> state of such a node is shown by a wrapper that answers "narrow" from the first render.

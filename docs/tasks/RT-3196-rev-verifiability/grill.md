# Grill

Work of epic RT-3190, task RT-3196. No cargo records.

## The owner request

> заведи новый эпик на актуализацию обвязки agent kit и разбей на задачи. нужно сделать ревизию
> всей документации, правил и скилов в agent kit. так же нужно начать с построения графа graphify
> для каждого из проектов в этом репозитории, если это будет необходимо - построить некое подобие
> графа для понятий и правил в agent kit

## What the tree already has

- The family of the law `verifiability` in the package: the law, two rules — `testing` and
  `browser-verification` — four patterns: `testing-unit`, `testing-e2e`,
  `browser-verification-stand`, `browser-verification-measure`, and the cold file of `testing`.
  `browser-verification` has no cold file: its pitfalls stand inline.
- The rules graph report names 26 articles of the family held by memory: testing 14 of 42,
  browser-verification 12 of 23. One pair of repeats names a text of the family.
- The role `rules-reviewer` has read the family on the tip of RT-3195: 18 divergences, 9 gaps,
  16 near repeats.

## What the rules already say

- The owner decided for the whole epic: «По семьям законов, правки сразу».
- A law is not edited in a branch: its article goes to the owner as text.
- A hook and check behaviour changes only for a divergence between a rule statement and its
  executor, with a scenario of its own.

## Questions and answers

**How is the revision split and when are findings fixed?**
«По семьям законов, правки сразу»

## Decisions

- **The role over the whole family plus a binding comparison by a second agent.** The lesson of
  RT-3193 and RT-3194.
- **A gap of the law closes by a rule article only where something holds it.** Otherwise it goes
  to "What of the law is not here". The lesson of RT-3195.
- **A finding that looks like a code defect is read in the code before a task is filed.** The
  lesson of RT-3195.

## What is left unclear

- Findings where the rule and the law disagree and the law may be the side to change (D1–D3): they
  go to the owner as a question in the task.

# Grill

Work of epic RT-3190, task RT-3195. No cargo records.

## The owner request

> заведи новый эпик на актуализацию обвязки agent kit и разбей на задачи. нужно сделать ревизию
> всей документации, правил и скилов в agent kit. так же нужно начать с построения графа graphify
> для каждого из проектов в этом репозитории, если это будет необходимо - построить некое подобие
> графа для понятий и правил в agent kit

## What the tree already has

- The family of the law `project-documentation` in the package: the law, two rules — `doc-style`
  and `spec-driven` — and six patterns: `doc-style-write`, `doc-style-sweep`, `doc-style-trace`,
  `spec-driven-rule`, `spec-driven-domain`, `spec-driven-sweep`.
- The rules graph report names 13 articles of the family that the companion marks «Not checked» or
  «Not carried out»: doc-style 7 of 21, spec-driven 6 of 31. Five pairs of repeats in the package
  name a text of the family.
- The lessons of RT-3193 and RT-3194: the role reads only package texts; the binding comparison
  finds stale marks and false bindings, a line naming a hook that does not carry the article out.

## What the rules already say

- The owner decided for the whole epic: «По семьям законов, правки сразу».
- A hook and check behaviour changes only for a divergence between a rule statement and its
  executor, with a scenario of its own.

## Questions and answers

**How is the revision split and when are findings fixed?**
«По семьям законов, правки сразу»

## Decisions

- **The role over the whole family plus a binding comparison by a second agent.** The lesson of
  RT-3193 and RT-3194.
- **A binding is checked by the code it names, not by the file name.** The lesson of RT-3194.

## What is left unclear

- Which findings touch law articles: they go to the owner as a question in the task.

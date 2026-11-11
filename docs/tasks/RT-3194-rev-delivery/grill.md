# Grill

Work of epic RT-3190, task RT-3194. No cargo records.

## The owner request

> заведи новый эпик на актуализацию обвязки agent kit и разбей на задачи. нужно сделать ревизию
> всей документации, правил и скилов в agent kit. так же нужно начать с построения графа graphify
> для каждого из проектов в этом репозитории, если это будет необходимо - построить некое подобие
> графа для понятий и правил в agent kit

## What the tree already has

- The family of the law `delivery` in the package: the law, four rules — `git-workflow` in three host
  variants, `deploy-flow` in three host variants, `dependencies`, `queue-audit` — seventeen
  patterns and three pitfall files.
- The rules graph report names 43 articles of the family that the companion marks «Not checked» or
  «Not carried out»: git-workflow 27, deploy-flow 13, dependencies 2, queue-audit 1.
- Two pairs of repeats with the work-conduct family were left to this task by RT-3193: «The task is
  created by a command» and «Opening a PR is refused while the branch carries its task folder».
- The lesson of RT-3193: the role reads only package texts, and a third of the findings came from
  comparing rule articles with the companion bindings and the hook code.

## What the rules already say

- The owner decided for the whole epic: «По семьям законов, правки сразу».
- A law article goes to the owner as text; hook and check behaviour changes only for a divergence
  between a rule statement and its executor, with a scenario of its own.

## Questions and answers

**How is the revision split and when are findings fixed?**
«По семьям законов, правки сразу»

## Decisions

- **The role over the whole family plus a binding comparison by a second agent.** The lesson of
  RT-3193. Rejected: the role alone — it does not read the companions.
- **All host variants are read.** A tree lays out one, and the others diverge silently.

## What is left unclear

- Which findings touch law articles: they go to the owner as text and do not block the branch.

# Grill

## The owner request

> заведи новый эпик на актуализацию обвязки agent kit и разбей на задачи. нужно сделать ревизию всей
> документации, правил и скилов в agent kit. так же нужно начать с построения графа graphify для
> каждого из проектов в этом репозитории, если это будет необходимо - построить некое подобие графа
> для понятий и правил в agent kit

The whole request and the epic answers lie in `docs/plans/agent-kit-revision.md`.

## What the tree already has

Measured on 11.11.2026.

- The graph of `projects/agent-kit` built by graphify holds 1 674 nodes from 157 texts of the
  package: headings only, joined to their file by `contains`. Not one link runs between two texts:
  graphify reads no front matter and no mention of a resource name.
- The package resources: 16 laws, 33 rules, 58 patterns, 10 pitfalls files, 11 skills, 13 roles,
  4 commands, 2 pipelines, 93 hooks, 54 checks.
- A rule names its law by `law:` in the front matter, a pattern its rule by `rule:`. The package
  check of integrity reads both and reports a name nothing answers to.
- Only 2 of 33 rules name what executes them by a `**Requires:**` line. The executors of the
  articles stand in the companions of this tree: 33 files, 323 lines «article — `file:symbol`»
  pointing at a hook or a check.
- The glossary of the package holds 65 words, each as a line `- **Word** — meaning`.

## Questions and answers

**When is the graph of concepts and rules built?** Options: before the revision (recommended) ·
after the first family · not at all.
«Перед ревизией».

## Decisions

- **A builder of its own, not graphify.** The measurement above: graphify gives no link between two
  texts, and every link the task names lives in a header, a binding or a name in backticks.
- **The graph keeps the graphify shape.** Nodes and links in the same fields, so `graphify explain`
  and `graphify affected` read it with `--graph`, the same as the code graphs.
- **The builder is this tree's own tool, not a package resource.** It reads the package sources and
  the companions of this tree; a tree that installs the package has neither.
- **The graph and its report lie in history next to the package.** The epic milestone compares the
  report before the revision and after it.
- **Questions on scope, sign and sample are closed by assumption.** The owner took the recommended
  answer twice running in the epic grill; the task body names what is done and what shows it.

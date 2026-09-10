# Grill

## The owner request

> бери все жалобы и предложения из приёмника, верифицируй их по соотвтевию общему направлению
> развития пакетов, заведи эпик и под задачи и бери в работу

Row 11 of the epic plan `docs/plans/cargo-intake.md`. The work was created along the way: the cargo
record split in two, and the second half changes the whole way the name is derived.

## The cargo record taken here

`ce256fc33ace01e7578b0b7c3ad3d808a7c2804b57fd8d8781f239f9627b316a` — its first half. The second
half, the refusal on an empty walk, was done by `RT-2034` and is already merged.

The complaint: the lib layout audit derives the name of a lib, its tag and its import alias by a
formula over the path instead of reading what the tree declared in `project.json` and
`tsconfig.base.json`. A tree that named a lib otherwise gets a divergence on flat ground, and the
only way to silence it is the exceptions list.

## What the tree already has

- `projects/agent-kit/assets/checks/lib-common.mjs:104-106` — `projectName`, `projectTag` and
  `importAlias`, all three derived from the path.
- `projects/agent-kit/assets/checks/lib-manifests.mjs` — the only consumer that judges by them:
  the project name against the path, the single tag against the path, and the alias in
  `tsconfig.base.json` against the path.
- `projects/agent-kit/assets/checks/lib-boundaries.mjs:32` — takes the tag by the same formula and
  looks for it in the linter boundary settings.
- The spec of this family is `docs/specs/agent-kit/layout/`, where two articles of the same kind
  already stand: the package knows neither the layout of a foreign tree nor its words. The names
  are the third such thing.
- The probes are `projects/agent-kit/tests/checks-lib-layers.test.sh`.

## What the rules already say

- **The rule of lib layers keeps the names in the companion, not in the rule.** The rule travels
  between trees, and a path named in it lies in the first tree that keeps its code differently. The
  same reason applies to a name derived by a formula.
- **A value declared by one side is not recomputed by the other.** The rule of code structure says
  it outright: two computations of one value diverge silently. Here the tree declares the name in
  the manifest, and the check computes its own copy.

## Decisions

- **The declared name wins, and the formula stays where nothing is declared** — that is the
  record's own wording, and it keeps the check useful for a lib that declared nothing: the formula
  then says what the name must become. Rejected: dropping the formula altogether — a lib without a
  name in the manifest would then get no verdict at all.
- **The alias is found by what it points at, not by its spelling** — a lib is reachable by an alias
  or it is not, and that half of the check is worth keeping; how the tree spells the alias is its
  own business. Rejected: judging the alias spelling against the formula — that is the very
  divergence on flat ground the record is about.
- **The tag is judged against the declared name, not against the path.** One tag per lib stays
  mandatory: that requirement is about the linter boundaries and not about naming.

## What is left unclear

- Whether a tree exists that declares a name and no tag at all. It does not block the work: a
  missing tag is reported as before, and the expected value is now derived from the declared name.

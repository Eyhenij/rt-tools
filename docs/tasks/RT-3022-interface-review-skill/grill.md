# Grill

## The owner request

> добавь себе в скилы и так же добавь в agent kit; # Review the interface as one system
>
> A strong interface is not five independent audits stapled together. […]

The full text of the skill came in the same message. It is carried into the package resources
without retelling; only the split into files and the links between them are this work's own.

## What the tree already has

- The package skills live in `projects/agent-kit/assets/skills/` and are laid out as
  `<name>/SKILL.md`. A skill has no law above it and declares none.
- A resource that a tree does not need without a trait carries the suffix `needs-<trait>`. The
  package declares the traits `app` (screens people use) and `mockups` (frames in a design tool);
  this tree has both.
- The text limit of the rules layer is 330 lines and 24,000 characters per file
  (`tools/rt-kit-checks.config.mjs`).
- Nothing in the package or in the owner's personal skills reviews an interface as a whole.

## What the rules already say

- `write-a-skill`: the preamble is `name` and `description`, the first section is "When to use",
  a file stops being read in full past about a hundred lines, a link deeper than one level is not
  followed.
- `agent-kit-source`: an edit of a package resource reaches a tree only through a build and a
  layout — `pnpm run agent-kit:sync`.
- The package boundary: the package carries only what a consumer carries out. A tree with screens
  carries out an interface review; a tree with frames carries out the annotation of a frame.

## Questions and answers

None were asked: the request names both places and gives the whole text.

## Decisions

- **The text goes into seven package skills, not one.** The owner's text is about three times the
  limit of one file. Rejected: one skill with the limit raised — the limit holds every other text
  of the layer.
- **The core skill keeps the run order and the report form, the rest are its references.** The
  agent loads the core first, and the core names which neighbour to read for which domain.
- **Six skills need the trait `app`, the frame annotation needs `mockups`.** A tree without screens
  has nothing to review, a tree without frames has nothing to annotate.
- **The personal copy repeats the same seven skills.** The owner asked for the skill in both places;
  one text in two shapes would diverge on the first edit.

## What is left unclear

- Whether the owner wants the package released right after the merge. Releasing is the owner's
  separate decision, and this work does not start it.

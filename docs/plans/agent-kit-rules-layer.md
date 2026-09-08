# The rules layer in `@rt-tools/agent-kit`

The package carries the laws and two empty samples. Everything that makes a law act — a rule, a
pattern, a hook, a role, a workflow — every repository writes anew and silently diverges from the
neighbouring one. The plan moves this layer into the package.

## What there already is

- Fifteen laws in `assets/laws/`, the samples of a rule and of a pattern.
- The layout with the header `rt-kit v… · <resource> · <sum>`: an edit by hand and a lag the package
  tells apart, and it does not encroach on the first.
- The overrides of the project by a merging over the `## ` sections, the substitution of the
  `{{holes}}`, the choice through `only` / `skip`, the commands `init`, `sync`, `sync --check`,
  `doctor`, `list`.

## Decisions

- **A rule travels whole if it is about a technique, not about a subject area.** A technique moves
  between repositories, the device of a booking or of a price list does not.
- **The names of this tree live not in the rule but in a companion file next to it.** The rule says
  what must be true and by which technique that is done; what it is called here and where it lies is
  in `implementation.md` next to it. The package neither reconciles nor moves the companion.
- **The draft of the companion is laid by `sync` once.** A skeleton with empty tables appears at the
  first layout of the rule and is not touched any more. `sync --check` refuses if the companion is
  gone or stayed an unfilled skeleton.
- **The patterns travel — all that the carried rules have — but on nameless examples.** `libs/<domain>`,
  `<Feature>Component`, `<app>` instead of the names of a specific tree: the technique is visible, and
  the code in a foreign repository does not pass itself off as working.
- **The package carries executors, not only a text.** The hooks of the gate of the skills, the guard
  hooks of the delivery, the roles and the slash commands at them, the workflows and the preset of the
  map of the hooks.

## The kinds of the resources

| Kind        | Where it lands                   | What it is                               |
| ----------- | -------------------------------- | ---------------------------------------- |
| `laws`      | `docs/constitution/`             | what must be true                        |
| `rules`     | `.claude/skills/<name>/SKILL.md` | by which technique that is done          |
| `patterns`  | `.claude/skills/<name>/SKILL.md` | the ready-made code of a technique       |
| `hooks`     | `.claude/hooks/`                 | what does not let it be broken           |
| `agents`    | `.claude/agents/`                | the roles                                |
| `commands`  | `.claude/commands/`              | the slash commands at the roles          |
| `workflows` | `.claude/workflows/`             | the multi-step runs                      |
| `checks`    | `tools/`                         | the checks the gate calls                |
| `templates` | `.claude/rt-kit/templates/`      | the forms of a rule and of a pattern     |
| `skills`    | `.claude/skills/<name>/SKILL.md` | a skill without a law above it           |
| `defaults`  | `.claude/rt-kit/defaults/`       | the gate map and the profile of the tree |

A rule and a pattern land the same way — both are skills; they are told apart by `kind` in the
introduction of the file. In the same place lands `skills` too — a skill above which there is no law
at all: the showcase, a generator, the creation of the skill itself.

## What is moved

Twenty-five rules and thirty-eight patterns at them. The rules about a technique —
`typescript-conventions`, `git-workflow`, `lib-layers`, `doc-style`, `spec-driven`, `reuse-first`,
`testing`, `browser-verification`, `component-structure`, `styling-bem`, `angular-patterns`,
`api-layer`, `platform-access`, `shared-code`, `translations`, `seo`, `permissions`, `task-flow`,
`dependencies`.

The rules of a subject area were at first decided not to be carried, but they arrived as a second
layer: the lists, the navigation, the edit of a record, the models of the entities and the access are
lawful for an application that has these subjects, and a tree without them refuses the law by one line.

By the task RT-431 this choice was reconsidered twice. The count of the price and the owning entity
left the set: their laws named the subjects of one application by name and in a foreign tree are
unexecutable whole. The other nine were recognised as a technique and stayed. And the difference is
no longer held by the one layer of the laws: a refusal of a law removes its rules and patterns itself
— the link for that already lay in the introduction of the resources, and it was a silent layout that
made the tree list the descendants by hand.

## The order

1. **Done.** The kinds `rules`, `patterns`, `commands`, `workflows` in the catalogue and the layout; a
   rule and a pattern land in a directory by their name, the header stands after the introduction of
   the skill.
2. **Done.** The draft of the companion: it is laid once, in `--check` — a requirement to fill it;
   three states — gone, a draft, filled.
3. **Done.** Seventeen rules and twenty-seven patterns — all that the carried rules had.
4. **Done.** Nineteen hooks: the gate of the rules with its four, the guard hooks of the delivery, of
   the queries to the storage, of the development server, of the anchors for the specs, of the
   reinvention of the ready-made and of the pinned profile of the browser. Everything the package
   cannot know is taken out to the project: the gate map, the profile of the project and the
   identifier of the profile of the browser — the forms of the first two lie in the samples, the paths
   are substituted by the holes `{{gateMap}}` and `{{projectProfile}}`.
5. **Done.** The README of the package describes three layers, the companion, the hooks, the files of
   the project and what is truly not in the package.

6. **Done.** Six roles, a slash command to the review of a closed task and two pipelines — `plan` and
   `feature`. A role asks the owner no questions, so the grill stayed with the main agent, and the
   roles stand on both sides of it.
7. **Done.** Eleven checks the gate of the push calls and the rules refer to. The paths and the
   identifiers are read from `.claude/rt-kit/checks.json`, not sewn into the code; those whose course
   depends on the hosting lie as kinds.
8. **Done.** The gate map and the profile of the tree arrive by a default — the kind `defaults`. The
   override of the project stayed, became optional and has the right to call the default back.

9. **Done.** The defects of the first clean installation — the task RT-322. The sets of the scenarios
   on the executable resources, a refusal of the layout instead of silence at a gap of a kind and at an
   outdated build, the map of the hooks as a ready-made piece with a check of the insertion, the
   command of the acceptance of a foreign file, the merging of the settings by nested keys, the roots
   of the checks from the setting, the cleaning of the addressing out of the texts. The product
   agreement — `docs/specs/agent-kit/`.

10. **Done, apart from the live run — the task RT-396.** The feedback from the bottom up: the guards
    write the observations into the tree, the digest counts them and names what is laid out but never
    once loaded, the review of a closed task unloads the proposals as a file with an address, and the
    sending takes those addressed to the package away by a record into its work queue — with a digest
    and with a check against the address of the tree. By the same session the delivery got a
    requirement to merge the main branch before the opening of a PR: an article, the first item of the
    checklist and a guard. The product agreement is merged into `docs/specs/agent-kit/` by the task
    RT-402 — the rules and the scenarios `SC-AK-70` … `SC-AK-84`.

## What is left

- A live run of the cycle whole: the release of a version, two or three days of the work of the trees,
  a digest, a proposal, a bringing together and an edit of the package. Inside a branch it is
  unreachable — the trees install the package from the registry. Whether to create a task for it or to
  count it closed by a release is a decision of the owner.
- The instruments of the creation of a task and of the audit of the queue for the second and the third
  hosting: the rule of the delivery travels in three kinds, the commands at it in one. The layout is no
  longer silent about that, but the instruments themselves do not exist.
- The sending and the bringing together for the second and the third hosting — for the same reason and
  next to them.
- A generator of the drafts of the rules by a law.

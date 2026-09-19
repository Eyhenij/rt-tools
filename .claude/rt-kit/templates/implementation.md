<!-- rt-kit v0.29.0 · templates/implementation.md · 5539a41f6a7f · правится надстройкой, не здесь -->
# <имя-правила> — what is this tree's own

Names and bindings of this tree under the rule `SKILL.md` next to it.

The rule speaks by technique and names the paths shared by the workshop's trees — there is no
need to rewrite them here. Only what the package cannot know goes here: what things are called in
this very repository, and in which of its files each article of the rule is carried out.

While `<!-- заполняет проект -->` stands in the file, the rule counts as not deployed:
`agent-kit sync --check` refuses, and the agent reads an instruction that has no addressee here.

## What it is called here

Only what differs from the rule: the task key, the board address, the component prefix, the name
of the owning entity, the storage currency, the set of commit scopes. A line that merely repeats
the rule is not carried here — it would go stale separately from it.

| In the rule      | Here                                              |
| ---------------- | ------------------------------------------------- |
| <rule notion>    | <name in this code> <!-- заполняет проект --> |

## Where it lives

| What        | Where                                      |
| ----------- | ------------------------------------------ |
| <mechanism> | `<path>` <!-- заполняет проект --> |

## Где исполняются статьи

The first column is the article verbatim, as written in the section "How the law applies here"
(the bold part of the item). An article without a line and a line without an article is a
discrepancy: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

| Article            | Where it is carried out                             |
| ------------------ | --------------------------------------------------- |
| <статья дословно> | `<путь>:<символ>` <!-- заполняет проект --> |

## What else is worth knowing when reading the code

- <What is visible only from inside this tree: why the technique looks exactly so here.>

## What checks it

- <The command that catches a violation — and what exactly it catches.>

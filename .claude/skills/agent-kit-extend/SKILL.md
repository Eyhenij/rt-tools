---
name: agent-kit-extend
description: Ready-made examples of how a tree adds its own on top of the rules package. Load when the package text says something that is not true here, the gate demands the wrong rule or a guard judges by the wrong paths. Layout and settings — skill agent-kit; the shape of a new skill — write-a-skill.
---
<!-- rt-kit v0.41.1 · skills/agent-kit-extend.md · 5aedbf1c543c · правится надстройкой, не здесь -->

# How to add your own on top of the package

The skill `agent-kit` says **where** an edit goes; here — **how** it looks and what checks it. Cold part, samples whole: `pitfalls.md`.

A file with the header `rt-kit v… · <resource> · <checksum>` is never edited in place: the next
layout loses the edit, and `sync` refuses the file.

## When to use

- The package text is not true here: names, paths, techniques.
- The gate demands the wrong rule, or none where there is one.
- A guard judges by the wrong roots, checks or branch form.
- A sign, a check or a law with a rule of your own is started.

## Text: an override merges by section

- **`overrides/<resource>` repeats the resource path.**
- **A package heading replaces its section whole; a new one is appended; an empty body lifts it.**
- **Your own items go under your own heading.** A package heading silently drops its items; take it only to lift a wrong section.
- **A heading inside a code fence is not a section.** Named by it, the override lands at the end and the layout stays green; take the enclosing section, sample included.
- **Checked by `sync --check` and by eye on the laid-out file.** `skip` drops a whole resource.

## Nothing checks a gate map override

- **A wrong branch silently returns the wrong rule.** Test the edit by a gate call on three paths: the target, a neighbour, a file with no rule.

## Gate: your own branch decides before the default

- **`skill_for` prints a rule name or nothing; nothing passes the edit.**
- **The specific branch stands above the general: the first match wins.**
- **The redeclared function calls `skill_for_default`, or every package branch is lost.**

## Guard: the profile answers for names and commands

- **A profile function calls `<name>_default "$@"` for the rest.**
- **`rt_docs_pair_for` prints a path sample, not a path.**
- **A path sign starts at the tree root: `*/projects/*` also matches a foreign directory.**

## Signs and checks: data, not code

- **An object merges key by key; a list is replaced and written in full.**
- **A bundle is declared by what the tree consumes.** One also writing it excludes those folders by `exceptNamed`.

## Your own law and rule

- **`law:` and `rule:` link a tree law, rule and pattern; a dangling name is refused.**
- **A statement with no code goes to "Pitfalls" as prose, not to the companion.**

## Common misses

- **A shell edit by pattern loses `esac`: `bash -n` after it.**
- **The order is edit, build, `sync`; a formatter run goes before `sync`.**

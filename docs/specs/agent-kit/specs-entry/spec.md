# The entry into the specs by a resource name

**Status:** in force · **Revision:** 2026-09-09 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `project-documentation`
**Procedures:** none

## Why

How the package must work is written in the specs, and they are full. What they have no entry by is
the name of a resource: a complaint from the intake names the place it is about — a hook, a rule, a
skill — and there is nothing that turns that name into the spec speaking of it. The domain holds
more than twenty subdomains; finding the right one means opening them in a row and reading, which
costs more than the taking apart of the complaint itself. So the taking apart goes by memory, and a
proposal arguing with the way the package is designed passes on a par with a right one.

The subdomain names the entry: by the name of a resource one command gives the spec about it and its
statements, and the same command names the resources no spec speaks of.

## Terminology

- **A resource** — a file of the rules layer the package carries: a hook, a rule, a skill, a check, a
  pattern. In a complaint it is named by the path from the root of what is carried.
- **A binding** — a line of the companion of a spec: a statement of the spec and the address where it
  is carried out, `<путь>:<символ>`.
- **The entry** — the answer to the question "which spec speaks of this resource": the subdomain, the
  statements about that very file and the addresses they are carried out by.
- **An uncovered resource** — a file the package carries that not one binding of any spec names.

### What it is called in the interface

There is no interface: the entry is the output of a command in the executor's own turn.

## Rules

- **The spec about a resource is found by a command, not by reading the subdomains in a row.** More
  than twenty subdomains stand in the domain, and the one needed is told from the rest only by
  reading. What is paid for by the whole window is not done before every taking apart of a complaint:
  it is skipped, and the complaint is judged by memory.
- **The entry is assembled from the bindings of the companions, not from a list of its own.** A second
  list would name the same files from the other side and would diverge from the bindings in silence:
  each is edited on its own, and neither says the other stayed behind.
- **A resource is matched with a binding by the tail of the path, not by the whole string.** A
  complaint names the resource from the root of what is carried, and a binding names it from the root
  of the tree: the same file, two different strings. Matching by the whole string would give an empty
  answer to every complaint at once.
- **The tail is matched by whole segments of the path.** Matched by characters, a short name matches
  a longer one ending in it, and the answer names a foreign spec — that is, it leads the taking apart
  to a statement about another file.
- **The answer names the statements about that very file, not the whole spec.** A subdomain speaks of
  ten files at once, and the statement needed is found in it by the same reading the command was made
  to remove.
- **A name matched by nothing ends with a refusal, not with an empty answer.** An empty answer reads
  as "no spec speaks of it", and a typo in the name looks exactly the same. The refusal names what was
  looked for.
- **Called without a name, the command names the resources no spec speaks of.** Which of them is a
  gap and which is a lawful case is decided by the taking apart of the complaint; the work of the
  command is to show that the entry here is empty before the answer is written by memory.
- **The uncovered are counted by what the package carries, not by the files the bindings name.**
  Counted the other way round, the list is empty by construction: what a binding names is exactly
  what is covered.

## States

| What is asked                           | What comes back                                             |
| --------------------------------------- | ----------------------------------------------------------- |
| a name matched by bindings              | the subdomain, the statements about the file, the addresses |
| a name matched by bindings of two specs | both subdomains, the statements apart under each            |
| a name matched by nothing               | a refusal naming what was looked for                        |
| no name at all                          | the list of the resources no spec speaks of                 |

## What is out of scope

- The judgement of a proposal against the spec found: three outcomes and the quarantine are a
  neighbouring subject, and the entry is only what the judgement stands on.
- The completeness of a spec: whether the statements found answer the complaint is decided by the one
  taking it apart. The audit of the specs answers for the completeness of the bindings.
- Writing a spec for an uncovered resource: the command names it, the spec is written by work of its
  own.

## Contract

The surface is a command with one argument or without it. The answer goes to the standard output;
the exit code says whether the entry was found.

### Refusal codes

| What happened                   | How it ends | What it says                                         |
| ------------------------------- | ----------- | ---------------------------------------------------- |
| the name is matched by bindings | code zero   | the subdomain, the statements and the addresses      |
| the name is matched by nothing  | code one    | what was looked for and how the uncovered are listed |
| called without a name           | code zero   | the resources no spec speaks of, one per line        |
| there are no specs in the tree  | code zero   | nothing: there is nothing to assemble the entry from |

## Data

There is no storage of its own. The bindings are read from the companions of the specs, the list of
what is carried — from the layout directory of the package named by the tree profile.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the output is single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

A consumer tree carries no sources of the package, and there is nothing to count the uncovered by
there: the list comes back empty, and the entry by a name works as before — the bindings of the
consumer's own specs are read the same way.

## Decisions

- **The entry is given by a command and is not kept as a file.** A file goes stale at the first new
  spec and lies without turning red; a list nobody believes is not read. Rejected: an index file next
  to the domain spec.
- **The match goes by the tail of the path, not by a table of names.** A table would be kept fresh by
  hand next to the bindings — the very second list the article above forbids.
- **A name matched by nothing is a refusal, not an empty answer.** The two cases are told apart by
  the reader only when the command says which of them it is.

## Open questions

- `Q-SE-1` — a statement about a resource may stand in a spec without a binding to that file at all:
  the binding names a neighbouring symbol. Such a statement does not reach the entry, and nothing
  counts how many of them there are.

## History of changes

- 2026-09-09 — the subdomain was created: the entry into the specs by the name of a resource, for the
  taking apart of the cargo from the intake.

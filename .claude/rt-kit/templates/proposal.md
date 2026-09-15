<!-- rt-kit v0.28.0 · templates/proposal.md · e680e662b35c · правится надстройкой, не здесь -->
# Proposals on the rules layer

<!--
This file is placed by the main agent — as a step of the `/skill-curator` command, from the reply
of the review role. The role writes no files: rules act on all future sessions, and changing
them silently is not allowed.

The file is read by `agent-kit propose`. The heading form is not decoration: by it the command
picks what goes out to the package repository.

    ## <адрес> · <ресурс>

The address is one of three, and the role sets it:

    пакет      — an edit of a @rt-tools/agent-kit resource; goes outside
    компаньон  — implementation.md next to the rule: the names of this tree
    дерево     — an override of this tree; never goes outside

The resource is named by the package identifier — `rules/styling-bem.md`, `hooks/skill-gate.sh`
— and for the addresses "компаньон" and "дерево" by a path in the tree.

The proposal text never holds a path of this tree, a name of its domains or its own name: the
file goes to a foreign repository in full. A found tree address refuses the send with the line
number — that is a check, not a reminder.

There are four lines under the heading, and all four are mandatory:

    место          — where the edit goes in the resource
    повод          — what went wrong without it
    ближайшее      — the exact quote of the resource line this is closest to, and what it does
                      not cover; there is nothing close at all — write exactly that: «нет»
    чем закрывается — which overrides and additions of this tree are lifted when the edit
                      arrives as a package edition

The third line is the only one the machine checks: the quote is searched for in the resource,
and one not found refuses the block. It is written so that the resource gets read. An incident
analysis ends with a proposal to add an article to the very resource that already described the
miss — and from outside such an analysis is indistinguishable from one that ended in a fix.
Measuring text similarity was tried: the lawful neighbourhood of two articles of one rule gives
0.345 shared meaningful words, and the lawful move of a good article to a neighbouring place
gives 0.355, and there is no threshold between them. A named quote is judged by fact: it is
either in the resource or it is not.

A refused block does not vanish: it stays lying with the mark «отбито» and the reason. It is
visible that the review took place, and visible why it did not become an edit.

The fourth is written because the proposal goes outside, while the override it was written for
stays lying in the tree, and there is no link between them. The package releases a fixed edition
— and the tree has nothing to say which overrides it closed: the resource name is the same for a
dozen proposals, and the override section carries the same heading as the package one. Lifting
at a guess is scary, leaving is cheap — and the override stays forever, silently replacing the
fixed package section.

There is nothing to lift — write exactly that: «ничего, надстройки под это нет». An empty fourth
line does not count; the machine does not see it at all — no check reads the proposal body, and
this form is held by whoever writes the record.
-->

## пакет · rules/<правило>.md

- **место:** section «<heading>», at the end
- **повод:** what went wrong in this task without this rule
- **ближайшее:** «<the exact line of the rule this is closest to>» — <what it does not cover>
- **чем закрывается:** `.claude/rt-kit/overrides/rules/<правило>.md`, section «<heading>» —
  lifted in full when the edit arrives as a package edition

> The ready-made text of the edit — exactly what to insert, in the style of the neighbouring
> rules: in Russian, as a statement, without padding.

## дерево · .claude/rt-kit/gate-map.sh

- **место:** branch `edit`, next to the neighbouring kind of file
- **повод:** a kind of file of our own that other trees do not have
- **ближайшее:** нет — the map says nothing about this kind of file at all
- **чем закрывается:** nothing, there is no override for this — the edit is the override

> The ready-made text of the edit.

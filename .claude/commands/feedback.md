---
description: A remark about the rules layer, made in the middle of work, lands as a block in the proposals file
argument-hint: '<what gets in the way, what was missing, what went wrong>'
---
<!-- rt-kit v0.27.0 · commands/feedback.md · 1b5d29cf79bd · правится надстройкой, не здесь -->

Put the user's remark as a block into the proposals file. The remark: `$ARGUMENTS`

Called **in the middle of work**, not after it: what we stumbled on an hour ago is forgotten by
the review of the closed task, and the reply itself lives to the end of the session and dies
with it. The review of a closed task looks at what was loaded and at the progress; replies it
does not see at all.

The command sends nothing. It puts a block on disk, and the ordinary send, called separately,
carries it away. Tell the user this in the last line — otherwise what was put is read as sent,
and they wait for a reply nobody sent.

## 1. Understand what the remark is about

The user's remark is prose: "this rule gets in the way", "the gate demands the wrong thing",
"this is not in the rules at all". Your part is to turn it into three things:

- **the address** — where the edit goes;
- **the resource** — what exactly is edited;
- **the ready-made text** — exactly what to insert.

The address is one of three, and it is not chosen for convenience:

    пакет      — an edit of a @rt-tools/agent-kit resource; true for any tree and goes outside
    компаньон  — implementation.md next to the rule: the names of this tree and the binding of articles
    дерево     — an override of this tree; never goes outside

The resource is named by the package identifier — `rules/styling-bem.md`, `hooks/skill-gate.sh`,
`patterns/git-workflow-commit.md` — and for the addresses "компаньон" and "дерево" by a path in
the tree.

**An unclear address is asked about, not assigned by guess.** A wrong address sends the edit to a
foreign repository: what was said about our tree goes to everyone, and what was said about
everyone stays lying at home. Until the user has answered, nothing is written to the file.

No need to ask when the address is visible from the remark itself: it is about a rule you have
just loaded — that is `пакет`; it is about the names, paths and commands of this tree —
`компаньон` or `дерево`.

## 2. Find today's file

The block goes to the same place where the review of a closed task puts it: they have one
addressee and one format, and a second file next to it would mean that the send reads two
places, and the user does not remember in which one their remark lies.

```bash
ls .claude/rt-kit/proposals/$(date +%F)-*.md 2>/dev/null
```

Found — append to it. Not found — start one from the template, named by the branch:

```bash
mkdir -p .claude/rt-kit/proposals
cp .claude/rt-kit/templates/proposal.md \
   ".claude/rt-kit/proposals/$(date +%F)-$(git branch --show-current).md"
```

In a fresh file the template header stays, and the unfilled sample block — `rules/<правило>.md`
with the brackets — is replaced by your block: the send skips such a sample, but it lies there as
silent litter.

## 3. Write the block

The heading form is not decoration: by it the send picks what goes outside. A block without an
address in the heading goes nowhere and stays lying silently.

```markdown
## <адрес> · <ресурс>

- **место:** section «<heading>», at the end
- **повод:** what went wrong in this work without this rule
- **ближайшее:** «<the exact resource line this is closest to>» — <what it does not cover>

> The ready-made text of the edit — exactly what to insert, in the style of the neighbouring
> rules: in Russian, as a statement, without padding.
```

**The line «ближайшее» is mandatory, and it is the only one the machine checks.** The quote is
searched for in the resource, and one not found refuses the block: either the resource was not
read, or the statement has been rewritten since. There is nothing close at all — write exactly
that: «нет». It exists so that the resource gets read: a review ends with a proposal to add an
article to the very resource that already described the miss, and a second article about the
same thing costs more than its absence. A refused block stays lying with a mark and a reason — it
is visible that the review took place, and visible why it did not become an edit.

The reason is written from the case, not from a wish: "it was inconvenient here" does not become
a rule. The user's remark is retold by its meaning, not by your conclusions about how it should
have been.

**An address of this tree never appears in the block text** — no path, no root name, no name of a
foreign repository: the file goes to a foreign repository in full. A found address refuses the
send with the line number, and that is a check, not a reminder. Fix the text, do not bypass it.

## 4. Say what came out

In one line: which file the block landed in, how many blocks it holds now and what will carry
it away.

```bash
npx agent-kit propose --dry-run     # what would have gone
npx agent-kit propose               # send the cargo to the intake
```

The send carries away the blocks with the address «пакет» and marks them sent; the blocks
«компаньон» and «дерево» stay lying — they are edited by whoever works in this tree.

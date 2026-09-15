---
description: Review of a closed task through the eyes of the tree's rules — what was loaded, what helped, what was missing
argument-hint: '[empty | <what to look at first>]'
---
<!-- rt-kit v0.28.0 · commands/skill-curator.md · 37f040b442bd · правится надстройкой, не здесь -->

Launch the `skill-curator` agent on the review of the task just closed. The user's emphasis:
`$ARGUMENTS`

Called **right after the PR is opened** — in the same turn in which the work is handed in for
review. The agent edits nothing: it brings ready-made wording, and the decision to insert it is
made by the user.

**The launch is in the background, and the turn does not end on it.** While the agent works, the
next task is taken: it asks nothing and goes no faster for being waited on. Steps 1 and 2 are
done before the launch — while the task is still in mind; steps 4–6 receive the returned reply in
one turn and bring the executor back to the previous work.

## 1. Find the list of what was loaded

The rules gate writes it, one file per session:

```bash
ls -t "${TMPDIR}claude-skill-gate/"*.loaded | head -5
```

You need the file of the **current** session: its identifier stands in the scratchpad path from
the system prompt. Taking the newest by time blind is not allowed — a parallel session in another
window overtakes yours, and the review goes to someone else's task.

The record is reset at context compaction, so the list covers the last stretch of the session.
If you know what was loaded earlier — add it to the summary in words, do not pass the list off as
complete.

## 2. Assemble the summary

Without it the review degenerates into a retelling of the rules: the agent saw neither the task
nor where you stumbled. In the summary:

- **what was done** — the task in one sentence, the volume in numbers (files, commits, branch);
- **what went wrong** — item by item, and this is the main part. Each: what broke, what caught
  it (or why nothing caught it), whether you found it yourself or a check did;
- **what was at hand** — which rules were loaded and what each gave: where it worked, where it
  stayed silent, where it led astray. A rule that was loaded and was of no use is as much a
  finding as a missing one;
- **environment traps** — a linter rule, a tool limitation, a stand behaviour that you ran into
  and that is in no rule.

Honesty here is worth more than completeness: "the review found it, not me" and "the item was
marked done by work that did not happen" are exactly what rules are made of. A smoothed summary
gives a smoothed review.

## 3. Launch the agent in the background and return to work

With the `Agent` tool, `subagent_type: 'skill-curator'`. Into the prompt — the path to `.loaded`
and the summary in full.

The turn does not end on this: while the agent works, the next task is taken. The reply arrives
as a notification, and then come steps 4–6 — one turn, after which the executor returns to what
they were doing.

## 4. Put the findings into the task folder

The role's reply lives in the conversation and dies with it, so it goes to disk at once — next to
the progress, in the task folder. You write it, not the role: it writes no files at all.

```bash
cat > docs/tasks/<branch>/curator.md    # block heading — «## <адрес> · <ресурс>»
```

The role has already set the address of every block — «пакет», «компаньон» or «дерево». Your part
is not to lose it and not to rewrite the text in your own words.

The task folder dies with the merge, and the findings must outlive the whole epic: the owner
reads them at once, when the epic is over. So when the folder is taken apart, the findings file is
not deleted but moves to the epic plan — the work-closing pattern. Work outside an epic shows the
findings to the owner at once.

## 5. Send the observation digest — and only it

```bash
npx agent-kit propose --dry-run     # what would have gone
npx agent-kit propose               # send the cargo to the intake
```

The cargo goes out at every run: the observation digest with a snapshot of the overrides, the
incident analyses and the proposals lying in the proposals directory. The digest is fact: what
was used, what was never used, what the tree overrode. It always goes and does not wait for the
owner's word.

**The review findings do not land in the proposals directory by themselves, and so do not go.**
A proposal is a draft of an edit to a foreign tree, and some drafts fall away at the first
reading; gone without review, it becomes the work of someone who did not order it. Only what the
owner has named right moves to the proposals directory — and goes at that moment.

The send refuses if an address of this tree is found in the digest or in the proposal text — a
path, a root name, a foreign repository. This is not nitpicking: the cargo goes outside in full.
Fix the text, do not bypass the check. An incident analysis is not covered by the check: by
design it names the tree files where the miss happened.

## 6. Hand the findings to the owner — at the end of the epic

Show the findings **as they are**: the role writes ready-made text for insertion, and retelling
spoils it. On each, say your own view — agree or not and why; a rule you disagree with does not
need inserting.

Work in an epic does not show them at once: the findings accumulate at the epic plan and are read
at once, when the epic is over — so the owner sees what repeats, not scattered notes. What they
named right moves to the proposals directory and goes in step 5.

On every proposal the agent puts the mark «пакет», «компаньон» or «дерево»: the texts arrive from
`@rt-tools/agent-kit`, and an in-place edit of a laid-out file is lost on the next
`agent-kit sync`. Leave the mark in the proposal text — a person decides by it.

Where each goes:

- **пакет** — an edit of a resource in `@rt-tools/agent-kit`; here also lands everything true
  for any tree of the workshop;
- **компаньон** — `implementation.md` next to the rule: the names of this tree and the binding
  of articles;
- **дерево** — an override: `.claude/rt-kit/overrides/<identifier>` for texts,
  `.claude/rt-kit/gate-map.sh` and `project.sh` for the map and the profile.

A rule and its companion change together: a divergence between them is worse than no rule. A new
rule also needs an entry in the gate map, otherwise nobody loads it — and after editing the map
or a hook, a full run of their scenarios is mandatory.

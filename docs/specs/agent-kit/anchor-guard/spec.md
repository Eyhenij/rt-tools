# The guard of the anchors

**Status:** in force · **Revision:** 2026-09-08 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`

**Procedures:** none

## Why

End-to-end specs address elements through one attribute. Styling classes change together with the
layout, and a lookup by role and text breaks on translations: the application lives in many locales.
Both kinds of selection make the specs brittle, so the anchor is set by default rather than added
later — an element without it gets into a spec only after somebody notices it is missing.

The subdomain names which element is asked for an anchor, how the refusal is opted out of and why a
write by a shell command is judged on a par with an edit by the tool.

## Terminology

- **An anchor** — the value of the attribute an end-to-end spec finds the element by.
- **An interactive element** — a compound tag or a tag with an event binding: what a spec presses.
- **A decorative tag** — a tag a spec never presses; the tree names such tags itself.
- **The new text of an edit** — the lines the edit adds; what already lay in the file the guard does
  not judge.

### What it is called in the interface

The guard has no interface: only the executor sees it, as the text of a refusal in their own turn.

## Rules

- **Any compound tag and any tag with an event binding is asked for an anchor.** Listing the
  interactive ones by name does not work: a kit holds over a hundred components, and a list goes
  stale silently — a component forgotten in it passes without an anchor.
- **The opt-out is marked on the tag itself, not anywhere in the edit.** A marker searched for over
  the whole edit would switch the check off entirely: one decorative link would take the submit
  button of the same edit with it.
- **A framework tag produces no document node and is not asked for an anchor.** An anchor set on it
  is found by no selection, so demanding it means demanding what does not work.
- **Only the new text of the edit is judged.** What already lay in the file was not created by this
  edit, and asking an anchor of somebody else's line means refusing an edit of a neighbouring one.
- **A comment is cut out before the parse.** Comments often hold sample markup, and an edit was
  refused because of an element that will not be in the document tree at all.
- **An opening tag is parsed whole, not line by line.** A tag spans several lines, and the anchor
  often stands not in the first of them.
- **A write by a shell command is judged the same as an edit by the tool.** The same markup with the
  name of the shell instead of the name of the edit gave silence, and a screen written by a heredoc
  got into the tree without a single anchor. The target is taken by the shared parse of write
  targets, and the new markup is the body of the command.
- **The markup of the application alone is judged.** Without a positive check by the tree profile the
  guard would reach any markup file on disk: a draft outside the tree was refused with a demand for
  anchors.

## What is out of scope

- The showcase, the root markup and the specs themselves: the tree names their paths in its profile.
- Whether the anchor value is a good one: the guard sees its presence, and its meaning is judged by
  whoever reads the spec.

## Contract

The surface is the events of the agent: editing a file and calling the shell. The answer of the guard
is a pass or a refusal naming the tags left without an anchor.

### Refusal codes

Not applicable: the guard refuses a call before it is carried out, and such a refusal has no command
exit code.

| What happened                                | How it ends      | What it says                                  |
| -------------------------------------------- | ---------------- | --------------------------------------------- |
| an interactive element without an anchor     | the call refused | the tags and how to set anchors               |
| the opt-out marker on the tag itself         | a pass           | nothing                                       |
| a read, a write to a file that is not markup | a pass           | nothing                                       |
| no parser, broken input, a foreign tool      | a pass           | nothing: a broken guard does not jam the work |

## Data

There is no storage of its own: the markup is read from the call, and the paths and the tag names
come from the tree profile.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the refusal texts are single-language. The lookup by text is exactly what the anchor
exists instead of, because the screen speaks many languages.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The guard is one for all trees, and what counts as a component, what as decorative and where markup
is not asked for anchors is named by the tree profile.

## Decisions

- **The rule is inverted: everything is interactive but the named.** A list of interactive names goes
  stale silently, and the default must lean towards the anchor. Rejected: a list of names.
- **The opt-out lives on the tag.** Rejected: a marker anywhere in the edit — it switches the check
  off for the whole edit.

## Open questions

None.

## History of changes

- 2026-09-08 — the subdomain was created: the guard had no agreement, and the scenarios about a write
  by a shell command had nowhere to stand. The guards subdomain had reached the length limit.

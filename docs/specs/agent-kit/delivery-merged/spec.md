# The push into a branch whose PR is merged

**Status:** in force · **Revision:** 2026-10-21 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `delivery`
**Procedures:** none

## Why

The owner merged a PR, the host deleted its branch, and minutes later the executor committed an
incident analysis into the same branch and pushed it. The host answered `new branch`: the branch
came back with one commit over the merged work, and no PR would ever merge it. The pattern of the
commit already asked for the PR state before such a push, and only memory held it.

The subdomain stands apart from the delivery gate for the same reason its helper stands apart from
the guard: the delivery gate texts and the guard itself are at the length limit.

## Terminology

| Word              | What it means here                                                                     |
| ----------------- | -------------------------------------------------------------------------------------- |
| the pushed branch | the destination of the last refspec of the push, or the checked-out branch without one |
| a merged branch   | a branch that has a merged PR and no open one                                          |

### What it is called in the interface

There is no interface: the guard is visible only to the executor — as the text of a refusal in their
own turn.

## Rules

- **A push into a branch whose PR is merged and which has no open PR is refused.** The host deletes
  the branch with the merge, and a push recreates it with commits nobody will merge. The refusal
  names the merged PR and the way out: a new branch from the fresh base.
- **A branch reopened by a new PR after the merge is lawful work.** An open PR of the same branch
  clears the refusal.
- **A silent host gives no refusal.** No profile function, no network, a dry run — the push passes:
  the state of a PR is asked over the network, and its silence is not an answer.

## What is out of scope

- **A commit into a merged branch.** A commit stays on the machine and costs nothing; the miss is
  the push that brings it back to the host.
- **The main branch.** It has no PR of its own, and a push into it is judged by the main branch
  guard.

## Contract

The subdomain has no procedures and no interface: it is a guard on the agent's commands. Its surface
is one point — the push — and one profile function, `rt_pull_merged`, which a tree on another host
declares for itself.

### Refusal codes

Not applicable: the guard answers with a refusal decision and a text, not with named codes.

## Data

Its own storage there is none. The state of the PR is asked of the host on every push.

## Screens and states

The subdomain has no screen: what it says is seen in the refusal text of the guard.

## Cross-cutting requirements

### Locales

The text of the refusal is in the language of the rules layer.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the guard judges one command of one turn, and nothing here depends on the current
moment.

## Decisions

- **The refusal needs both signs: a merged PR and no open one.** One sign alone refused a branch
  reopened by a new PR, which is lawful work.
- **The host function lives next to the helper, not in the profile defaults.** The defaults file is
  at the length limit; a tree still overrides the function by its own profile.

## Open questions

None open.

## History of changes

- 21 October 2026 — the subdomain is created by task RT-2928 from an incident analysis of the
  intake.

## Scenarios

The scenarios lie in `scenarios.md` next to it.

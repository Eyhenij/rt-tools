# Grill

## The owner request

> Научить проверку (Recommended)

The answer to the question about the refused branch of RT-2927: the guard on branch creation knew
only the machine mail, and the owner signs commits with their own one.

## What the tree already has

- The delivery guard refuses creating a branch with a task number when the working copy mail is
  not the machine mail (scenarios SC-AK-372 and SC-AK-373 of the delivery-gate subdomain).
- The signature check on push accepts the machine mail and every mail named in `RT_HUMAN_EMAILS`.
- The profile of this tree names the owner mail in `RT_HUMAN_EMAILS`.

## What the rules already say

The rule git-workflow: a condition known at the start of work is asked at the start, and a
foreign signature email is refused on branch creation. A mail the tree named for a person is not
foreign: the push accepts it.

## Questions and answers

**The branch of RT-2927 is refused by the signature check; how to proceed?**
«Научить проверку (Recommended)»

## Decisions

- **The branch creation accepts the mails of `RT_HUMAN_EMAILS` the same way the push does** — the
  two checks judged one signature by two different lists. Rejected: switching the mail for one
  call, which leaves the hole for the next task.

## What is left unclear

- Nothing.

# Grill

## The owner request

> Задачи вне эпиков

A defect found along RT-2407 and created as a task by the rule; the owner's word covers work outside
epics.

## What the tree already has

- CI step «Migrations against a clean database» fell with «read ECONNRESET» on run 37004340467, PR
  #2483, with no edit in the branch that could cause it.
- The step waits for the base by `pg_isready` inside the container, over the unix socket.
  `deploy/dump.sh` waits for its probe base the same way.
- The Postgres image log on this machine: the init server is ready on the unix socket at
  12:22:21.864, shuts down by 12:22:22.187, and the real server listens on TCP 5432 at 12:22:22.277.

## What the rules already say

- `deploy-flow`: an edit to the pipeline is checked before the merge; a PR run reads the workflow
  from the branch.

## Questions and answers

**What this copy takes next**
Задачи вне эпиков

## Decisions

- Question closed by assumption: behaviour of the applications does not change — CI and the dump
  probe only.
- Question closed by assumption: the wait asks over TCP (`-h 127.0.0.1`); the init server listens on
  the socket alone and does not answer it.

## What is left unclear

- Nothing.

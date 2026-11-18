---
name: git-workflow-docker
kind: pattern
rule: deploy-flow
description: Pattern of rule deploy-flow. Load when working with images on your own machine — starting and restarting the daemon, diagnosing a hanging command, building for the production server platform, registry login from a service. Production server commands — pattern git-workflow-restart.
---

# Images on one's own machine

Pattern of the rule `deploy-flow`. What must be true meanwhile — the law
`docs/constitution/delivery.md`.

The daemon here is someone else's: on the owner's machine it holds their development storage,
their stand and the containers of their other works. Every command is written so that it can be
cancelled without asking the owner, and so that it touches nothing except what it created itself. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- A daemon command does not answer, and the reason must be found.

## What is not yours is not touched

## Space is asked before the run

The virtual machine's disk is separate from the host's disk: the host has room, inside it is empty, and this is visible only from inside.

## Garbage is removed by selection, and what is not yours is excluded by label

Volumes outlive their containers and pile up silently: `docker ps` does not show them, and `docker system df` counts them as one line.

## The daemon is brought up by its own CLI

Opening the application does not bring up the virtual machine: the application counts as running, and the daemon does not answer for hours.

## "The command hangs" — first check whether it really hangs

## Where it breaks: three tiers

The tiers are checked separately, otherwise the wrong thing gets fixed.

## A command from a service: its own settings directory and an explicit daemon address

## Token rights are asked before the pipeline leans on them

## The image is built for the production server platform

The owner's machine and the production server can be of different architectures.

## Common misses

- **The daemon restart is declared done by the application's state.**
- **The stand is not brought back after the restart.**

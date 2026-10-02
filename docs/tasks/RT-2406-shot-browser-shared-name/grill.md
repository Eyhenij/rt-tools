# Grill

## The owner request

> Задачи вне эпиков

The answer to the question what this copy takes after RT-2471; RT-2406 is the next single task.

## What the tree already has

- The task body: the shot browser container `rt-tools-shot` on port 43210 is one per machine, and
  a second run started next to it restarts it — the first falls with `ECONNRESET`.
- The pipeline half is closed by commit `fd13c0009` (RT-2457): CI sets `E2E_SHOT_CONTAINER` and
  `E2E_SHOT_PORT` of its own.
- The local half is alive: two working copies on one machine (the machine holds three) still share
  the default name and port in `tools/shot-browser.mjs`.

## What the rules already say

- `git-workflow`: «On a machine with several runners, any path from the home directory is shared.
  Install directory, container name and builder name are per project.»

## Questions and answers

**What this copy takes next**
Задачи вне эпиков

## Decisions

- Question closed by assumption: behaviour of the applications does not change — a test tool.
- Question closed by assumption: the default name and port are derived from the working copy path;
  the environment variables still win.
- Question closed by assumption: the sign is two different paths giving two different names and
  ports, the same path giving the same.

## What is left unclear

- Nothing.

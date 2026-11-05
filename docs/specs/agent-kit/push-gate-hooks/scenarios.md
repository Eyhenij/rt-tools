# Scenarios: the guard scenarios in the push set

A subdomain of the delivery guards. Here is how the push set treats the guard scenarios of a tree
that has no run file for them.

### SC-AK-1248 — a push editing the guards without a run file names the missing file

Given a tree without the run file, and a branch that touched a file under the hooks directory
against its base
When the push set is printed against that base
Then it holds a line naming the missing run file, and the line passes

Given the same branch in a tree with the run file, or a branch that touched no guard, or no base
When the push set is printed
Then it holds no such line

Covered: `projects/agent-kit/tests/defaults.test.sh`.

# What it is carried out by — the utils package

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree.

- **Every exported function has a spec, and a function without one fails the run.** — `projects/utils/jest.config.ts:global` — coverage is collected from the sources at 100%, so an untested function fails the run

# Grill

Task RT-2595 · the request — the PR into the epic branch RT-2591

## The owner request

> нужно вынести редактор и cms в общий модуль/пакет … rt-tools

> Вмержил пр, делай дальше

The second line answers the question whether to start the release of the three CMS packages; the
publication itself was named in that question as needing the owner's word, and this is that word.

## What the tree already has

- One publication workflow per package, started by hand; it builds the package and publishes the
  version written in the manifest.
- GitHub starts a manual workflow only from a file that lies in the main branch; the run takes the
  code of the branch it is started on.
- The build scripts `build:cms-contract`, `build:cms-server` and `build:cms-angular` exist.
- The server and the Angular packages link the contract as `workspace:*`; all three stand at 0.1.0,
  and the registry holds none of them.

## What the rules already say

- The release of the auth contract went the same way: its workflow went into main first, then ran
  on the working branch.

## Questions and answers

| Question                       | Closed by                                             |
| ------------------------------ | ----------------------------------------------------- |
| Does the work change behaviour | no: the packages are released as they are             |
| Is a law or a rule edited      | no                                                    |
| One task or several            | one, as in the epic plan                              |
| What is out of scope           | switching the application to the packages             |
| What shows the task is closed  | the three packages at 0.1.0 install from the registry |
| The publication                | the owner's word «Вмержил пр, делай дальше»           |

## Decisions

- **The three workflows go into main by a PR of their own, then run on the epic branch.** GitHub
  does not see a manual workflow outside main. Rejected: waiting for the epic merge — the
  application switch waits with it.
- **The contract is published first; then the links become `^0.1.0` and the other two follow.** A
  package with a `workspace:*` link does not install from the registry.

## What is left unclear

- nothing

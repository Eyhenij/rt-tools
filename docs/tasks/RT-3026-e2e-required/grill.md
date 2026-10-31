# Grill

## The owner request

> пиши себе в правила и гарды что перед пушем ты обязан гонять e2e тесты

> и ты обязан писать e2e тесты на весь фукнционал который ты меняешь или добавляешь

## What the tree already has

- The push gate already runs the end-to-end suites by subject: `rt_push_checks` in the tree profile
  prints `message-bus-admin-e2e` for the receiver and the second kit, the auth stand and
  `auth-example-e2e` for the entry module. A push is refused while they are red.
- Nothing demands that a branch changing such code also changes the end-to-end suite of that code.
- The verifiability law speaks of scenarios and tests and says nothing about end-to-end coverage.

## What the rules already say

- The verifiability law: promised behaviour is named as a scenario, and the scenario is named in
  the test that checks it. The kind of test is not named.
- The rule `testing`: an end-to-end test closes what a unit test cannot see. It names a technique,
  not a demand.

## Questions and answers

None asked: both requests name the work in full.

## Decisions

- **The law gets a section of its own in the tree override, not a package edit.** The demand
  follows from this tree's suites, and the package ships to trees without them. Rejected: a package
  edit, since a foreign tree has nothing to carry it out with.
- **The guard stands on opening a PR, not on a push.** The push gate already runs the suites. The
  missing part is the demand to write the test, and its last visible point is the PR opening.
  Rejected: a guard on a commit, since a commit without the test is lawful in the middle of work.
- **The guard reads the subjects by the same function the push gate reads them by.** One place
  decides what a path belongs to. Rejected: a second list of paths inside the guard.

## What is left unclear

- A behaviour no suite can walk, such as a pure refactor: the guard lets it through by a line
  `E2E-skip: <reason>` in a commit body of the branch. The owner did not name it. Without it a
  refactor could never be handed over.

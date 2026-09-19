# testing — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. A separate file because the rule speaks by
technique and travels between repositories whole, while everything below is true only here and
goes stale at every renaming.

The tree publishes libraries and holds two applications — the cargo receiver and the admin panel
to it. It has one end-to-end suite, the admin panel's: `apps/message-bus-admin-e2e`, Playwright,
its own stand of production builds and its own database. Everything else is checked by a call —
components, services, pure functions and the receiver's handlers — and the visible state of the
kit is shown by the showcase.

There are two spec runners here, and the boundary between them goes by directory: the published
packages in `projects/` have Jest, the application and the receiver's internal libs have Vitest.
They diverged not by taste: the packages stand on the frontend framework and its preset, while
the server side does not know it at all.

## What it is called here

- **In the rule** — Here
- **a spec runner** — Jest with `jest-preset-angular` on the packages; Vitest on the receiver and its libs; Playwright on the suite
- **a spec file** — `*.spec.ts` next to the source
- **a fixture builder** — a local `setup()` in the first kit; `createRtFixture(...)` in the second
- **the list of a component's behaviours** — `CONTEXT.md` next to a second-kit component — the sections "Главное, что нужно знать" and "Края"
- **the mark of what is not covered** — a line in `UI-KIT-V2-ISSUES.md`
- **the type check of the specs** — the target `typecheck` of the second kit: `tsc --noEmit` over `tsconfig.spec.json`

## Where it lives

- **the zoneless stand startup** — `projects/ui-kit/src/test-setup.ts`
- **the second kit's spec harness** — `projects/ui-kit-v2/src/testing/rt-kit-testing.ts`
- **the text editor double** — `projects/ui-kit-v2/src/testing/quill-mock.ts`
- **a sample component spec** — `projects/ui-kit/src/lib/ui-kit/buttons/unified-button/rtui-button.component.spec.ts`
- **a sample service spec** — `projects/store/src/lib/base-store.service.spec.ts`
- **a sample pure-function spec** — `projects/utils/src/lib/functions/transform-string-input/transform-string-input.spec.ts`
- **the mapping of package paths for Jest** — `projects/ui-kit/jest.config.ts`
- **the admin panel's end-to-end suite** — `apps/message-bus-admin-e2e/` — the stand in `stand/`, the specs in `src/`, the README next to them

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **The scenario id stands at the start of the test title, followed by a dash.** — Not carried out: there are no domain specs with numbered scenarios in the tree. The link is held by a word — the behaviour is named in the component's `CONTEXT.md` and named once more in the test title.
- **A scenario without a test carries a mark with a reason.** — `tools/check-specs.mjs:collectReferences` — a scenario without a test and without the "Не покрыто" mark is named by the audit. The list of what is not covered, with a reason, is kept by `UI-KIT-V2-ISSUES.md`.
- **A test that does not follow the user's path is marked as partial coverage.** — Not carried out: there is no coverage digest by user paths here. The closest is the section about assertions that cannot fail, in `UI-KIT-V2-ISSUES.md` §7.
- **A test mentioning a scenario that is not in the specs takes the check down.** — **Not checked by anything.** The audit goes from a scenario to a test, and it has no reverse side: a title with a foreign number is green. The closest on another subject is `tools/verify-ui-kit-v2-docs.cjs`.
- **An exchange counts as read on both sides, not by the success of calls.** — `tools/cargo-pull.mjs:main` — the reading side of the cargo: the send and the mark answered with success, while there was nothing to take what lay in the intake with, and over two hundred records stood as new.
- **A value shared by two sides of an exchange is taken from the declaring side, not computed anew.** — `tools/cargo-mark.mjs:treeSlug` — the mark takes the tree trait from the package by the same function the send computes it with; its own copy took the last word of the address against the whole address, and not one record ever got marked.
- **A decision is moved into a pure function and checked by a call.** — `projects/utils/src/lib/functions/deep-equal/deep-equal.ts:areArraysEqual` — a folder per function, the spec next to the source; the component stays a thin wrapper while it has no branching of its own. Two deep-comparison functions share one module: apart they are an import cycle.
- **A Connect procedure is checked by calling its method with a hand-written database double.** — `libs/message-bus-api/accounts/feature/src/lib/setup.controller.spec.ts:PrismaDouble` — the double is written by hand in every receiver spec: the filtering, the sorting and the creation of rows it does itself.
- **A scenario whose "Then" names a person and what they see is closed by an end-to-end test.** — `apps/message-bus-admin-e2e/src/support/admin.ts:openSection` — six spec files walk the person's path and close twenty-nine scenarios of the receiver's spec; which specs the check counts as end-to-end is set by the key `e2eRoots` in `.claude/rt-kit/checks.json`.
- **An end-to-end test switched off by an environment variable does not count as coverage.** — `apps/message-bus-admin-e2e/stand/stand.mjs:ACCOUNT` — the sign-in pair is named in the code rather than in the environment: a test put out by a missing variable counts as skipped, and the run looks successful at that. There is not one switch by environment in the suite.
- **A procedure is also called by the end-to-end suite, not only by the test next to it.** — Not carried out: the tree's end-to-end suite walks only the person's path — `apps/message-bus-admin-e2e/src/support/` holds a screen helper and a snapshot, and there is not one helper for calling a procedure directly. The article starts being carried out the day the suite gets such a helper.
- **The seed creates what a screen cannot open without, and nothing a guest would take for real.** — `apps/message-bus-admin-e2e/stand/seed.mjs:seed` — three trees named «Стенд первый» and on by the count, the reviews name a case of the suite, the proposals an edit of the suite. The seed creates no owner settings at all.
- **A created check goes into the push gate or the pipeline, not only into the umbrella target.** — `.claude/rt-kit/project.sh:rt_push_checks` — the line of the gate suite, and the step "E2E admin" in `.github/workflows/ci.yml`; the link between them is audited by `tools/check-push-gate.mjs`.
- **A test that irreversibly changes stand data is switched off by default.** — Not applicable: the suite has a stand of its own, and a disposable one — `apps/message-bus-admin-e2e/stand/seed.mjs:seed` cleans the database before every run, and there is nothing in it to spoil. The suite touches no foreign stand: its ports and its database are its own.
- **Tests that need nginx in front of the application wake together with `BASE_URL`.** — Not applicable: there is no reverse proxy in the tree — it arrives with the third task of the work line. The admin panel's production build and the receiver are brought to one address by the suite's own serving, `apps/message-bus-admin-e2e/stand/serve-admin.mjs`: without a shared address the browser does not send the sign-in cookie.
- **A linter rule that forbids a technique accepted here is switched off in the config, not bypassed in every test.** — `eslint.config.mjs:rt` — this tree's own rules are declared with the exception `**/*.spec.ts`, and the annotation of an arrow parameter is relaxed for specs there too. There are no pointed switches in the specs.
- **A check that arrives by layout arrives with its place too.** — `.claude/rt-kit/project.sh:rt_push_checks` — the gate suite, and `package.json` — the command name: a laid-out check stands in both, otherwise it is learned of by a new file in the list of what was laid out.
- **A hard-coded date in a fixture is the expiry date of the test itself.** — **Not checked by anything.** A date in a fixture is indistinguishable to a machine from a date in the code under test: both are a literal. It is held by both moments being taken the same way, and by reading red that arrived without an edit
- **A decision that depends on the current moment takes the moment as a parameter.** — **Not checked by anything.** A clock call inside a function is indistinguishable to a machine from a call that arrived as a parameter: both are a reference to the same name. Held by reading.
- **A guard lets the action through when it is itself broken.** — `.claude/hooks/proposal-guard.sh:verdict` — with no JSON parser, no progress record and on a repeated entry the turn is allowed; every guard of the tree is arranged that way.
- **A check's known list is named and explains itself.** — `tools/check-file-size.mjs:parseAllowlist` — the list is read by a shared parser by the check's name, and every entry carries a reason and a task number.
- **A test asserting absence is green even when it looks for the wrong thing.** — **Not checked by anything.** The assertion "this is absent" is true with a typo in the query too: a machine has nothing to check against whether the search looked in the right place. Held by reading.
- **A count taken over a run's output says nothing until the run is known to have reached the step counted.** — **Not checked by anything.** There is nothing to bind such a count to. It is written anew each time and by a different command. Held by this article and by the paired positive check it prescribes.
- **A test title promises more than the body checks, and the audit does not see it.** — **Not checked by anything.** The audit knows the scenario number in the title and does not read the body: the promise and the check diverge silently.
- **An accepted entry differs from debt by whether work is opened for it.** — `tools/rt-kit-checks.config.mjs:parseAllowlist` — the sides of the list are read apart, and the debt is given to the check separately from the accepted.
- **Every entry carries its own reason and the number of the task that added it.** — `tools/rt-kit-checks.config.mjs:parseAllowlist` — an entry without a reason or without a number ends the parsing with a refusal naming the file and the entry itself.
- **A list entry nothing calls any more is removed together with what called it.** — `tools/check-file-size.mjs:allowlist` — an entry about a file that is no longer in the tree is named by a separate digest line; the tree's other lists have no such check, and there the article is held by reading
- **Red has an assigned action, and a second rerun is not part of it.** — `.claude/hooks/rerun-guard.sh:seen` — a rerun call is refused until the journal of that same pipeline step has been read within the same turn.
- **A line is not added to the known list for a red check.** — Not checked by anything and will not be: a known list is data, and an accepted line is indistinguishable to a machine from a silenced one — both have a name, a key and a reason. Held by this article and by the PR review; in the tree such lists are kept by `tools/check-file-size.mjs` and the checks next to it, and a growing list is visible in the diff.
- **A command's successful answer is re-read by a separate request.** — **Not checked by anything.** That a call happened is visible to a machine; that the result was read after it is not. In the tree that came out as a miss: `npm run task:new` printed the task number twice and never brought it to the board, and this was read by hand.
- **A service counts as up by a request it carried through, not by an open port.** — **Not checked by anything.** A port is asked by a command, but whether a request went through the service is known only by whoever sent it: the end-to-end suite raises the stand itself and falls on the very first request, while sorting out the port answers only "who is listening".
- **The snapshot suite's references lie next to the test, are updated by a separate call and read by eye.** — `apps/message-bus-admin-e2e/src/support/shot.ts:expectScreen` — the snapshot is taken by that wrapper, the references lie in the `__snapshots__` directory next to the suite. The update goes by the argument `--update-snapshots`; **not checked by anything** is that the updated frame was looked at by eye.
- **The browser raster is named explicitly, otherwise a frame does not match itself.** — `tools/shot-browser.mjs:SHOT_ARGS` — the four arguments to the browser stand where the browser is launched, inside the image: the connection does not carry them, the browser is already up by then. The language needs a variable of its own next to them — `SHOT_LOCALE`: the image holds `LC_ALL=C.UTF-8`, and it beats the argument, so the date field drew the American order under a named `--lang=ru-RU`. **Not checked by anything** is that they are named at all: without them a frame matches about three runs out of four.
- **A mask covers the content but not the width.** — `apps/message-bus-admin-e2e/stand/seed-self-check.mjs:checkNothingDrifts` — what drifts is cured in the stand seeding (`moments`), and it judges itself as its last step: a time value that landed on the run day or later, and a record's month diverging from its own run time, end the stand startup with a refusal in words. **Not checked by anything** is the width of a node under a mask itself: the frame matches or it does not, and why is read by comparing pixel by pixel.
- **Not only time is made constant but everything the application derived from it.** — `apps/message-bus-admin-e2e/stand/seed-self-check.mjs:checkNothingDrifts` — the query matches the month key against the time of that same record (`"month" <> to_char("ranAt", 'YYYY-MM')`): a derivative computed before the times were edited names itself. The other derivatives — the deadline, the freshness sign — are **not checked by anything**: each needs a query of its own, and it is started together with the column.
- **The seeding checks itself instead of relying on the frame.** — `apps/message-bus-admin-e2e/stand/seed-self-check.mjs:checkNothingDrifts` — the stand startup ends with a refusal in words before the first frame is taken. **Not checked by anything** is the completeness of the set of judged columns: a column is put on screen by one line of markup, and the query for it is written by whoever remembered the seeding.
- **A guard that did not recognise the call is as silent as a working one.** — **Not checked by anything.** Every guard has its own call sign (`.claude/hooks/git-guard-*.sh`, `.claude/hooks/browser-guard-*.sh`), and from outside an unrecognised command is indistinguishable from a sound pass: it leaves no trace. Held by the article and by the PR review; the miss has already happened in the tree — the command was called by its full path, while the sign accepted only the bare name.

## What else is worth knowing when reading the code

- The stand is zoneless, and an unknown element or property in it is a refusal. A missing import
  fails the spec instead of drawing emptiness; a redraw is moved explicitly.
- Inputs are set by `componentRef.setInput(...)` — assigning to a field does not work, the inputs
  are reactive.
- Assertions go by the drawn block classes and by real directive instances
  (`By.directive(...)`): that is how it is proved that the modifier and the bridge to Material
  really applied.
- The substitutions in the second kit that nobody would think of: the text editor does not come
  up in an environment without a browser and is replaced by a double; the translation loader must
  return an empty dictionary; there is nothing to measure the window width with in that
  environment, and the breakpoints service is substituted; content in an overlay appears only
  after `ApplicationRef.tick()`; the double's output is declared as an object rather than by a
  call of `output()`. All of them with ready-made code in the rule `ui-component-tests`, the file
  `spec.md`.
- `passWithNoTests` is on: a green target does not mean the spec ran — the number of tests is read
  from the report.
- The states that never happen on a seeded stand — a service refusal, an expired wait, emptiness
  altogether and an answer that caught up with its list late — the end-to-end suite shows by
  substituting the receiver's answer with browser means: the receiver is one for the whole run,
  and one put out for the sake of a single state would leave the other specs without data.
- The suite's main trap is not time but order: the address changes on a click at once, while the
  rows arrive in the receiver's answer. The wait is not by a countdown but by the change of the
  list itself; the ready-made waits lie in `apps/message-bus-admin-e2e/src/support/admin.ts`.

## What this is checked by

- `pnpm test` — all packages; `pnpm exec nx test @rt-tools/<package> --testFile=<path>` — one file.
- `pnpm exec nx run message-bus-admin-e2e:e2e` — the admin panel's end-to-end suite; it raises the
  stand itself and needs only the database container up.
- `pnpm exec nx run @rt-tools/ui-kit-v2:typecheck` — the types of the specs: Jest does not check
  them, and the linter here does not look at types.
- `pnpm exec nx run @rt-tools/ui-kit-v2:verify` — the audit of the input tables against the
  components.
- The pipeline runs `nx affected -t lint test build` against the main branch
  (`.github/workflows/ci.yml`): a spec green only on its own machine stops the PR.

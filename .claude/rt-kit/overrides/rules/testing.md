## What of the law is not here

The tree holds both libraries and applications, and the rule applies to them differently. The
libraries have no end-to-end runs at all: the visible state is shown by the showcase, and it is
confirmed by a story frame. There are two end-to-end suites in the tree — the suite of the
receiver's admin panel and the suite of the entry example — and everything the law says about a
stand, data and the request path applies to them alone.

- **The runner of the package specs is Jest with `jest-preset-angular`, not Vitest.** One project
  per package; everything the rule says about the Vitest config has nothing to apply to here. The
  end-to-end suite runs Playwright.
- **Numbered scenarios exist for the receiver and do not for the kits.** The titles of the admin
  panel's end-to-end specs carry a scenario number, and the scenarios themselves live in
  `docs/specs/message-bus/`. The kits have none: the link between behaviour and test is held by a
  word — the behaviour is named in the component's `CONTEXT.md` and named once more in the test
  title.
- **The end-to-end suite raises the stand itself, and it cannot be pointed elsewhere by an
  environment variable.** Production builds of both applications, their own database, schema and
  seeding come up by one command and go down with the run; the specs therefore have no switches
  by the state of the stand.
- **The ready-made code of a kit component's spec and of an application screen frame lies in the
  rule `ui-component-tests`.** There too are the substitutions nobody would think of, and the
  choice between a spec, a story snapshot, a screen frame and a measurement.

The completeness of a test is checked by nothing, and the tree agreed on no way of substituting
modules: a double is written by hand.

## End-to-end coverage of a change

The first article of the law's section of the same name is held here by a guard at opening a PR.
The second is held by nothing: the push gate runs the suites, and by the law its run is not the
executor's check.

- **The suite a path demands is named by the subject of the path.** The subjects are named by the
  tree profile: the receiver, its libraries, the schema and the rollout demand the admin panel's
  suite; the entry packages and the theme demand the entry suite. The push gate raises the same
  suites by the same subjects, and for the second kit it raises both. At opening a PR a second-kit
  edit demands the suite of an application only when it reaches what that application draws — a
  component it names, one drawn inside it, or a kit file outside the components: a test in an
  application without a calendar checks nothing about the calendar.
- **A PR does not open while the branch changes code a suite walks and adds or edits no test of
  that suite.** The test is a `*.spec.ts` of the suite: a README, a stand script or a re-shot
  snapshot walks no new behaviour. The base, the head and the tree are read from the command.
- **The bypass is the line `E2E-skip: <reason>` in the body of a commit that changes code.** The
  reason is at least three characters, without `<`, and says what closes the gap. A line in a commit
  of texts only lifts nothing.
- **A change of a root setting or the build harness demands no suite.** It acts on every subject,
  and the push gate runs all suites for it.

Not checked by anything: that the executor ran the suites and named their output, and what the
reason of the bypass promises. Neither is a PR opened in the browser or a draft lifted by
`gh pr ready`.

## Pitfalls of this tree

- **The image-based suites do not run from a working tree under the system temporary directory.**
  The docker machine does not mount it, and the run ends with «браузер образа не ответил за 600
  секунд». A second working tree for them lives under the home directory.

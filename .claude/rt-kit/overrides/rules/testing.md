## What of the law is not here

The tree holds both libraries and applications, and the rule applies to them differently. The
libraries have no end-to-end runs at all: the visible state is shown by the showcase, and it is
confirmed by a story frame. There is one end-to-end suite in the tree — the suite of the
receiver's admin panel — and everything the law says about a stand, data and the request path
applies to it alone.

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

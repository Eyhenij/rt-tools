---
name: ui-component-tests-screens
kind: rule
law: verifiability
description: This tree's rule about the references and the application screens: the probes of the snapshot harness, re-taking a reference, the end-to-end suite frame, masks and the seeding. Take it on the harness, a reference image, a screen frame and the seeding of the stand. The showcase — ui-component-tests.
---

# Checking an application screen — references and frames

This tree's rule, not from the package. Cold part: `pitfalls.md`; articles whole — `ui-component-tests`, `pitfalls-2.md`.

## How the law applies here

- **A wait removed from the harness is guarded by a probe, not by the snapshot run.** It matches the frame before the wait against the one after.
- **A probe judges the markup it was created for.**
- **A probe judging by one measurement inherits the very rarity it guards against.** Measured until two diverge.
- **A probe names the state of the showcase it was pointed at, not only the state of the harness.**
- **A probe reading the harness as text separates the code from the explanations.**
- **A reference is taken after the frame has been looked at, not before.**
- **A re-taken reference is confirmed by a second raising before it is committed.**
- **A reference is re-taken deliberately and one at a time.**
- **A reference is taken from the same showcase the gate raises.**
- **A frame is taken by the drawn span, not by the node's box.**
- **A one-off check script does not travel into the repository.**
- **A branch the spec does not reach is named in the PR.**
- **An application screen is closed by an end-to-end suite frame, not by a showcase story.**
- **The end-to-end suite writes no settled-frame wait of its own.**
- **Screen frames have no step of their own in the gate or in the pipeline.**
- **What drifts in a screen frame is removed by name, not covered by a threshold.**
- **A mask covers the content but not the width.** What drifts is made constant in the seeding; the mask goes.
- **Not only time is made constant but everything the application derived from it.**
- **The seeding checks itself instead of relying on the frame.** At stand startup it refuses, in words, a time on the run day or later; a far future is named apart.
- **The self-check judges the time columns of every table the screens read, not only those shown today.**

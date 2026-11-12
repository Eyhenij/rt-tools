## What of the law is not here

Nobody checks before the push that the declared versions match the snapshot: `--frozen-lockfile`
stands in the pipeline, and it comes after the push.

Ranges are checked in this tree, in one manifest. The check of this rule reads the root
`package.json` and refuses a range there; it stands in the push set and in the pipeline. The
manifests of the published packages are not read: a library declares what it accepts by a range.

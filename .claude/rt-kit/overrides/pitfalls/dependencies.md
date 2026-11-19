## What of the law is not here

That the declared versions match the snapshot is checked before the push only for an edit of the
manifest or the lock: the push set then builds both images, and the build installs with
`--frozen-lockfile`. For any other edit the same install stands in the pipeline and in the rollout,
and both come after the push.

Ranges are checked in this tree, in one manifest. The check of this rule reads the root
`package.json` and refuses a range there; it stands in the push set and in the pipeline. The
manifests of the published packages are not read: a library declares what it accepts by a range.

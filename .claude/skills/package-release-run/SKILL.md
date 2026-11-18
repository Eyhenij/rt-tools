---
name: package-release-run
kind: pattern
rule: package-release
description: A pattern of the rule package-release. Take it before a release of a package without a framework and when a new such package is created — the commands that load the built package and read the release wiring.
---

# Before a release of a package without a framework

A pattern of the rule `package-release`. What must be true at that is the law
`docs/constitution/delivery.md`.

## When to use

- A publication workflow of a package without a framework is about to start.
- A package is created from a copy of another package's pipeline.
- The wiring check or the guard of the start refused.

## The commands

The wiring of every such package — the `verify` target, the root build command, the publication
workflow and its commit headers:

```bash
node tools/check-package-release.mjs
```

The built package, loaded as a consumer loads it: from the built folder and from a packed tarball
installed into an empty folder. The root build command runs it after the build:

```bash
pnpm run build:<package>
node tools/verify-package.cjs <package> --no-consumer   # without the registry, the tarball step is skipped; the pull request and push runs of the pipeline skip it too
```

One package — the call the start guard makes, with `--lenient`, so that a package with a framework is passed and not refused. Add `--build` to also run `pnpm run build:<package>`, which loads the package:

```bash
node tools/check-package-release.mjs --package <package> --lenient
node tools/check-package-release.mjs --package <package> --build
```

## A new package

Three lines are copied together with the pipeline, and none is left out: the `verify` target in
`projects/<package>/project.json` calling `tools/verify-package.cjs <package>`, `nx verify` at the
end of `build:<package>` in the root `package.json`, and the commit area of the publication workflow
in the list `scope-enum` of `commitlint.config.cjs`. The wiring check refuses a package missing the first two, and the third when the workflow writes a header with that area.

## What it does not tell

A consumer's own bundler or runtime is not asked: the check loads the package in Node and from the
tarball. The first consumer's report is the only trace of a divergence there.

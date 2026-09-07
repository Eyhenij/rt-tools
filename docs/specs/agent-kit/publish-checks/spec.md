# The checks of publishing

**Status:** in force · **Revision:** 2026-09-06 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `delivery`, `verifiability`
**Procedures:** none

## Why

The packages of the tree are published into the registry one by one, and a consumer installs each of
them from the registry — the version of a neighbour the manifest allows. In the tree the build and
the types read the sources of a neighbour, so two misses stay silent until the consumer: an import
of a symbol the published neighbour does not have yet, and a dependency lock that fell behind the
versions the raise wrote into the manifests. The first breaks the build at a consumer, the second
the next publishing.

The subdomain names the two checks of the tree that catch both misses before the release: the
comparison of the imports from neighbours with the published version of the neighbour, and the order
of the steps of the publishing pipeline.

## Terminology

| Word                   | Meaning                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| a neighbour            | a package of the same scope the package of the tree imports and names in the manifest             |
| a published neighbour  | the version of the neighbour from the registry, the greatest under the range of the manifest      |
| waiting for publishing | a symbol the published neighbour does not have, while the sources of the neighbour in the tree do |
| the strict mode        | the mode of the check in the publishing pipeline: a symbol waiting for publishing drops the check |

### What it is called in the interface

There is no interface: the checks are visible to the executor as a line in the push gate and as a
step of the pipeline.

## Rules

- **The imports of a package from a neighbour are read from the sources, not from the build.** The
  build writes them in the same shape, and the sources are read without it — in the push gate too.
  The import is a named one, in one line or in several, with `type` and with `as`; what is compared
  is the name the neighbour has, before the `as`.
- **Probes, showcase stories and imports inside comments are not judged.** They do not go into the
  package; a sample of an import in a description is not an import.
- **The exports of a neighbour are read from the types of the published version, the greatest in the
  registry under the range of the manifest.** That is how a consumer installs the neighbour; the
  working copy of the neighbour has nothing to do with it. The entry point of the types is taken from
  the first field of the manifest that leads to a file: at a package on ng-packagr the field `types`
  points at a source the package does not have.
- **The chain of `export *` is read to the end, and the file of types is taken before the source next
  to it.** Next to a `.d.ts` lies a `.js` of the same name, and taken first it gives back an empty
  list of names.
- **The neighbour imported from is named in the manifest, and there is a version in the registry
  under its range.** Otherwise there is nothing for a consumer to install, and the check names the
  range.
- **A symbol the published neighbour does not have, while the sources of the neighbour do, waits for
  publishing and does not drop the check in the push gate.** Between two releases this is an ordinary
  state, and it is fixed by the order of publishing; the check names the symbol and counts those
  waiting. In the strict mode the same symbol drops the check: a release with it will not build at a
  consumer.
- **The judging is narrowed down to one package by a flag, and an unknown package is refused.** The
  publishing pipeline judges its own package, not the neighbours; a package that does not exist would
  read as "there is nothing to compare".
- **The registry did not answer — the check passes and says so.** The push gate works without a
  network too, and a silent skip is indistinguishable from a comparison that came out even.
- **The published versions lie in a cache under the dependency directory.** The network is asked once
  per version; a probe puts a fixture directory in place of the cache and does not go into the
  network.
- **The comparison of the imports stands in the suite of the push gate, as a step of the pipeline and
  as a strict step before the publishing of every package.** Three places — three moments: the edit,
  the merge, the release.
- **A pipeline that raises the version rebuilds the lock after the publishing and puts it by a
  request of its own.** A rebuild before the publishing asks the registry for a version that is not
  there yet; a rebuild without a request stays on the runner. What is judged is the files of the
  pipelines, not a run.

## What is out of scope

- The order of publishing the packages and the raising of the versions — the version-raising scripts
  and the pipelines; here only the check of them.
- Imports from foreign packages outside the scope of the tree: their versions are held by the lock.
- Circles of imports inside a package — the check of circles is in the subdomain of the tree's
  checks.

## Contract

The surface is two commands of the tree: `check:package-imports` with the flags `--strict` and
`--package <name>`, and `check:publish-lockfile`. The directory of the packages, the directory of the
published versions and the directory of the pipelines are overridden by environment variables — that
is how the probes judge a fixture.

### Refusal codes

Not applicable: the checks answer with a non-zero exit code and a line for every divergence — the
package, the symbol, the neighbour and its version; for the pipeline — the file and the missed step.

## Data

There are no data of its own: the cache of the published versions lies under the dependency directory
and does not get into history.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The text of the refusal is in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the check judges one tree.

## Decisions

- **The exports of a neighbour are read from the types, not from the JavaScript build.** The types
  list everything public by name, including the interfaces and types that JavaScript does not have.
- **The range of the manifest is parsed by code of its own, not by a library.** The shapes of the
  range are those the version-raising scripts write: `^`, `~`, an exact one, `>=` and any; an
  unfamiliar shape allows nothing and is named in the refusal.
- **The push gate tolerates a symbol waiting for the publishing of a neighbour.** Otherwise any edit
  of a package would turn red between the release of a neighbour and its own — and this is fixed by
  the order of publishing, which the strict step of the pipeline guards.

## Open questions

None.

## History of changes

- 2026-09-06 — the subdomain was created: two kits went out with an import of symbols the published
  utilities and core did not have. The check of the order of the steps of the publishing pipeline,
  created earlier without a spec, is bound here as well.

## Scenarios

`scenarios.md` next to it.

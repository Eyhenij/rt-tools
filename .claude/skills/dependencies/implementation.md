# dependencies — what is its own here

The names and bindings of this tree, next to the rule `SKILL.md` beside it.

The tree publishes libraries and holds one application — the cargo intake. A dependency here is
either a build or check tool, or a neighbouring package of this same repository, or a peer
dependency of a published package, or what the intake stands on: the serving framework, the
storage client and its adapter. The differences from the rule grow out of that.

## What it is called here

- **In the rule** — Here
- **a dependency declaration** — `package.json` at the root — one manifest for the whole monorepo; the packages have their own `package.json`
- **the snapshot of the installed tree** — `pnpm-lock.yaml` at the root
- **a substitution of a foreign version** — `overrides` in `pnpm-workspace.yaml` — 21 entries: 16 floors against vulnerabilities of the build graph and 5 ceilings scoped to the showcase snapshot runner, whose own Jest and Playwright chain stays where the references were taken
- **the waiting term for a fresh version** — `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`; the term itself is not set in the tree
- **publishing one of our packages** — a manual start of the pipeline on GitHub, not `pnpm publish` from a machine

## Where it lives

- **the tool dependencies** — `package.json`, `devDependencies`
- **the peer dependencies of a published package** — `projects/<package>/package.json`
- **the substitutions and the waiting term** — `pnpm-workspace.yaml`
- **the makeup of the workspaces** — `pnpm-workspace.yaml`, `packages`
- **the check that the lock matches** — `.github/workflows/ci.yml` — installation with a frozen lock

## Where the articles are carried out

- **A package version is written as an exact number.** — `package.json:dependencies` — not a single entry with `^` or `~`; the request line in `pnpm-lock.yaml` matches the manifest, and `pnpm install --frozen-lockfile` accepts the lock without an edit. The substitutions of foreign versions in `pnpm-workspace.yaml` stay ranges on purpose: their meaning is «not below this version» for transitive dependencies that are not in the manifest at all, and an exact number there would pin a vulnerable branch.
- **Substituted versions of foreign dependencies are gathered in one list, and it is revisited at every update.** — `pnpm-workspace.yaml:overrides` — sixteen floors against vulnerabilities of the build graph and five ceilings scoped to the showcase snapshot runner; the list is revisited at every version bump: an entry whose parents no longer admit a version below its floor is dropped, a floor that fell behind the fixed version is raised.
- **A fresh version waits first, and one needed before the term is written out separately.** — **Not carried out** in full: the waiting term is set by `minimumReleaseAge`, and there is no separate list «needed before the term» in the tree — an exception is written as a line in the same file.
- **Only what the linter checks the formatting of gets reformatted.** — `.claude/rt-kit/project.sh:rt_lint_for` — the linter set of the tree; what they read gets reformatted, and nothing beyond that.
- **A package that carries styling is raised by a task of its own.** — **Not carried out** here: the tree does not read styling packages, it publishes them. A task of its own is created by the task creation command; the tree deliberately has no check for removed properties — it declares its own properties itself.

## What else is worth knowing when reading the code

- **Our own package is declared by an exact number even where a foreign one stands as a range.** A
  range on a neighbouring package of the monorepo gives a different tree on the machine and in the
  pipeline: locally the built `dist` stands there, in the pipeline what is already in the registry.
- **The lock file diverges from the manifests after every publication.** The package versions are
  bumped by the pipeline, and the lock stays with the former ones — it is fixed by a separate
  commit, otherwise the next installation with a frozen lock falls.
- **`npm run` here calls the scripts, and the installation is done by `pnpm install`.** They are
  not mixed: `npm install` would start a second lock file and a different tree.

## What this is checked by

- `pnpm install --frozen-lockfile` — catches a manifest that diverged from the lock; the pipeline
  installs the same way.
- `pnpm run check:all` — after a version bump: the linters, the specs, the build of every package.
- `pnpm run test:visual` — after bumping the version of a package that draws the layout: the specs
  stay green even on a shifted padding.

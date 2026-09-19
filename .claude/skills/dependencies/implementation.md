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
- **a substitution of a foreign version** — `overrides` in `pnpm-workspace.yaml` — two kinds. Floors against vulnerabilities of the build graph are written as a bare package name. Ceilings are scoped by a `parent>child` key to the showcase snapshot runner, whose own Jest and Playwright chain stays where the references were taken. The count is asked, not written: `grep -c '>' pnpm-workspace.yaml` gives the ceilings, and the rest of the `overrides` entries are floors
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
- **Substituted versions of foreign dependencies are gathered in one list, and it is revisited at every update.** — `pnpm-workspace.yaml:overrides` — floors against vulnerabilities of the build graph and ceilings scoped to the showcase snapshot runner. The list is revisited at every version bump. An entry whose parents no longer admit a version below its floor is dropped; a floor that fell behind the fixed version is raised; a ceiling is re-tried once the runner it protects takes the newer version.
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
- **A dependabot PR that a task overtakes is closed by that task and named in the task's PR
  body.** Left open, it re-raises the same versions on the next run and looks like a lag of the
  tree.

## What sets a bound no peer range declares

A peer range names the upper bound for the packages that declare one. Three things in this tree
set a bound and declare nothing, and each was found by a red run rather than by reading.

- **The showcase snapshot runner.** `@storybook/test-runner` runs under its own Jest and
  Playwright. A Jest raised past what the runner loads with refuses at `module.register()`, and
  the refusal names Jest, not the runner. The bound is held by the `parent>child` ceilings.
- **The reference browser.** The visual references were taken by one Chromium build. A newer
  Playwright brings a newer Chromium, and native controls — the textarea grip, the scrollbar —
  are drawn a pixel differently; the run turns red on stories nobody edited. The bound is the
  Playwright version in the same ceilings, and it moves only with a re-take of the references.
- **The seeded data.** The faker version fixes the sample values. A newer one gives other names
  and other numbers, and every frame with data diverges by text alone. The bound is the exact
  faker version in the manifest.

How to tell them from a defect of the edit — a divergence only in native controls after a
browser raise, only in text after a generator raise — is in the traps of the pattern
`ui-component-tests-visual`.

## What this is checked by

- `pnpm install --frozen-lockfile` — catches a manifest that diverged from the lock; the pipeline
  installs the same way.
- `pnpm run check:all` — after a version bump: the linters, the specs, the build of every package.
- `pnpm run test:visual` and `pnpm run test:visual:v2` — after bumping a package that draws the
  layout, and after bumping the runner, the browser or the data generator. The specs stay green
  even on a shifted padding; only the frames tell a raise from a breakage.

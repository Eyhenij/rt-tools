# doc-style — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. A separate file because the rule speaks by
technique and travels between repositories whole, while everything below is true only here and
goes stale at every renaming.

The texts of this tree are read not only by whoever edits it: the README and the changelog leave
for the published package, and the description of the token set is the only place where the
token names are listed at all.

## What it is called here

- **In the rule** — Here
- **a document** — a package README, a component `CONTEXT.md`, a decision in `docs/adr/`, a plan in `docs/plans/`, the changelog
- **the pair "an edit and its document"** — by the guard itself: a rule and its companion; by the tree profile: a kit component and the `CONTEXT.md` next to it, the production make-up (`docker-compose.prod.yml`, `deploy/Caddyfile`, `.github/workflows/deploy.yml`) and `docs/PROD.md`. A lib for the guard is any directory with `project.json` — every package under `projects/`, `apps/` and `libs/`: creating or removing one, and moving a file between two, demands their READMEs
- **the bypass mark** — the line `Docs-skip: <reason>` in the commit body; an empty reason is not accepted
- **the project glossary** — `docs/GLOSSARY.md` — the shared part is brought by the package, the subject part is appended by the override

## Where it lives

- **the laws** — `docs/constitution/` — laid out by the package, not edited by hand
- **the rules and patterns** — `.claude/skills/<name>/SKILL.md`, the names of this tree next to them — `implementation.md` alongside
- **the accepted decisions** — `docs/adr/`
- **the work plans** — `docs/plans/`
- **the description of the token set** — the styling pages `projects/ui-kit-v2/docs/*.mdx`
- **the description of a component** — `CONTEXT.md` next to a kit component
- **the list of what is not covered** — `UI-KIT-V2-ISSUES.md`
- **the pair guard** — `.claude/hooks/docs-guard.sh`, the pairs — in `.claude/rt-kit/project.sh`
- **the project glossary** — `docs/GLOSSARY.md` — laid out by the package, the subject sections — by an override
- **the address audit** — `tools/check-doc-paths.mjs`, the settings — `tools/rt-kit-checks.config.mjs`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **A path named in a document exists.** — `tools/check-doc-paths.mjs:checkDoc`, the run — `npm run check:docs`
- **A bare name or directory counts as a full path.** — `tools/check-doc-paths.mjs:existsInTree`; the tree is taken from git — `tools/check-doc-paths.mjs:treeOfRepo`
- **The archive and task folder are outside the path check.** — `tools/check-doc-paths.mjs:isSkipped` — `docs/archive/` and the task folders under `docs/tasks/`
- **Portable text is outside the address check too.** — `tools/check-doc-paths.mjs:isPortable`; the sources — `portableDirs` in `.claude/rt-kit/checks.json`, here that is `projects/agent-kit/assets`
- **An index is kept only for a directory read through it.** — `.claude/rt-kit/checks.json:indexedDirs` — here the list is empty and overrides the package default: the description of the past has no index, and records are found by their file name.
- **A directory index and its contents match both ways.** — `tools/check-doc-paths.mjs:checkIndex`; which directories are audited — `indexedDirs` in `.claude/rt-kit/checks.json`. Here the list is empty, so the audit runs on no directory: the article is carried out by the code and has nothing to judge in this tree.
- **An index entry is its file name in backticks.** — `tools/check-doc-paths.mjs:PATH_IN_BACKTICKS` — from the table row the first name in backticks with the `.md` extension is taken. Here no directory is indexed, so the article judges nothing.
- **A name kept only as gone is in the exceptions.** — `tools/rt-kit-checks.config.mjs:parseAllowlist`, called by `tools/check-doc-paths.mjs`; the list itself — `tools/doc-paths-allowlist.json`: linter rule names, pieces of code, branch names, what the build generates
- **A document ships in its change's commit.** — `.claude/rt-kit/project.sh:rt_docs_pair_for` — the pairs of this tree; they are watched by `.claude/hooks/docs-guard.sh`, the bypass is the line `Docs-skip:` with a reason.
- **A tree file is edited by the edit tool, not shell.** — **Not checked by anything.** Nothing refuses a shell write as such. `.claude/hooks/prose-style-guard.sh:added` judges its text: the heredoc bodies, and without a heredoc the whole command body. So a shell edit is refused by words it does not add, and the edit tool gives the guard only the new text. The targets of a script file an interpreter runs are read by `.claude/hooks/script-files.sh:rt_script_files`, its text is not judged as prose.
- **A laid-out file needs no pair.** — `.claude/hooks/docs-guard.sh:rt-kit` — the sign is read from the layout header in the first lines of the file. A laid-out rule still gets the pair "a rule and its companion": that part of the guard does not read the header.
- **A document is no longer than the length limit.** — `tools/check-file-size.mjs:limitOf` — prose has a limit of its own, `tools/check-file-size.mjs:PROSE_LIMIT` lines and `tools/check-file-size.mjs:PROSE_CHARS` characters, counted on the laid-out copy; the description of the past and the task folders are taken out of the count.
- **An archive record has an expiry, then is removed.** — `tools/archive-age.mjs:RETENTION_DAYS` — the number of days arrives by the key `archiveRetentionDays` of the checks settings; here a week is assigned. Records are removed by `tools/archive-prune.mjs`, the selection is one for both — `tools/archive-age.mjs:staleRecords`, and the check calls it with a day of slack — `tools/archive-age.mjs:CHECK_GRACE_DAYS`. The check stands in the push gate suite and as a pipeline step.
- **Expired records leave in their own commit.** — **Not checked by anything.** The cleanup command `tools/archive-prune.mjs` is called by hand. Nothing tells its commit from the work commit next to it: a separate subject and a line in the PR body are held by this article.
- **A live text names a decision in words, not an archive address.** — **Not checked by anything.** The path check does not read the archive, so a dead link turns red not there but in the text that referred to it. That is how the very first pruning broke two links, and both were found by the address audit.
- **A file moving to the archive names its former address in its header.** — **Not checked by anything.** The path check does not read the archive at all, and a miss there never turns red. It is held by the order of the move.
- **The glossary is edited where assembled, not where read.** — `.claude/hooks/glossary-load.sh:where` — the preamble names the address of the edit itself: the override `.claude/rt-kit/overrides/docs/GLOSSARY.md`, where this tree's own word goes; the shared part arrives by the package, and an in-place edit is refused by `.claude/hooks/rule-source-guard.sh`
- **An override section replaces the same-named package section whole.** — **Not checked by anything.** The merge by section lies in `projects/agent-kit/src/lib/sections.ts:mergeDocuments`, and neither the layout audit nor the glossary check sees that a section replaced the package one. Both read the assembled view
- **The working glossary is not the screen language.** — **Not checked by anything.** The labels of the kit lie in its translation files, and no check searches them for the words of the glossary's left column.
- **Machine state is written as a command and the answer to compare.** — **Not checked by anything.** The audits read the tree, while it is the machine that aged: a statement about it is written together with the way to ask it.
- **A diagram changes with the text it depicts.** — **Not checked by anything.** The diagram is typed in words inside that same file, and its divergence from the prose can be told only by reading both.
- **A text's number is recomputed by command in that change, or not written; a check is run, not retold.** — **Not checked by anything.** No check tells a fresh number from a stale one or a run check from a retold one: the author holds both.

## Texts for a person — what holds them

The spec audit reads only the section "How the law applies here", so the five articles of the
section "Texts for a person" have no lines above. All five are held by nothing in this tree: a
task, a PR description and a chat reply pass no wording check before they leave. The language
boundary is partly held for commit subjects — commitlint refuses a subject in the wrong case,
not in the wrong language.

## What else is worth knowing when reading the code

- Files laid out by the package (laws, rules, patterns) are edited not in place but by an
  override in `.claude/rt-kit/overrides/<resource>`: an in-place edit is lost on the next layout,
  and the layout refuses over it.
- Remaining work is not written into a document but opened as a task on the board.
  `UI-KIT-V2-ISSUES.md` diverges from the law's article about the work queue: it lists what the
  kit does not cover yet. Until its items become tasks, the work goes by the law.
- The released sections of the changelog are assembled from commit subjects and are not
  rewritten; only the unreleased one is edited.
- Numbers in texts (how many specs, how many components) go stale within one branch — next to
  the number the day it is true for is named.

## What this is checked by

- `.claude/hooks/docs-guard.sh` on a commit — only those pairs where the link is mechanical.
- `npm run check:docs` — the addresses named in the texts; no directory index is audited here.
- `pnpm run agent-kit:check` — what is laid out matches the package and the override.
- By reading: everything else in this rule the machine does not check.

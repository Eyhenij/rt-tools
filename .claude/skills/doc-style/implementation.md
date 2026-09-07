# doc-style — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. A separate file because the rule speaks by
technique and travels between repositories whole, while everything below is true only here and
goes stale at every renaming.

The texts of this tree are read not only by whoever edits it: the README and the changelog leave
for the published package, and the description of the token set is the only place where the
token names are listed at all.

## What it is called here

- **In the rule** — Here
- **a document** — a package README, a component `CONTEXT.md`, `TOKENS.md`, a decision in `docs/adr/`, a plan in `docs/plans/`, the changelog
- **the pair "an edit and its document"** — a second-kit component and the `CONTEXT.md` next to it; the styling tokens and `TOKENS.md`
- **the bypass mark** — the line `Docs-skip: <reason>` in the commit body; an empty reason is not accepted
- **the project glossary** — `docs/GLOSSARY.md` — the shared part is brought by the package, the subject part is appended by the override

## Where it lives

- **the laws** — `docs/constitution/` — laid out by the package, not edited by hand
- **the rules and patterns** — `.claude/skills/<name>/SKILL.md`, the names of this tree next to them — `implementation.md` alongside
- **the accepted decisions** — `docs/adr/`
- **the work plans** — `docs/plans/`
- **the description of the token set** — `projects/ui-kit/src/styles/TOKENS.md`
- **the description of a component** — `CONTEXT.md` next to a second-kit component
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
- **A bare name and a directory are judged the same as a full path.** — `tools/check-doc-paths.mjs:existsInTree`; the tree is taken from git — `tools/check-doc-paths.mjs:treeOfRepo`
- **The description of the past is excluded from the path check entirely.** — `tools/check-doc-paths.mjs:isSkipped` — `docs/archive/` and the task folders under `docs/tasks/`
- **Portable text is excluded from the address check, like the archive.** — `tools/check-doc-paths.mjs:isPortable`; the sources — `portableDirs` in `.claude/rt-kit/checks.json`, here that is `projects/agent-kit/assets`
- **An index is kept for a directory people read through it, not by walking it.** — `.claude/rt-kit/checks.json:indexedDirs` — here the list is empty and overrides the package default: the description of the past has no index, and records are found by their file name.
- **A directory index is checked against its contents from both sides.** — `tools/check-doc-paths.mjs:checkIndex`; which directories are audited — `indexedDirs` in `tools/rt-kit-checks.config.mjs`, here that is the archive
- **An index entry is named by its file name in backticks.** — `tools/check-doc-paths.mjs:PATH_IN_BACKTICKS` — from the table row the first name in backticks with the `.md` extension is taken; the second column holds prose, and there is nothing to take from there.
- **A name mentioned only to say "it is gone" is listed in the exceptions by name.** — `tools/check-doc-paths.mjs:parseAllowlist`; the list itself — `tools/doc-paths-allowlist.json`: linter rule names, pieces of code, branch names, what the build generates
- **A document goes in the same commit as the change it describes.** — `.claude/rt-kit/project.sh:rt_docs_pair_for` — the pairs of this tree; they are watched by `.claude/hooks/docs-guard.sh`, the bypass is the line `Docs-skip:` with a reason.
- **A file placed by the layout needs no pair.** — `.claude/hooks/docs-guard.sh:rt-kit` — the sign is read from the layout header in the first lines of the file.
- **A document is no longer than the length limit.** — `tools/check-file-size.mjs:LIMIT` — the limit is shared with code and styles; the description of the past and the task folders are taken out of the count.
- **A record in the description of the past has an expiry, and after it the record is removed.** — `tools/check-archive-age.mjs:RETENTION_DAYS` — the number of days arrives by the key `archiveRetentionDays` of the checks settings; here a week is assigned. Records are removed by `tools/archive-prune.mjs`, the selection is one for both — `tools/archive-age.mjs:staleRecords`, and the check calls it with a day of slack — `tools/archive-age.mjs:CHECK_GRACE_DAYS`. The check stands in the push gate suite and as a pipeline step.
- **A link to a record of the past in a live text lives exactly until the record's expiry.** — **Not checked by anything.** The path check does not read the archive, so a dead link turns red not there but in the text that referred to it. That is how the very first pruning broke two links, and both were found by the address audit.
- **A file leaving for the description of the past names its former address in its header.** — **Not checked by anything.** The path check does not read the archive at all, and a miss there never turns red. It is held by the order of the move.
- **The glossary is edited where it is assembled, not where it is read.** — `.claude/hooks/glossary-load.sh:where` — the preamble names the address of the edit itself: the override `.claude/rt-kit/overrides/docs/GLOSSARY.md`, where this tree's own word goes; the shared part arrives by the package, and an in-place edit is refused by `.claude/hooks/rule-source-guard.sh`
- **An override section replaces the package section of the same name entirely; it does not append to it.** — **Not checked by anything.** The merge by section lies in `projects/agent-kit/src/lib/sections.ts:mergeDocuments`, and neither the layout audit nor the glossary check sees that a section replaced the package one. Both read the assembled view
- **The working glossary and the screen language are two different vocabularies.** — **Not checked by anything.** The glossary is brought by the package, while the labels belong to the tree: neither of them has a list of its own screen strings, and there is nothing to search the left-column words in.
- **A text naming the state of a machine goes stale without a single edit in the tree.** — **Not checked by anything.** The audits read the tree, while it is the machine that aged: a statement about it is written together with the way to ask it.
- **A diagram is edited by the same change as the text it depicts.** — **Not checked by anything.** The diagram is typed in words inside that same file, and its divergence from the prose can be told only by reading both.

## What else is worth knowing when reading the code

- Files laid out by the package (laws, rules, patterns) are edited not in place but by an
  override in `.claude/rt-kit/overrides/<resource>`: an in-place edit is lost on the next layout,
  and the layout refuses over it.
- Remaining work is not written into a document but opened as a task on the board. The exception
  is `UI-KIT-V2-ISSUES.md`: it holds the list of what is not covered, and it exists exactly so
  that the debt is visible.
- The released sections of the changelog are assembled from commit subjects and are not
  rewritten; only the unreleased one is edited.
- Numbers in texts (how many specs, how many components) go stale within one branch — next to
  the number the day it is true for is named.

## What this is checked by

- `.claude/hooks/docs-guard.sh` on a commit — only those pairs where the link is mechanical.
- `npm run check:docs` — the addresses named in the texts and the completeness of the archive
  index.
- `pnpm run agent-kit:check` — what is laid out matches the package and the override.
- By reading: everything else in this rule the machine does not check.

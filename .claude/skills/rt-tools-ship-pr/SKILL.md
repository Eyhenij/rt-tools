---
name: rt-tools-ship-pr
description: Push the current branch and open a GitHub PR for this repo with a description derived from the full diff and commits, then add an Unreleased CHANGELOG section per affected package in a separate commit. Use when asked to push the branch and open a PR, ship a branch, create a pull request, or update release notes / CHANGELOG in this Angular monorepo. For linking the PR to a board task and moving its status, see the rt-tools-board skill.
---

# Ship a PR

Push the current branch, open a PR with a thorough description, and record an
**Unreleased** CHANGELOG entry for each affected package.

## Conventions

- Base branch is `main`. Each package has its own `projects/*/CHANGELOG.md`;
  versions live in `projects/*/package.json`.
- `CHANGELOG.md` is auto-generated at release from conventional commits — never
  rewrite released sections. Only prepend/extend a `## [Unreleased]` block.
- Stage files by explicit path; never `git add .` (avoid sweeping untracked junk).
- If a bare `git`/`gh` errors with an account-selection message, prefix it with
  `command` (e.g. `command gh ...`).

## Workflow

1. **Gather context** — run the helper once (paths relative to this skill dir):

    ```bash
    scripts/gather-context.sh main
    ```

    It reports: branch, upstream, existing PR, commits + bodies (`main..HEAD`),
    diff stat, affected `projects/*`, their CHANGELOG/version, and dirty files.

2. **Understand the changes** — read the diff and key changed files
   (`command git diff main...HEAD`, then Read the important ones). Identify new
   or changed public API, removed exports, and any **breaking changes**.

3. **Push** — if no upstream: `command git push -u origin <branch>`.

4. **Update CHANGELOG (separate docs commit)** — for each affected
   `projects/*/CHANGELOG.md`, prepend/extend a `## [Unreleased]` block using the
   conventional-changelog headings, commit only those files, and push. Format in
   [REFERENCE.md](REFERENCE.md).

5. **Open or update the PR** — write the body to a scratchpad file and pass it
   with `--body-file`. If a PR already exists, `command gh pr edit <n> --body-file ...`
   instead of creating a duplicate. Template in [REFERENCE.md](REFERENCE.md).

6. **Report** — PR URL, affected packages, breaking changes, leftover dirty files.

## Commit trailers

End commit bodies with the assistant co-author trailer, and PR bodies with the
standard generated-with footer (see [REFERENCE.md](REFERENCE.md)).

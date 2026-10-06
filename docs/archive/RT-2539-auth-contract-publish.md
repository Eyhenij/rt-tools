# Grill

## The owner request

> Опубликовать контракт 0.1.0 (Recommended)

The answer to the question how to get `@rt-tools/auth-server` past the package import check: the
server imports the contract, and the registry holds no version of it. The owner also said: «ты уже
публиковал новые версии пакетов для ui-kit и прочих».

## What the tree already has

- One publication workflow per package, started by hand. Each is hard-wired to its package.
- The npm token of this machine answers 401; the repository secret `NPM_TOKEN` publishes.
- GitHub starts a manual workflow only from a file that lies in the main branch.

## Decisions

- **A workflow of its own for the contract, started on the contract branch.** The file lies in
  main, so GitHub registers it, and the run takes the code of the branch it is started on.
  Rejected: waiting for the epic merge — the server package waits with it.
- **No version bump in the workflow.** The first version is written in the manifest by the
  contract branch.

## What is left unclear

- Nothing blocks the task.

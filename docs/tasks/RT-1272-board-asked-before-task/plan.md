# Замысел

**Поведение:** не меняется — правятся тексты слоя правил, кода за ними нет.

## Что делается

1. `patterns/git-workflow-commit.github.md`, раздел о заведении задачи: абзац о том, что очередь
   работ спрашивается поиском по словам темы до заведения, вместе с командой.
2. `patterns/git-workflow-pr.github.md`, раздел о чтении состояния заявки: абзац о пуше в ветку,
   заявка которой уже влита.

## Чем проверяется

`npm run agent-kit:sync`, `npm run agent-kit:check`, `node tools/check-file-size.mjs`,
`node tools/check-doc-paths.mjs`.

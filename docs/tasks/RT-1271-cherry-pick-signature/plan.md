# Замысел

**Поведение:** не меняется — правится текст слоя правил, кода за ним нет.

## Что делается

Разделом после «Порядок» в `patterns/git-workflow-merge.md` встаёт перенос коммита
черри-пиком: команда с переменными подписи, чем грозит их отсутствие и что делать с отпавшей
веткой.

## Чем проверяется

`npm run agent-kit:sync`, `npm run agent-kit:check`, `node tools/check-file-size.mjs`,
`node tools/check-doc-paths.mjs`.

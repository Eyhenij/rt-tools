# Замысел

**Поведение:** не меняется — правится текст закона, кода за ним нет.

## Что делается

В раздел «Статьи» закона о фронтовом приложении встаёт статья: управляющий элемент не меняет
размер, пока идёт начатая им работа.

## Чем проверяется

`npm run agent-kit:sync`, `npm run agent-kit:check`, `npm run check:specs`,
`node tools/check-file-size.mjs`, `node tools/check-doc-paths.mjs`.

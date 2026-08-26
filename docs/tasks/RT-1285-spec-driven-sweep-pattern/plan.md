# Замысел

**Поведение:** не меняется — заводится текст слоя правил, кода за ним нет.

## Что делается

1. Заводится паттерн `spec-driven-sweep`: пять проходов сплошного разбора привязки, разбор
   срабатываний чтением, доля ложных по слоям и ловушки.
2. Правило `spec-driven` называет его третьей строкой в разделе «Паттерны».

## Чем проверяется

`npm run agent-kit:sync`, `npm run agent-kit:check`, `npm run check:specs`,
`node tools/check-file-size.mjs`, `node tools/check-doc-paths.mjs`,
`node tools/check-descriptions.mjs`.

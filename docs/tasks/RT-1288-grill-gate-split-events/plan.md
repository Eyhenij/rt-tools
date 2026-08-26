# Замысел

**Поведение:** не меняется — оба события судятся тем же телом и тем же отказом; меняется то, что
дерево вправе взять только одно из них.

## Что делается

1. Объявление `PreToolUse AskUserQuestion` уезжает из `hooks/grill-gate.sh` в свой ресурс
   `hooks/grill-gate-ask.sh`: он объявляет событие, требует первый и отдаёт ему ввод.
2. `hooks/grill-gate.sh` остаётся при завершении хода — там ловится прозаический вопрос.
3. Сценарии при обоих: тонкий ресурс судит вызов инструмента тем же отказом.

## Чем проверяется

`bash projects/agent-kit/tests/grill-gate.test.sh`, `npm run agent-kit:sync`,
`npm run agent-kit:check`, `node tools/check-hooks.mjs`, `npm run check:specs`.

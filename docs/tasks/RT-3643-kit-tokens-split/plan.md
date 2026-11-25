# Plan

**Task:** RT-3643 · **Branch:** RT-3643-kit-tokens-split
**Spec:** `docs/specs/ui-kit-v2/tokens/spec.md`
**Behaviour:** unchanged — полный `tokens.css` остаётся побайтно прежним; добавляются два файла для потребителей, которым не нужны местные куски темы; слово владельца в эпике RT-3641: «запускай task flow»

## Points

- **A:** потребитель получает токены одним файлом `tokens.css` в 620 КБ, из которых около 461 КБ — местные куски темы, нужные не всем.
- **This task reaches:** потребитель без островов темы подключает `tokens.base.css` (159 КБ) вместо полного файла; приложение с островами — `tokens.base.css` и следом `tokens.scope.css`.
- **Sign:** `node tools/check-kit-weight.mjs --print` показывает `tokens.base.css` около 159 КБ при полном `tokens.css` в 619948 байт; видит это владелец в сборке потребителя.
- **Milestone G of the epic:** пресеты и темы подключаются по требованию.
- **Metric:** нет: ни правило, ни хук, ни проверка не улучшаются

## Task footprint

| What                 | Where                                                   |
| -------------------- | ------------------------------------------------------- |
| Specs (правится)     | `docs/specs/ui-kit-v2/tokens/`                          |
| Code (правится)      | `projects/ui-kit-v2/src/styles/`                        |
| Code (правится)      | `tools/build-tokens-split.mjs`                          |
| Code (правится)      | `tools/tests/build-tokens-split.test.sh`                |
| Code (правится)      | `tools/kit-weight-threshold.json`                       |
| Code (правится)      | `package.json`                                          |
| Code (правится)      | `projects/ui-kit-v2/package.json`                       |
| Documents (правится) | `projects/ui-kit-v2/README.md`                          |
| Rules                | `.claude/skills/rt-tools-styling/`                      |

## What counts as done

- `tokens.css` побайтно равен прежнему (619948 байт, совпадает с пакетом 0.52.0).
- `tokens.base.css` собирается без местных кусков темы, `tokens.scope.css` содержит их и плотность следом.
- Порог веса знает оба новых файла, пакет экспортирует их, спека и README описывают порядок подключения и называют, кому нужен `tokens.scope.css`: острова темы, узел с набором под тёмной страницей и корень страницы с набором Material и тёмной темой вместе (правило корня лежит в `_theme-scope.scss`, в базе его нет; сценарии шага 3 это закрепляют).
- Потребителю с набором Material на узлах или корне и тёмной темой нужны оба файла вместе (вес на 3890 байт больше полного: плотность повторена); облегчение даёт только приложение без этих сочетаний. Это названо в документации прямо.

## Stages

### 1. Раздельная поставка токенов

- **Steps:**
    1. Входной файл стилей режется на голову, местный кусок темы и хвост
       Check: `test -f projects/ui-kit-v2/src/styles/_index-head.scss` → exit 0
    2. Скрипт режет полный файл на базу и местные куски
       Check: `node tools/build-tokens-split.mjs` → /^build-tokens-split: base \d+, scope \d+, full 619948 bytes$/
    3. Сценарии проверяют состав обоих файлов, порядок, повтор плотности в конце местных кусков, отказ при испорченном входе и размер полного файла
       Check: `bash tools/tests/build-tokens-split.test.sh` → /^build-tokens-split: \d+ ok, 0 failures$/
    4. Порог веса знает новые файлы
       Check: `grep -c 'tokens.scope.css' tools/kit-weight-threshold.json` → >= 1
    5. Пакет экспортирует новые файлы
       Check: `grep -c 'tokens.base.css' projects/ui-kit-v2/package.json` → >= 1
    6. Спека и её сценарии описывают порядок подключения и кому нужен местный кусок
       Check: `grep -c 'tokens.scope.css' docs/specs/ui-kit-v2/tokens/spec.md` → >= 1
    7. README называет, кому нужен `tokens.scope.css`
       Check: `grep -c 'tokens.scope.css' projects/ui-kit-v2/README.md` → >= 1
- **Readiness sign:** полный `tokens.css` прежний, а база весит около четверти полного файла.
- **Verified by:** сценарии шага 3 (состав и порядок) и `node tools/check-kit-weight.mjs`: он сверяет размеры обоих файлов с порогом, а в последней строке «при пороге 331452» набор частей не сдвинулся.

## What this work does not do

- Не меняет значения токенов и порядок правил полного файла.
- Не сжимает сами острова: источник `_theme-scope.scss` весит 5,7 КБ и раскрывается в 461 КБ размножением значений по сочетаниям набора и темы; это RT-3649.
- Не повторяет хвост базы в `tokens.scope.css` целиком: пересечение хвоста с местными кусками измерено, это три свойства плотности (`--rt-input-density`, `--rt-input-height-md`, `--rt-input-height`), они уже повторены; остальные 36 свойств хвоста с островами не пересекаются.
- Не сливает порог руками: после слияния соседней задачи он пересчитывается командой `--write`.
- Не добавляет загрузчик: он в RT-3644.
- Не правит приложения-потребители.

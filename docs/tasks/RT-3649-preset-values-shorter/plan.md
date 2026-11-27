# План

**Task:** RT-3649 · **Branch:** RT-3649-preset-values-shorter
**Путь:** лёгкий · 60 строк · API и вид не меняются
**Behaviour:** unchanged — вычисленный вид во всех темах и наборах тот же, объединяются только одинаковые блоки

## Точки

- **A:** в `tokens.css` пять местных кусков темы записаны двумя наборами значений, три и два раза. Минифицированный
  файл весит 297298 байт.
- **Эта задача доводит до:** `tokens.css` и `tokens.scope.css` без сжатия легче не меньше чем на 100000 байт, вид тот же.
- **Признак:** минифицированный `tokens.css` не больше 197298 байт, снимки историй тем и наборов совпадают.
- **Цена:** по сети выигрыш мал: в brotli около 50 байт, в gzip около 9 КБ.
- **Веха G эпика:** не меняется. Рост 0.52.0 не в токенах, это уменьшение сверх возврата.

## След задачи

| Что | Где |
| --- | --- |
| Генератор (правится) | `tools/build-tokens-v2.mjs` |
| Лист генератора (пересобирается) | `projects/ui-kit-v2/src/styles/_theme-scope.scss` |
| Сценарий раздельной поставки (правится) | `tools/tests/build-tokens-split.test.sh` |
| Размеры файлов в описании (правится) | `projects/ui-kit-v2/README.md` |
| Порог веса (правится при изменении) | `tools/kit-weight-threshold.json` |
| План эпика (правится) | `docs/plans/kit-weight-remainder.md` |

## Решение

Решения нет: новых модулей, файлов кода и открытых имён нет. Генератор пишет два правила вместо пяти копий: селекторы
светлых копий переходят в первое светлое правило набора, селекторы второй тёмной копии — в первое тёмное. Светлые
селекторы сильнее тёмного правила под набором специфичностью, порядок тёмного после светлого остаётся.

## Этапы

### 1. Каждый набор значений в местных кусках записан один раз

- **Steps:**
    1. Минифицированный tokens.css легче не меньше чем на 100000 байт
       Check: `pnpm run -s build:ui-kit-v2 >/dev/null 2>&1; node -e "const {transformSync}=require(require.resolve('esbuild',{paths:[require.resolve('@angular/build/package.json')]}));const n=Buffer.byteLength(transformSync(require('fs').readFileSync('dist/ui-kit-v2/styles/tokens.css','utf8'),{loader:'css',minify:true}).code);console.log(n);process.exit(n<=197298?0:1)"` → exit 0
    2. Сценарий раздельной поставки требует, чтобы каждый набор значений стоял в листе местных кусков один раз
       Check: `test "$(grep -c 'the scope writes every set of values once' tools/tests/build-tokens-split.test.sh)" = 1 && bash tools/tests/build-tokens-split.test.sh` → exit 0
    3. Проверки токенов и веса кита проходят
       Check: `test "$(wc -c < dist/ui-kit-v2/styles/tokens.css)" -le 420000 && pnpm run -s check:tokens-build && node tools/check-tokens-graph.mjs && node tools/check-tokens-theme.mjs && node tools/check-tokens-styles.mjs && pnpm run -s check:kit-weight` → exit 0
    4. Все тесты кита проходят
       Check: `test "$(wc -c < dist/ui-kit-v2/styles/tokens.css)" -le 420000 && pnpm exec nx test @rt-tools/ui-kit-v2` → exit 0
    5. Снимки историй тем и наборов совпадают
       Check: `test "$(wc -c < dist/ui-kit-v2/styles/tokens.css)" -le 420000 && node tools/visual-gate.mjs ui-kit-v2 'preset|theme'` → exit 0
- **Readiness sign:** файл легче не меньше чем на 100000 минифицированных байт, вид тот же по снимкам.
- **Verified by:** `wc -c < dist/ui-kit-v2/styles/tokens.css` → число не больше 420000

### 2. Числа записаны

- **Steps:**
    1. Байты токенов после объединения записаны в плане эпика и в описании пакета
       Check: `grep -cE '^Токены после объединения: [0-9]+ байт' docs/plans/kit-weight-remainder.md` → >= 1
- **Readiness sign:** названы байты без сжатия, в gzip и в brotli.
- **Verified by:** `grep -c 'Токены после объединения' docs/plans/kit-weight-remainder.md` → >= 1

## Чего эта работа не делает

- Не меняет значения токенов, селекторы, вид и поведение.
- Не вводит `light-dark()` и не оставляет на узле одни отличия.
- Не обещает выигрыша по brotli.
- Не выпускает пакет: выпуск — задача RT-3716.

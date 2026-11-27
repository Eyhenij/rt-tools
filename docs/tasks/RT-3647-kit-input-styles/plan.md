# План

**Task:** RT-3647 · **Branch:** RT-3647-kit-input-styles
**Путь:** лёгкий · 150 строк · API и вид не меняются
**Behaviour:** unchanged — вид и поведение `rt-input` не меняются, меняется только запись его стилей

## Точки

- **A:** скомпилированные стили `rt-input` весят 18335 байт, часть `input` в пороге веса — 33092. Длинный признак набора
  Material стоит в них 39 раз.
- **Эта задача доводит до:** стили `rt-input` легче не меньше чем на 1500 байт, вид во всех наборах и темах тот же.
- **Признак:** скомпилированные стили не больше 16835 байт, часть `input` в пороге не больше 31592, снимки историй
  `input` и `field` совпадают.
- **Цена:** по gzip выигрыш не больше 103 байт.
- **Веха G эпика:** приложение из восьми частей укладывается в остаток 13000 с большим запасом.

## След задачи

| Что | Где |
| --- | --- |
| Стили (правятся) | `projects/ui-kit-v2/src/lib/components/input/` |
| Тест селекторов (правится при расхождении) | `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts` |
| Порог веса (правится) | `tools/kit-weight-threshold.json` |
| План эпика (правится) | `docs/plans/kit-weight-remainder.md` |

## Решение

Решения нет: меняется запись правил в четырёх листах стилей, новых модулей, файлов кода и открытых имён нет. Порядок
взят из замечаний ролей: объединить `--fill` и `--pill`, один включатель рамки `:before`, объединить значки слева и
справа. Свойства берутся только там, где иначе не дойти, с отдельной приставкой, не `--rt-input-*`. Формула размера
кнопки-значка на `.rt-input` не поднимается.

## Этапы

### 1. Стили input записаны без повторов

- **Steps:**
    1. Скомпилированные стили input легче не меньше чем на 1500 байт
       Check: `node -e "const s=require('sass'),d='projects/ui-kit-v2/src/lib/components/input/';const n=['rt-input.component','rt-input-floating-label','rt-input-icons','rt-input-affixes'].reduce((a,f)=>a+Buffer.byteLength(s.compile(d+f+'.scss',{style:'compressed',loadPaths:['projects/ui-kit-v2/src/styles']}).css),0);process.exit(n<=16835?0:1)"` → exit 0
    2. Порог веса переписан, часть input легче не меньше чем на 1500 байт
       Check: `node -e "process.exit(require('./tools/kit-weight-threshold.json').parts.input<=31592?0:1)" && pnpm run check:kit-weight` → exit 0
    3. Все тесты кита проходят на новых стилях
       Check: `node -e "process.exit(require('./tools/kit-weight-threshold.json').parts.input<=31592?0:1)" && pnpm exec nx test @rt-tools/ui-kit-v2` → exit 0
    4. Снимки историй input и field совпадают
       Check: `node -e "process.exit(require('./tools/kit-weight-threshold.json').parts.input<=31592?0:1)" && node tools/visual-gate.mjs ui-kit-v2 'input|field'` → exit 0
- **Readiness sign:** стили легче не меньше чем на 1500 байт, вид тот же по снимкам.
- **Verified by:** `node -e "console.log(require('./tools/kit-weight-threshold.json').parts.input)"` → число не больше 31592

### 2. Измерение приложения

- **Steps:**
    1. Байты пробного приложения после правки стилей записаны в плане эпика
       Check: `grep -cE '^Приложение после стилей input: [0-9]+ байт' docs/plans/kit-weight-remainder.md` → >= 1
- **Readiness sign:** названо, сколько осталось запаса до остатка 13000.
- **Verified by:** `grep -c 'Приложение после стилей input' docs/plans/kit-weight-remainder.md` → >= 1

## Чего эта работа не делает

- Не меняет вид, поведение, имена ручек темы и свойств приложения.
- Не трогает стили других частей кита.
- Не обещает выигрыша по gzip.
- Не выпускает пакет: выпуск — задача RT-3716.

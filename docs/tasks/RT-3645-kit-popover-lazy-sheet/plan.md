# Plan

**Task:** RT-3645 · **Branch:** RT-3645-kit-popover-lazy-sheet
**Spec:** `docs/specs/ui-kit-v2/popover-sheet/spec.md`
**Behaviour:** unchanged — вид и поведение нижнего листа не меняются; меняется только то, когда загружается его код: при первом открытии на узком экране, а не на старте. Правится публичный контракт точки `popover`: из неё уходит класс `RtPopoverSheetComponent`, а ручка открытой шторки `IRtPopoverSheetOpened` теряет ссылку на компонент и несёт собственные поток закрытия и состояние. Это ломающая правка для внешних потребителей: номер версии и запись об изменении идут в выпуске эпика; слово владельца в эпике RT-3641: «запускай task flow»

## Points

- **A:** часть popover на старте потребителя несёт нижний лист целиком, хотя лист открывается только на узком экране; статический экспорт его класса из публичной точки `popover` и статический импорт в помощнике держат лист в стартовой связке.
- **This task reaches:** код листа подгружается при первом открытии листа и на старте потребителя не лежит. Директива popover, меню и контекстное меню вкладок открывают лист как прежде; закрытие, снос и повторное открытие до прихода листа не оставляют его висеть и не создают второго; сбой загрузки куска снимает состояние «открыто».
- **Sign:** `pnpm run check:kit-weight` после переписи порога выходит кодом 0, часть `popover` в пороге строго меньше прежних 16473, определение класса листа лежит в отдельном файле-куске, а не в `rt-tools-ui-kit-v2-popover.mjs`. Сколько байт ушло, называется по замеру в итоге задачи: лист весит около 5,4 КБ в исходниках, меньше после минификации, и часть его общего кода нужна старту; цифра эпика −8,6 КБ этой задачей не достигается.
- **Milestone G of the epic:** вес кита под контролем: лист popover не лежит на старте.
- **Metric:** нет: ни правило, ни хук, ни проверка не улучшаются

## Task footprint

| What                 | Where                                                                |
| -------------------- | -------------------------------------------------------------------- |
| Specs (правится)     | `docs/specs/ui-kit-v2/popover-sheet/`                                |
| Code (правится)      | `projects/ui-kit-v2/src/lib/components/popover/`                     |
| Code (правится)      | `projects/ui-kit-v2/src/lib/components/menu/`                        |
| Code (правится)      | `projects/ui-kit-v2/src/lib/components/tabs/`                        |
| Code (правится)      | `tools/check-kit-weight.mjs`                                         |
| Code (правится)      | `tools/kit-weight-threshold.json`                                    |
| Documents (правится) | `projects/ui-kit-v2/src/lib/components/popover/Overview.mdx`         |

## What counts as done

- `rtOpenPopoverSheet` возвращает ручку сразу. Ручка несёт оверлей, поток закрытия `dismissed` и сигнал `open`; ссылки на компонент в публичном типе нет. Компонент подгружается ленивым `import()`; обещание загрузки кэшируется и сбрасывается при ошибке; `finishClosingSheets()` остаётся синхронным до загрузки.
- Закрытие, снос директивы и повторное открытие во время загрузки не оставляют листа и не создают двух (сценарии SC-UKV-1782…1784, у каждого есть спека); ошибка загрузки куска снимает состояние «открыто» и допускает повтор.
- Директива popover, меню и контекстное меню вкладок работают как прежде: их спеки зелёные, три спеки листа переписаны под ручку и ожидание загрузки.
- Публичная точка `popover` не экспортирует `RtPopoverSheetComponent`; `Overview.mdx` и `implementation.md` спеки не называют его.
- Сторож не принимает ленивый кусок за часть кита (случай в его проверках), порог переписан командой `--write` по измерению.

## Stages

### 1. Лист popover грузится при первом открытии

- **Steps:**
    1. Публичная точка popover не экспортирует компонент листа
       Check: `grep -c "rt-popover-sheet.component" projects/ui-kit-v2/src/lib/components/popover/index.ts || true` → /^0$/
    2. Помощник шторки грузит компонент ленивым `import()`
       Check: `grep -c "import('./rt-popover-sheet.component')" projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet.helper.ts` → >= 1
    3. Публичный тип открытой шторки не держит ссылки на компонент
       Check: `set -o pipefail; sed -n '/export interface IRtPopoverSheetOpened/,/^}/p' projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet.helper.ts | grep -c 'ComponentRef' || true` → /^0$/
    4. Спека popover-sheet называет сценарии о закрытии, сносе и повторном открытии во время загрузки, и у каждого есть спека
       Check: `set -o pipefail; grep -c 'SC-UKV-178[2-4]' docs/specs/ui-kit-v2/popover-sheet/scenarios.md >/dev/null && grep -rho 'SC-UKV-178[2-4]' projects/ui-kit-v2/src/lib/components/popover | sort -u | wc -l | tr -d ' '` → /^3$/
    5. Документы не называют класс листа
       Check: `set -o pipefail; cat projects/ui-kit-v2/src/lib/components/popover/Overview.mdx docs/specs/ui-kit-v2/popover-sheet/implementation.md | grep -c 'RtPopoverSheetComponent' || true` → /^0$/
    6. Спеки popover, меню и вкладок зелёные
       Check: `set -o pipefail; grep -rq 'SC-UKV-1782' projects/ui-kit-v2/src/lib/components/popover && FORCE_COLOR=0 pnpm exec nx test @rt-tools/ui-kit-v2 --testFile='components/(popover|menu|tabs)/' --output-style=stream --skip-nx-cache --no-colors 2>&1 | grep 'Tests:'` → /Tests:\s+(\d+ skipped, )?\d+ passed, \d+ total/
    7. Собранная точка popover не определяет класс листа, ровно один другой файл определяет
       Check: `set -o pipefail; pnpm exec nx build @rt-tools/ui-kit-v2 --skip-nx-cache >/dev/null 2>&1 && pnpm run build:tokens-v2 >/dev/null 2>&1 && echo "$(grep -c 'class RtPopoverSheetComponent' dist/ui-kit-v2/fesm2022/rt-tools-ui-kit-v2-popover.mjs || true) $(grep -l 'class RtPopoverSheetComponent' dist/ui-kit-v2/fesm2022/*.mjs | wc -l | tr -d ' ')"` → /^0 1$/
    8. Сторож не считает ленивый кусок частью кита: его проверки зелёные, среди них один новый случай
       Check: `set -o pipefail; bash tools/tests/check-kit-weight.test.sh 2>&1 | tail -1` → /check-kit-weight: 15 ok, 0 failures/
    9. Порог переписан по измерению: сторож выходит кодом 0, часть popover строго меньше 16473
       Check: `pnpm run check:kit-weight >/dev/null 2>&1 && node -e "console.log(require('./tools/kit-weight-threshold.json').parts.popover < 16473)"` → /^true$/
- **Readiness sign:** лист подгружается при первом открытии, закрытие за время загрузки не оставляет листа, часть popover на старте меньше прежней.
- **Verified by:** спеки трёх компонентов, `pnpm run check:all`, `bash tools/tests/check-kit-weight-live.test.sh`; живая проверка листа в закреплённом Chrome на узком окне: лист выезжает и закрывается, файл листа запрашивается один раз при первом открытии и ни разу до него, с оборванной сетью состояние «открыто» снимается. Порог один файл на ветки эпика: после слияния соседней задачи он пересчитывается командой `--write`.

## What this work does not do

- Не меняет вид и поведение листа, его стили и токены.
- Не трогает часть `bottom-sheet`: она остаётся в наборе как самостоятельная точка входа.
- Не правит приложения-потребители.
- Не возвращает вес 0.51.0: эта задача снимает часть из 8,6 КБ роста части popover, остальное ищут RT-3646…RT-3648.

# Plan

**Task:** RT-3646 · **Branch:** RT-3646-kit-menu-lazy-confirm
**Behaviour:** unchanged — вид и поведение диалога подтверждения не меняются; меняется только то, когда загружается его код: при первом подтверждении пункта меню, а не на старте. Публичный контракт точки `menu` тот же: класс диалога из неё не экспортировался. Слово владельца в эпике RT-3641: «запускай task flow»

## Points

- **A:** часть menu на старте потребителя несёт диалог подтверждения пункта целиком (код, шаблон, стили), хотя подтверждение нужно только пунктам с `confirmMessage` и открывается редко; статический импорт в `rt-menu-item.component.ts` держит его в стартовой связке.
- **This task reaches:** код диалога подтверждения подгружается при первом подтверждении и на старте потребителя не лежит. Пункт с подтверждением открывает диалог как прежде: «Подтвердить» выполняет действие, «Отмена» и закрытие без ответа нет; сбой загрузки куска не оставляет меню в состоянии «жду ответа».
- **Sign:** `pnpm run check:kit-weight` после переписи порога выходит кодом 0, часть `menu` в пороге меньше прежних 39659 не менее чем на 2000 байт, класс диалога определён в отдельном куске, а не в `rt-tools-ui-kit-v2-menu.mjs`. Оценка по сборке даёт 4,5–5,2 КБ, оценка по размеру исходников 1–2 КБ; цифру даёт сторож, и итог называет её как есть, вместе с gzip.
- **Milestone G of the epic:** вес кита под контролем: диалог подтверждения menu не лежит на старте.
- **Metric:** нет: ни правило, ни хук, ни проверка не улучшаются

## Task footprint

| What                 | Where                                                            |
| -------------------- | ---------------------------------------------------------------- |
| Code (правится)      | `projects/ui-kit-v2/src/lib/components/menu/`                    |
| Code (правится)      | `tools/kit-weight-threshold.json`                                |

В папке `menu/` правятся пункт меню, его тесты (`rt-menu.component.spec.ts` ждёт диалог сразу после щелчка) и обёртки витрины, которые открывают подтверждение.

## What counts as done

- Статического импорта `RtMenuConfirmDialogComponent` в `rt-menu-item.component.ts` нет (тип допустим только как `import type`); диалог подгружается ленивым `import()` перед `RtDialogService.open`. Сбой загрузки перехвачен внутри `mergeMap`: он идёт обработчику ошибок, меню получает `#announceConfirm(false)`, подписка живёт и следующее нажатие пробует снова.
- Поведение при двух подтверждениях подряд не меняется (`mergeMap` остаётся); меню, закрытое за время загрузки, остаётся известным ограничением: диалог откроется после прихода кода.
- Тесты `rt-menu-item-confirm-lazy.spec.ts` покрывают: «Подтвердить», «Отмена», закрытие без ответа, повтор (кусок грузится один раз), сбой загрузки и следующая попытка, снос пункта за время загрузки, пункт-ссылку и отключённый пункт (кусок не грузится). Синхронные тесты других файлов меню и обёртки витрины подгружают код диалога до жеста.
- Все тесты кита и снимки витрины по меню зелёные.
- Порог переписан командой `pnpm run check:kit-weight -- --write` по измерению сторожа; перед измерением ветка получила порог соседней задачи, если она уже влита.

## Stages

### 1. Диалог подтверждения menu грузится при первом подтверждении

- **Steps:**
    1. Пункт меню не импортирует диалог подтверждения статически
       Check: `set -o pipefail; grep -E "^import .*rt-menu-confirm-dialog" projects/ui-kit-v2/src/lib/components/menu/rt-menu-item.component.ts | grep -vc "^import type" || true` → /^0$/
    2. Пункт меню грузит диалог ленивым `import()`
       Check: `grep -cE "^[^/]*import\('./rt-menu-confirm-dialog.component'\)" projects/ui-kit-v2/src/lib/components/menu/rt-menu-item.component.ts` → >= 1
    3. Тесты меню зелёные, среди них не меньше шести тестов ленивой загрузки диалога, без пропущенных
       Check: `set -o pipefail; F=projects/ui-kit-v2/src/lib/components/menu/rt-menu-item-confirm-lazy.spec.ts; test "$(grep -cE "^\s*it\(" $F)" -ge 6 && ! grep -qE "it\.skip|xit\(" $F && FORCE_COLOR=0 pnpm exec nx test @rt-tools/ui-kit-v2 --testFile='components/menu/' --output-style=stream --skip-nx-cache --no-colors 2>&1 | grep 'Tests:'` → /Tests:\s+(\d+ skipped, )?\d+ passed, \d+ total/
    4. Все тесты кита зелёные
       Check: `set -o pipefail; test -f projects/ui-kit-v2/src/lib/components/menu/rt-menu-item-confirm-lazy.spec.ts && FORCE_COLOR=0 pnpm exec nx test @rt-tools/ui-kit-v2 --output-style=stream --skip-nx-cache --no-colors 2>&1 | grep 'Tests:'` → /Tests:\s+(\d+ skipped, )?\d+ passed, \d+ total/
    5. Собранная точка menu не определяет класс диалога, ровно один другой файл определяет
       Check: `set -o pipefail; rm -rf dist/ui-kit-v2 && pnpm exec nx build @rt-tools/ui-kit-v2 --skip-nx-cache >/dev/null 2>&1 && pnpm run build:tokens-v2 >/dev/null 2>&1 && echo "$(grep -c 'class RtMenuConfirmDialogComponent' dist/ui-kit-v2/fesm2022/rt-tools-ui-kit-v2-menu.mjs || true) $(grep -l 'class RtMenuConfirmDialogComponent' dist/ui-kit-v2/fesm2022/*.mjs | wc -l | tr -d ' ')"` → /^0 1$/
    6. Порог переписан по измерению: сторож выходит кодом 0, часть menu меньше 39659 не менее чем на 2000
       Check: `pnpm run check:kit-weight >/dev/null 2>&1 && node -e "console.log(require('./tools/kit-weight-threshold.json').parts.menu < 37659)"` → /^true$/
    7. Снимки витрины по меню совпадают, число совпавших снимков не нулевое
       Check: `set -o pipefail; grep -qE "^[^/]*import\('./rt-menu-confirm-dialog.component'\)" projects/ui-kit-v2/src/lib/components/menu/rt-menu-item.component.ts && node tools/visual-gate.mjs ui-kit-v2 'menu' 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep 'Snapshots:'` → /Snapshots:\s+[1-9]\d* passed, [1-9]\d* total/
- **Readiness sign:** диалог подтверждения подгружается при первом подтверждении, часть menu на старте меньше прежней не менее чем на 2000 байт, поведение подтверждения прежнее.
- **Verified by:** тесты кита, снимки витрины по меню (они доказывают вид, а не ленивость: ленивость держат шаги 2, 3 и 5), `pnpm run check:all`; живая проверка пункта с подтверждением в закреплённом Chrome на витрине: диалог открывается, «Подтвердить» и «Отмена» работают, файл диалога запрашивается один раз при первом подтверждении и ни разу до него, размер куска и время при медленной сети записаны отдельной строкой. Порог один файл на ветки эпика: после слияния соседней задачи он пересчитывается командой `--write` до измерения этой.

## What this work does not do

- Не меняет вид, стили и тексты диалога подтверждения.
- Не меняет порядок и число открытых диалогов при двух подтверждениях подряд.
- Не трогает точку `dialog`: она остаётся в наборе самостоятельной частью.
- Не правит приложения-потребители.
- Не возвращает вес 0.51.0 целиком: остальное ищут RT-3647 и RT-3648.

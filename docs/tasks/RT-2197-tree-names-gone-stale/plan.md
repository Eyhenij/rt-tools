# Plan

**Task:** RT-2197 · **Branch:** RT-2197-tree-names-gone-stale
**Epic:** RT-2195 · `docs/plans/tree-tells-truth-about-itself.md`
**Behaviour:** unchanged — правятся подсказки слоя правил и одна настройка; приложений и их
экранов работа не касается

## Task footprint

| What     | Where                                                     |
| -------- | --------------------------------------------------------- |
| Rules    | `.claude/skills/browser-verification/implementation.md`   |
| Settings | `.claude/rt-kit/gate-map.sh`, `.claude/rt-kit/project.sh` |

## What counts as done

- Правка эталона сквозного набора требует правила о кадрах экранов, а правка спеки того же набора
  по-прежнему требует правил о проверках и о браузере.
- Привязки правила о браузере не отрицают наличия приложений и не зовут дерево библиотекой.
- Перечень стендов называет все стенды дерева и говорит, кто его читает.

## Stages

### 1. Карта доводит правило о кадрах до эталонов набора

- **What is done:** ветка о каталоге сквозного набора делится: путь внутри `__snapshots__` уходит
  правилу о кадрах, остальное остаётся при правилах о проверках и о браузере.
- **Readiness sign:** сейчас оба пути дают `testing browser-verification`; после правки эталон даёт
  `ui-component-tests`, а спека — прежнюю пару.
- **Verified by:** `bash -c 'source .claude/rt-kit/gate-map.sh; skill_for edit "$PWD/apps/message-bus-admin-e2e/__snapshots__/chromium/shell-no-sections.png" ""; echo --; skill_for edit "$PWD/apps/message-bus-admin-e2e/src/no-sections.spec.ts" ""'`
  — до черты `ui-component-tests`, после черты `testing` и `browser-verification`.

### 2. Привязки правила о браузере говорят о дереве правду

- **What is done:** строка об отсутствии приложений заменяется перечнем того, что в дереве есть;
  две соседние строки того же возраста — про арендаторов и про отсутствие конвейера — правятся
  тем же заходом.
- **Readiness sign:** в файле не остаётся ни одного утверждения, что дерево держит только
  библиотеки.
- **Verified by:** `grep -c 'no applications at all\|the library has' .claude/skills/browser-verification/implementation.md`
  — сейчас 3, после правки 0.

### 3. Перечень стендов называет стенды дерева

- **What is done:** `RT_STANDS` перечисляет приёмник, админку, стенд сквозного набора и обе
  витрины; рядом комментарием сказано, что читающий её хук здесь не разложен.
- **Readiness sign:** в значении переменной стоят все пять портов дерева.
- **Verified by:** `bash -c 'source .claude/rt-kit/project.sh; printf "%s\n" "$RT_STANDS"'` — в
  строке есть 3000, 4200, 3310, 4310, 6006 и 6007.

## What this work does not do

- Хук `dev-server-guard.sh` здесь не включается: дерево отказалось от него намеренно, и это
  отдельное решение владельца.
- Отправка находок в приём правится задачей RT-2196 того же эпика.
- Пропавший каталог разборов происшествий не восстанавливается: брать запись неоткуда.

# Разбор правил по RT-3645

Разбор закрытой задачи RT-3645 эпика RT-3641 ролью `skill-curator`. Три находки ждут слова владельца: они правят правила пакета и этого дерева.

## 1. Набор перед пушем отказал на грязной копии после записи хука передачи

- **Что случилось.** Хук перед сжатием окна дописал раздел передачи в `progress.md` и оставил его незакоммиченным. Набор отказывает на грязной копии, два запуска ушли впустую.
- **Где не хватило.** Правило `git-workflow-push`, раздел «How the law applies here»: про грязное дерево перед набором нет ни слова.
- **Правка (пакет).** После статьи «The final set before a push is read from the state review…» добавить: «**The set runs on a clean working tree, and a handover section the compaction hook wrote into the progress is committed first.** The hook leaves the section uncommitted by design; the set refuses a dirty copy, and learning it from the refusal costs a whole run. `git status --porcelain` is read right before the set.» В `implementation.md` рядом — строка про `.claude/hooks/handoff-write.sh` и `git status --porcelain`. Прибавка около 330 знаков.

## 2. Файл сценариев дорос до 522 строк, а проверка шага плана называла этот файл

- **Что случилось.** Сценарии 1782…1784 дописаны в `scenarios.md` поддомена `popover-sheet`, предел 500 строк. Набор отказал, пришлось выносить сценарии в новый поддомен и заменять проверку шага 1.4.
- **Где не хватило.** Совет «меряй место до правки» есть в `spec-driven-domain` и `task-flow-close`, но на `docs/specs/*` ворота грузят только `spec-driven`, а в нём его нет. `task-flow-plan` молчит о том, что шаг с проверкой по имени файла не знает, что файл придётся делить.
- **Правка (пакет), два места.** В `spec-driven`: «**The room of a spec file is measured before an edit that appends to it.** Lines against the size limit of the tree; a file that would cross it is split by a commit of its own first, never squeezed after. Scenarios and rules of one domain share the limit with its spec.» В `task-flow-plan`: «**A step check names a file only if the plan's own steps leave it in place.** A step that appends to a file near the size limit lists the split as its own step before it; the check then names the file after the split.» Прибавка около 300 и 280 знаков.

## 3. Десять тестовых файлов других частей кита упали только в наборе перед пушем

- **Что случилось.** Тесты я гонял только по трём папкам (popover, меню, вкладки). Тесты select, autocomplete, multiselect, page-header и toggle-button-group ждали лист сразу и упали в наборе после пяти минут других шагов; потом упал снимок витрины.
- **Где не хватило.** Правило `task-delivery-loop` говорит о живой проверке и наборе один раз, но не требует до второго круга запустить весь тестовый набор проекта, чью публичную точку или общий помощник правили.
- **Правка (дерево).** В `task-delivery-loop` после статьи «The push set runs once per branch…»: «**Before round two the whole test target of every project whose public entry, shared helper or harness changed is run, not the folders of the edit.** `pnpm exec nx test @rt-tools/ui-kit-v2` in the background, the number of passed in the progress. A change to what other parts import fails their tests, and the push set shows it only after the long steps before it.» Прибавка около 420 знаков.

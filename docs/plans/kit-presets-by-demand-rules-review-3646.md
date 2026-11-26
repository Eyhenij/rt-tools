# Разбор правил по RT-3646

Разбор закрытой задачи RT-3646 эпика RT-3641 ролью `skill-curator`. Дополняет `docs/plans/kit-presets-by-demand-rules-review-3645.md`. Четыре находки ждут слова владельца: они правят правила пакета и этого дерева.

## 1. Копия шаблона папки задачи несёт шапку пакета, и первая правка файла отказана

- **Что случилось.** `tools/task-new.mjs` снимает шапку `rt-kit v…` в двух ветках, а в ветке «папка уже на месте» не снимает. Папка, заведённая копией шаблона, оставляла шапку, и первая правка файла отказывала.
- **Где не хватило.** Код: пустая ветка «папка уже есть» в `tools/task-new.mjs`. Правило `task-flow-plan` не говорит, что шапка в файле папки задачи означает ошибку сборки.
- **Правка 1 (дерево, код).** В этой ветке снимать шапку функцией `unstampFolder` и печатать, из каких файлов.
- **Правка 2 (пакет, `task-flow-plan`).** «**A file of a task folder carries no layout header.** The header belongs to the sample. A copy with it refuses its first edit. The cure is `unstampFolder` over the folder, never an edit of the package sample.»

## 2. Проверка шага плана совпала по подстроке с именем соседнего файла

- **Что случилось.** Проверка шага 1.1 искала строку `rt-menu-confirm-dialog` в импортах и сработала на импорт соседнего файла состояния. Имя файла пришлось менять.
- **Где не хватило.** В статье `task-flow-plan` о проверке у каждого шага нет требования называть целое имя или целую строку.
- **Правка (пакет, `task-flow-plan`).** «**A step check matches a whole name or a whole line, never a substring.** `grep -c name` also counts the neighbour whose name contains it. The check names the path with its extension. It is run once against the tree while the plan is written, together with the file it must not match.»

## 3. Порог веса при слиянии базы

- **Что случилось.** `tools/kit-weight-threshold.json` правят все ветки эпика. Конфликт в нём после слияния чужой ветки решается не чтением, а пересчётом командой `--write`; это делалось по памяти.
- **Где не хватило.** В `git-workflow-merge` среди проверок после разрешения нет класса «файл-измерение». `task-delivery-loop` не говорит, что порог пересчитывается один раз, после слияния базы и до набора.
- **Правка 1 (дерево, `task-delivery-loop`).** «**A threshold file is never merged by hand.** After the base is merged, the build is redone and the threshold is rewritten by its own command, once, before the push set.» Ворота: правка `tools/*-threshold.json` требует `task-delivery-loop`.
- **Правка 2 (пакет, `git-workflow-merge`).** «A file that holds a measurement of the tree is not resolved by reading the conflict. It is taken from the base, and the command that wrote it is run again on the merged tree.»

## 4. Тест приложения-потребителя упал только в круге ревью

- **Что случилось.** Тест приложения нажимает на пункт меню с подтверждением и сразу ищет диалог. Он упал только после стратега второго круга: он стоит в другом проекте и не входит в тесты кита. Дополняет находку 3 разбора по RT-3645.
- **Где не хватило.** `task-delivery-loop` и `task-delivery-loop-run` не называют зависимые проекты.
- **Правка (дерево, `task-delivery-loop`; объединить со статьёй из разбора RT-3645).** «**Before round one the tests of every project the change reaches are run, consumers included.** `pnpm exec nx affected -t test --base=<epic branch>` lists them. A consumer that clicks and looks for the result at once fails when the code behind it becomes lazy.» В `task-delivery-loop-run` добавить команду запуска в фоне.

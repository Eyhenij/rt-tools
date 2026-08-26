# Чем исполняется — снимки витрины

Первая колонка — правило спека рядом дословно. Вторая — где оно исполняется в дереве; там же
назван сценарий, которым это проверяется, а чем именно покрыт каждый сценарий, сказано в
`scenarios.md`.

Правило без строки и строка без правила — расхождение: спек обещает то, чего в дереве нет, либо
в дереве стоит то, о чём спек молчит.

- **У каждого кита своя обвязка снимков и свой каталог эталонов.** — `projects/ui-kit-v2/.storybook/test-runner.ts:SNAPSHOT_DIR` — своя обвязка и свой каталог; общего файла с первым китом нет; сценарий `SC-UKV-07`
- **Снимается всё, кроме помеченного исключением.** — `projects/ui-kit-v2/src/showcase/story-snapshot.ts:storySnapshotSkip`, ранний выход `projects/ui-kit-v2/.storybook/test-runner.ts:postVisit`; сценарий `SC-UKV-02`
- **Исключение без причины роняет прогон.** — `projects/ui-kit-v2/.storybook/test-runner.ts:preVisit`; сценарий `SC-UKV-11`
- **Эталон, которому нет истории, роняет прогон.** — `projects/ui-kit-v2/.storybook/test-runner.ts:remember`, `tools/visual-snapshots-v2.mjs:requireNoOrphans`; сценарий `SC-UKV-12`
- **Кадр берётся по корню показа, а не всей страницей.** — `projects/ui-kit-v2/src/showcase/story-snapshot.ts:STORY_SNAPSHOT_ROOT_ATTRIBUTE`, `projects/ui-kit-v2/.storybook/test-runner.ts:shoot`; сценарий `SC-UKV-13`
- **Кадр целой страницы снимается раздвинутым до неё окном, а не съёмкой за пределы окна.** — `projects/ui-kit-v2/.storybook/test-runner.ts:fitViewportToPage`, параметр объявлен `projects/ui-kit-v2/src/showcase/story-snapshot.ts:IStorySnapshotParameters`; сценарий `SC-UKV-57`
- **Кадр порога берётся на каждом пороге, который называет сам компонент.** — `projects/ui-kit-v2/src/showcase/story-snapshot.ts:storySnapshotWidths`; сценарий `SC-UKV-03`
- **Кадр порога снимается на той стороне порога, которую медиазапрос включает.** — `projects/ui-kit-v2/src/showcase/story-snapshot.ts:storyWidthAtMost`, `projects/ui-kit-v2/src/showcase/story-snapshot.ts:storyWidthOver`; сценарий `SC-UKV-03`
- **Кадр детерминирован: две съёмки подряд без правок сходятся.** — `projects/ui-kit-v2/.storybook/snapshot-wait.ts:quiet`; сценарий `SC-UKV-06`
- **Упавшая история не переснимается повторно.** — `tools/visual-snapshots-v2.mjs:runnerArgs` — признака повторов у прогона нет вовсе; сценарий `SC-UKV-19`
- **Состояние, до которого кадр не дошёл, роняет прогон, а не попадает в эталон.** — `projects/ui-kit-v2/.storybook/test-runner.ts:requireOpenedOverlay`, `projects/ui-kit-v2/src/showcase/story-overlay.ts:openStoryOverlay`; сценарий `SC-UKV-04`
- **Отсутствующий эталон — отказ прогона, а не молчаливая досъёмка.** — `projects/ui-kit-v2/.storybook/test-runner.ts:UPDATING`; сценарий `SC-UKV-05`
- **Эталон снимается с починенного.** — `.claude/skills/ui-component-tests-visual/SKILL.md:parameters` — правило разбора изменения; прогоном не проверяется; сценарий `SC-UKV-14`
- **Порог расхождения назван замером, а не перенесён из первой витрины.** — `projects/ui-kit-v2/.storybook/test-runner.ts:FAILURE_THRESHOLD`; сценарий `SC-UKV-15`
- **Эталон снимается и сверяется в одной среде.** — `tools/visual-snapshots-v2.mjs:CONFIG_DIR` — одна обвязка на сверку и обе пересъёмки; сценарий `SC-UKV-16`
- **Разошедшийся кадр отдаёт картинку различий, и она не едет в репозиторий.** — `.github/workflows/ci.yml:visual-diffs-ui-kit-v2`, маска каталога различий в `.gitignore:__diff_output__`; сценарий `SC-UKV-08`
- **Красный кадр не вливается.** — `.github/workflows/ci.yml:STORYBOOK_URL` — шаг блокирующий, без `continue-on-error`; сценарий `SC-UKV-10`
- **Компонент, приехавший в витрину после этой работы, привозит свой эталон тем же изменением.** — `projects/ui-kit-v2/.storybook/test-runner.ts:shoot` — отказ при отсутствующем эталоне; сценарий `SC-UKV-10`
- **Пересъёмка идёт по названной истории.** — `tools/visual-snapshots-v2.mjs:updateOne`; пересъёмка каталога — `tools/visual-snapshots-v2.mjs:updateAll`; сценарий `SC-UKV-20`
- **Язык подписей в кадре один и назначен обвязкой.** — `projects/ui-kit-v2/.storybook/preview.ts:showcaseTranslator`; сценарий `SC-UKV-17`
- **Тема матрицы одна и назначена обвязкой.** — `projects/ui-kit-v2/src/showcase/story-themes.component.ts:StoryThemesComponent`; сценарий `SC-UKV-09`
- **Пустой показ эталоном не становится.** — `projects/ui-kit-v2/src/lib/components/bar-list/stories/bar-list.stories.ts:storySnapshotSkip` и ещё семнадцать таких пометок; сценарий `SC-UKV-14`
- **Число историй, открытых разом, задаёт прогон, а не машина.** — `tools/visual-snapshots-v2.mjs:MAX_WORKERS`; сценарий `SC-UKV-06`
- **Готовность значка проверяется нарисованным значком, а не признаком загрузки.** — `projects/ui-kit-v2/.storybook/snapshot-wait.ts:drawnIcons` — значок ищется по ссылке в набор, `projects/ui-kit-v2/.storybook/snapshot-wait.ts:ICON_USE_SELECTOR`; сценарий `SC-UKV-06`
- **Прогон отказывает, если по названному адресу не та витрина.** — `tools/visual-snapshots-v2.mjs:requireOwnShowcase`; сценарий `SC-UKV-18`
- **Компонент, чья начинка приезжает позже, объявляет недостроенность сам, а съёмка её ждёт.** — `projects/ui-kit-v2/.storybook/snapshot-wait.ts:PENDING_SELECTOR` и `projects/ui-kit-v2/src/lib/components/rich-editor/rt-rich-editor.component.ts:mounted`; сценарий `SC-UKV-53`
- **История, показывающая раскрытую панель, называет её узел, и уход указателя на её странице заглушён.** — `projects/ui-kit-v2/.storybook/test-runner.ts:freezeHover` и `requireOpenedOverlay` там же; параметр объявлен `projects/ui-kit-v2/src/showcase/story-snapshot.ts:IStorySnapshotParameters`; сценарий `SC-UKV-54`

# Grill

## The owner request

> В корне @rt-tools/ui-kit-v2@0.23.0 из npm лежит файл rt-tools-ui-kit-v2-0.23.0.tgz размером
> 2.3 MB. Это архив того же пакета, который случайно попал в публикацию. Похоже, его собрали через
> npm pack в папке сборки и потом опубликовали эту же папку.
>
> - Чем мешает: каждая установка (у разработчиков и в CI) скачивает и хранит лишние 2.3 MB. В бандл
>   приложения файл не попадает, на build и работу приложения не влияет.
> - Что сделать киту: убрать *.tgz из публикации (через files или .npmignore) в следующей версии.

> Заведи ветку, карточку и быстро исправляй.

## What the tree already has

- Every `packagr:*` script in the root `package.json` runs `npm pack` and then `npm publish` in
  the build folder. `npm pack` writes the archive into that folder, and `npm publish` then packs the
  folder with the archive inside. Six packages are built this way: core, store, utils, agent-kit,
  ui-kit, ui-kit-v2.
- The publish workflows call these scripts after the build; the build clears the folder first, so
  each release carries exactly one archive.

## Decisions

- **Drop `npm pack` from all six scripts** — the archive it writes is used by nothing: `npm publish`
  packs the folder on its own. Rejected: a `files` list or `.npmignore` in each package — two
  places to keep instead of removing the step that creates the file.

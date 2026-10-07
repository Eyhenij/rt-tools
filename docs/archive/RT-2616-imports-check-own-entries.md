# Grill

Task RT-2616 · the request — the red run of the pipeline after the merge of #2614 ·

## The owner request

> пиздуй смотри https://github.com/Eyhenij/rt-tools/actions/runs/37618559005/job/112782754431

## What the tree already has

- Шаг «Imports against published neighbours» гоняет `tools/check-package-imports.mjs`. Символ,
  который есть в исходниках соседа и не выпущен, сверка называет ждущим выпуска и не роняет.
- После #2614 корень `ui-kit-v2` переотдаёт входы строкой `export * from '@rt-tools/ui-kit-v2/<вход>'`,
  а сверка раскрывала только относительные пути. `RtDotFieldComponent` из `auth-keycloak-theme`
  стал «пропавшим», и шаг упал.

## Decisions

- **Вход того же пакета раскрывается по его описанию.** У выпущенного пакета — карта `exports`
  манифеста, в исходниках — `ng-package.json` каталога входа. Строгий режим выпуска читает те же
  типы выпущенного пакета, и без этого он упал бы на первой версии кита с точками входа.

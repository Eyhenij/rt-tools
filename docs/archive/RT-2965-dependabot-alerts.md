# RT-2965 — алерты Dependabot по транзитивным зависимостям

Ветка `RT-2965-dependabot-alerts`, отведена от `main`. Папка задачи разобрана в эту запись.

## Просьба владельца

> изучи https://github.com/Eyhenij/rt-tools/security и исправь все проблемы

## Что было

- На вкладке Security 28.10.2026 было открыто 33 алерта Dependabot. Анализа code scanning нет,
  алертов о секретах нет.
- 31 алерт относился к транзитивным пакетам, у которых есть исправленная версия: undici 7 и 8,
  vite 8.3.0, launch-editor, follow-redirects, fast-uri, multer, body-parser 2, qs и
  serialize-javascript.
- Ещё 3 алерта — quill 2.0.3 (XSS в HTML-экспорте, две записи одного бюллетеня) и deepmerge 4.3.1
  (порча прототипа в `mergeObject()`). Исправленной версии у них нет.

## Решения

- **Версии подняты строками `overrides` в `pnpm-workspace.yaml`**, так же, как в RT-2823.
  Родительские пакеты держат старые версии, и `pnpm install` сам их не поднимает.
- **vite закреплён строкой `vite@8`, @angular/build не поднимался.** Версия 22.2.5 с vite 8.3.5
  вышла в день работы и младше срока ожидания.
- **Алерты quill и deepmerge остаются открытыми.** Вопрос владельцу: «Что сделать с 3 алертами
  quill и deepmerge на GitHub?», варианты «Отклонить с причиной (Recommended)» и «Оставить
  открытыми». Ответ: «Оставить открытыми». HTML-экспорт Quill (`getSemanticHTML`) в дереве не
  вызывается, а `rt-delta-view` строит узлы без `innerHTML`.

## Чем подтверждено

- В lockfile нет ни одной версии из уязвимых диапазонов. Получилось: undici 7.30.1 и 8.12.3,
  vite 8.3.5, launch-editor 2.14.2, follow-redirects 1.16.2, fast-uri 3.1.9, multer 2.5.0,
  body-parser 2.4.0, qs 6.17.0, serialize-javascript 7.1.4.
- `pnpm install --frozen-lockfile` — «Already up to date».
- `pnpm run check:all` — exit 0, 358 из 358 задач nx и stylelint без замечаний.

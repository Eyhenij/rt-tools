# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — Метка @Service для синглтонов
- **Done:** все четыре шага этапа; живая проверка в витрине и на стенде панели
- **Next step:** первый круг ревью
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Правило линтера принимает метку Service
- [x] 1.2 Классы шестидесяти файлов помечены Service
- [x] 1.3 Образцы правил и README учат Service
- [x] 1.4 Порог записан, снимки витрины прежние, тесты, линт, типы и сборка затронутых проектов зелёные

## Decisions along the way

## Sessions

### 23.11.2026

- Задача взята по просьбе эпика. План прочитан стратегом и критиком цели до одобрения: признак
  шага 1 запускал спек флагом, которого нет у vitest; сборки не было в признаке; образец
  `entity-store` перевёлся бы на общее хранилище. Всё поправлено до одобрения.
- Живая проверка, витрина на порту 6007: боковая панель фильтров открылась через сервис панели и
  вернула фокус по Escape; тема переключилась с тёмной на светлую; тост показан шиной уведомлений
  (стопка 0 → 1); ошибок в консоли 0.
- Живая проверка, стенд панели на порту 4310 после входа: списки «Разборы происшествий»,
  «Предложения» (6 строк), «Сводки проектов» (3), «Использование» (2) открылись, заголовок вкладки
  у каждого «<раздел> · Приёмник»; карточка разбора открылась по строке списка; ошибок в консоли 0.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3485-ngdoctor-service-decorator

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — Метка @Service для синглтонов
- **Next step:** правило линтера принимает метку `@Service`
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3485-ngdoctor-service-decorator/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-3485-ngdoctor-service-decorator/progress.md
```

### Commits over the main branch

```
dd95f3f72 chore(rt:ui-kit-v2): порог Angular Doctor без находок о метке @Service (RT-3485)
5459724bd chore(rt:ui-kit-v2): синглтоны помечены @Service вместо @Injectable с корнем (RT-3485)
e5b1c7bf9 docs(rt:ui-kit-v2): прогресс RT-3485 — план одобрен, этап начат (RT-3485)
be16faa63 docs(rt:ui-kit-v2): план RT-3485 — @Service для синглтонов, сборка в признаке (RT-3485)
e8bd0907a docs(rt:ui-kit-v2): разбор RT-3485 — @Service вместо @Injectable для синглтонов (RT-3485)
1f68c0af6 docs(rt:ui-kit-v2): находки ревью правил по RT-3484 рядом с планом эпика (RT-3485)
40d5f040b docs(rt:ui-kit-v2): записи архива старше недели удалены (RT-3484)
78624b97a Merge remote-tracking branch 'origin/RT-3476-angular-doctor' into RT-3484-ngdoctor-document-image
6729c3e1c Merge remote-tracking branch 'origin/main' into RT-3476-angular-doctor
124defd52 docs(rt:ui-kit-v2): папка задачи RT-3484 разобрана в архивную запись (RT-3484)
5fa92022f chore(rt:ui-kit-v2): правки после второго круга ревью (RT-3484)
8dcc72bed chore(rt:ui-kit-v2): правки после первого круга ревью (RT-3484)
45353b927 docs(rt:ui-kit-v2): живая проверка RT-3484 в витрине (RT-3484)
8c841b25b docs(rt:ui-kit-v2): четвёртая оговорка вехи эпика — картинки уходят в эпик RT-3561 (RT-3484)
dd4c18aa4 chore(rt:ui-kit-v2): порог Angular Doctor без находок о document и с одиннадцатью картинками (RT-3484)
8d3530681 chore(rt:ui-kit-v2): поле #doc, токен DOCUMENT вместо глобального document, примеры без картинок (RT-3484)
120174b4a docs(rt:ui-kit-v2): прогресс RT-3484 — шаги этапа (RT-3484)
14be55ac3 docs(rt:ui-kit-v2): прогресс RT-3484 — план одобрен, этап начат (RT-3484)
0ed4f0338 docs(rt:ui-kit-v2): план RT-3484 — токен DOCUMENT, картинки с причинами (RT-3484)
9629e41f6 docs(rt:ui-kit-v2): находки ревью правил по RT-3526 рядом с планом эпика (RT-3484)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.

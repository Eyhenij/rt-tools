# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — Токен DOCUMENT и картинки с известным размером
- **Done:** план одобрен словом «Одобряю plan.md RT-3484»; plan-red: 1.1 → 29, 1.2 → 13, 1.3 → red
- **Next step:** переименование `#document` → `#doc` и пять глобальных `document`
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [>] 1.1 Поле #document переименовано, пять глобальных document берут токен DOCUMENT
- [ ] 1.2 Примеры в комментариях без тега img
- [ ] 1.3 Порог записан, снимки витрины прежние, тесты, линт и типы затронутых проектов зелёные

## Decisions along the way

## Sessions

### 23.11.2026

- Задача взята по просьбе эпика. Вопрос «вид не меняется» был лишним — разбор инцидента отправлен
  в приёмник.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3484-ngdoctor-document-image

### Where we stand at the minute of the compaction

- **State:** `замысел-записан`
- **Stage:** 1 of 1 — Токен DOCUMENT и картинки с известным размером
- **Next step:** переименование `#document` → `#doc` и пять глобальных `document`
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3484-ngdoctor-document-image/progress.md`; the plan lies next to it.

### Uncommitted

```
 M libs/message-bus-admin/common/core/util/src/lib/admin-locale.ts
 M projects/auth-angular/src/lib/auth.service.ts
 M projects/auth-keycloak-theme/src/login/shell/rt-kc-root.component.ts
 M projects/cms-angular/admin/src/lib/editor/cms-editor-block/cms-editor-block.component.ts
 M projects/cms-angular/admin/src/lib/editor/cms-editor/cms-editor.component.ts
 M projects/ui-kit-v2/src/ai-chat-chart/lib/components/block/rt-ai-chat-chart.component.ts
 M projects/ui-kit-v2/src/ai-chat-chart/lib/components/dialog/rt-ai-chat-chart-dialog.component.ts
 M projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.ts
 M projects/ui-kit-v2/src/lib/components/aside/rt-aside.service.ts
 M projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.ts
 M projects/ui-kit-v2/src/lib/components/dialog/rt-dialog.service.ts
 M projects/ui-kit-v2/src/lib/components/drawer/rt-drawer.component.ts
 M projects/ui-kit-v2/src/lib/components/icon/rt-icon-font.service.ts
 M projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts
 M projects/ui-kit-v2/src/lib/components/image-cropper/stories/component/test-image-cropper.component.ts
 M projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts
 M projects/ui-kit-v2/src/lib/components/pdf-viewer/rt-pdf-viewer.component.ts
 M projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts
 M projects/ui-kit-v2/src/lib/platform/theme.service.ts
```

### Commits over the main branch

```
120174b4a docs(rt:ui-kit-v2): прогресс RT-3484 — шаги этапа (RT-3484)
14be55ac3 docs(rt:ui-kit-v2): прогресс RT-3484 — план одобрен, этап начат (RT-3484)
0ed4f0338 docs(rt:ui-kit-v2): план RT-3484 — токен DOCUMENT, картинки с причинами (RT-3484)
9629e41f6 docs(rt:ui-kit-v2): находки ревью правил по RT-3526 рядом с планом эпика (RT-3484)
0ee2127c6 docs(rt:ui-kit-v2): разбор RT-3484 — токен DOCUMENT и картинки с известным размером (RT-3484)
4ac4d88d0 [RT-3526] Проверка Angular Doctor судит поле angularDoctor в package.json (#3556)
2426c1688 docs(rt:ui-kit-v2): папка задачи RT-3526 снова разобрана, запись называет замену проверки шага (RT-3526)
4aed76e77 docs(rt:ui-kit-v2): прогресс RT-3526 — замена проверки шага 1.1 на «>= 5» (RT-3526)
fa56329fd docs(rt:ui-kit-v2): находка ревью правил называет ресурс пакета словами (RT-3526)
86c0b0b90 docs(rt:ui-kit-v2): папка задачи RT-3526 разобрана в архивную запись (RT-3526)
35febc324 chore(rt:ui-kit-v2): правки после второго круга ревью (RT-3526)
d1d442a12 chore(rt:ui-kit-v2): правки после первого круга ревью (RT-3526)
0f8cda869 Merge remote-tracking branch 'origin/RT-3476-angular-doctor' into RT-3526-ngdoctor-config-package-field
f89103378 docs(rt:ui-kit-v2): строка RT-3483 в плане эпика — готово, PR влит (RT-3526)
c2506116b docs(rt:ui-kit-v2): живая проверка RT-3526 на копии дерева (RT-3526)
1d5b1421c chore(rt:ui-kit-v2): проверка Angular Doctor судит поле angularDoctor в package.json (RT-3526)
95c402dac docs(rt:ui-kit-v2): находки ревью правил по RT-3525 рядом с планом эпика (RT-3526)
96df3b176 docs(rt:ui-kit-v2): план RT-3526 — поле angularDoctor судится как файл настройки (RT-3526)
21f58d357 docs(rt:ui-kit-v2): разбор RT-3526 — поле angularDoctor судится как файл настройки (RT-3526)
c850e5f87 [RT-3525] Проверка Angular Doctor видит потерянный package.json и файл стилей (#3533)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.

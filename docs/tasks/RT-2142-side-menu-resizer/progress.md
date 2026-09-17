# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 5 — События наружу о начале и конце тяги
- **Done:** этап 1 закрыт — тяга идёт указательными событиями с захватом на ручке, перо и палец
  тянут край наравне с мышью, отнятый средой указатель кончает тягу. Механика вынесена в
  `side-menu.logic.ts`, компонент вернулся под предел в 500 строк. Статья и два сценария записаны
  в описание домена.
- **Next step:** два выхода наружу — начало и конец тяги.
- **Uncommitted:** папка задачи, правки кита, описание домена.
- **Waiting for the owner:** нет.
- **PR:** not open yet

## Decisions along the way

- **Запрет эпика на правку первого кита снят словом владельца** — «делай по порядку», сказано в
  ответ на порядок, где эта задача стояла первой с прямым вопросом о ней. Affected stage of the
  plan: —.

- **Договорённость пишется прямо в описание домена, черновика не заводится** — у бокового меню
  описание есть, `docs/specs/ui-kit/side-menu/`, префикс сценариев `SC-UK`, свободные номера с 69.
  Статьи и сценарии правятся тем же этапом, что и код, который их держит. Строка `**Spec:**`
  вписана в шапку плана по отказу проверки хода работ: запрет на правку плана держит этапы, а не
  шапку. Affected stage of the plan: 1–4.

## Sessions

### 2026-09-17

- Отправная точка: `pnpm exec nx test @rt-tools/ui-kit --testFile=…/rtui-side-menu.component.spec.ts`
  — 39 из 39 зелёные.
- **Этап 1 сделан.** Тяга переведена с `mousedown` и слушателей на документе на `pointerdown` с
  захватом указателя и слушателями на самой ручке; добавлен `pointercancel`. Механика уехала в
  `startSubMenuWidthDrag` рядом с прочей логикой меню — компонент перевалил за предел в 500 строк,
  и туда же уехал замер нарисованной ширины. Сценарии тяги вынесены в свой файл проверок
  `rtui-side-menu.resizer.spec.ts` по той же причине; двойник `PointerEvent` встал в стенд — среда
  проверок знает только `MouseEvent`.
  Проверено: `pnpm exec nx test @rt-tools/ui-kit --testFile=src/lib/ui-kit/side-menu/` — 105 из 105
  зелёные (было 39 в одном файле, стало 105 в пяти: счёт по папке целиком). `pnpm exec nx lint
@rt-tools/ui-kit` — чисто. `npm run check:specs` — код выхода 0, SC-UK-69 и SC-UK-70 закрыты
  проверками.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2142-side-menu-resizer

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 5 — Тяга на указательных событиях с захватом
- **Next step:** перевести тягу на `pointerdown` с захватом указателя.
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2142-side-menu-resizer/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-2142-side-menu-resizer/plan.md
```

### Commits over the main branch

```
9804382c8 docs(rt:ui-kit): папка задачи о ручке ширины подменю заведена, план записан
2e3c5cd41 docs(rt:ui-kit-v2): в плане эпика записано, за чем на деле стоит задача о значке
f46a2d391 test(rt:ui-kit-v2): эталоны витрины эпика пересняты браузером образа
e8f36806a Merge remote-tracking branch 'origin/main' into RT-1870-one-kit
45bd9b771 docs(rt:ui-kit-v2): снимок хода работы обновлён хуком перед сжатием контекста
bbb74ee2f docs(rt:ui-kit-v2): ход эпика выправлен по сегодняшним слияниям
45b5400f2 docs(rt:ui-kit): замер потребителя о трёх дефектах закреплённой панели первого кита
d216fd2ef [RT-2172] Стрелка на кнопке указателя смотрит по состоянию списка (#2173)
ad19db5d3 docs(rt:ui-kit-v2): задача про стрелку внесена в план эпика строкой 7.4
2d2cb4c04 fix(rt:ui-kit-v2): в ветку эпика приходит лечение кадров вместо ошибочного возврата
6048674b5 docs(rt:ui-kit-v2): папка задачи про стрелку разобрана, запись в архиве
440674b93 feat(rt:ui-kit-v2): обе стороны стрелки указателя попали в кадры витрины
4dccd928d docs(rt:ui-kit-v2): папка задачи про стрелку заведена, замысел записан
03310a16c fix(rt:ui-kit-v2): стрелка в показе указателя смотрит по состоянию списка
b98da5257 [RT-2165] Кадры витрины перестали разъезжаться между её поднятиями (#2168)
9fc35022c docs(rt:ui-kit-v2): в записи архива дописано, чем расходятся кадры главной ветки
97f491df2 docs(rt:ui-kit-v2): задача про кадры витрины внесена в план эпика строкой 7.3
dbafeb360 Merge branch 'RT-1870-one-kit' into RT-2165-showcase-font-from-machine
9a4ee5ee0 docs(rt:ui-kit-v2): в состоянии работы эпика записан следующий шаг после влития главной
fe67fcbbb test(rt:ui-kit-v2): убран эталон без стори, пришедший с главной веткой
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.

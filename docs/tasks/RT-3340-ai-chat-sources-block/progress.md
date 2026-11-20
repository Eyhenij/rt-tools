# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 из 5 — Витрина и сверка с макетом (этап 3 закрыт: компонент, событие, подписи, спеки)
- **Done:** задача взята (исполнитель `rt-tools-dev`, карточка в «In progress», ветка `RT-3340-ai-chat-sources-block` от ветки RT-3339, цепочка, PR #3447). Разведка сделана, `grill.md` записан, договорённость написана `spec-writer` (46 правил, сценарии SC-UKV-1541…1559) и ждёт `spec-critic`, план записан.
- **Next step:** этап 4, шаг 4 — показать витрину владельцу и записать слово в approvals.md. Потом этап 5.
- **Uncommitted:** строки договорённости и этого файла
- **Waiting for the owner:** слово «Одобряю витрину»; ховер и фокус переделаны по его замечанию (подложка на всю строку, кольцо внутрь), кадры макета перерисованы, наложение 4,90%
- **PR:** не открыт; PR эпика #3438 влит в main 20.11.2026, main слит в ветку, база PR — `main`

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write the lenient data function of a sources block in `sources-data.ts` next to `link-data.ts`: `items` as a list, a source with a trimmed title, a detail, an icon with `file` by default and an address, a source without a title dropped.
- [x] 1.2 Write the JSON schema of the block in `sources.schema.ts`, export both from the util barrel and add the schema to `OWN_SCHEMAS` of the section schema.
- [x] 1.3 Write the specs of the data function and the schema with the scenario numbers of the agreement: SC-UKV-1548, 1549, 1550, 1551, 1553.
- [x] 2.1 Read the kit copy in the second file for the components the block takes: the expansion panel header, the icon, the text styles.
- [x] 2.2 Draw the frame of the sources block from kit instances: one and five sources, collapsed and expanded, a pressable and a plain source, a long title, at 328, 386 and 640, and dark at 328.
- [x] 2.3 Measure the frames by node coordinates and show them to the owner.
- [x] 2.4 Write the owner's word into `approvals.md` and add the rules of the drawn values to the agreement.
- [x] 3.1 Add the `SourcesBlock` type, the `sources` view, the `SourceOpen` event type, `sources` in `OWN_TYPES`, the data step in `toBlockViews` and the copy lines in `leafText`.
- [x] 3.2 Write the `rt-ai-chat-sources` component on `rt-expansion-panel` and `rt-icon`: the header with the label and the count, the rows, the pressable rows as buttons, the numbers of the approved mockup.
- [x] 3.3 Carry the press through `rt-ai-chat-blocks` and the answer to a synchronous `sourceOpen` output of `rt-ai-chat` that adds the message id.
- [x] 3.4 Add the label «Sources» to the kit English set and the showcase Russian set.
- [x] 3.5 Write the specs of the component, the logic, the copy and the chat output: SC-UKV-1541, 1542, 1543, 1544, 1545, 1546, 1547, 1552, 1554, 1555, 1556, 1557.
- [x] 4.1 Write the stories of the block with one and with five sources, the states, the long texts, the right-to-left and the dark theme, with play steps that press and measure.
- [x] 4.2 Write the overview page of the block with the handler code of an application and the chat overview lines for `sourceOpen`.
- [x] 4.3 Run the stories in the showcase and measure them against the mockup by two independent readings; write the table in the progress.
- [x] 4.4 Show the showcase to the owner and write their word into `approvals.md`.
- [x] 5.1 Run the first review round with three roles, check every finding against the code and fix the confirmed ones as one commit.
- [x] 5.2 Run the second round and fix the same way.
- [>] 5.3 Merge the agreement into `docs/specs/ui-kit-v2/ai-chat-sources/` with its bindings and edit the chat spec and the indexes.
- [ ] 5.4 Bring `CONTEXT.md` of the chat up to the block and the output.
- [ ] 5.5 Mark the row of the epic plan, write the archive record and take the task folder apart.
- [ ] 5.6 Run the push set, push and open the PR.

## Decisions along the way

- **Вопросы разбора закрыты допущением.** Владелец дважды подряд брал рекомендованное и велел «делай эпик дальше».
- **Открытые вопросы договорённости Q-1…Q-3 не блокируют работу.** Q-1 (шапка копии) закрыта допущением «Sources, табуляция, число»; Q-2 (набор значков) не меняется; Q-3 закроет макет.

## Sessions

### 20.11.2026

- Разведка по блоку `link` и `rt-expansion-panel`: места правки найдены, значки проверены по набору кита.
- Набор перед push RT-3339 дважды падал на открытии страниц витрины при нагрузке машины и один раз на порту базы e2e, совпавшем с главной копией; третий и пятый запуски зелёные.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/ai-chat-blocks
**Branch:** RT-3340-ai-chat-sources-block

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 4 из 5 — Витрина и сверка с макетом (этап 3 закрыт: компонент, событие, подписи, спеки)
- **Next step:** этап 4, шаг 4 — показать витрину владельцу и записать слово в approvals.md. Потом этап 5.
- **PR:** не открыт; база — `RT-3339-ai-chat-link-block` (PR #3447 ждёт слияния в ветку эпика)

The progress in full — `docs/tasks/RT-3340-ai-chat-sources-block/progress.md`; the plan lies next to it.

### Uncommitted

```
 M projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/sources/rt-ai-chat-sources.component.scss
```

### Commits over the main branch

```
97477a610 feat(rt:ui-kit-v2): истории и страница обзора блока источников (RT-3340)
6c360ea3e feat(rt:ui-kit-v2): блок источников в ответе чата и событие нажатия (RT-3340)
658d318b1 docs(rt:ui-kit-v2): макет блока источников одобрен (RT-3340)
6eac865ce feat(rt:ui-kit-v2): данные и схема блока источников (RT-3340)
8f15f678a docs(rt:ui-kit-v2): договорённость и план блока источников (RT-3340)
0ba332c88 docs(rt:ui-kit-v2): разбор задачи блока источников и находки RT-3339 (RT-3340)
abceef399 docs(rt:ui-kit-v2): папка задачи карточки ссылки разобрана (RT-3339)
a19a5fb32 fix(rt:ui-kit-v2): карточка ссылки после второго круга ревью (RT-3339)
770cd83a2 fix(rt:ui-kit-v2): карточка ссылки после первого круга ревью (RT-3339)
bb120577e docs(rt:ui-kit-v2): одобрение витрины карточки ссылки (RT-3339)
71571d2fd docs(rt:ui-kit-v2): сверка витрины карточки ссылки с макетом (RT-3339)
32f03344d feat(rt:ui-kit-v2): истории и страница обзора карточки ссылки (RT-3339)
c0864d598 feat(rt:ui-kit-v2): карточка ссылки в ответе чата и событие нажатия (RT-3339)
212421024 feat(rt:ui-kit-v2): блок ссылки в модели чата и в логике ленты (RT-3339)
db78420f3 feat(rt:ui-kit-v2): данные и схема блока ссылки на страницу (RT-3339)
bc1088482 chore(rt:ui-kit-v2): ветка эпика влита в ветку задачи (RT-3339)
869349424 [RT-3342] Блок секции и сетка составного ответа (#3437)
bc0febefa chore(rt:ui-kit-v2): главная ветка влита повторно, номера сценариев разведены (RT-3342)
2bd4be248 chore(rt:ui-kit-v2): главная ветка влита в ветку задачи (RT-3342)
a174a2147 docs(rt:ui-kit-v2): макет секции сведён с витриной, совпадение 24 из 24 (RT-3342)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.

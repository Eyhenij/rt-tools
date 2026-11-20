# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 из 5 — Данные блока: мягкая функция и схема
- **Done:** задача взята (исполнитель `rt-tools-dev`, карточка в «In progress», ветка `RT-3340-ai-chat-sources-block` от ветки RT-3339, цепочка, PR #3447). Разведка сделана, `grill.md` записан, договорённость написана `spec-writer` (46 правил, сценарии SC-UKV-1541…1559) и ждёт `spec-critic`, план записан.
- **Next step:** этап 1, шаг 1 — функция данных блока `sources-data.ts`; ответ `spec-critic` вносится в договорённость до кода.
- **Uncommitted:** договорённость, план, прогресс
- **Waiting for the owner:** нет
- **PR:** не открыт; база — `RT-3339-ai-chat-link-block` (PR #3447 ждёт слияния в ветку эпика)

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [>] 1.1 Write the lenient data function of a sources block in `sources-data.ts` next to `link-data.ts`: `items` as a list, a source with a trimmed title, a detail, an icon with `file` by default and an address, a source without a title dropped.
- [ ] 1.2 Write the JSON schema of the block in `sources.schema.ts`, export both from the util barrel and add the schema to `OWN_SCHEMAS` of the section schema.
- [ ] 1.3 Write the specs of the data function and the schema with the scenario numbers of the agreement: SC-UKV-1548, 1549, 1550, 1551, 1553.
- [ ] 2.1 Read the kit copy in the second file for the components the block takes: the expansion panel header, the icon, the text styles.
- [ ] 2.2 Draw the frame of the sources block from kit instances: one and five sources, collapsed and expanded, a pressable and a plain source, a long title, at 328, 386 and 640, and dark at 328.
- [ ] 2.3 Measure the frames by node coordinates and show them to the owner.
- [ ] 2.4 Write the owner's word into `approvals.md` and add the rules of the drawn values to the agreement.
- [ ] 3.1 Add the `SourcesBlock` type, the `sources` view, the `SourceOpen` event type, `sources` in `OWN_TYPES`, the data step in `toBlockViews` and the copy lines in `leafText`.
- [ ] 3.2 Write the `rt-ai-chat-sources` component on `rt-expansion-panel` and `rt-icon`: the header with the label and the count, the rows, the pressable rows as buttons, the numbers of the approved mockup.
- [ ] 3.3 Carry the press through `rt-ai-chat-blocks` and the answer to a synchronous `sourceOpen` output of `rt-ai-chat` that adds the message id.
- [ ] 3.4 Add the label «Sources» to the kit English set and the showcase Russian set.
- [ ] 3.5 Write the specs of the component, the logic, the copy and the chat output: SC-UKV-1541, 1542, 1543, 1544, 1545, 1546, 1547, 1552, 1554, 1555, 1556, 1557.
- [ ] 4.1 Write the stories of the block with one and with five sources, the states, the long texts, the right-to-left and the dark theme, with play steps that press and measure.
- [ ] 4.2 Write the overview page of the block with the handler code of an application and the chat overview lines for `sourceOpen`.
- [ ] 4.3 Run the stories in the showcase and measure them against the mockup by two independent readings; write the table in the progress.
- [ ] 4.4 Show the showcase to the owner and write their word into `approvals.md`.
- [ ] 5.1 Run the first review round with three roles, check every finding against the code and fix the confirmed ones as one commit.
- [ ] 5.2 Run the second round and fix the same way.
- [ ] 5.3 Merge the agreement into `docs/specs/ui-kit-v2/ai-chat-sources/` with its bindings and edit the chat spec and the indexes.
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

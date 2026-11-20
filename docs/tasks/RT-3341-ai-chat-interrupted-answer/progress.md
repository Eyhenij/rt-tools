# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — the showcase and the match
- **Done:** ветка от RT-3340, карточка в работе, назначение копии переписано словом владельца «Бери RT-3341»; разведка, разбор в `grill.md` (вопросы закрыты допущением)
- **Next step:** слово владельца о витрине (3.3), затем коммит этапа 3 и первый круг ревью
- **Uncommitted:** `plan.md`, `approvals.md`, правки договорённости и этого файла, `docs/plans/ai-chat-blocks.md`
- **Waiting for the owner:** одобрение плана
- **PR:** not open yet; PR RT-3340 #3453 — черновик в `main`, ветка этой задачи стоит на нём

## Steps

- [x] 0.1 разведка по чату
- [x] 0.2 разбор в grill.md
- [x] 0.3 договорённость
- [x] 0.4 макет в Figma и слово владельца
- [ ] 0.5 слово владельца о плане — план принят допущением, не закоммичен
- [x] 1.1 the field `interrupted` on `IRtAiChat.AssistantMessage` and the label key in the English and the showcase Russian sets
- [x] 1.2 the row in the answer template, the input `sending` and the output to the chat
- [x] 1.3 the output `askAgain` of `rt-ai-chat` and the binding of `sending`
- [x] 2.1 the row styles: gap, wrap, the focus ring not clipped, right to left
- [x] 2.2 the spec next to the chat with SC-UKV-1563…1575, 1578 and 1579 in the titles
- [x] 3.1 the stories of a partial and an empty interrupted answer, the widths 240…640, right to left, dark, with play steps SC-UKV-1576, 1577, 1580
- [x] 3.2 the match of the showcase with the mockup by numbers and by overlay, hover and focus included, the line «Совпадение» in `approvals.md`
- [>] 3.3 the owner's approval of the showcase, the line «Витрина» in `approvals.md`

Этап 3: семь историй Organisms/Chat/AiChatInterrupted, шаги `play` шести из них зелёные в
витрине (у Presets шага нет). Живая проверка нашла три промаха историй, все исправлены. Ящик 30rem
давал прокрутку ленты при 240, 328 и при ошибке хода, и полоса отнимала 11 px у ответа: ящик
теперь 40rem, как у соседней матрицы чата. «Копировать» искался по всей ячейке и находил кнопку
вопроса. Английская ячейка рисовала русские подписи: шаблон через `ngTemplateOutlet` берёт
инжектор места объявления, поэтому чат поставлен прямо в обёртку. Замер при 240/328/386/640: ответ
шириной ячейки, строка 12 px высотой 16.2, от строки до ряда 8, ряд 32, «спросить снова» второй с
отступом 36, лента не раздвинута.
Сверка с макетом — 21 из 21 числа ячейки «386 · пишет»: строка, ряд, кнопка, наведение (подложка
0,0,0/0.04), кольцо фокуса 3 px primary 24 %, отключено 0.5, тёмная тема. Сверка нашла расхождение
копии в Figma: все 77 кнопок рядов кадра стояли на `Icon color = muted` (103), а кит и до этой
задачи рисует ряд цветом текста (40, в тёмной теме 250). Копия переключена на `current`, кит не
тронут. Строка хода в копии макета 21 высотой, в витрине 22.9: компонент вне задачи, в сверку не
взят. Наложение строки и ряда (386×56, кадр витрины снят при 2x и сведён к 1x): разошлось 2.31 %
пикселей, только по краям букв и иконок, без сдвига. Владелец на вопрос о витрине ответил: «Прогони
2 цикла ревью сам и сравни с макетами наложением» — наложение снято, круги ревью идут.

Этап 1: typecheck зелёный, спеки `ai-chat` зелёные (1 мин 17 с). У `rt-icon-button` новый вход
`ariaDescribedby` — у кнопки-иконки не было способа сослаться на поясняющий узел; описания кнопки
дополнены.
Этап 2: строка `__interrupted` (12 px, `--rt-leading-snug`, приглушённая, перенос вместо обрезки);
ряд действий — прежний flex с зазором 4, RTL отражается сам. Спека `rt-ai-chat.interrupted.spec.ts`
— 15 из 15, typecheck зелёный. Раскладку и кольцо фокуса проверяет витрина на этапе 3.

Макет: https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8451-922 — частичный ответ при 328, 386, 640,
пустой прерванный ответ, тёмная тема, состояния действия (наведение, фокус, отключено). Замер: шаг 8 между
частями ответа, метка по центру кнопки (разница 0), кнопка 160×32, метка и действие в один ряд на всех трёх
ширинах. Значения наведения и фокуса сняты с кнопки «Ask again» в витрине: подложка primary 8%, кольцо 3px
primary 24%; варианты Hover и Focus копии `Button/Text` в Figma с китом разошлись (заливка, ширина 101).

Владелец на вопрос об одобрении: «Прогони сам 2 цикла речью на этих макетах» — два круга ревью макета.
Круг 1 (10 находок): дорисованы 240 (действие под меткой), пустой ответ без строки хода и при 328/640,
строка хода running и failed, вместе с ошибкой хода, RTL, английские подписи при 328, тёмная тема на
всех ширинах и её состояния; наведение и кольцо привязаны к переменным темы `action/primary-subtle`
(8% / 16%) и `focus/ring` (24% / 32%); высота строки метки 135%; лишние скрытые узлы удалены.
В договорённости: значения состояний по теме, метка при отключённом действии приглушена, ширина
английской кнопки около 118.
Круг 2 (12 находок): RTL-панель заменена зеркальной строкой со значком справа от подписи
(половинное зеркало кит не рисует); добавлены кадры «пишется — метки нет» и «пустой с вложениями»;
размер метки привязан к `text/xs`, фон тёмной полосы — к `bg/surface`; в договорённости зазоры
переноса 8/4 и ширина английской кнопки 115. Не исправлено, с причиной: варианты Hover/Focus копии
`Button/Text` в Figma рисуются сломанными (сплошная заливка, ширина 101), поэтому состояния — вариант
Default с подложкой и кольцом на переменных темы. Контраст текстовой кнопки в тёмной теме ~2,6:1 —
так у всех текстовых кнопок кита, в том числе у «Ask again» ошибки хода; вне задачи.
Слово владельца о пустом ответе: «Строка хода остаётся (Recommended)».
Слово владельца о виде метки: «Метка плашкой». Перерисовано: метка — плашка `rt-message` warning
(отступ 16, скругление 8, значок 20, текст 14 при строке 21), внутри текст «Ответ прерван» и в 12 за
ним кнопка «Спросить снова» (primary, sm, sync) по центру строки текста, кнопка выходит в отступ на
5,5. Замер: 386 и 640 — одна строка, высота 53; 328 по-русски и 240 — кнопка под текстом в 12,
высота 86; 328 по-английски — одна строка. RTL — зеркальная плашка, значок справа. Договорённость
переписана: роль `status`, раскладка, сценарии 1574, 1576, 1577.
Владелец на плашку: «Посмотри как сделано в других нормальных зарнесах». Найдено: ChatGPT, Claude и
Gemini под остановленным ответом ставят тихую строку (у Gemini «You've stopped this response before
it was complete»), повтор — иконкой в ряду копирования и оценки («Try again», «Retry», «Redo»);
Cloudscape — без отметки, повтор иконкой в группе кнопок под ответом; цветная плашка с действием —
только у настоящей ошибки. В макете раздел «Как в других чатах — сравнение» (узел 8476:2136): плашка
и тихая строка с иконкой sync в ряду действий, подсказка «Спросить снова».
Владелец выбрал «Как в других чатах (Recommended)». Перерисовано на всех кадрах: метка — тихая
строка 12 px (`text/xs`, 135%, `text/muted`), высота 16; действие — кнопка-иконка ряда действий с sync
сразу за «Копировать», зазор 4, ряд 32, между строкой и рядом 8; у пустого ответа в ряду одно
действие. Состояния: наведение (подложка кита и подсказка), фокус (кольцо 3 px на `focus/ring` —
вариант Focus копии `Icon Button` кольца не рисует), отключено. RTL: строка у правого края, ряд
отзеркален. Раздел сравнения удалён. Договорённость переписана: строка без своей живой области,
действие в ряду, раскладка 240–640 в одну строку, сценарии 1563, 1564, 1574–1577.
Слово владельца о макете: «Одобряю макет (Recommended)» — записано в `approvals.md`.

## Decisions along the way

- **Ветка от `RT-3340-ai-chat-sources-block`, PR каскадом** — эпик RT-3346 закрыт слиянием в `main`,
  а блок источников ещё не влит; задача трогает те же файлы чата.

## Sessions

### 2026-11-20

- Взята по слову владельца «Бери RT-3341».

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/ai-chat-blocks
**Branch:** RT-3341-ai-chat-interrupted-answer

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — the showcase and the match
- **Next step:** слово владельца о плане `plan.md`, затем коммит плана и этап 1
- **PR:** not open yet; PR RT-3340 #3453 — черновик в `main`, ветка этой задачи стоит на нём

The progress in full — `docs/tasks/RT-3341-ai-chat-interrupted-answer/progress.md`; the plan lies next to it.

### Uncommitted

```
?? docs/tasks/RT-3341-ai-chat-interrupted-answer/plan.md
?? projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/stories/ai-chat-interrupted-matrix.stories.ts
?? projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/stories/component/ai-chat-interrupted.fixture.ts
?? projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/stories/component/test-ai-chat-english-labels.component.html
?? projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/stories/component/test-ai-chat-english-labels.component.ts
?? projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/stories/component/test-ai-chat-interrupted-matrix.component.html
?? projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/stories/component/test-ai-chat-interrupted-matrix.component.ts
```

### Commits over the main branch

```
97fa6dbf1 feat(rt:ui-kit-v2): прерванный ответ чата — тихая строка и «спросить снова» (RT-3341)
2fc592e5e docs(rt:ui-kit-v2): разбор и договорённость о прерванном ответе чата (RT-3341)
cbf9f498f fix(rt:ui-kit-v2): название источника из одних невидимых знаков отбрасывается (RT-3340)
2020935fd Merge remote-tracking branch 'origin/main' into RT-3340-ai-chat-sources-block
00239d118 test(rt:ui-kit-v2): эталоны историй блока источников и шаги без гонки (RT-3340)
eecfaf70c fix(rt:ui-kit-v2): у элемента блока источников в ленте есть правило стиля (RT-3340)
7dca04bd9 docs(rt:ui-kit-v2): папка задачи блока источников разобрана (RT-3340)
60a66e818 docs(rt:ui-kit-v2): договорённость блока источников слита в спеку домена (RT-3340)
4718dc1bc fix(rt:ui-kit-v2): блок источников после второго круга ревью (RT-3340)
d7ae065b8 fix(rt:ui-kit-v2): блок источников после первого круга ревью (RT-3340)
6c69632a5 docs(rt:ui-kit-v2): кадры наведения и фокуса блока источников перерисованы (RT-3340)
1e0e34126 Merge remote-tracking branch 'origin/main' into RT-3340-ai-chat-sources-block
b41af0dd8 fix(rt:ui-kit-v2): наведение и фокус строки источника (RT-3340)
97477a610 feat(rt:ui-kit-v2): истории и страница обзора блока источников (RT-3340)
6c360ea3e feat(rt:ui-kit-v2): блок источников в ответе чата и событие нажатия (RT-3340)
658d318b1 docs(rt:ui-kit-v2): макет блока источников одобрен (RT-3340)
6eac865ce feat(rt:ui-kit-v2): данные и схема блока источников (RT-3340)
8f15f678a docs(rt:ui-kit-v2): договорённость и план блока источников (RT-3340)
0ba332c88 docs(rt:ui-kit-v2): разбор задачи блока источников и находки RT-3339 (RT-3340)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.

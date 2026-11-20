# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 из 5 — the showcase
- **Done:** RT-3343 выкинута владельцем (карточка закрыта, ветка и макет удалены); карточка RT-3344 в работе, ветка `RT-3344-ai-chat-theme-tokens` от ветки RT-3341, строка копии в `assignments.md` по слову «Делать RT-3344»
- **Next step:** три истории `Properties` витрины чата, затем эталоны и живая сверка
- **Uncommitted:** нет
- **Waiting for the owner:** нет
- **PR:** не открыт; #3454 (RT-3341) влит в ветку RT-3340, ветка задачи взяла её (6d811c52b); база PR — `RT-3340-ai-chat-sources-block`, а после слияния #3453 — `main`

## Steps

- [x] 0.1 the exploration and the grill
- [x] 0.2 the agreement
- [x] 0.3 the plan and the owner's word
- [x] 1.1 handles of `rt-markdown-text`
- [x] 1.2 handles of `rt-ai-prompt-input`
- [x] 1.3 handles of `rt-thread-list`
- [x] 2.1 chat root handles and the pass-down to the parts
- [x] 2.2 the input `questionAuthor`
- [x] 2.3 specs of the handles and the input
- [>] 3.1 the three `Properties` stories
- [ ] 3.2 references of the new story and the run over all stories
- [ ] 3.3 the live check against the agreement
- [ ] 4.1 review round one and its fixes
- [ ] 4.2 review round two and its fixes
- [ ] 4.3 the owner's word on the showcase
- [ ] 5.1 overviews of the chat and the parts, the README exception, the epic plan
- [ ] 5.2 the agreement merged into the domain spec, the folder taken apart
- [ ] 5.3 the push set and the PR into the branch of RT-3340

## Decisions along the way

- **План одобрен владельцем:** «Одобряю план (Recommended)». **Выпуск:** «Да, в следующий выпуск
  (Recommended)» — RT-3344 входит в следующий выпуск кита вместе с источниками и прерванным ответом.
- **Договорённость после критики:** части читают свои токены с запасным значением на месте, чат
  ставит их на своём корне; время строки под действиями прячется только по токену приложения.
  Affected stage: 1–3.
- **Скругление карточки подсказки передаётся селектором чата на кнопке карточки**, а не запасным
  значением в самой карточке: её токен объявлен на кнопке шаблона, и запасное значение со ступенью
  скругления в её стилях спорило бы с проверкой токенов. Карточка не меняется. Affected stage: 2.
- **Подпись автора выведена заготовкой `authorLabel`**, а не веткой `@if` в пузыре: ветка подняла
  сложность шаблона чата до 26 при пределе 25. Affected stage: 2.
- Этапы 1–2: типы кита без ошибок, весь набор кита 4077 тестов зелёный, новые спеки 7 + 2 зелёные,
  линтер стилей и проверка токенов без новых находок.

## Sessions

### 20.11.2026

- Владелец выбрал «Делать RT-3344» после вопроса, нужна ли задача; RT-3343 перед этим выкинута его словом.

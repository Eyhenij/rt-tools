# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — Признак второй записи считает и доставку файла
- **Done:** ветка отведена, папка перенесена в неё, замысел записан. Причина найдена чтением: досрочный выход на местном адресе считает вторую запись только по глаголам SQL и по кормящим трубу командам, а доставку файла флагом `-f` — не считает, хотя основная ветка стража её признаком записи считает
- **Next step:** этапы кончились — разобрать папку и открыть заявку черновиком
- **Uncommitted:** нет
- **Waiting for the owner:** слово о находках разбора закрытой работы RT-1899 — это правки слоя правил
- **PR:** ещё не открыт

## Steps

The steps of the plan, all of them, with a mark each. Rewritten by every turn that moves the work.

- `[x]` done · `[>]` going on right now · `[ ]` not begun

Exactly one step carries `[>]`. The numbers and the names are copied from the plan and not
reworded: a check matches the two lists, and the turn exit guard counts what is not done yet.

- [x] 1.1 досрочный выход берёт тот же признак записи файлом, каким его считает основная ветка
- [x] 1.2 проба на обе стороны: цепочка с доставкой файла спрашивает, одиночная миграция молчит
- [ ] 2.1 <name of the first step of the second stage>

## Decisions along the way

- **<decision>** — <reason>. Affected stage of the plan: <number>.

## Sessions

### <date>

- <what was done, in numbers: files, commits, what is green>
- <what we stumbled on and what caught it>

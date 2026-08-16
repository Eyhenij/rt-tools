# Где это исполняется — слово человека посреди работы

Ключ связи — сам текст правила из `spec.md` рядом.

| Правило                                                                        | Где исполняется                                   |
| ------------------------------------------------------------------------------ | ------------------------------------------------- |
| Команда кладёт блок на диск и в сеть не ходит.                                 | `projects/agent-kit/assets/commands/feedback.md`  |
| Блок собирает агент, а не человек.                                             | `projects/agent-kit/assets/commands/feedback.md`  |
| Слово без ясного адреса не превращается в блок молча.                          | `projects/agent-kit/assets/commands/feedback.md`  |
| Блок ложится в файл сегодняшнего дня, а не в свой.                             | `projects/agent-kit/assets/commands/feedback.md`  |
| Файл дня заводится с образца, если его ещё нет.                                | `projects/agent-kit/assets/templates/proposal.md` |
| Текст блока проверяется на адрес дерева тем же, чем проверяется всё остальное. | `projects/agent-kit/src/lib/proposals.ts:leaksIn` |
| Команда говорит, куда лёг блок и чем он уедет.                                 | `projects/agent-kit/assets/commands/feedback.md`  |

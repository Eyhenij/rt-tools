# Признак предложения — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделах «Правила» и «Данные» спека.
Правило без строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в
коде стоит то, о чём спек молчит.

| Правило                                                                       | Где исполняется                                                                        |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Предложение опознаётся признаком, а не текстом в ограничении.                 | `libs/message-bus-api/proposals/util/src/lib/proposal.logic.ts:proposalDigest`         |
| Признак предложения уникален в пределах дерева.                               | `prisma/schema.prisma:Proposal`                                                        |
| Уже лежавшее пропускается, а не отбивает запрос.                              | `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:addProposals`  |
| Отбор уже приехавшего держит хранилище, а не проверка чтением.                | `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:addProposals`  |
| Ответ приёма называет, сколько записей легло и сколько уже лежало.            | `libs/message-bus-api/proposals/feature/src/lib/proposals-intake.controller.ts:accept` |
| Предложение остаётся при своей записи месяца.                                 | `libs/message-bus-api/proposals/feature/src/lib/proposals-intake.controller.ts:accept` |
| Пара «дерево — признак предложения» уникальна.                                | `prisma/schema.prisma:Proposal`                                                        |
| Пара «запись месяца — текст предложения» уникальной быть перестаёт.           | `prisma/migrations/20260815064800_proposal_digest/migration.sql`                       |
| Дерево у предложения стоит своей колонкой, а не читается через запись месяца. | `prisma/schema.prisma:Proposal`                                                        |

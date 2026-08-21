# Вход в админку — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

| Правило                                                                              | Где исполняется                                                                                   |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Груза без входа не отдаёт ни одна операция.                                          | `libs/message-bus-api/access/feature/src/lib/access.guard.ts:canActivate`                         |
| Человек представляется именем учётной записи и паролем.                              | `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:login`                          |
| Браузер несёт вход кукой, недоступной скриптам, и посылает её только своему адресу.  | `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:cookieOptions`                  |
| Приёмник держит только хеш пароля.                                                   | `libs/message-bus-api/accounts/util/src/lib/password.util.ts:passwordHash`                        |
| Отказ входа не называет, что именно не сошлось, и отвечает за то же время.           | `libs/message-bus-api/accounts/util/src/lib/password.util.ts:burnAbsentAccountTime`               |
| Пароль не попадает ни в журнал, ни в ответ, ни в адрес.                              | `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:login`                          |
| Неудачная попытка входа записывается в журнал с именем учётной записи.               | `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:login`                          |
| Неудачные попытки подряд удлиняют ответ.                                             | `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:refusal`                        |
| Вход живёт сроком и по его истечении перестаёт приниматься.                          | `libs/message-bus-api/accounts/util/src/lib/session-token.util.ts:sessionAlive`                   |
| Входов у одной записи бывает несколько, и выход обрывает тот, которым пришли.        | `libs/message-bus-api/accounts/data-access/src/lib/account.queries.ts:revokeSession`              |
| Токен дерева админки не открывает, а вход человека не открывает приёма груза.        | `libs/message-bus-api/access/feature/src/lib/access.guard.ts:canActivate`                         |
| Каждая операция объявляет свой способ доступа явно.                                  | `libs/message-bus-api/access/util/src/lib/operation-access.ts:OPERATION_ACCESS`                   |
| Учётная запись заводится, меняет пароль и отключается командой строки запуска.       | `libs/message-bus-api/accounts/feature/src/lib/account-commands.service.ts:run`                   |
| Имя учётной записи занято одним человеком, и в нём не различается регистр.           | `libs/message-bus-api/accounts/util/src/lib/account-name.util.ts:accountNameKey`                  |
| Отключённая запись входа не заводит, а её прежние входы перестают приниматься.       | `libs/message-bus-api/accounts/data-access/src/lib/account.queries.ts:disableAccount`             |
| Служба говорит при старте, что учётных записей нет ни одной.                         | `libs/message-bus-api/accounts/feature/src/lib/account-startup.service.ts:onApplicationBootstrap` |
| Человек, отправленный с адреса раздела на вход, после входа попадает туда, куда шёл. | `libs/message-bus-admin/auth/shell/src/lib/session.guard.ts:sessionGuard`                         |
| Имя учётной записи уникально по приведённому виду.                                   | `prisma/schema.prisma:Account`                                                                    |
| Пароль лежит только хешем.                                                           | `prisma/schema.prisma:Account`                                                                    |

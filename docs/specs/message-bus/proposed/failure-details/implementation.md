# Подробности отказа — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» договорённости.
Привязки проставляются по мере того, как пишется код: пустая колонка — правило, за которым
кода ещё нет.

| Правило                                                                      | Где исполняется                                                                          |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Отказ пишется разобранной причиной, а не одним текстом.                      | `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:describeError`   |
| Причина разворачивается по цепочке до предела глубины.                       | `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:MAX_CAUSE_DEPTH` |
| Ошибка хранилища узнаётся формой кода, а не классом.                         | `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:STORAGE_CODE`    |
| Стек пишется срезанным.                                                      | `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:STACK_LINES`     |
| Отказ по вводу и правам пишется без стека.                                   |                                                                                          |
| Номер обращения стоит в строке отказа и в ответе тому, кто спрашивал.        |                                                                                          |
| Строка журнала машинная: имя и поля объектом.                                |                                                                                          |
| Имя строки постоянно, а всё переменное лежит полями.                         |                                                                                          |
| Вне прода строка печатается читаемой.                                        |                                                                                          |
| Уже написанные вызовы журнала начинают писать так же, ничего в них не правя. |                                                                                          |
| Поля вычищаются по имени ключа, а не по виду значения.                       | `libs/message-bus-api/observability/util/src/lib/redact.util.ts:SECRET_KEY`              |
| Пароль, токен и хеш вырезаются целиком.                                      | `libs/message-bus-api/observability/util/src/lib/redact.util.ts:redact`                  |
| Текст ошибки внутри разобранной причины вычисткой не съедается.              | `libs/message-bus-api/observability/util/src/lib/redact.util.ts:ERROR_BRANCH`            |
| Наружу по-прежнему уходит код и общий текст, подробности остаются в журнале. |                                                                                          |
| Обход в глубину и в длину ограничен.                                         | `libs/message-bus-api/observability/util/src/lib/redact.util.ts:MAX_DEPTH`               |

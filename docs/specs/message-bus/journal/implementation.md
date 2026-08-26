# Что приёмник пишет о себе — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

- **Отказ пишется разобранной причиной, а не одним текстом.** — `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:describeError`
- **Причина разворачивается по цепочке до предела глубины.** — `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:MAX_CAUSE_DEPTH`
- **Ошибка хранилища узнаётся формой кода, а не классом.** — `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:STORAGE_CODE`
- **Стек пишется срезанным.** — `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:STACK_LINES`
- **Отказ по вводу и правам пишется без стека.** — `apps/message-bus/src/app/failure.filter.ts:journalFields`
- **Строка журнала машинная: имя и поля объектом.** — `libs/message-bus-api/observability/feature/src/lib/app-logger.service.ts:machineLine`
- **Имя строки постоянно, а всё переменное лежит полями.** — `apps/message-bus/src/app/failure.filter.ts:journalName`
- **Вне прода строка печатается читаемой.** — `libs/message-bus-api/observability/feature/src/lib/app-logger.service.ts:humanLine`
- **Уже написанные вызовы журнала пишут так же, ничего в них не правя.** — `apps/message-bus/src/main.ts:useLogger`
- **Поля вычищаются по имени ключа, а не по виду значения.** — `libs/message-bus-api/observability/util/src/lib/redact.util.ts:SECRET_KEY`
- **Пароль, токен и хеш вырезаются целиком.** — `libs/message-bus-api/observability/util/src/lib/redact.util.ts:redact`
- **Текст ошибки внутри разобранной причины вычисткой не съедается.** — `libs/message-bus-api/observability/util/src/lib/redact.util.ts:ERROR_BRANCH`
- **Обход в глубину и в длину ограничен.** — `libs/message-bus-api/observability/util/src/lib/redact.util.ts:MAX_DEPTH`

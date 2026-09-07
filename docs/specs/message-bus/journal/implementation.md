# What the intake writes about itself — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **A refusal is written as a taken-apart reason, not as one text.** — `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:describeError`
- **The reason is unfolded along the chain up to the limit of the depth.** — `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:MAX_CAUSE_DEPTH`
- **An error of the storage is recognised by the shape of the code, not by the class.** — `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:STORAGE_CODE`
- **The stack is written cut.** — `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:STACK_LINES`
- **A refusal by the input and by the rights is written without a stack.** — `apps/message-bus/src/app/failure.filter.ts:journalFields`
- **The row of the journal is machine-readable: the name and the fields as an object.** — `libs/message-bus-api/observability/feature/src/lib/app-logger.service.ts:machineLine`
- **The name of the row is constant, and everything variable lies as fields.** — `apps/message-bus/src/app/failure.filter.ts:journalName`
- **Outside production the row is printed readable.** — `libs/message-bus-api/observability/feature/src/lib/app-logger.service.ts:humanLine`
- **The already written calls of the journal write the same way, with nothing edited in them.** — `apps/message-bus/src/main.ts:useLogger`
- **The fields are cleaned by the name of the key, not by the look of the value.** — `libs/message-bus-api/observability/util/src/lib/redact.util.ts:SECRET_KEY`
- **A password, a token and a hash are cut out whole.** — `libs/message-bus-api/observability/util/src/lib/redact.util.ts:redact`
- **The text of the error inside a taken-apart reason is not eaten by the cleaning.** — `libs/message-bus-api/observability/util/src/lib/redact.util.ts:ERROR_BRANCH`
- **The walk in depth and in length is limited.** — `libs/message-bus-api/observability/util/src/lib/redact.util.ts:MAX_DEPTH`

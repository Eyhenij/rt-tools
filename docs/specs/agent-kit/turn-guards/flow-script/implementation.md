# Binding — the task flow as an executable scenario

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The description is one object in parentheses closed by a semicolon, and nothing follows it.** — `projects/agent-kit/assets/checks/flow-syntax.mjs:parse` — the opening `({`, the closing `);` and the end check; scenario `SC-AK-1475`
- **A value is a literal, a reference, a call of a reference, an array or an object.** — `projects/agent-kit/assets/checks/flow-syntax.mjs:Call` — a reference with arguments; scenarios `SC-AK-1471`, `SC-AK-1477`
- **A function, an operator and a word that runs code are refused with the place they stand at.** — `projects/agent-kit/assets/checks/flow-syntax.mjs:FORBIDDEN` — the words that run code; operators are refused by the tokenizer; scenarios `SC-AK-1472`, `SC-AK-1473`
- **A reference starts with one of the six sections.** — `projects/agent-kit/assets/checks/flow-syntax.mjs:SECTIONS` — the section list; scenario `SC-AK-1478`
- **A repeated key of an object is refused.** — `projects/agent-kit/assets/checks/flow-syntax.mjs:FlowSyntaxError` — the refusal with the key and its place; scenario `SC-AK-1474`
- **A comment is skipped, and a comment or a dot inside a string is the string's own text.** — `projects/agent-kit/assets/checks/flow-syntax.mjs:tokenize` — comments are skipped outside strings only; scenarios `SC-AK-1476`, `SC-AK-1529`
- **The description has exactly six sections.** — `projects/agent-kit/assets/checks/flow-model.mjs:buildModel` — an extra and a missing section are named; scenario `SC-AK-1479`
- **A name of an entry, a capability or a port matches `[A-Za-z][A-Za-z0-9]*`.** — `projects/agent-kit/assets/checks/flow-model.mjs:NAME` — the name pattern; scenario `SC-AK-1480`
- **An entry of `source` or `measure` is a file next to the description, and a capability is its named export.** — `projects/agent-kit/assets/checks/flow-model.mjs:COMPONENT_SECTIONS` — the sections whose entries are files; scenario `SC-AK-1481`
- **The ports of a capability equal the signature of its factory exactly.** — `projects/agent-kit/assets/checks/flow-model.mjs:signatureOf` — `()` or `({ a, b })` read from the declaration; scenarios `SC-AK-1482`, `SC-AK-1483`
- **A missing capability is an error, never a substitute.** — `projects/agent-kit/assets/checks/flow-model.mjs:FlowModelError` — the refusal naming the file and the capability; scenario `SC-AK-1484`
- **The references between components form no cycle.** — `projects/agent-kit/assets/checks/flow-model.mjs:target` — every port resolves to a component, then the walk names a cycle; scenario `SC-AK-1485`
- **The states keep the order of the description, and a title is unique.** — `projects/agent-kit/assets/checks/flow-model.mjs:buildModel` — the states in written order, a repeated title refused; scenarios `SC-AK-1486`, `SC-AK-1487`
- **A file of `measure/` imports only its neighbours and reaches no data past the ports.** — `projects/agent-kit/assets/checks/flow-model.mjs:checkMeasureDir` — every file of the directory is read; scenarios `SC-AK-1488`, `SC-AK-1507`, `SC-AK-1508`, `SC-AK-1509`, `SC-AK-1533`, `SC-AK-1534`

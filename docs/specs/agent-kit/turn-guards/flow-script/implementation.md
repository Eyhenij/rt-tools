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
- **A file of the measurer directory imports only its neighbours and reaches no data past the ports.** — `projects/agent-kit/assets/checks/flow-model.mjs:checkMeasureDir` — every file of the directory is read; scenarios `SC-AK-1488`, `SC-AK-1507`, `SC-AK-1508`, `SC-AK-1509`, `SC-AK-1533`, `SC-AK-1534`
- **The exit of a state and the `when` of a release case are a condition over the measurers of the description.** — `projects/agent-kit/assets/checks/flow-model.mjs:buildModel` — `exit` and `when` are required and checked as conditions; scenario `SC-AK-1514`
- **A condition object has exactly one key — `all`, `any` or `not` — and a reference in it names a measurer capability of the description.** — `projects/agent-kit/assets/checks/flow-condition.mjs:validateCondition` — the operator list and the measurer check; scenarios `SC-AK-1513`, `SC-AK-1514`
- **A condition is met by the results of the measurers, and an absent result counts as unmet.** — `projects/agent-kit/assets/checks/flow-condition.mjs:evaluateCondition` — `all`, `any`, `not` over the results; scenarios `SC-AK-1510`, `SC-AK-1511`, `SC-AK-1512`, `SC-AK-1513`, `SC-AK-1515`
- **The literals of `words` are lists of non-empty strings under known keys, and `nudge` is a pattern that compiles.** — `projects/agent-kit/assets/checks/flow-data.mjs:checkWords` — the keys of `WORD_KEYS`, the lists and the pattern; the stop words, their exceptions, the write commands and the menu reach the model only through it; scenarios `SC-AK-1516`, `SC-AK-1517`, `SC-AK-1518`
- **A form of the expected result is a pattern and a way of comparison of `exit`, `line`, `regex` or `number`.** — `projects/agent-kit/assets/checks/flow-data.mjs:checkExpect` — the pattern compiles, the way is one of `COMPARE`; scenario `SC-AK-1519`
- **The release cases are asked in the order of the field `order`, and two cases never share one.** — `projects/agent-kit/assets/checks/flow-data.mjs:releaseOrder` — an integer from 1, a repeat refused, the cases sorted; scenario `SC-AK-1520`

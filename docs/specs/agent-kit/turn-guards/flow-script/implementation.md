# Binding — the task flow as an executable scenario

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The description is one object in parentheses closed by a semicolon, and nothing follows it.** — `projects/agent-kit/assets/checks/flow-syntax.mjs:parse` — the opening `({`, the closing `);` and the end check; scenario `SC-AK-1475`
- **A value is a literal, a reference, a call of a reference, an array or an object.** — `projects/agent-kit/assets/checks/flow-syntax.mjs:Call` — a reference with arguments; scenarios `SC-AK-1471`, `SC-AK-1477`
- **A function, an operator and a word that runs code are refused with the place they stand at.** — `projects/agent-kit/assets/checks/flow-syntax.mjs:FORBIDDEN` — the words that run code; operators are refused by the tokenizer; scenarios `SC-AK-1472`, `SC-AK-1473`
- **A reference starts with one of the six sections.** — `projects/agent-kit/assets/checks/flow-syntax.mjs:SECTIONS` — the section list; scenario `SC-AK-1478`
- **A repeated key of an object is refused.** — `projects/agent-kit/assets/checks/flow-syntax.mjs:FlowSyntaxError` — the refusal with the key and its place; scenario `SC-AK-1474`
- **A comment is skipped, and a comment or a dot inside a string is the string's own text.** — `projects/agent-kit/assets/checks/flow-syntax.mjs:tokenize` — comments are skipped outside strings only; scenarios `SC-AK-1476`, `SC-AK-1529`

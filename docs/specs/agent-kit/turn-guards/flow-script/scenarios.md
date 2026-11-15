# Scenarios: the task flow as an executable scenario

A subdomain of the domain "The guards of the end of a turn". Here are the scenarios of the language
the task flow is described in and of the engine that measures it.

### SC-AK-1471 — literals, references, arrays and objects are parsed into a model

Given a description with strings, numbers, `true`, `false`, `null`, references, arrays and objects
When the parser reads it
Then the model holds the same values, a reference as `{"ref": "<path>"}`

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1472 — a function in the description is refused

Given a description with a `function` or an arrow function as a value
When the parser reads it
Then it refuses, saying the description executes nothing

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1473 — an expression is refused

Given a description with an arithmetic or a logical operator between values
When the parser reads it
Then it refuses, saying an expression is not allowed

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1474 — a repeated key is refused

Given an object of the description that names one key twice
When the parser reads it
Then it refuses and names the key

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1475 — a tail after the closing semicolon is refused

Given a description followed by a statement after `);`
When the parser reads it
Then it refuses: nothing may follow the description

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1476 — comments and dots in a string are data, not execution

Given a description with comments around it and strings that hold `//`, `/* */` and dots
When the parser reads it
Then the comments are skipped and the strings keep their text

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1477 — a call of a reference with literals and references is parsed

Given a value `measure.count(1, 'b', source.git, [true])`
When the parser reads it
Then the model holds the call with its reference and its four arguments

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1478 — a reference to an unknown section is refused

Given a reference that starts with a name outside the six sections, or a `require` call
When the parser reads it
Then it refuses and names the section list or the word

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1479 — the description has exactly six sections, an extra one is refused

Given a description with the six sections, one with a seventh, and one without `expect`
When the model is built
Then the first is accepted, the extra section is named, the missing one is named

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1480 — a name outside [A-Za-z][A-Za-z0-9]* is refused

Given an entry named by a string with a dash
When the model is built
Then it refuses and names the entry

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1481 — `measure.x` is the file `measure/x.mjs`, a capability is its export

Given a measurer entry `plan` with the capability `approved`
When the model is built
Then the component points at `measure/plan.mjs` and holds the capability `approved`

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1482 — ports that are not the signature are refused, naming the component

Given a capability whose ports lack a name its factory takes
When the model is built
Then it refuses and names `measure.<entry>.<capability>`, the ports and the signature

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1483 — a signature with a default or a renaming is refused

Given a factory declared as `({ git = 1, marks })` or as `({ git: repo, marks })`
When the model is built
Then it refuses: a port carries a default, a renaming or a pattern

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1484 — a missing capability is an explicit error, without a substitute

Given a description naming a capability its file does not export
When the model is built
Then it refuses and names the capability

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1485 — a cycle of references is refused

Given two measurers whose ports point at each other
When the model is built
Then it refuses and names the cycle

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1486 — the order of the states is the order of the description

Given two states written one after the other
When the model is built
Then the states come in the written order

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1487 — a repeated state title is refused

Given two states with one title
When the model is built
Then it refuses and names the title

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1488 — a measurer importing a path not starting with `./` is refused

Given a measurer that imports `node:fs` or a file of a neighbouring directory
When the model is built
Then it refuses: the import leaves the directory

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1507 — `import()` in a measurer is refused

Given a measurer with a dynamic `import()`
When the model is built
Then it refuses and names `import()`

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1508 — `process` in a measurer is refused

Given a measurer that reads `process.env`
When the model is built
Then it refuses and names `process`

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1509 — `createRequire` and `require` in a measurer are refused

Given a measurer that calls `createRequire` or `require`
When the model is built
Then it refuses and names the word

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1533 — a neighbour file of a measurer importing `node:fs` is refused

Given a file of `measure/` that the measurer imports, and that imports `node:fs`
When the model is built
Then it refuses and names the neighbour file

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1534 — `globalThis` in any file of `measure/` is refused

Given a neighbour file of a measurer that reaches `globalThis`
When the model is built
Then it refuses and names `globalThis`

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1529 — the layout header as a line comment before the description is skipped

Given a laid-out description whose first line is the layout header as a `//` comment
When the parser reads it
Then the header is skipped and the model holds only the description

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

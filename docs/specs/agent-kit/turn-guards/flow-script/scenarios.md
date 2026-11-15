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

### SC-AK-1529 — the layout header as a line comment before the description is skipped

Given a laid-out description whose first line is the layout header as a `//` comment
When the parser reads it
Then the header is skipped and the model holds only the description

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

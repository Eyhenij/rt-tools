# Scenarios: the language of the task flow description

A subdomain of the task flow as an executable scenario. Here are the scenarios of the parser, the
model, the conditions and the data of the description, of the tree override, of the stub generator
and of the text generator.

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

### SC-AK-1481 — `measure.x` is the file x.mjs of the measurer directory, a capability is its export

Given a measurer entry `plan` with the capability `approved`
When the model is built
Then the component points at the file plan.mjs of the measurer directory and holds the capability `approved`

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

Given a measurer that reads the environment through `process`
When the model is built
Then it refuses and names `process`

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1509 — `createRequire` and `require` in a measurer are refused

Given a measurer that calls `createRequire` or `require`
When the model is built
Then it refuses and names the word

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1533 — a neighbour file of a measurer importing `node:fs` is refused

Given a file of the measurer directory that the measurer imports, and that imports `node:fs`
When the model is built
Then it refuses and names the neighbour file

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1534 — `globalThis` in any file of the measurer directory is refused

Given a neighbour file of a measurer that reaches `globalThis`
When the model is built
Then it refuses and names `globalThis`

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1529 — the layout header as a line comment before the description is skipped

Given a laid-out description whose first line is the layout header as a `//` comment
When the parser reads it
Then the header is skipped and the model holds only the description

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1510 — `all` is met when every part is met

Given a state whose exit is `all` over two measurers
When the exit is measured with both results true and with one false
Then it is met in the first case and unmet in the second

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1511 — `any` is met when one part is met

Given a state whose exit is `any` over two measurers
When the exit is measured with one result true and with none
Then it is met in the first case and unmet in the second

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1512 — `not` inverts a measurer

Given a state whose exit is `not` over a measurer
When the exit is measured with the result false and with it true
Then it is met in the first case and unmet in the second

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1513 — nested conditions are parsed and measured

Given a state whose exit is `all` over a measurer and an `any` holding a `not`
When the model is built and the exit is measured
Then the model keeps the nesting, and the exit follows every level

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1514 — a condition over an unknown measurer is refused

Given an exit naming a capability the measurer lacks, a `when` naming an absent measurer, an object of two keys or a reference to a source
When the model is built
Then it refuses and names the place of the condition and the reason

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1515 — a state exit built from a condition without code is measured

Given a state whose exit is `any` over two measurers, one under `not`
When the engine measures the state with the measurers answering, once with a result absent
Then the exit is met by the answers, and an absent result counts as unmet

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1517 — the write commands of case 3 are taken from `words`

Given a description whose `words.write` names two commands
When a compound command, a read and a longer word are judged
Then the compound command is a write, the read and the longer word are not, and an empty entry is refused

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1518 — the options of the refusal menu are taken from `words`

Given a description whose `words` name the menu and the nudge pattern
When the model is built
Then the model holds the menu in its order and the pattern matches, while an option that is not a string and a pattern that does not compile are refused

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1519 — the way a form of the expected result is compared is the field `compare`

Given a description with the forms `exit`, `line`, `regex` and `number`
When runs are compared with expected texts of each form
Then each form compares by its way, a non-zero code fails a text, an unknown text has no form, and an unknown way is refused

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1843 — a number with blanks before it is read, as `wc -l` prints it

Given the expected result «= 0» and an output whose last line is «0» with seven blanks before it, as `wc -l` of macOS prints it
When the run is compared with the expected result
Then the form is `number`, and it is matched

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1520 — the order of the release cases is the field `order`, and a repeat is refused

Given two release cases written in reverse order, two with one order, and one with a fraction
When the model is built
Then the cases come by their order, the repeat names both cases, and the fraction is refused

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1489 — the override adds a state by its key

Given an override that adds a measurer, a state without `after` and a release case with its own order
When the model is built from the package description merged with it
Then the state stands last, the case comes by its order, the changes name all three, and a repeated order or a section outside the six is refused

Covered: `projects/agent-kit/tests/flow-language-override.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1527 — `after` puts a state of the override after the named state

Given an override with two states whose `after` names the same state, once as a reference and once as a string
When the model is built
Then both stand right after that state in the order of the override, the field leaves the model, and an `after` naming no state is refused

Covered: `projects/agent-kit/tests/flow-language-override.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1490 — the override replaces a measurer, and its contract is checked

Given an override that replaces a measurer with a file next to the override and fewer ports
When the model is built
Then the measurer is read from the file of the override with the ports of its signature, and the change is named as a replacement

Covered: `projects/agent-kit/tests/flow-language-override.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1491 — `null` with a reason removes a key, and `measure` prints it

Given an override that removes a state by `null` with a reason next to it
When the model is built and the engine measures the branch
Then the state is gone, and `measure` prints the removed key with its reason

Covered: `projects/agent-kit/tests/flow-language-override.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1492 — `null` without a reason is refused

Given an override with `null` and no reason, an empty reason, a reason with nothing removed, and `null` over a key the package lacks
When the model is built
Then each is refused, naming the section and the key

Covered: `projects/agent-kit/tests/flow-language-override.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1493 — an override that breaks the contract is refused

Given an override measurer whose ports differ from its signature, one that imports `node:fs`, and an override that removes a measurer a state still names
When the model is built
Then each is refused, the first naming the component of the override

Covered: `projects/agent-kit/tests/flow-language-override.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1494 — a new measurer gets a stub and a stub case

Given a description naming a measurer with two capabilities and no file
When the stub generator runs
Then it writes a stub whose factories throw `Not implemented` with their ports and a case that stays red until the factories are written, and the model accepts the stub

Covered: `projects/agent-kit/tests/flow-language-scaffold.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1495 — a written implementation is not touched

Given a description whose measurers and stub case are written
When the stub generator runs again
Then it creates nothing, and every file keeps its text

Covered: `projects/agent-kit/tests/flow-language-scaffold.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1496 — `CONTRACT_CHANGED` when the ports drift

Given a written measurer whose ports in the description differ from its signature, and then a capability the file does not export
When the stub generator runs
Then it warns `CONTRACT_CHANGED` with the ports and the signature, or with the missing capability, and leaves the file as it was

Covered: `projects/agent-kit/tests/flow-language-scaffold.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1497 — `UNREACHABLE_MEASURE` for a measurer nothing names

Given a measurer no state exit, release case or port names
When the stub generator runs, and again after a release case names it
Then it warns `UNREACHABLE_MEASURE` the first time and not the second

Covered: `projects/agent-kit/tests/flow-language-scaffold.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1498 — `MEASURE_REMOVED`, and the file stays

Given a file in the measurer directory that the description does not name and no neighbour imports
When the stub generator runs
Then it warns `MEASURE_REMOVED`, the file stays, and an imported neighbour is not named

Covered: `projects/agent-kit/tests/flow-language-scaffold.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1499 — flow.md is compared with its generation as text

Given the package views written by the text generator, and then a line added to flow.md by hand
When `--check` runs
Then it matches before the edit, and after it refuses the description view with code 1

Covered: `projects/agent-kit/tests/flow-language-sync.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1500 — the table «Work states» of the rule is generated

Given the rule source with the markers of the states view
When the text generator runs
Then each state has a row of its title, exit, action and pattern, and the text outside the markers is unchanged

Covered: `projects/agent-kit/tests/flow-language-sync.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1501 — the turn map is generated

Given the turn map source with the markers of the map view
When the text generator runs
Then each state has a line of its title, action and leading pattern

Covered: `projects/agent-kit/tests/flow-language-sync.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1502 — the section on the end of a turn in the rule `turn-conduct` is generated

Given the rule source with the markers of the turn-end view
When the text generator runs
Then each release case has a line of its order, log and condition

Covered: `projects/agent-kit/tests/flow-language-sync.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1503 — the table of expected forms of the plan template is generated

Given the plan template with the markers of the expect view
When the text generator runs
Then each form has a row of its name, pattern and what it matches

Covered: `projects/agent-kit/tests/flow-language-sync.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1504 — a hand edit between the markers is refused by `--check`

Given a row of the states view edited by hand, and then a text without markers
When `--check` runs and the generator writes
Then the check refuses the edited view, the write brings back the text of the description, and the text without markers is refused and not written

Covered: `projects/agent-kit/tests/flow-language-sync.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1528 — the view of the override goes into the companion, and the laid-out rule is unchanged

Given a tree where the package is laid out and an override adds a state
When the text generator runs, and again after the laid-out rule is edited by hand
Then only the companion is written, with the change and the merged states, its own lines kept, and the laid-out rule is neither changed nor rewritten

Covered: `projects/agent-kit/tests/flow-language-sync.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1535 — in a tree with an override `--check` compares its view too

Given a laid-out tree with an override whose view is written
When `--check` runs, after the override changes, and after it is removed
Then it prints `flow sync: 6 views match`, then refuses the view of the override, then prints `flow sync: 5 views match`

Covered: `projects/agent-kit/tests/flow-language-sync.test.sh`, also run by `projects/agent-kit/tests/flow-language.test.sh`.

### SC-AK-1849 — the stop words and what holds the turn after them are taken from `words`

Given a description whose `words` set `stop`, `stopExcept` and `holdAfter`
When messages are judged by them
Then a message opening with a stop word says stop, and one that goes on with a word of the two other lists does not, «не» before the exception aside
And a stop word inside another word or not at the start says nothing, and another description has other words
And exceptions that are no list and a key no description has are refused

Covered: `projects/agent-kit/tests/flow-language.test.sh`.

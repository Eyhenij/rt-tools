# Scenarios — the checks of publishing

The prefix `SC-AK`. The subdomain `publish-checks` of the domain `agent-kit`.

### SC-AK-893 — the published neighbour has the symbol

Given the package imports from a neighbour symbols that are in the types of the published version
When the comparison of the imports goes
Then the check is green and names the number of pairs "package — neighbour"

Covered: `projects/agent-kit/tests/checks-package-imports.test.sh`.

### SC-AK-894 — the published neighbour does not have the symbol

Given the package imports a symbol that is not in the greatest version of the neighbour under the
range of the manifest
When the comparison of the imports goes
Then the check is red and names the package, the symbol, the neighbour and its version; it does not
name the symbols that are there

Covered: `projects/agent-kit/tests/checks-package-imports.test.sh`.

### SC-AK-895 — a multi-line import with `type` and `as`

Given the import is written in several lines, with `import type` and with a rename through `as`
When the comparison of the imports goes
Then what is compared is the name at the neighbour, not the alias, and the check is green

Covered: `projects/agent-kit/tests/checks-package-imports.test.sh`.

### SC-AK-896 — the chain of `export *` is read to the end

Given the types of the neighbour are assembled by a chain of `export * from`, and a `.js` lies next
to every `.d.ts`
When the comparison of the imports goes
Then the symbol from the depth of the chain is found, and the check is green

Covered: `projects/agent-kit/tests/checks-package-imports.test.sh`.

### SC-AK-897 — probes and showcase stories are not judged

Given the missing symbol is imported only in a probe and in a showcase story
When the comparison of the imports goes
Then the check is green

Covered: `projects/agent-kit/tests/checks-package-imports.test.sh`.

### SC-AK-898 — a neighbour without a version under the range, or not named in the manifest

Given there is not a single version of the neighbour in the registry under the range of the manifest
When the comparison of the imports goes
Then the check is red and names the range

Given the package imports from a neighbour that is not in the manifest
When the comparison of the imports goes
Then the check is red and names the absence in the manifest

Covered: `projects/agent-kit/tests/checks-package-imports.test.sh`.

### SC-AK-899 — the registry did not answer

Given the registry does not answer
When the comparison of the imports goes
Then the check passes and says that the comparison was skipped

Covered: `projects/agent-kit/tests/checks-package-imports.test.sh`.

### SC-AK-900 — the symbol waits for the publishing of the neighbour

Given the published neighbour does not have the symbol, while in the sources of the neighbour in the
tree it is exported
When the comparison of the imports goes without the strict mode
Then the check passes, names the symbol as waiting for publishing and counts those waiting

Given the same
When the comparison of the imports goes in the strict mode
Then the check is red and names the symbol

Covered: `projects/agent-kit/tests/checks-package-imports.test.sh`.

### SC-AK-901 — judging one package and an import inside a comment

Given the named package is clean, while a neighbouring package has a missing symbol
When the comparison is narrowed down to the named package
Then the check is green and does not see the neighbouring one; an import inside a comment is not
judged

Given the named package is not in the directory
When the comparison is narrowed down to it
Then the check is red: there is nothing to judge

Covered: `projects/agent-kit/tests/checks-package-imports.test.sh`.

### SC-AK-902 — the publishing pipeline rebuilds the lock after the publishing and puts it by a request

Given the pipeline raises the version of the package
When its steps are read
Then the rebuild of the lock stands after the publishing step, and after it a step that puts the
request; a pipeline without a rebuild, with a rebuild before the publishing or without a request is
named by the name of its file with the reason

Covered: `projects/agent-kit/tests/checks-publish-lockfile.test.sh`.

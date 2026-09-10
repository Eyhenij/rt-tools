# Scenarios — the laws the package ships

Prefix `SC-AK`. The subject is the kind of the resource, not the content of any particular law.

### SC-AK-990 — a law names no address

Given a law of the package
When its text is read whole
Then it holds no path, no file name and no binding to a symbol

Covered: `projects/agent-kit/tests/laws-kind.test.sh`.

### SC-AK-1001 — a law holds the articles section and nothing but open questions besides it

Given a law of the package
When its sections are listed
Then the articles section is present and not empty, and any other section is the open questions

Covered: `projects/agent-kit/tests/laws-kind.test.sh`.

### SC-AK-1002 — a law name is unique across both layers of the constitution

Given the laws of the shared layer and of the application layer
When their names are gathered together
Then not one name is met twice

Covered: `projects/agent-kit/tests/laws-kind.test.sh`.

### SC-AK-1003 — a law needing a trait of the tree names it in its file name

Given a law whose articles hold only where the tree has a storage, an admin panel or an application
When the name of its file is read
Then the trait stands in it as a prefix, and a tree that did not declare the trait does not get the
law

Covered: `projects/agent-kit/tests/laws-kind.test.sh`.

### SC-AK-1004 — a law without a rule under it declares itself an agreement before the code

Given a law not one rule declares
When its header is read
Then a status line says it is an agreement written before the code

Covered: `projects/agent-kit/tests/laws-kind.test.sh`.

### SC-AK-1005 — the index of the laws is printed from the directory, not from a list

Given the laid-out directory of the laws
When the session start prints the index
Then every file of the directory stands in the index, and the index is assembled by no list of its
own

Covered: `projects/agent-kit/tests/laws-kind.test.sh`.

### SC-AK-1006 — the entry into the specs answers about a law with a spec, not with a gap

Given the name of any law of the package
When the entry into the specs is called with that name
Then it answers with this subdomain and its statements, and the exit code is zero

Covered: `projects/agent-kit/tests/laws-kind.test.sh`.

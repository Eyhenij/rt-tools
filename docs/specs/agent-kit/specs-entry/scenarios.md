# Scenarios — the entry into the specs by a resource name

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-940 — by the name of a resource the spec about it and its statements are named

Given the companion of a subdomain binds a statement to a file of the package
When the command is called with the name of that file
Then it names the path of the spec of the subdomain, the statement text and the address of the
binding, and the exit code is zero

Covered: `projects/agent-kit/tests/specs-for.test.sh`.

### SC-AK-941 — a short name and a full path give one answer

Given the complaint names the resource from the root of what is carried, and the binding names it
from the root of the tree
When the command is called first with the one string and then with the other
Then both calls name the same subdomain and the same statements

Covered: `projects/agent-kit/tests/specs-for.test.sh`.

### SC-AK-942 — the tail is matched by whole segments of the path

Given a binding names a file whose name ends with the asked name as a piece of a word
When the command is called with the short name
Then that file does not get into the answer: the match goes by the boundary of a path segment

Covered: `projects/agent-kit/tests/specs-for.test.sh`.

### SC-AK-943 — a name matched by nothing ends with a refusal

Given not one binding of any spec names the asked file
When the command is called with that name
Then the exit code is not zero, and the output names what was looked for

Covered: `projects/agent-kit/tests/specs-for.test.sh`.

### SC-AK-944 — a file two subdomains speak of comes back with both

Given the companions of two subdomains bind statements to one file
When the command is called with its name
Then both subdomains are named, and the statements stand apart under each

Covered: `projects/agent-kit/tests/specs-for.test.sh`.

### SC-AK-945 — called without a name, the command names the uncovered

Given the package carries a file not one binding names
When the command is called without an argument
Then that file stands in the output, and a file bound by a statement does not

Covered: `projects/agent-kit/tests/specs-for.test.sh`.

### SC-AK-946 — a tree without the sources of the package gets an empty list of the uncovered

Given the tree carries no layout directory of the package
When the command is called without an argument
Then the exit code is zero and there is nothing to name: there is nothing to count the uncovered by

Covered: `projects/agent-kit/tests/specs-for.test.sh`.

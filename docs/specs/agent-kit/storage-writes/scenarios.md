# Scenarios — writing to the storage

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-1056 — a query that addresses no rows by an identifier is refused

Given a delete or an edit without a condition, or with a condition not by the primary key When the
guard judges the query Then it refuses it and names the addressing by identifier: without a
condition the query touches the whole table, and by anything else it may match wider than intended.
An assignment in the set part does not count as addressing — the tail after the last `where` is read

### SC-AK-1057 — an addressed edit and an insert are asked about, a read passes

Given an edit addressed by the primary key, an insert, or a condition by a foreign key When the
guard judges the query Then it asks: only the owner's word decides on a data edit. A select passes
in silence

### SC-AK-1058 — on the production storage a write is refused and a read is proven

Given the tree named the address of the production storage When a write goes to that address Then it
is refused without a bypass; a taken dump and a single select pass, while a call the guard did not
recognise as a read is refused even without a verb of a write in it

### SC-AK-1059 — a delivery whose content is invisible counts as a write

Given the query arrives as a file, as a pipeline from a source into the client or as a restore out
of a dump When the guard judges the command Then it counts it a write, because it sees no content.
Taking a dump stays a read even next to such a call: the segment of its own call is judged

### SC-AK-1060 — a command that delivers nothing to the server is not parsed

Given a search across the tree or a commit whose message holds the words of a query When the guard
judges the command Then it passes: going around a refusal here would mean spoiling the search
pattern rather than the work. An empty input and a foreign tool pass the same way

### SC-AK-1061 — a migration is judged by the address it resolves to

Given applying migrations, and the address is taken from the command, from the environment or from
the environment file When the guard judges it Then a local address passes, the production one is
refused and any other is asked about. A migration next to a second write in the same command loses
the pass: the check would come off the second link

### SC-AK-1062 — a throwaway database is asked nothing

Given the address leads to a loopback with a port out of the range the tree set aside for throwaway
databases When the guard judges a write there Then it passes: the copy is torn down right after the
check, and there is no data worth guarding

### SC-AK-1063 — the marker lowers a refusal to a question and does not lift it

Given the text of the query holds the marker When the guard judges a destructive query Then it asks
instead of refusing; the same query without the marker is refused, and on the production address the
marker changes nothing

Covered: `projects/agent-kit/tests/sql-guard.test.sh`.

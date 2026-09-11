# Scenarios — the second development server

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-1051 — raising a server is refused whatever it is raised by

Given a command raises a development server — by the framework, by a script of the package runner,
by a bundler or by a static server over a build When the guard judges the command Then it refuses
it: a second instance takes another port and serves another build, and the difference between two
servers reads as a defect of the edit

### SC-AK-1052 — a build, a test and a look at the ports pass

Given a command builds, runs the suite, asks a raised port or looks at the listeners When the guard
judges the command Then it lets it through. A call of version control passes as well, even when the
words of a raise stand in the text of a message; a search over the tree and killing a process by a
pattern pass because the start of a call is bounded by the start of the line or a separator

### SC-AK-1053 — the refusal names the addresses of the raised applications

Given the tree named the addresses at which its applications are raised When a raise is refused Then
those addresses stand in the text: a refusal without an address is bypassed rather than carried out.
A tree that named none gets a general text and the refusal itself stays

### SC-AK-1054 — a run configuration is judged by its name, an unnamed one by its file

Given a launch of a ready run configuration whose name looks like a raise When the guard judges the
call Then it refuses it: the content is invisible by the name alone. A configuration made of the
manifest file has no name at all and is refused by the file; a configuration named otherwise passes

### SC-AK-1055 — the nested command is parsed, not its wrapper

Given a raise of a server is passed as a nested string of the universal executor When the guard
judges the call Then it refuses it: the runner name stands right after a quote, and without parsing
the nested command no rule of the guard reaches it

### SC-AK-1091 — who raises the stands is answered by the tree

Given the tree profile says the session raises the stands When the guard judges a raise Then it
refuses it only while a port of the stand list is taken, and the refusal names that port and the
way to ask what holds it. A free port passes: nobody but the session raises anything here. A tree
that set nothing keeps the former behaviour whole — any raise is refused, and the text of the
refusal names the addresses of the raised applications

Covered: `projects/agent-kit/tests/dev-server-guard.test.sh`.

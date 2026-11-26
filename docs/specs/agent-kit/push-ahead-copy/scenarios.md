# Scenarios — the run ahead and its copy

The numbers continue the numbering of the package; a changed promise keeps its number.

### SC-AK-1980 — an edit left in the copy ends the run

Given a step of the set that leaves an edit in the copy, and a step after it
When the set runs ahead
Then the run ends with 101, names the edited path and the step, starts no further step, says «not
judged» and never «the set is green», and the steps before the edit keep their marks

Given the step that edits the copy is red
When the set runs ahead
Then the run ends with the number of red checks and names the edit

Given a step that adds a file, in a copy whose settings hide untracked files
When the set runs ahead
Then the run ends with 101 and names the file as written

Given a step that leaves a process in the background, and the process edits the copy
When the set runs ahead
Then the step ends with the process, and the run ends with 101

Covered: `projects/agent-kit/tests/push-ahead-copy.test.sh`.

### SC-AK-1981 — a commit made under the run takes the marks away

Given a step under which a commit is made, a step before it and a step after it
When the set runs ahead
Then the run ends with 101, names the first two, not the third, and says the head moved

Given the step under which the commit is made is red
When the set runs ahead
Then the run ends with the number of red checks and names the step before it

Given a step found green already that reads the committed text, and a heavy one that does not
When a commit of the text is made under a later step
Then the run ends with 101 and names the first alone

Given marks that cannot be written
When the set runs ahead
Then the run ends with 101 and does not say the head moved

Covered: `projects/agent-kit/tests/push-ahead-copy.test.sh`.

### SC-AK-1982 — a copy nobody touched is judged as before

Given a set whose steps are green, one with nothing to look at and one that writes the record of
observations
When the set runs ahead
Then the run ends with 0 and says the set is green

Given a step that reads its input
When the set runs ahead
Then the step after it runs too

Given an edit outside the index before the start
When the set runs ahead
Then the run does not start and ends with 3

Covered: `projects/agent-kit/tests/push-ahead-copy.test.sh`.

### SC-AK-1983 — a stopped run leaves no process and keeps its marks

Given a step with a server in a group of its own, taken down by the step on `INT`, and another that
takes its server down on `TERM`
When the run is sent `TERM` twice
Then the step takes its server down itself, the run ends with 143, names the stopped step, starts no
further one, leaves the copy clean, and the step before keeps its mark while the stopped one has none

Given a step whose child outlived its own parent in the group of the step
When the run is sent `INT`
Then the run ends with 130 and the child is gone

Given a step that dies at once and held a deaf child in a group of its own, and a step deaf itself
When the run is sent `TERM`
Then nothing of them is left

Given a step that dies at once and held a child in a group of its own that cleans up by `TERM`
When the run is sent `TERM`
Then the child cleans up and is gone

Given a step of two commands, the first of which ends by `INT` itself
When the run is sent `TERM`
Then the second command does not start

Given the same step
When the run is sent `HUP`
Then the run ends with 129 and the step is gone

Given a machine with no table of processes, or one that fails once, and a step deaf to `INT`
When the run is sent `TERM`
Then the step is gone, and the run ends without waiting for it to finish

Covered: `projects/agent-kit/tests/push-ahead-copy.test.sh`.

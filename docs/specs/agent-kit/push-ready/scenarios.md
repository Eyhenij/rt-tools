# Scenarios — a PR asked about before the set

The numbers continue the numbering of the package; a changed promise keeps its number.

### SC-AK-1993 — the run starts nothing while a PR would not open

Given a branch with a task number, an open step in its folder and a guard of the tree that refuses
When the set runs ahead
Then the run ends with 3, names both reasons, says «not ready for a PR», starts no step and leaves a line in
the observations

Given a branch every condition of which is met
When the set runs ahead
Then the first step starts

Given the same branch and `--no-pr` with a reason
When the set runs ahead
Then nothing is asked, the reason is printed, the first step starts and the observations keep a line

Given `--no-pr` without a reason, with a reason shorter than three characters, with the sample of the reason,
or another argument
When the run is called
Then it ends with 3 and the line of the usage

Given a branch with no task number
When the set runs ahead
Then nothing is asked

Covered: `projects/agent-kit/tests/push-ready.test.sh`.

### SC-AK-1994 — the folder that cannot be taken apart

Given a step not done, an untouched footprint, a plan edited after its commit, a step with no mark of the
engine, or a folder with no plan
When the set runs ahead
Then the run ends with 3 and names that reason; two reasons are two lines

Given a folder with every step done and no approval mark on the machine
When the set runs ahead
Then the first step starts

Given a description of the flow that does not build
When the set runs ahead
Then the run says the folder is not judged and starts the first step

Given a folder taken apart, and a main branch that moved
When the set runs ahead
Then the first step starts

Given a card with the label of an epic and a folder of a task left in the branch
When the set runs ahead
Then the run ends with 3 and names the folder

Covered: `projects/agent-kit/tests/push-ready.test.sh`.

### SC-AK-1995 — a moved base

Given a task of an epic with its folder in the branch, and the branch of the epic moved by a plain commit, by
a merge of the host, or under a chain
When the set runs ahead
Then the run ends with 3 and names the merge of the branch of the epic

Given a task outside an epic with its folder in the branch, and the main branch moved
When the set runs ahead
Then the run ends with 3 and names the merge of the main branch

Given a card that does not answer, several branches of the epic, or the branch of an epic itself with a moved
main branch
When the set runs ahead
Then the base holds nothing

Covered: `projects/agent-kit/tests/push-ready.test.sh`.

### SC-AK-1996 — the guards of the tree are asked with the base of the PR

Given a guard named by the profile that refuses
When the set runs ahead
Then the first line of its refusal is the condition; a guard that passes, and one that is absent, hold nothing

Given a task of an epic, of a moved epic and of a chain
When the set runs ahead
Then the guard is asked with the branch of the epic, and in a chain with the branch below

Given a run that inherits the parsed input of a hook around it, or stands in another copy than the session
When the set runs ahead
Then the guard is asked with the opening of a PR in the copy the run stands in

Given the helper is not laid out
When the set runs ahead
Then the set runs as before

Covered: `projects/agent-kit/tests/push-ready.test.sh`.

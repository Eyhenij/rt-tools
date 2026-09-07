# The findings of the review of the closed works of the epic RT-702

The findings accumulate here while the epic "The review of the texts of the rules layer" goes: the
owner reads them at once when the epic is over and says what of them is right. What they name is made
into a proposal and leaves for the package; outward without that word goes only the digest of the
observations. Every next task of the epic appends its findings here too, as a section.

The file lies next to the plan of the epic — `docs/plans/agent-kit-rules-review.md` — and not inside
it: over an epic more findings accumulate than the plan itself, and the plan would stop reading as a
decision about the order of the works.

## RT-703, RT-710, RT-716 — the review of 16 August 2026

The role of the review of a closed task, three tasks in one session.

Loaded over the session: `task-flow`, `task-flow-start`, `spec-driven`, `doc-style`, `git-workflow`,
`git-workflow-commit`. Not one of them stood idle. All the losses are in the pair of rules about the
delivery: the rule openly claimed the wrong thing about the machine account, and about the refusal of
`gh pr create` at the quota, about the executor of a task, an empty body of a task, a refusal of the
runner and a missing run it said nothing.

## The package, the companion and the gate map

**Taken apart by the task RT-1604.** Thirteen items were reconciled with the present resources: eight
were closed by past edits, one fell away, four were brought in by this task, and a fifth — a property
of the machine — landed as an override of the tree.

| Item                                                                   | What it ended with                                                                                                    |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1 · what is created is visible to whoever reads it                     | brought in: an article of the law of the delivery about the visibility of what is created to the side it is for       |
| 2 · a request is reread by the token of whoever takes it apart         | closed: the articles about the rereading of the state and about the checking of the author against the reviewer       |
| 3 · a contradiction in the pitfall about the account                   | closed: the former wording is gone, the order is described by the section about the machine account                   |
| 4 · the opening of a request is refused in the language of the queries | brought in: the technique of the opening by a REST call in the pattern of the request                                 |
| 5 · the body of a task is never empty                                  | brought in: an article of the pattern of the start of the work                                                        |
| 6 · the commands of the tree are called from the root                  | brought in: a pitfall of the cold part of the rule of the delivery                                                    |
| 7 · what one comes back to a run by                                    | fell away: the order changed — between two messages to the owner the executor does not wait at all                    |
| 8 · an absence of a run is never green                                 | closed: the pitfall about a tip without a run and about what it is called                                             |
| 9 · a refusal of the runner at the preparation is not about the edit   | closed: the pitfall about a refusal of a step before its first own step                                               |
| 10 · the gate judges all the paths of a command                        | closed: the paths are taken at the writing pieces, and a redirection gives one goal of the write                      |
| 11 · the line about the account of the machine work                    | closed: the line of the companion is right, the order is described by the section about the machine account           |
| 12 · the pulling goes by the same token                                | closed: the substitution of the token is named by the companion of the tree                                           |
| 13 · the runner on this machine is not the only one                    | brought in as an override of the tree: the pitfall about a neighbouring queue on the same machine                     |
| the gate map: the sources of the package                               | closed: the branches of the map lead into the rule of the structure of the texts and into the rule of the rules layer |
| by a task of its own: the sign of a write                              | closed: a piece writing by one redirection gives the goal of the write, not every path                                |

## RT-704 — the first run of the role of the review, the family `project-documentation`

**Taken apart by the task RT-1210.** All five items below are closed: the reference to a
non-existent question is removed, the form of the number is brought to one across all the texts of the
family and in the text of two checks, the closing section of the patterns is named by one name across
the whole corpus, the line of the revision is removed from the sample, and the article about an image
and the prose is reflected by the rule of the style and bound by the verdict "It is checked by
nothing". The law was not edited at that: both the section of the open questions and the line of the
revision are an edit of it, and that demands a word of the owner.

The run was led by the main agent, not by a subagent: the setting of the executor forbids calling the
roles without a word of the owner, and there was no word for this run. The order of the reading is the
one the command prescribes: the law, both rules under it, the five patterns at them, 1098 lines.

### The divergences

1. **A reference of a rule leads into a question that is not in the law.** `rules/spec-driven.md`:
   "The order 'first the description, then the code' is held by an agreement — that is `Q-PD-3` in the
   law". `laws/project-documentation.md` carries neither a section "Open questions" nor the question
   `Q-PD-3` at all. The reader goes into the law for the agreement and finds nothing there; both sides
   at that look to be in force.
2. **The rule and the pattern at it name a question by two forms.** `rules/spec-driven.md`: "`Q-N` —
   it is referred to from a task on the board and from the commits".
   `patterns/spec-driven-rule.md`: "A question is named `Q-<the letter of the law>-<the number>`". In
   the laws themselves the second form stands — `Q-CS-3`, `Q-O-1`. Whoever creates a question by the
   rule will put a number that will coincide with not a single one already standing.
3. **The pattern declares one closing section for the patterns, and the corpus carries two.**
   `patterns/spec-driven-rule.md`: "The sections: `## When it is taken` · the ready code ·
   `## Common misses`". Of the forty-five patterns "Common misses" is carried by forty-one, "Pitfalls"
   — by five, and all five are at the rules of the conduct of the work and of the checking through the
   browser. Whoever creates a pattern by the sample will write one thing, whoever reads a neighbouring
   one will see another and take it for a miss.
4. **The sample of a law in the pattern carries a line that sixteen laws of seventeen do not have.**
   `patterns/spec-driven-rule.md` shows in the example "**Revision:** 2026-08-05"; the line "Revision"
   is carried by one law — `observability`. Either it is mandatory and sixteen lack it, or it is not
   mandatory and it has no place in the sample.

### The gaps

5. **The article about the pair "an image and the prose" is reflected in not a single rule of the
   family.** `laws/project-documentation.md`: "An image is edited by the same change as the text it
   depicts". Neither `spec-driven` nor `doc-style` says anything about it — neither in the section of
   the application nor in "What of the law is not here". There are no graphs in the package yet, and
   the article reads as a sleeping one; it will wake by the task RT-705, and by that moment the rule
   must say what this pair is held by here.

## RT-705 — the first run of the role over two families, 16 August 2026

The role of the review was run over the families `work-conduct` (a law, a rule, four patterns) and
`verifiability` (a law, two rules, four patterns). Fourteen divergences and nine gaps came back; five
divergences concerned the fresh graphs and were fixed by the same PR — below is what is left waiting
for the owner.

### The family work-conduct

**Taken apart by the task RT-1580.** Of the ten items one turned out alive — the sixth: an article of
the rule about the second threshold of the filling of the window named the record of the progress, and
the guard lets the task folder through whole, and the pattern of the handover says the same. The rule
is brought to what the guard refuses.

The other nine were closed earlier or fell away: 2 — by the task RT-1203, the order of the closing of a
work is now one and unambiguous; 4, 7, 8, 10 — by the task RT-1212 under its numbers 27, 7, 30 and 29;
1, 5 and 9 fell away together with the text that gave birth to them — the claims about a question that
cannot be intercepted, the word "pipeline" over two notions and the requirement to name a stop by a
remark of one's own are not in the present edition at all; 3 is lifted by the fact that the "When it is
taken" of the pattern of the closing now lists both the opening of the request and the first message to
the owner as steps of its own.

1. **The rule says that there is no interception of a question before the sending, and there is one.**
   The section "What of the law is not here" claims: "A prose question is not an instrument, and there
   is nothing to catch it earlier by" — and the guard of the conversation stands on two events, and a
   menu is caught before the sending. An executor who believed the rule loses the turn and the question
   at once.
2. **The taking apart of the folder: by a green run or after the remarks.** The rule and the pattern
   name the order "the run is green → the folder is taken apart", and the pitfall of the same pattern —
   "the edits by the review, then the taking apart of the folder". The first wording removes the plan
   before the edits by the remarks, and the guard refuses them.
3. **The pattern of the closing is taken later than two of its steps happen.** The first message to the
   owner and the background launch of the review are obliged to happen in the turn of the opening of the
   PR, and the "When it is taken" puts the pattern after the stages are closed.
4. **The findings of the review are laid into a folder that no longer exists by their arrival.** By the
   numbers of the steps the findings come back after the taking apart of the folder — there is nowhere
   to lay them, and "the moving at the taking apart of the folder" is unexecutable.
5. **The word "pipeline" stands over two different notions** in one section: the pipeline of the roles
   after the review and the run of the checks on the side.
6. **The second threshold of the filling of the window is described by two volumes:** the rule allows
   the record of the progress, the pattern — the whole task folder. The pattern is right: the guard lets
   the folder through whole.
7. **The end of an epic as a ground to close a session.** The law gives one ground — the limit of the
   filling of the window; the pattern of the returning to the work introduces a second.
8. **A gap: a negation got by one source.** The article of the law is reflected by not a line, and the
   exploration in the pattern of the start of the work is named by exactly one-time sources.
9. **A gap: the form of a remark about a stop.** The rule demands naming a stop by a separate remark,
   but there is no ready form for it in any pattern — unlike the neighbouring messages to the owner.
10. **A gap: a record about an incident.** Neither a directory, nor a form, nor the difference from the
    findings of a review is named by the rule or the patterns; the guard of an incident is not named in
    the line of the requirements of the rule.

### The family verifiability

**Taken apart by the task RT-1211.** The items 11–19 are closed: the place of the check and the kind of
the switch are named, the pinned identifier of the profile is removed from the portable pattern, the
fate of a neighbouring stand and the set before the push are brought together with the rule and the law,
four gaps are closed by the articles of the rule or named as prose in "What of the law is not here". The
law was not edited.

11. **The pattern of the stand sends one to look at the screens on the dev server**, and the rule and
    the law name as the place of the check the production build behind the real proxy.
12. **The three canonical switches of the end-to-end tests** the rule declares to be unfulfilled tests
    (a switch by a variable of the environment), and the pattern serves as an ordinary technique and is
    silent about the marks. A sign telling "the state of the stand" from "a variable" is given by not a
    single text of the family.
13. **The portable pattern carries a pinned identifier of one tree** — in the same file where the ports
    are taken out as holes for the tree.
14. **The stand of a neighbour: to keep it up or to put it out.** The pattern orders both kept, the
    pitfall of the rule — to put it out before the shooting; which is senior is not said.
15. **The pattern of the moving of the code prescribes a set by the changed files** — exactly the
    technique the law about the checkability names the reason of a red pipeline.
16. **A gap: a successful answer of a command.** The article of the law about the rereading of the
    result by a query of its own is not laid out into a single rule of the family.
17. **A gap: a service is counted up by a fulfilled step of the pipeline.** The rule goes only as far as "who answers on
    the port".
18. **A gap: the observation of the work.** Neither the kind of an event, nor the place of a write, nor
    the check on the carrying-out side is named by the family.
19. **A gap: the snapshot set lives only in a pitfall of the rule** — neither where the references are
    nor how they are updated is said anywhere.

## The second and the third runs of the role — the families `work-conduct` and `delivery`

The run was led by the role `rules-reviewer`, one session per family, at the word of the owner "move on
by the epic". The sign of the closing of the epic demands two or three families; with the first run
there are three of them.

The order of the reading is the one the command prescribes. `work-conduct`: the law, the rule
`task-flow`, four patterns at it. `delivery`: the law, the rule `dependencies`, three editions of the
rule `git-workflow` and nine patterns at them.

### The family `work-conduct` — the divergences

**Taken apart by the task RT-1212.** Of the seventeen items of the family ten were closed by past
editions; open stayed seven — 7, 20, 21, 29, 30, 31, 32 — and all of them are closed by this task: the
ground to stop a session is one again, the threshold "more than one remark" is lifted, the form of an
assumption, the place and the form of a record about an incident, a negation by one source, the work
outside an epic and an argument of the executor against an accepted decision are named. The law was not
edited.

20. **The task folder: "no exceptions" against the threshold "more than one remark".** The rule lifted
    the threshold by the size of the work by a direct text, and the condition of the entry in
    `task-flow-start` returns it in another measure. Whoever appraised the request as "one remark long"
    creates no folder and runs into a refusal of the guard already with the edit in their hands.
21. **Six questions "always" against the article about an obvious answer.** The law allows naming an
    assumption and going on, the pattern demands six answers of the owner before the pipeline and gives
    no form "the question is closed by an assumption".
22. **The second threshold of the filling of the window allows different things.** The rule leaves the
    record of the progress, the pattern of the handover — the whole task folder, including the plan,
    which is forbidden to edit.
23. **The draft of the folder: an unconditional rule against "half of the works" in the pattern.** The
    step 2 orders a draft created always, the step 5 — that at an issued number there is no draft; the
    grill stays in an abandoned directory.
24. **The first message to the owner at the opening of a PR lies in the pattern of the closing**, whose
    condition of the taking is knowingly not fulfilled by the moment of the opening of the draft.
25. **Two different "last commits of a PR".** The rule twice names the last both the merging of the
    agreement and the taking apart of the folder; the pattern decides the argument in favour of the
    taking apart.
26. **The plan of an epic is deleted earlier than the owner has read the findings laid next to it.** The
    step 12 removes the place the step 17 lays the findings into "until the end of the epic".
27. **The findings of a review land in a folder that no longer exists by their arrival.** The step 14
    removes the folder, the step 17 lays a file into it.
28. **A directory named by the tree: "the companion of the rule" against "the profile of the tree".**
    Two directories of one kind are sent to different carriers.

### The family `work-conduct` — the gaps

29. **A record about an incident: the mechanism is named, the form and the place — nowhere.** The guard
    refuses a turn while there is no record, but there is not a line about where it lies and what it is
    called in the family.
30. **A negation got by one source.** The article of the law is laid out neither into the rule nor into
    the pattern; the pattern, on the contrary, declares a one-time "I did not find it" a checkable
    result.
31. **The work outside an epic: what a session is occupied with after its closing.** Only the branch of
    an epic is described.
32. **An argument of the executor against an already accepted decision about a sending.** The case where
    the sending runs into an inconvenience is named neither by the rule nor by the pattern.

### The family `delivery` — the divergences

**Taken apart by the task RT-1213.**

33. **The edition for Azure builds the number without the key of the tasks**, although the law demands
    one form "the key, a hyphen, the number" everywhere; the section "What of the law is not here" is
    silent about that.
34. **The rule says that the pipeline is run on a PR, the pattern — that nothing is run before the
    merge.** The pattern contradicts both the rule and itself fifteen lines lower.
35. **The rule for GitLab orders the absorbed task erased, the pattern — that it must not be erased.**
36. **The law demands the second task erased, two editions close it as a duplicate** and declare no
    departure.
37. **The auto-merge: the law gives the merge to a person, two editions object only to the order**, from
    which it reads that after the checks the button is lawful.
38. **The common patterns are written for one hosting, and all three editions call them** — the executor
    looks for a file of the rollout that is not in their tree.
39. **The pattern of the merge is wholly on the client of one hosting**, and it is listed as a pattern at
    all three.
40. **Where the key of the tasks is set — the editions answer differently:** at one the key is in the
    setting and it refuses at the first call, at another — in the text for the reader.
41. **About the freshness of the tip of the main branch three editions describe one and the same guard
    oppositely.**
42. **The pattern sews in the scopes of a commit and the names of the columns the rule gave to the
    tree.**

### The family `delivery` — the gaps

**Taken apart by the task RT-1213.**

43. **The rolling back of a rollout is described nowhere**, although both the law and the rules rest on
    it: the depth of the rolling back in three shas is named, and the movement is not.
44. **Not a single rule answers the article of the law about a record on a breakage that took place.**
45. **"I will check after the merge" the law forbids, the rules are silent** about the case where there
    is nothing to run by.
46. **Two editions have not a line under the article "A PR into the main branch is merged by a
    person".**
47. **The pattern of one hosting does not name the fate of a branch after a merge**, whereas at the
    neighbouring editions that line stands in the common misses.

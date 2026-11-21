<!-- rt-kit v0.37.1 · pitfalls/task-flow-close.md · 99acd720a50f · правится надстройкой, не здесь -->
# Closing the work — cold part

The pattern `task-flow-close` whole, in two files: every section with its code and its reasons. Its hot part names the sections and the opening of each.

## Pitfalls

The misses of this pattern stand where they happen: in its sections below and in its list of
common misses, when it has one.

Pattern of the rule `task-flow`. What must be true meanwhile — the law
`docs/constitution/work-conduct.md`.

## When to use

- The stages of the plan are closed.
- `npm run check:specs` listed the agreement in its "time to merge" section.
- The spec is measured for length before the merge and right after it: one already over the limit is
  split by a commit of its own first, one that has grown is split by the same commit.
- The domain texts are up to date, and `product-strategist` reviews the work against its points.
- The gate suite is run whole — after the merge and the texts, not before them.
- The task folder is taken apart, and the PR opens — a draft or ready, by the base.
- The run on the head is green, and the draft is lifted from the PR.

Taking the folder itself apart is not here — that is pattern `task-flow-archive`. It stands between
the suite run and opening the PR: the PR opens behind work already cleaned up.

**The run stands after merging the agreement and bringing the texts up to date, not before them.**
Both steps cost minutes, and the run costs the session window. A session that spent it on the run
hit the fill threshold on four binding lines, and there was nothing left to write them with. The
second argument is stronger than the first — a run that goes after the merge checks the merge
itself; going before it, it looks at a state of the tree that will not reach main.

## State `этапы-кончились`: the agreement merges into the domain spec

By one of the last commits of the branch, before the PR opens. By then the code is written, so the
`file:symbol` bindings are known — the rule enters the domain spec checkable at once.

```bash
npm run check:specs   # the "time to merge" section names the ready directories
```

**The spec is measured for length before the merge, and again in the same turn after it.** Merging
is a known move that grows a spec. One merge took it to 572 lines against a limit of 500, and the
executor learned of it from the push guard's refusal — after the commit. One that has grown is split
into subdomains right here, not on the push.

A spec grows by direct edits too, and a measure taken only after the merge leaves that excess to
every next merge: one domain spec stood at 885 lines and its scenarios at 1293 before any of nine
waiting agreements. So the measure goes first: a spec already over the limit is split by a commit
of its own, and the agreement merges after it. The same holds for a rule or a scenario added to a
spec directly, with no agreement: the room is measured before the edit, not learned from the push
set after the work.

The order of the move:

- the rules from `proposed/<фича>/spec.md` are appended to the domain's `spec.md`, into its
  sections;
- the scenarios move to the domain's `scenarios.md` **with their old numbers**: test titles refer to
  them, and renumbering breaks the audit;
- scenarios whose promise the work rewrote are edited in place: the number stays, the text is new,
  the test title is edited by the same commit. Work that removes a technique rewrites a written
  promise more often than it adds a new one, and a list naming one append does not name this edit at
  all;
- the bindings from `proposed/<фича>/implementation.md` are appended to the domain's
  `implementation.md` and set on the code that now exists;
- the laws the feature declared in its header are appended to the header of the domain spec;
- the `proposed/<фича>/` directory is deleted, and the line about the feature is removed from the
  "proposed, not yet rolled out" section of `docs/specs/README.md`;
- the domain did not exist yet — `proposed/` is replaced by a full spec, and the domain gets a row
  in the table of `docs/specs/README.md`.

The work went in several tasks — the merge goes in the last of them. Which one is last is seen in
the epic plan; a closed epic leaves for the archive or is deleted.

```bash
npm run check:specs   # after the merge: the bindings are in place, no scenario is lost
```

**Next move:** after the merged agreement, in the same turn, come the domain texts — the rules,
patterns and sections the work touched.

## State `этапы-кончились`: the domain texts are brought up to what was done

Only what was written before the code goes into the spec. The other texts — rules, patterns,
application laws — nobody re-reads after the edit, and they go on describing the old tree. The next
reader takes them for true.

What to re-read is taken from the plan section that names what the work touches: the specs, laws and
rules along its footprint stand there. What surfaced along the way is added. The whole constitution
and all the rules need not be read.

| Kind of text | What is done with it |
| --- | --- |
| the domain spec and its subdomains | a new feature gets a rule, a scenario and a binding; what is now included leaves "What is not included" |
| a rule and its `implementation.md` | a new statement with a `file:symbol` binding; a lifted one leaves together with its binding line |
| a pattern | code that diverged from the tree is fixed; a new technique is appended as a section |
| an application law and a general law | **the file is not edited**: the owner gets the text of the article, the work goes on without it |
| the product overview document | a new feature is appended as a line; the line about a lifted one is edited |

What is stale lies most often in four places, and all four are read whole:

- **"What of the law is not here" in a rule.** The spec audit does not read this section, so an
  untruth lives there as long as it likes;
- **"What is not included" in a domain spec.** A task boundary was written there, and the task is
  long closed;
- **"Where it lives" in a rule.** Files move, the paths in the table stay;
- **A statement of a companion about what the tree does not have.** Written before the subject
  exists, it lives on words about emptiness, and nobody rereads it once the subject appears.

```bash
# where the rule and the specs speak of what the work touched
grep -rn -i "<слово работы>" <каталог правил>/*/SKILL.md docs/specs/*/spec.md
# the section nothing audits — read whole by eye
grep -rn -A3 "What of the law is not here" <каталог правил>/<правило>/SKILL.md
# the companions: statements about emptiness and counts, checked by nothing
grep -rn -iE "(нет|ни одного|пока|всего|записей) [0-9]*" <каталог правил>/*/implementation.md
```

**A law is not edited in the branch.** An article of a law is an agreement with the owner, and the
owner changes it. The work diverged from it — the ready-made text of the article is written: into
the progress and into the PR body. The law file is edited after the answer, an application law too.

What was done at this step is written into the PR body: what was re-read, what was changed, and if
nothing was changed — why. The form of the section — pattern `git-workflow-pr-body`. The body fits
the host's length limit — Azure DevOps takes 4000 characters — so the report is one line per text.

**The role `product-strategist` reviews the work while the folder still lies here.** It runs the sign
of each point in the plan and tries to prove the miss. A proved miss is fixed now or named in the PR
body next to the table of points. Before the PR of an epic the same call judges the milestone.

**The role `goal-critic` compares the result with the owner's words in the same state.** It gets the
words verbatim and the result, without the plan or an account of the work. A session calls it before
saying the work is done. Its reply is not reworded: a disagreement goes under it as a session line.

**Next move:** the updated texts are committed, and in the same turn the task folder is taken apart
— by the last commit of the branch, pattern `task-flow-archive`.

## State `папка-разобрана`: the work is handed in by a PR

The folder is taken apart and pushed, the work is cleaned up behind — and the PR opens. Whether it
opens as a draft is decided by the bases the pipeline wakes for: where a run comes, a draft, and it
is lifted on the green; where none comes, the PR opens ready and the push gate is the check behind
it. From then the work waits for the owner, and the session does not end on it: the queue audit
before the opening and the background rules review after it — pattern `task-flow-archive`; the
next task is taken by the same move, pattern `task-flow-resume`.

**Readiness is measured by what is told, not by what has passed.** A check the executor cannot pass
for a reason outside the work — a refused permission, an unreachable environment, a key held by a
person — does not cancel readiness: it goes into "Not run" and into "Remaining step" with the
reason. Silence about it reads as passed.

There is no state on disk any more — the progress left with the folder. This is the price of the
cleanup standing before the PR. The tail — open the PR, wait for the run, lift the draft, ask to
merge, and without a run the first and the last of those — is held by this pattern, not by a line in
a file. The guard counts the work
handed in by the branch history: a folder removed by its commit is the sign.

### The section on the remaining step is written in the PR body, not appended later

It stands there from the minute of opening. Saying it aloud is not enough, and the requirement does
not hold on that alone. A message lives until the next message, and the merge decision is taken on
the PR page — there is no conversation there at all. The owner merges as soon as they see green, and
a PR opened without the section goes into main before the section is appended. That is how a task
folder once went unsorted while the run was going. The section stands last and says exactly one
thing: is anything left before the merge.

```markdown

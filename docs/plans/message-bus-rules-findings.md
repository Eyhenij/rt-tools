# The receiver of the cargo: the findings about the rules layer

They accumulate along the epic RT-733 (`docs/plans/message-bus.md`) and are read at once when the
epic is over. The owner says what of this is right; what they name is made into an edit or a proposal
outward. The file outlives the merge of the branches of the tasks: a task folder dies together with
them.

At every finding an address is named: **the rules layer** — true for any tree of this class, **the
names of the tree** — true only here, **an override** — here it sounds different from the package.

## RT-692 — the details of a refusal in the journal of the receiver

- **A green build from a cache belongs to the former code, not to the present one.** The build of the
  receiver before the opening of the PR answered with a success taken from the cache, and the pipeline
  on the same code stopped: the builder checks the types in the specs too, and the spec read a field
  of a line of the journal through a dot. Neither the linter nor the run of the specs sees this — only
  the build. The item "all the applications of the tree build" from the list of the checks before the
  publication of a PR is run with the cache switched off.
  _The address: the rules layer — the pattern about a branch, a commit and a PR._

- **An access to a field of an index signature through a dot is caught only by the build of the
  application.** Such a place is created every time a spec reads the fields declared by a record with
  unknown keys, and both the rule of the structure of the code and the linter are silent about it. It
  fits as a pitfall: a field is read by a key.
  _The address: the rules layer — the pitfalls of the rule of the structure of the code._

- **The rule of the observability does not say how a machine line differs from a readable one.** It
  demands the cleaning of the fields and the taking apart of the reason in one place, but about the
  fact that on the production the line is gathered by a name and fields, and outside the production it
  is printed for a person, there is nothing in it — that is taken from the sample tree. It is closed
  by an item of the rule and a section of the pattern about a write into the journal.
  _The address: the rules layer — the rule of the observability and its pattern._

- **Mutually calling functions of a walk are declared as one.** Set apart by the kinds of the values,
  they call one another, and the linter refuses the one declared later than the call.
  _The address: the rules layer — the pitfalls of the rule of the observability._

- **A new domain is created by four layers, even when one is filled.** The checking of the layout
  demands all four, and a domain with one filled layer is entered into the list of the exceptions with
  a reason. This order came to light by a refusal of the checking, in the texts about the layers of
  the libs it is not there.
  _The address: the names of the tree — the companion of the rule about the layers of the libs._

## RT-691 — the build of the receiver and the vanished client of the storage

- **The body of a task describes the day it was written and goes stale silently.** The task claimed
  that the build at the loss of what is generated passes and lays a broken bundle; in the tree it
  refused. The check of the premise took one run and changed the subject of the work whole. It fits as
  an article about the conduct of the work: the exploration checks not only "what is in the tree" but
  also "is what is written in the task still true".
  _The address: the rules layer — the rule of the conduct of the work, the step of the exploration._

- **The guard of the conversation refuses a question to the owner before the question has left.** The
  refusal comes on the instrument of the question and demands a search by the words of the subject to
  be run. That is right in essence, but the text of the refusal does not say what counts as a search:
  the directories had to be guessed. A line with a ready command in the refusal itself would have cost
  one turn instead of two.
  _The address: the rules layer — the text of the refusal of the guard of the conversation._

- **The config of the build does not call a typed module, and a spec for it is not written by the
  usual way.** To allow a mixing of the languages across the whole project for the sake of one function
  is dear; the types are laid by a declaration next to the function, and the spec imports it as an
  ordinary one. The technique fits as a section of the pattern about the checkability: a decision is
  taken out into a pure function even where the calling side is the harness of the build.
  _The address: the rules layer — the pattern about the specs._

- **The step of the pipeline that was asked to be created already stood.** The sign of the closing
  named by the owner turned out carried out before the beginning of the work — it could be seen only
  by a reading of the file of the pipeline. It fits as a pitfall: the sign of the closing is reconciled
  with the tree by the same movement it is written down by.
  _The address: the rules layer — the pitfalls of the rule of the conduct of the work._

## RT-749 — the dump and the rollout, run live

- **The divergence of the production from the main branch is seen by nothing.** The rule of the
  delivery claims that it is seen by the audit of the work queue; in this tree there is no such check —
  `tools/check-board.mjs` does not ask about the rollout at all, and `npm run check:specs` keeps this
  claim among the rules without a binding. The production stood on an image that lagged by 86 commits,
  and only a session that climbed onto the node by hand named that.
  _The address: the names of the tree — the audit of the work queue._

- **A path of a rollout is counted unchecked until a run of the pipeline has gone by it.** The first
  rollout was made by hand, the production answered at that, and for a month that read as a working
  rollout. The rule demands rolling out by a sha and cleaning the old images, but does not say what the
  path itself is confirmed by. It fits as an article: a container that came up confirms the image, not
  the road to it.
  _The address: the rules layer — the rule of the delivery._

- **A check of a destructive path has no lawful form in the rules.** The guard of the destructive
  actions refuses the loading of a dump on a par with the removal of a volume, and there is nothing to
  go around it with — that is why the loading was never checked once. The probe goes on a disposable
  environment next to the live one, and the recipe lands in the description of the production as ready
  commands. It fits as a section of a pattern.
  _The address: the rules layer — the pattern about the production._

## RT-750 — the division of the spec of the domain into subdomains

- **The checking of the length of the files lies in the tree and is called by nothing.**
  `tools/check-file-size.mjs` is laid out by the package, but it is neither in the commands of the
  tree, nor in the gate of the push, nor in the pipeline — that is why "not a single checking counts
  the length of a document" was true, although a check for it is written. Run by hand, it names 11
  files longer than the limit, including the specs of two other domains.
  _The address: the names of the tree — the set of the checks and the gate of the push._

- **The prefix of the scenarios belongs to the domain together with the subdomains, and the rule speaks
  about a spec.** While the owner of the prefix was a separate directory, the division of the domain
  ran into "the prefix is taken" at every subdomain, and the fixing was an edit of the checking. The
  article of the rule about the specs has to be talked through: a subdomain takes the prefix of the
  domain, and the prefix does not become taken by that.
  _The address: the rules layer — the rule about the specs, the article about the prefix._

- **A number in the plan of an epic goes stale over the time of the epic and turns red by nothing.**
  "708 lines at a limit of 500" was true at the planning; by the fifth task the spec carried 800 and
  the scenarios 692. It fits as a pitfall: a number in the plan of an epic is recounted by the task
  that carries it out — there too, where something is divided by it.
  _The address: the rules layer — the pitfalls of the rule of the conduct of the work._

- **A claim of a handover about an obstacle is rechecked by the rule, not taken on trust.** The
  handover named the limit of the queries of the machine account temporary and appointed an hour of
  waiting; the companion of the rule of the delivery says openly that the quota equals zero, and the
  work queue goes by the account of the owner. The hour of waiting cost one reading. It fits as a
  pitfall to the returning to the work, next to the one ordering the numbers of the handover to be
  recounted.
  _The address: the rules layer — the pitfalls of the pattern of the returning to the work._

- **A commit that reached a branch may stay with no run at all, and the silence about that is
  complete.** Three commits of this pair left by a push with the token of the machine account, and on
  their tips there turned out not a single check: `gh pr checks` answers "no checks reported", the
  `check-runs` at the commit are zero, and in the list of the runs of such a branch there is simply no
  line. The run was created only at the event of the opening of the PR — it was made by the account of
  the owner — and came back at a reopening of the PR by the same account; the next push, made by its
  token, created a run at once. **This is measured, not derived:** the difference is given either by a
  limitation of the machine account or by the reopening of the PR, and which of the two was not checked
  by a probe of its own. What is dear here is the silence: a green run on the first commit of a PR
  reads as a run over the whole branch, and the list of the checks at the tip is opened by nobody.
  _The address: the rules layer — the pattern about a branch, a commit and a PR: the state of a run is
  read at the tip of the branch, not at the PR._

- **A draft branch without a number is created one per task.** Two works of the epic landed in one
  branch by two commits, and the files of both mixed inside each: the edit of the description of the
  production travelled together with the division of the spec. They had to be divided by a rewriting of
  the branch — lawful only because it was not pushed. It fits as a pitfall: a draft branch is set aside
  for a task, not for a session.
  _The address: the rules layer — the pitfalls of the pattern about a branch, a commit and a PR._

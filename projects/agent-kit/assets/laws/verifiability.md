# Law on verifiability

What counts as confirmation that work is done. The law is needed because a retelling looks as
confident as a verified statement, and afterwards there is nothing to tell them apart with: code
that "should work" and code that was checked look the same in the history.

## Articles
- **A test is written before the code and fails before the change.** Written afterwards, it checks
  not the promise but what came out: the author reads their own code and fits the expectation to it,
  so such a test is green from the first run and catches nothing. A failure before the change is the
  only proof that the test looks where it should; a test never once shown red does not count as
  coverage.
- **A change that has nothing to show red says so in words and says what closes it.** It happens:
  styling no test sees, configuration, someone else's service. A step skipped silently looks in the
  history the same as a step passed, and afterwards there is nothing to tell them apart with.
- **Promised behaviour is named as a scenario, and the scenario is named in the test that checks
  it.** Otherwise the link between the promise and the check holds only on the author's memory.
- **A scenario without a test is marked as uncovered and is visible in the summary.** A silent skip
  looks the same as a covered scenario, and the debt stops being noticeable.
- **A test that checks part of what was promised counts as debt, not as coverage.** Otherwise the
  summary shows as done what is done by half.
- **A promise given to the user is closed by a test that follows the user's path.** The same
  computation, checked past the screen, is correct — and does not close the promise: between a
  correct decision and a person seeing it lies everything the check did not touch.
- **A test switched off by an environment flag does not count as coverage.** In an ordinary run it
  is never executed, and in the summary it looks the same as an executed one.
- **A test that removes itself by what it found on the screen does not count as coverage.** A set
  that runs in one session carries state from test to test. A check that begins with "what I need is
  not on the screen — skipping" removes itself because of someone else's change, not because of its
  own environment. In the summary this is one line about a skip, and a whole feature stands behind
  it.
- **A test brings the screen into the state it needs by itself, and returns the shared state as it
  found it.** Otherwise a test that removed itself holds exactly until the neighbour's next change,
  and the run reports zero failures on the day the check was not executed even once.
- **A spoken list of checks is not a check.** It names the intent, not what went into the command,
  and both texts are written in one turn without being compared to each other: a list named item by
  item differs from a short "I checked" only in length. A check is reading what came back: the
  output of the command, the text that was returned, the state after the call.
- **A mention in a test of a scenario that does not exist is a failure.** This is how a renamed or
  discarded scenario is caught: without it, it disappears silently.
- **A running application is checked where the user sees it.** The debug mode behaves differently
  from the production one, and a check in it confirms not what the user will get.
- **Before the push, the change is checked with the same set as the pipeline, and with the same
  commands.** A set assembled from the changed files skips what the change reached through
  dependencies: the check is green and the pipeline is red. What to check is computed by the tool
  from the same base, not by the author's memory.
- **A check of an environment flag applies only to the launch path on which it was made.** The paths
  by which the same application is brought up set the flags differently, and what is confirmed on
  one of them is wrong on the rest — while it looks checked as a whole.
- **Layout is checked by measurement, not by eye.** By eye, padding cannot be told from margin, nor
  alignment from coincidence, and the discrepancy is found only after the rollout.
- **A successful reply from a command means it ran, not that the needed state has arrived.** Some
  requests are carried out by half, and the reply says nothing about the rejected part: by the
  return code such a call cannot be told from a completed one. So the result is read by a separate
  request, and what goes into the PR is what was read, not what was ordered.
- **A service counts as up when it has completed a piece of work, not when it reported readiness.** A
  readiness message says only that the service announced itself: one that got no work at all looks
  in it exactly like a working one. Both sides of the link are checked — that the client picks this
  very service and that a piece of work went through it.
- **Both sides of an exchange are asked, and a side that does not exist is named plainly.** A
  one-sided exchange looks working from both sides: the sending side gets success on every call, and
  that there is nothing to read the result with is visible from nowhere. Silence about the missing
  side is indistinguishable from a working exchange. So the exchange is asked not "did the call go
  through" but "does anyone read the second side", and the answer "nothing does" is written in
  words, not left as a blank.
- **A value declared by one side of an exchange is not recomputed by the other but taken from the
  first.** Two copies of one computation drift apart silently, and both sides reply with success
  meanwhile: one sends under one value, the other looks under another and never finds anything.
  Whatever is declared — a flag, a record format, a way of computing a key — is taken from the
  declaring side whole, not repeated from its description.
- **The cause of a failure on which a decision is built is confirmed by measurement, not by
  plausibility.** The explanation that came first explains the observed no worse than the correct
  one. A property of the environment and one's own slip look the same in a failure, and only a
  measurement set up so that one of the two cannot pass tells them apart. A decision derived from an
  unconfirmed cause treats the wrong thing — and costs a rollback of the whole work, not of one
  change.
- **If a checking tool forbids a technique used here all the time, its rule is switched off in the
  tool's settings, not bypassed in every place.** The bypass has to be repeated as many times as
  there are such places, and none of them says why: from outside it looks like the author's mistake,
  not a decision.
- **A red check means wrong code, not a wrong check.** A place taken out from under the check so
  that it goes quiet fixes the reading, not what the check pointed at: the code stays the same, and
  nobody has a signal about it any more. The known list is accumulated by the day the check is
  created and only shrinks; disagreement with the check itself is a question to the owner, not a
  line in the list.
- **The usefulness of a rule is confirmed by observing how it is used, not by an opinion about it.**
  A rule that was never opened and a rule half the work rests on look the same in the text — and
  what gets edited first is usually what was remembered, not what gets in the way. Observation is
  kept where the work goes on, and outlives a single session: a record that dies with the session
  answers only the question "what happened a minute ago".
- **Observation of the work takes nothing outside except what is common to all.** The name of a
  rule, the kind of an event and the version are the same everywhere the rules layer stands. A path,
  a domain and the name of a tree belong to one tree and mean nothing elsewhere except a leak. This
  is held by a check on the exporting side, not by the memory of the one who writes.
- **A check that broke itself does not stop the work.** A tool failure does not count as a found
  violation, and work stopped by it stands until the tool is fixed. There is one way out, and it is
  named in the failure itself. The executor goes through the failures one by one, shows the owner
  the analysis — how many lines, of what kind, how their falsity is proven — and fixes the check
  itself. The known list is not used for this: it holds what was accepted, not the results of a
  broken check.
- **A check that did not find what to compare says so and does not count as matched.** An empty
  input is three different states — there is no subject at all, the subject is declared and not
  found, the declaration was not parsed — and merged into one they give a green where nothing was
  compared. The lawful answer "there is nothing to compare" is said by a word in the text being
  checked, not derived from an empty parse.
- **A declaration read by a check as text is written as a literal in the place of the
  declaration.** What is moved into a constant or assembled by an expression such a check does not
  see at all: the application works, the check is silent, and the miss shows itself by nothing.
  Where a value has to be a literal, that is said in the same place where it is said what declares
  it.
- **A decision that depends on the current moment gets the moment from outside.** Otherwise it can
  be checked only by turning the clock, and a turned clock acts on everything that happens to be
  nearby: the check starts depending on what has no relation to it.
- **The sign for a check is chosen by the question being answered, not by what the change touched.**
  A sign taken from the subject of the change answers about that subject. The change assembled an
  address — and the presence of the address in the returned page confirms that the application
  assembled it, not that anything will arrive by it. The question asked meanwhile is "is it shown",
  and the difference between the two answers is visible in no output: both look like "checked". So
  the sign is named together with the question, and the first thing checked is that it answers that
  question.
- **Someone else's failure names its own state, not a cause on our side.** The reply of an external
  service says how the request ended there; what lies in the setting it read, it never says. A
  statement built up from it looks like a conclusion from an observation that did not happen. The
  value in question is read where it lies, and a decision derived from an unchecked cause is not
  taken outside at all: it asks to fix the wrong thing.
- **Past behaviour is answered by the code of the version being asked about.** The body of a change
  says what it changed, and is silent about what was true before it. A condition with one more
  mandatory value added to it hides what was shown before — and this is visible only by comparing
  with the version before the change, not by reading the change itself. The word of someone who saw
  the previous behaviour with their own eyes is testimony: a discrepancy between it and the text in
  the history is analysed by reading the code on their side of the discrepancy.
- **A check removed from the set so that the run passes does not confirm the work.** The set is
  assembled from the default and the tree's override, and a check bitten out by the override is
  indistinguishable from one the tree never had at all: the run is green because nobody called it.
  The neighbouring article judges a place taken out from under the check — here it is not a place
  that is taken out but the whole check, and no trace remains in the code. The discrepancy is closed
  by what the check pointed at, and disagreement with the check itself is a question to the owner.
- **A change to the look is checked at every layout threshold, not at one width.** Thresholds are
  the places where the layout changes, and a slip lives exactly there: on either side of the
  threshold the layout is assembled differently, and in the middle it looks correct. A change
  checked at the two extreme widths answers only about those two, and nobody has seen everything in
  between. Both of the pair around a threshold are checked: one width speaks only for the side it
  landed on.

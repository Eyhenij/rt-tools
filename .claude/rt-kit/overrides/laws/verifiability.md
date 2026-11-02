## Demonstration of a visible state

A test proves that a state has arrived and says nothing about how it looks. The class in the markup
matches, while colour on colour is unreadable, the padding is eaten and the caption is cut — and
the check is green. So a visible state has its own form of confirmation, and a test does not
replace it.

- **A visible state is promised behaviour, and it is shown where the eye can see it.** A claim
  about appearance confirmed only by a class check is confirmed incompletely.
- **The set of a component's states is declared up front, and an unshown state from the set is a
  failure.** Otherwise "all states are shown" means "the ones somebody remembered are shown", and
  nothing tells the two apart.
- **A state that cannot be shown is marked unshowable, with a reason.** A silent omission looks
  the same as a shown state, and the debt stops being visible.
- **A demonstration demands no action from the viewer.** A state reached through toggles is
  indistinguishable from a missing one at a glance — and a glance is how people look most often.
- **An empty demonstration does not count as coverage, and silence about it is a failure.** A
  demonstration where nothing was drawn looks exactly like a demonstration in the digest. A
  comparison with a baseline does not tell them apart at all: a new demonstration has no baseline
  yet, and the first captured baseline fixes whatever was drawn — including nothing.
- **A combination of values is shown when the values affect each other.** Showing every
  combination in a row is unreadable and hides a drift exactly as its absence does.
- **A demonstration lives next to the code of the state and is edited by the same change.** A
  drifted demonstration is convincing: it looks like a current description, and the longer it stays
  unchanged, the more so.

## End-to-end coverage of a change

A unit test proves a part, and the person meets the whole: the page, the request, the server
answer and the redirect together. A change green in its specs and never walked end to end
reaches the owner as the first one who walks it.

- **Behaviour a change adds or alters is covered by an end-to-end test in the same change.** A
  scenario of the change without an end-to-end test that walks it is uncovered, whatever the unit
  tests say.
- **The end-to-end suites the change touches are run by the executor before the hand-over, and
  their output is named.** The run of the hand-over gate is not the executor's check: its output
  is not seen, and "it passed the gate" says nothing about what ran.
- **A behaviour that no end-to-end suite can walk says so in words and says what closes it.** A
  silent gap looks the same as a covered change.

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

<!-- rt-kit v0.27.0 · laws/project-documentation.md · 6c6d07d256de · правится надстройкой, не здесь -->
# Law on project documentation

What must be true about the texts a project writes about itself. A document that drifts from
the running application drifts silently: neither the build nor the checks read texts, so a stale
description lives on and reads as a current reference — the older it is, the more convincing.

## Articles

- **A document has a fixed set of sections declared up front, and a missing section is a
  failure.** Requirements that have no place reserved for them are remembered after the release.
- **Every statement in a document is tied to the place where it is enforced.** A statement
  without such a place is an intention, and it must not be called current.
- **Upcoming work is listed in one place — the work queue.** A document does not keep a second
  list: two lists about the same work drift apart silently, and afterwards nobody can tell what
  is done and what is not. A document keeps what never becomes a task — an agreement, or a
  decision that was decided not to change.
- **A binding does not point to code nobody calls.** A symbol that is declared and used by no
  one enforces nothing, and the check on it stays green.
- **A path named in a document exists.** A link to a file that has moved reads as a current
  instruction, and the next reader recreates what was removed.
- **A directory index lists everything the directory holds.** An entry missing from the index
  does not exist for the reader: they search by the index, not by walking the directory, and
  start the analysis over. This is the reverse of the previous article — not only does a path in
  the text lead to a file, the file is also named in the text people search by.
- **A document that has drifted from the application is fixed the moment the drift is noticed.**
  A postponed fix never happens: the drift stops being noticeable the next day.
- **Drift is fixed on the side that is wrong, and that is not always the document.** A state
  described as existing but unreachable in the application is a defect of the application: the
  line reads as a reference to what works, people cite it as verified, and editing the document
  to match the code would seal the hole instead of exposing it.
- **A document makes no claims about the future, and the author is the one who watches this.**
  "Not planned", "will not be" — that is an intention, not a property of the application: there
  is nothing to check it against, and it passes every check. A machine cannot be given this: an
  open question is written in the same words as a promise, and a check would reject both.
- **Completeness of texts is checked from the side of the work too, not only from the side of
  the text.** A pass over what is written judges every statement, but a statement that does not
  exist is not in that pass: a technique applied and described nowhere is never found this way.
  So every closed piece of work is asked separately — did it leave a trace in the texts, or does
  it explicitly not need one.
- **A document states what has happened, not what should work.** A remedy written down as ready
  before it was run costs more than no record at all: the next reader takes it as verified — and
  takes it on the day the remedy is needed, when there is no time to investigate. What has not
  been run is either not written at all or called unverified in the same sentence.
- **A number in a text is recomputed by the same change that writes it, and the author watches
  this too.** A stale number looks exactly like a fresh one, and a machine cannot tell them
  apart: a date, a version and an id are numbers as well, and a check that knows one way of
  writing them fails silently on another.
- **A word that means something specific in the tree is recorded in the tree's glossary.** A word
  that is not there does not exist for the reader either: it is added to the glossary by the same
  change that first uses it, or replaced with one that already exists. The glossary is read before
  the text is written, not checked afterwards: a check afterwards finds a word a whole paragraph
  has already been built around.
- **A document assembled from several sources is edited in the source.** An edit to the
  assembled view lives until the next assembly and vanishes silently — and it looks exactly like
  an edit that stayed. An assembled document must name its source inside itself: whatever is said
  about it elsewhere may not reach the reader, and the assembled view always does.
- **Dropping a word extends to everything already read outside, not only to files.** The name of
  a piece of work, its description and the record of a change live outside the tree: a search
  over files does not see them, text checks do not look at them, and the drop looks done right
  until a reader runs into the dropped word in a title. The reader then concludes the word was
  never dropped at all.
- **A text that travels into another tree does not describe that tree's state as fact.** About a
  neighbouring part it speaks conditionally and names it: what the tree holds and what it lacks
  is known to the tree itself, not to a text that arrived in it. A statement made unconditionally
  lies all the more confidently because the tool itself prints it — and the tree cannot correct
  it if the text has no place for an edit.
- **An accepted decision becomes an item of the rules layer, not a record of the past.** What is
  written down as a description of the past stops being in force the same day: descriptions of
  the past do not enter the working context, are read as history and demand nothing. The next
  piece of work makes the same decision again — and makes it differently, because it no longer
  sees the arguments of the first.
- **A decision has a layer, chosen by what the decision is about.** What must be true in the
  product is an article of a law. By which technique it is done here is an item of a rule. Ready
  code and an order of steps is a pattern. A decision put in the wrong layer is found only by
  someone who already knows it exists.
- **A description of the past explains a move that happened; it does not hold a current
  requirement.** The difference shows in one question: would the text stop being true if
  everything were redone tomorrow. The story of how and why something was once moved is the past;
  the requirement "do it this way" is not, and its place is in the rules layer.
- **The criterion by which a decision is assigned to the past is written down in advance and is
  the same for all work.** Derived anew by every piece of work, it is set by whoever it gets in
  the way of: at the end of the work it is cheaper to call everything left unsorted the past.
- **The decisions section of a domain description is a temporary place, not a permanent one.**
  While a decision is there, it is in force only for whoever opened that file. A grown section is
  a sign that no rule has been set up for it, not that the domain is complex.
- **Work that moves decisions names, for each one, where it went.** Otherwise the description of
  the past cannot tell a decision that became a rule from a decision lost in the move: both look
  the same — a record nobody references.
- **A text distributed outward is judged no more leniently than its copy at the consumer.** A
  requirement that applies to the copy and not to the source finds the fault in someone who did
  not make it and cannot fix it: the fault reaches the consumer intact and turns red there.
- **A text edition this tree did not choose is judged the same as the chosen one.** An unread
  edition drifts from the read one silently, and the first to find out is the first to choose it —
  that is, someone with neither the history of the drift nor a reason to look for it.
- **The set of mandatory sections is declared separately, and the sample does not own it.** The
  sample is a draft for whoever starts a text, and it ages first. A set derived from the sample
  either declares the whole corpus divergent at once or notices nothing.
- **A requirement nobody has formulated stays silent; it does not reject.** A rejection on a
  subject with no declared requirement gets silenced with an exception list, and a month later
  the exception list becomes the working path — silencing, along with the noise, the very thing
  the check was set up for.
- **Two texts about the same thing either say the same, or one of them is wrong.** Agreement
  between texts follows neither from link integrity nor from section completeness: both pass any
  such check, and the executor takes whichever was read first. This is found by reading — there
  is nothing to count here.
- **An image is edited by the same change as the text it depicts.** Once they diverge, the
  diagram and the prose both remain readable, and the first to notice is whoever followed the
  diagram.

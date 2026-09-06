<!-- rt-kit v0.25.0 · laws/entity-editing.md · 1b9ca1e1e06f · правится надстройкой, не здесь -->
# Law on entity editing

How the application behaves when the user creates or changes a record. It behaves the same
everywhere records are edited: this is shared behaviour, not a feature of one part of it.

Getting into a record from a list and the amount of data requested are the subject of other laws.

## Articles

- **The form closes only after the record is saved.** Closing means "saved", so it must not close
  before the server replies.
- **While saving is in progress, the form cannot be submitted a second time, and the user sees that
  the request has not finished yet.** Otherwise a repeated press sends the same data once more.
- **If saving failed, what was entered stays in place.** The error is shown next to the fields, the
  form is open, and the user corrects the data instead of typing it again.
- **A new attempt removes the message about the previous error.** Otherwise a message about a
  failure that no longer exists hangs next to a working form.
- **After creation the form always closes; after a change, the screen decides.** The new record is
  not on the screen yet, and there is nothing to keep the form open over; on a change the screen may
  keep it open and reread the record.
- **Success is announced by a message, not by the form disappearing.** Closing alone does not tell
  whether it was saved — all the more so since the list behind the form does not refresh at once.
- **A form in which nothing was changed cannot be submitted.** Otherwise the user sends a request
  without edits and gets a confirmation of what they did not do.
- **If the user leaves with unsaved edits, the application asks what to do with them.** There are
  three answers: leave without saving, save and leave, stay. This is asked whatever way the user
  leaves.
- **The label of an action that leads away from the form makes clear what happens to what was
  entered.** If a form with edits and a view-only form show the same word, the user does not know
  whether they will lose what they entered.
- **If the record behind a link is already deleted, the user sees an explanation, not an empty
  screen.**
- **The form takes which record to show from the address.** Otherwise it cannot be opened by a link
  or restored after a reload.
- **When a long form is scrolled, its title and its actions stay in view.**
- **The title of the form makes clear what is about to happen, not only which record the user is
  working with.** The name of a record alone does not tell whether it is being created or changed.
- **Creation and change are named differently.**
- **What was entered can be saved with one action.** It stands apart from the one that leads away
  from the form, so the two are not confused.
- **The form can be left in several ways:** with the mouse, from the keyboard and by a press outside
  the form.
- **A closed form does not intercept presses.** It is not visible, and the page under it would stop
  responding without any explanation.
- **All fields of the form have the same distance from the edge and the same width.** The content
  scrolls as a whole, so the focus ring of the outermost field is not clipped.
- **While the record is loading, the place of the fields shows that loading is in progress.**
- **A record that cannot be changed is shown as text, not as input fields.** The user first tries to
  fill in a field that does not accept input.
- **A related record can be opened straight from the form.** The transition is the same leaving of
  the form as closing, so the question about unsaved edits is asked the same way; for the one who
  chose to save and leave, the related record opens after a successful save.
- **An explanation stands next to what raised the question.**
- **Whether the form can be submitted and whether to ask on leaving are decided by one sign.** Two
  different answers to the question "has anything changed" drift apart sooner or later, and the form
  either sends an empty edit or silently loses what was entered.

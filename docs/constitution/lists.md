<!-- rt-kit v0.28.0 · laws/lists.md · cc836188d873 · правится надстройкой, не здесь -->
# Law on record lists

How a user sees a list of records and what they do with them without opening any. The rules are
common to all lists: a list built unlike the rest, the user reads anew.

An opened record, how a record gets into the list, and the amount of data per row are the
subject of other laws.

## Articles

- **Every record is shown as a separate row, and every one of its properties as its own column.**
- **A click on a row opens the record.** Actions on a record stand apart: otherwise, to open a
  record, one would first have to choose an action.
- **While the list is loading, the place of the rows shows that loading is in progress.** An
  empty area cannot be told from a list with nothing in it.
- **An empty list explains why it is empty.**
- **On a narrow screen a row is rearranged so that its properties can be read without scrolling
  sideways.**
- **The user chooses the set and order of columns, and the choice is kept when they leave the
  screen and come back.**
- **Filter and sorting stand apart from actions on the list.** Mixed together they read as one
  set of buttons, and it is unclear what changes what is shown and what changes the records
  themselves.
- **An action that cannot be done with this record right now is not shown in its menu.** What
  can be done with a record depends on its state and changes from row to row: listing the
  unavailable in each one shows the user a list of bans instead of a list of actions.
- **A record that nothing can be done with has no menu at all.**
- **An action that cannot be undone asks for confirmation and names the consequence.**
- **If the list failed to load, the user is told why, and the attempt can be repeated with one
  action.**
- **The user sees the sorting and the filter that are really applied.** The default sorting is
  visible at once, and a condition the server did not accept does not stay on the screen as
  active.
- **List labels come from the dictionary and are not written in the markup.** Column headers,
  state texts and action names change with the language.

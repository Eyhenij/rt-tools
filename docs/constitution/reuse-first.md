<!-- rt-kit v0.28.0 · laws/reuse-first.md · d170594b4f2f · правится надстройкой, не здесь -->
# Law on application uniformity

Things that mean the same look and behave the same in all parts of the application. That comes
from the parts being assembled from one set of ready-made elements, not each written its own
way.

The law speaks of what is true for the user. How the ready-made is built in code is not its
subject.

## Articles

- **Every application has one source of look, and it differs between them.** Taking a control
  from another one's source means bringing to the screen a shape that exists nowhere else in this
  application.
- **The ready-made is taken, not written anew.** A copy of one's own drifts from the original at
  the first edit, and places that look the same start behaving differently.
- **Only the owner can decide to depart from the shared look.** Making one's own instead of the
  ready-made is asked of them before the first line is written.
- **Elements that mean the same behave the same everywhere.** An input field answers an error the
  same way as the one next to it; an edit form closes the same way as in another part of the
  application; success and failure are reported the same way on any screen. When things that
  mean the same look different, the user thinks the application is in different states.
- **The layout of pages, forms and windows is set once and applies to the whole application.**
  Margins, the heading, the action bar and the place for content are the same for all and change
  at once.
- **Styling is kept where the part of the application itself is.** Set right in the markup, it
  changes only its own screen, and the neighbouring one keeps the old look.
- **A departure from the ready-made is stopped before the file is written.** Noticed while
  reading the edit, it is not caught: markup of one's own is sound by itself, and the divergence
  is visible only to someone who remembers that the ready-made for this already exists.
- **What accumulated before the ban is counted and does not grow.** A ban set on the new says
  nothing about the old: without a number, the accumulated looks either vanished or uncountable,
  and there is nothing to reduce.
- **Repeated mechanics are kept in one place, and each case declares only its own part.** Left as
  an agreement, they are written anew at every use, and the uses drift apart unnoticed.

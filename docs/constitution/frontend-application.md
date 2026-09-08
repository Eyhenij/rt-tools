<!-- rt-kit v0.26.0 · laws/frontend-application.md · 30cca57cee8f · правится надстройкой, не здесь -->
# Law on the frontend application

How the thing that draws the screen is built. The law is common to all applications at once: a
screen built unlike its neighbour, the user reads anew, and the developer edits blind.

## Articles

- **A human action has a path in the interface.** A command on the server is the path of whoever
  holds the server: it has its own access, its own shell and its own node. An application where
  an ordinary action is done by logging in to the server gave that action no interface, and
  having such a command does not replace one.
- **Screen state recomputes by itself, not on command.** A manual recompute is skipped sooner or
  later, and the screen shows the old value next to the new one.
- **A template shows a ready value and does not compute it.** A computation in a template
  repeats on every redraw, and its cost is visible nowhere in the code.
- **A subscription lives no longer than whoever created it.** A subscription that outlives its
  creator keeps working on a destroyed screen and holds it in memory.
- **Styling comes from a shared set of values and is not written as a number in place.** What is
  written as a number drifts from the rest at the first change of styling, and there is nothing
  to find all such places with.
- **A control does not change size while the work it started is running.** Ready-made element
  sets replace the label and the icon with a wait indicator for the duration of the work, and
  the element shrinks to its own padding: it jumps, shifts its neighbours, and a click the person
  has already begun lands past it.
- **Every class in the markup has a style rule of its own.** A class without a rule looks working
  and silently does nothing.
- **A set of records comes from the server as a page, not whole.** A list that grows with the
  data one day stops opening, and that becomes noticeable at the user's end.
- **A value the application puts into the browser has a kind: device or signed-in user.** Browser
  storage survives a reload, a sign-out and a change of who is signed in; the kind decides
  whether the value is removed on sign-out. The key name does not show it: the interface language
  belongs to the device, the chosen workspace to the signed-in user, and by name they cannot be
  told apart. The kind has no default either: a left-over session value hands the next signed-in
  user someone else's choice, and a removed device setting forces choosing the language at every
  sign-in. So a person names the kind, and names it before the key is created.
- **Session values are removed by the same place that removes the sign-in.** Leaving on an
  expired sign-in goes past the sign-out button, and a key that only its own screen removes stays
  in place — that is, it goes to the next person signed in on this device.
- **An environment that does not exist on the server reaches the screen from outside and is not
  taken from the runtime.** Taken directly, it compiles and crashes when the server serves the
  page — that is, at a guest's end, not at the end of whoever wrote it. The places where there is
  no other way are named one by one.

## Where the human acts

An application with an interface answers for every action of the human, not only for those it got
around to. An action left in a command on the server does not exist for the human: they see the
interface and see nothing behind it.

- **An action the human performs lives in the interface.** A command-line command is a path for
  the one who runs the server, not for the one who uses the application. Demanding ssh for an
  ordinary action declares that the action has no interface.
- **A command-line command stays only where an interface cannot exist.** The first account,
  bringing the system up from nothing, investigating a breakdown when the application does not
  answer. Everything else is the interface's work, and "the command already exists" does not
  replace it.
- **An existing command is never a reason to leave an action outside the interface.** It
  describes the day when the interface did not exist yet, and by itself says nothing about the
  need.

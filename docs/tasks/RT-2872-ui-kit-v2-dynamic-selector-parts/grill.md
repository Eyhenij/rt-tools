# Grill

## The owner request

> Делай RT-2861

The fifth task of epic RT-2861. The task body (#2872): `rt-dynamic-selector` hands 30 of its
inputs to its parts one by one, and a new setting costs edits in four files. The barrel exports
the inner parts, and they became public by accident. The parts are to read one inner state given
by the root; the inner parts stop being exported after a release with a deprecation mark. The
epic plan adds: the inputs of the root do not change, so applications edit nothing.

## What the tree already has

- The root passes 23 bindings to `rt-dynamic-selector-popup` and 13 to `rt-dynamic-selector-list`.
- `rt-dynamic-input` is no part of the root: it is a field of its own, used with forms, and stays
  public.
- The popup is shown alone in the showcase matrix and in four spec files, by its inputs.
- The list has no spec of its own; only the root draws it.

## Questions and answers

The owner named the epic, and its plan answers the questions of this task. The menu about the
showcase was closed by the grill guard, so the recommended way is taken and named in the PR.

- **Behaviour changes?** No: the root inputs, outputs and markup stay; the present tests of the
  root stay green.
- **How do the parts read the root?** A service the root provides; the root binds its signals
  and handlers to it, and the popup and the list read them instead of inputs.
- **The popup shown alone?** The showcase and the specs give it the same service through a frame
  of their own.
- **The barrel?** The popup and the list stay exported for one release, marked deprecated.
- **Done sign:** the root template passes no input to the popup or the list; the tests and the
  showcase snapshots stay as they were.
- **Not part of it:** `rt-dynamic-input`; removing the deprecated exports — the next release.

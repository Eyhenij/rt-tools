# Findings of the epic RT-2542

The rules review of every closed task of the epic lands here and waits for the owner. Nothing below
is applied: the owner reads the list when the epic is over and names what goes in.

## RT-2548 — `rt-tree`

1. **A reuse sign for a native checkbox or radio inside a kit component.** The reuse bundle of the
   second kit covers the applications, not the kit itself, so the row of `rt-tree` drew the browser
   mark until the owner saw it. Address — the tree: a signal `kit-native-choice` in
   `.claude/rt-kit/signals.json` over `projects/ui-kit-v2/src/lib/components/**/*.html`, except the
   checkbox, radio-button and toggle-switch folders; `rt-multiselect` goes into the accepted list as
   debt, its fix is a task of its own.
2. **A view state the person owns is derived from an input once, not by a `computed` with a manual
   override.** `#open() ?? derive(value())` kept folding a branch under a choice until the first
   manual toggle. Address — the package: a paragraph in the pattern `angular-patterns-state`.
3. **`storyPseudoParameters(target)` builds a descendant selector.** A host-level state takes no
   target; the host's own class as a target matches nothing, and the `States` frames draw plain
   while the sweep stays green. Address — the tree: the pattern `rt-tools-storybook-story`.
4. **The look at the frames reads each cell against its caption.** A search case promised matches
   and showed «nothing found»; the frame had an area and passed the sweep. Address — the tree: the
   pattern `ui-component-tests-visual`.
5. **A ported module is not pushed before the owner's «открывай».** The third miss of this kind; the
   push gate knows nothing of the word. Address — the tree: an override section of the pattern
   `git-workflow-pr`; a guard is the next step if the text fails again.
6. **The documents guard demands a description of a showcase wrapper.** `*` in a `case` sample of
   `rt_docs_pair_for` crosses `/`, so `stories/component/*.component.ts` matched the component
   branch. Address — the tree: a branch `projects/ui-kit-v2/src/lib/*/stories/*) return 0 ;;` in
   `.claude/rt-kit/project.sh`; the same trap named in the package skill `agent-kit-extend`.
7. **A new wrapper of the second showcase keeps its template in a file.** The inline templates of
   the existing wrappers are frozen debt, and a copy is refused by `check-reuse`. Address — the
   tree: the pattern `rt-tools-storybook-story`.
8. **The conversation guard's refusal names the rules that count.** With edits in the turn only the
   rule of the edited area counts, while the refusal advises a search over the documents that can
   never satisfy it. Address — the package: the refusal text of `hooks/grill-gate.sh`.

Not a finding: the browser profile helper printed nothing because the tree names no profile — the
owner names it in `.claude/rt-kit/browser-device-id`.

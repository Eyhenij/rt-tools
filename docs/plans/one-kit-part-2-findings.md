# Findings of the epic "one kit, part 2"

They accumulate along the epic RT-2353 (`docs/plans/one-kit-part-2.md`) and are read at once when
the epic is over. The owner says what of this is right; what they name becomes an edit or a
proposal outward. The file outlives the merge of the task branches.

## RT-2424 and RT-2427 — the request error of a side panel, the panel in the showcase at 768

The review was made in the background after both PRs opened (#2426, #2429).

- **A length read off a frame by eye came out a quarter short.** The viewer showed a frame 1248
  wide at 999, and a popup of 320 was read as 255; the divergence was reported to the owner and
  then taken back. **Address:** the rules layer — pattern `browser-verification-measure`, the
  pitfalls of the viewing tool: a length is measured in the page or multiplied by real over shown
  width.
- **A look defect was named against the kit's own preset instead of the first kit's frame.** Task
  RT-2428 (a disabled icon button "too dark" under the material preset) was filed that way; the
  first kit's frame shows the same grey. **Address:** the rules layer — rule
  `browser-verification`, the article about accepting a carried-over look by the sample's frame;
  the names of this tree — its companion names the first kit's frame as the sample of the material
  preset.
- **After a branch checkout the running showcase kept its port and served stale type errors, then
  a 500.** Frames were retaken on it before it was restarted. **Address:** the names of this tree —
  rule `ui-component-tests`, the pitfall about a series of runs: a checkout counts as an edit, and
  the showcase is restarted before any frame.
- **`task:new --slug` assembled a folder for a card filed for later.** It had to be removed by
  hand, twice in the epic. **Address:** the rules layer — pattern `task-flow-start`, the step that
  creates the task: a card for later goes without `--slug`; the same bullet leaves the override of
  the cold part.
- **The refusal of the conversation guard names a search it does not accept.** In a turn with
  edits only the rule of the edited area counts as reading, while the refusal offers a grep over
  the whole catalogue; the exit guard then refused the same question in prose. **Address:** the
  rules layer — hook `grill-gate.sh`, its refusal text, and rule `turn-conduct`, the article about a
  turn with a question to the owner.

## Left unresolved

- **All five findings above** — wait for the owner's word on which become edits; the owner was
  reviewing the ports when they were written.

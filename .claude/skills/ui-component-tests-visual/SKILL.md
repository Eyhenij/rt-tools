---
name: ui-component-tests-visual
kind: pattern
rule: ui-component-tests
description: A pattern of the rule ui-component-tests. Take it when a story is created for the sake of a snapshot, when a fallen showcase snapshot is sorted out and when all the stories are swept. The hover parameters, what is undetermined in the frame, re-taking the references.
---

# The visual snapshot — ready-made code

The snapshot of every story of the first kit is matched against the reference next to it, in
`projects/ui-kit/.storybook/__snapshots__/`. The harness is
`projects/ui-kit/.storybook/test-runner.ts`. The shape of the story itself — the rule
`rt-tools-storybook`.

## When to use

- A state that is not in the frame gets a story of its own.
- The snapshot run fell, and it has to be understood whether the divergence is one's own.
- The references are taken for the first time, or re-taken.

The references were taken on the same machine the pipeline runs on, so the comparison threshold is
held at zero and a small edit does not pass silently. A change of machine or of browser version
means re-taking all the references rather than sorting out divergences.

Two traits of the machine are taken out of that dependence at the second kit — the timezone and the
browser's language: they change by themselves, without a change of machine at all. They are set by
the run's settings file; the list of what is undetermined says how.

## A state that is not in the frame

A story of its own is created for a state the snapshot does not reach by itself: a tooltip, a button
under the pointer, content in an overlay, the branch after a file is chosen.

**Hover** — by a story parameter, with a real pointer. An event played out from the story does not
live to the frame: a whole-page snapshot lays the page out anew.

```typescript
export const CopyButtonOnHover: Story = {
    args: { ...ManyItems.args },
    parameters: { snapshotHover: 'rtui-table-base-cell:has(.base-cell__copy-button)' },
};
```

**An overlay** — opened by a press in `play`, and the frame for it is set by a parameter. Content
outside the page flow a whole-page snapshot does not build up, and a popup above the frame is simply
cut off.

```typescript
export const SelectorPopup: Story = {
    parameters: { snapshotViewport: { height: 1100 } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        const trigger: HTMLElement | null = canvasElement.querySelector('[cdkoverlayorigin]');

        if (!trigger) {
            throw new Error('The button that opens the popup is not drawn in the story');
        }

        await userEvent.click(trigger);
        await waitFor(() => expect(document.querySelector('rtui-multi-selector-popup')).toBeTruthy());
    },
};
```

**The markup does not arrive in the same frame as the story.** A search for a node in `play` is
wrapped in a wait:

```typescript
const cell: HTMLElement = await waitFor(findCell);
```

**The initial state is not set by an input.** The story's values reach the wrapper later than its
`ngOnInit`, and a state computed in the hook is counted by the field's default. An empty list, a
chosen file, an opened panel are reached by a press in `play`.

## What is undetermined does not get into the frame

- random data — by a generator seed in `preview.ts`, not by a call on the spot;
- pictures — by bytes in the address, not by a load from the network; the type in the address must
  match the bytes, otherwise an empty frame is left in the shot;
- the skeleton animations do not go through CSS and do not stop at a declared zero duration — the
  harness drives them to the end before the shot;
- the icon font lies next to the showcase and is served by it rather than travelling from a foreign
  network; an icon keeps itself invisible until it is loaded, so the harness itself calls the
  loading of the families and refuses if they did not come up;
- the timezone and the browser's language — by the run's own settings file at the second kit's
  showcase, `projects/ui-kit-v2/.storybook/test-runner-jest.config.js`. The run picks a file of
  that name up from the showcase config directory and hands it to the test builder instead of its
  own default; a file in the tree root would be read by the first kit's run as well.

**Two settings are needed there, not one, and this is measured rather than reasoned.** The
context's `locale` moves `navigator.language` and the request header but does not touch the format
of a native date field: that one the browser draws in the language of its own launch. On one
date-picker story: without settings the month came first and the clock was twelve-hour, with
`locale` alone the same, with the launch language `15.03.2026` and `09:30`. The timezone is the
other way round — it obeys
the context, and a debug-protocol session sets it too, while the language it does not.

## The sweep over all the stories — before the references are taken

The sweep answers the question no run asks: is there anything at all in the frame. It goes over the
raised showcase and **before** the first taking of the references — after the taking it would be
checking what is already pinned.

```bash
pnpm run storybook:ui-kit-v2   # the showcase is raised apart and stays raised
pnpm run test:stories:v2       # the sweep: tools/story-sweep-v2.mjs
```

What it does: it takes the list of stories from the showcase itself (`GET <address>/index.json`),
opens each one and looks at two things — the showing area and the console.

- **The area.** The showing root is `[data-story-root]`, and at a zero root height — the largest
  drawn node inside the showing and inside the overlay container. A toast and a bottom sheet stand
  outside the flow, and the root above them collapses: without that reservation they would read as
  empty.
- **The console matters more than the area.** `NG0201` means a provider is not in the showcase's
  injector, `NG0950` means the owner did not set a mandatory input. The markup then draws emptiness,
  which from outside is indistinguishable from a matrix with nothing to show. A wreck's area happens
  to be non-zero too.
- **The showcase's noise is sifted out by name.** `NG04002` about `iframe.html` arrives in every
  story: the showcase's router is declared with an empty set of routes. Everything else is a refusal.

A green PR does not mean "shown rightly": it means "there is something to look at". After that the
frames are looked at by eye, and only then are the references taken.

## Sorting out a fallen run

1. **The share of the divergence and the area** — before the picture. A shift by a pixel and a
   vanished block are indistinguishable by eye.
2. **One's own divergence or a foreign one.** A divergence in a story the edit did not touch means a
   leak between stories or an edit of a shared layer.
3. **Re-taking — one reference at a time.** The file is deleted, and the run takes it anew;
   re-taking everything at once erases the divergence that was not expected as well.
4. **"Couldn't find story … after HMR"** — a trace of the hot reload: the showcase is restarted, the
   code is not edited.

The difference between two references is read by cutting one area out of both files and enlarging it
— by a one-off script in a temporary directory; it does not travel into the repository.

## A measurement instead of a look

When the snapshot said "it became different", what exactly drifted is answered by a measurement of
computed values: the font size, the height, the padding, the rounding, the colour. The technique and
the traps — the pattern `browser-verification-measure`; the narrow screen and work with the
showcase's driver — `browser-verification`, the file `implementation.md`.

## Traps

Each is checked on this machine; they all look like a broken harness, while what is broken is
something else.

- **`storybook-addon-pseudo-states` does not load in Node.** At the top level it touches `Element`,
  and the import falls with `Element is not defined`. The run reads `main.ts` in Node to find the
  story files, swallows the error — and is left without a page: **all** 124 files fall with
  `Cannot read properties of undefined (reading 'goto')`. So `main.ts` does not attach the addon when
  `RT_SNAPSHOT_RUN=1` is set, and the run command sets it. The showcase needs the addon: the states
  are drawn in the browser, and raising it with this variable is not allowed — hover, focus and
  active would leave the frame, and the reference would pin the wrong state.
- **The flag `-t` breaks the run's environment exactly the same way.** A selection by story name does
  not work — neither at the second showcase nor at the first. A pointed re-take selects **story files
  by path** (Jest's positional sample), not stories by name.
- **The path sample goes into the shell as it is.** Brackets and a vertical bar in it drop the launch
  (`syntax error near unexpected token`): the run builds the command as a string. The sample is
  written as a plain piece of a path — `tag`, `components/button`.
- **A missing reference is not taken up silently.** The second showcase's harness refuses: the
  comparison library would by default append the file and pass green, that is, the run would be green
  exactly because there was nothing to compare with.
- **A reference without a story drops the run.** A renamed story leaves its reference orphaned and
  forever green, because nobody opens it. This is caught by matching the directory against the
  registry of what was taken, not by `test-storybook` itself.
- **The pointer outlives the move between stories.** Hover from one arrives in the snapshot of the
  next: a story without hover carries the pointer away into a corner.
- **An orphaned reference can be a consequence rather than a rename.** A story that takes a second
  frame at a threshold width does not reach it once the first frame has fallen: the second is never
  taken, and its reference reads as orphaned. Eight such stood next to fifteen divergences and went
  away together with them, without a single file deleted. So the orphan list is read after the
  divergences are cured, not before: deleted on sight, those references would have to be taken anew.
- **A divergence only in native controls after a browser raise is the browser, not the layout.**
  A newer Playwright brings a newer Chromium, and the textarea grip, the scrollbar and the focus
  ring are drawn a pixel differently on stories nobody edited. The sign: the difference frames
  show only such controls, and the computed values of the nodes around them match to the
  hundredth. The cure is the browser version held where the references were taken, or a
  deliberate re-take of every touched reference — not a fix of the layout.
- **A divergence only in text after a data generator raise is the data, not the layout.** A newer
  faker gives other names and other numbers, and every frame with seeded values diverges by text
  alone while the boxes stay where they were. The sign: the difference frames show letters and
  digits, not edges. The cure is the generator version held in the manifest, or a re-take of the
  references together with the raise.

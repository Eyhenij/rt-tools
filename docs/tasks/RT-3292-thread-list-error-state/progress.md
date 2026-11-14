# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — The showcase
- **Done:** the agreement `docs/specs/ui-kit-v2/proposed/error-states/` with scenarios
  SC-UKV-1267…1278; `npm run check:specs` lists only them as without a test.
- **Next step:** a story for every new state of the thread list, the chat and the details panel.
- **Uncommitted:** no.
- **Waiting for the owner:** no.
- **PR:** not open yet.

## Steps

- [x] 1.1 Write the feature spec of the shared contract and of the three components
- [x] 1.2 Write its scenarios
- [x] 2.1 Add the labels `uiLoadError`, `uiLoadErrorHint`, `uiRetry` and the max-width variable of `rt-empty-state`
- [x] 2.2 Add `error`, `retry`, the text inputs and both slots to `rt-thread-list`, with the load more error row
- [x] 2.3 Fix the header and the tab switch spacing of `rt-thread-list`
- [x] 2.4 Cover the new states by the spec
- [x] 3.1 Add `error`, `retry`, `emptyTitle`, `emptyIcon` and both slots to `rt-chat`; fix the `emptyHint` render
- [x] 3.2 Add `error`, `retry` and the error slot to `rt-workspace-details`
- [x] 3.3 Cover the new states by the specs
- [>] 4.1 Add a story for every new state of the three components
- [ ] 4.2 Compare the stories with the frames by measurement and show them to the owner

## Decisions along the way

- **The empty title input keeps its former name `emptyText`** — renaming it would break the
  consumers of the published kit; the agreement names it so. Affected stage of the plan: 2.
- **An empty list without search and filters now titles «Пока пусто» (`uiThreadListEmpty`), not
  «Ничего не найдено»** — the agreement parts the two states; the former spec expectation is edited.
  Affected stage of the plan: 2.

- **The epic branch went to the remote on 14.11.2026 after main was merged in** — the push inputs
  check is still red on main, but the push set no longer runs it for this change. Affected stage of
  the plan: none.
- **The error view of the chat and the details panel is built by one helper `rtLoadErrorView` next
  to `rt-empty-state`** — the same title, hint and template context in every component; the thread
  list keeps its own computed values, written and tested before the helper. Affected stage: 3.
- **The details panel error stands in the details tab instead of a toast** — the approved frame
  says so; transition and history errors stay toasts. The former toast test is replaced by
  SC-UKV-1278. Affected stage: 3.
- **The import list of `rt-chat` moved to `rt-chat.imports.ts`** — the component file stood at
  499 lines of the 500 limit. Affected stage: 3.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-kit-states
**Branch:** RT-3292-thread-list-error-state

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — The chat and the details panel
- **Next step:** `error`, `retry`, `emptyTitle`, `emptyIcon` and both slots of `rt-chat`.
- **PR:** not open yet.

The progress in full — `docs/tasks/RT-3292-thread-list-error-state/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
afbc900cd fix(rt:ui-kit-v2): отступы шапки и вкладок списка переписки по одобренным макетам
097cde950 feat(rt:ui-kit-v2): ошибка загрузки и свои шаблоны у списка переписки
69da99e87 feat(rt:ui-kit-v2): подписи ошибки загрузки и переменная ширины заглушки
4a46e258a docs(rt:ui-kit-v2): договорённость RT-3292 — ошибка загрузки и свои шаблоны у списка переписки, чата и сведений
ad18c68aa docs(rt:ui-kit-v2): папка задачи RT-3292 — разбор, план и ход работы
b79f2299e Merge remote-tracking branch 'origin/main' into RT-3288-kit-error-states
0cb6e15af docs(rt:agent-kit): план эпика RT-3288 — макеты RT-3294 и RT-3295 одобрены
022d37569 docs(rt:agent-kit): план эпика RT-3288 — кадры RT-3294 и RT-3295 собраны
0a63c2c7e docs(rt:ui-kit-v2): план эпика RT-3288 — макет RT-3292 одобрен
3ad6cbf28 docs(rt:ui-kit-v2): план эпика RT-3288 — единые состояния ошибки и заглушки
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.

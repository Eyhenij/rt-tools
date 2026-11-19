# Grill

**Описание фичи:** не нужно — правка раскладки пакета правил и её описания; код приложений не меняется.

## The owner request

> я ухожу спать, переключайся в ночной автономный режим, доведи все задачи эпика до завершения и сам эпик до пр в main

The owner's word of 19.11.2026 for the night; the task is row 20 of the plan of the epic RT-3302.
The card (issue #3421) comes from the review of RT-3276 by the roles `product-strategist` and
`goal-critic`. A release of the package takes eight checks of the conversation away from the trees
that install it. The two model checks that replaced them — at the end of a turn and on a menu —
are not written into the settings of those trees. After the release nothing stands there in place
of the removed checks. It is the open question Q-8 of the mission of the turn guards. The card
asks: the layout writes both model checks into the settings of a tree, and after a layout in a
clean tree both hooks stand in its settings.

## What the tree already has

- **The two model checks.** `projects/agent-kit/assets/hooks/turn-judge.md` and `ask-judge.md` are
  laid out into `.claude/hooks/` like any hook. They are texts a model follows, not scripts, and
  they carry no declaration of an event.
- **How they are called here.** `.claude/settings.json` of this tree holds two records of the kind
  `agent`, written by hand. The one of the event `Stop` names the file of the turn judge, the
  words of its first round, the model and a limit of 120 seconds. The one of `PreToolUse` with the
  pattern `AskUserQuestion` names the file of the menu judge and a limit of 60 seconds.
- **How the layout writes the settings.** `projects/agent-kit/src/lib/hooks-map.ts:bindDispatch`
  is called at the end of `sync`. A script hook declares its event by a line `# rt-hook:` in its
  own file. For every declared event the layout appends one record of the dispatcher to the
  settings when none stands there; it never rewrites a record that stands. A limit lower than the
  declared one is named, not rewritten. The cases are `SC-AK-1205` and its neighbours in
  `hooks-map.spec.ts`; the rules live in `docs/specs/agent-kit/dispatch/`.
- **What the layout does not see.** The declaration is read from script hooks only. A model check
  has none, so the layout neither writes its record nor names its absence.

## What the rules already say

- The rule `agent-kit-source`: a resource the consumer does not carry out is never a package
  resource. Both model checks are carried out at a consumer the moment its settings call them.
- The header of `hooks-map.ts`: the settings are a file of the tree; the layout appends what is
  absent and never replaces what stands.
- The mission of the turn guards names Q-8 as an open question.

## Questions and answers

None. The card names the condition and the sign.

## Decisions

- **A model check declares itself in its own file.** A line of the file names the event, the
  pattern, the limit, the model and the words added to the call — the way a script hook names its
  event. Rejected: a list of model checks in the code of the layout. Such a list falls behind the
  set of files at the first check added. Спросить было некого: заход автономный. Цена ошибки:
  форма строки объявления меняется одной правкой разбора шапки.
- **The layout appends the record and never rewrites one that stands.** The same rule the
  dispatcher records follow. A record that calls the file but differs from the declaration — other
  words, a lower limit, another model — is named by the layout and by its check. The check refuses
  on other words, another pattern and a lower limit; another model and a higher limit are named
  only, so a tree with no access to the declared model can change it and stay green. A file on
  disk with no record is refused too. Цена ошибки: одна ветка сравнения.
- **The sign of the card is measured on a whole layout.** `init` and `sync` with the real
  catalogue into an empty tree, then the check of the layout. The role `goal-critic` showed that
  scenarios on made-up lines pass while a clean tree gets no record. The same role named the
  cases the first draft left out: a tree without the dispatcher, settings that do not parse, a
  moved directory of hooks.
- **A tree that put the check into its `skip` list gets no record.** The record is written for a
  file that lies on disk, as with the dispatcher.
- **The record of this tree must equal the declaration.** The words of the first round and the
  model of the turn judge move from the settings of this tree into the declaration of the file.
  The settings of this tree do not change.
- **Q-8 leaves the open questions of the mission** with the rule that answers it.

## What is left unclear

- Whether a consumer on an older host runs a hook of the kind `agent` at all. The layout cannot
  measure the host; the record is written, and the companion of the description says what host it
  needs.

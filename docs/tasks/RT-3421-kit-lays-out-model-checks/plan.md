# Plan

**Task:** RT-3421 · **Branch:** RT-3421-kit-lays-out-model-checks
**Behaviour:** unchanged — код приложений не меняется. Меняется раскладка пакета правил: она дописывает в настройку дерева записи двух модельных проверок; правило идёт в описание раскладки той же правкой. Слово владельца: «доведи все задачи эпика до завершения».

## Points

- **A:** the package lays out the files of two model checks — the judge of a turn end and the
  judge of a menu — and writes nothing about them into the settings of a tree. Here the two
  records were written by hand. A layout of today's package into an empty tree puts both files on
  disk and writes eight records of the dispatcher and no record of the kind `agent`. The next
  release takes eight checks of the conversation away from such a tree and puts nothing in their
  place. It is the open question Q-8 of the mission of the turn guards.
- **This task reaches:** a layout into a clean tree leaves both model checks called from its
  settings, with the limit, the model and the words each one declares. A record that already
  stands is left as it is; one that differs or is absent is named, and the check of the layout
  refuses on it.
- **Sign:** the scenario of the whole layout passes: `init` and `sync` with the real catalogue of
  the package into an empty tree leave two records of the kind `agent` in its settings, and the
  check of the layout right after ends with code 0. The records built from the declarations of the
  real files equal the records of this tree letter for letter.
- **Milestone G of the epic:** fewer than five refusals per hundred commands and no dead end. The
  epic replaces checks of the conversation by model checks; without this task the replacement
  reaches only the tree the package is written in.
- **Metric:** нет: пакет начинает прописывать записи, которые это дерево уже держит руками; счёт отказов здесь не меняется.

## Task footprint

| What  | Where |
| ----- | ----- |
| Laws  | `docs/constitution/work-conduct.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/agent-kit-source/`, `.claude/skills/spec-driven/`, `.claude/skills/typescript-conventions/`, `.claude/skills/testing/` |
| Code (правится) | `projects/agent-kit/src/lib/hooks-map.ts` |
| Code (правится) | `projects/agent-kit/src/lib/hooks-map.spec.ts` |
| Code (правится) | `projects/agent-kit/src/lib/sync.ts` |
| Code (правится) | `projects/agent-kit/src/lib/commands.ts` |
| Code (правится) | `projects/agent-kit/src/lib/commands.spec.ts` |
| Code (правится) | `projects/agent-kit/assets/hooks/turn-judge.md` |
| Code (правится) | `projects/agent-kit/assets/hooks/ask-judge.md` |
| Code (правится) | `projects/agent-kit/tests/turn-replay.test.sh` |
| Code (правится) | `.claude/hooks/turn-judge.md`, `.claude/hooks/ask-judge.md` — разложенные копии, их пишет раскладка |
| Code (правится) | `docs/specs/agent-kit/dispatch/` |
| Code (правится) | `docs/specs/agent-kit/turn-guards/mission/spec.md` |

## What counts as done

- Each of the two model checks declares in its own file its event, its pattern, its limit, its
  model and the words added to the call. The code of the layout holds no list of model checks.
- A layout into a tree with no settings writes both records of the kind `agent`. Each names the
  file of its check by the path the layout put it at, a moved directory of hooks included.
- A record that already calls the file of a check is neither doubled nor rewritten.
- The declarations of model checks are a list of their own: they do not enter the list of script
  hooks, so the limit of the dispatcher of the same event is not judged by them.
- A record that calls the file and differs from the declaration is named by the layout, with what
  differs. The check of the layout refuses on other words, another pattern and a lower limit.
  Another model and a higher limit are named and not refused: a tree with no access to the
  declared model must be able to change it and stay green.
- A file of a check that lies on disk with no record calling it is named too, and the check of the
  layout refuses on it.
- A tree that did not take the dispatcher still gets both records: a model check is called by its
  own record, not through the dispatcher. The line about the dispatcher is printed beside, not
  instead.
- Settings that do not parse are not edited. The layout names both checks and prints the ready
  records to insert by hand; a check counts as connected when the path of its file stands in the
  text of the settings.
- A check the tree put into its `skip` list gets no record; the other one does.
- The records built from the declarations of the two real files equal the records of this tree in
  the words, the model, the limit and the pattern. The settings of this tree do not change.
- The scenario that compares the words of the first round with the text of the turn judge reads
  the declaration, not the settings of the tree.
- The description of the layout carries the rules and the scenarios; Q-8 leaves the open questions
  of the mission.

## Stages

### 1. A model check declares itself

Rules: the file of a model check carries a declaration the layout reads — the event, the pattern,
the limit in seconds, the model, the words added to the call. The declaration is a comment of the
markup, not a heading: the model that follows the file must not read it as a part of its text. Its
fields are named, the pattern and the model may be absent, and the added words are the last field
to the end of the line. The comparison goes against the parsed value of a record, not against the
text of the settings. The words of the call are built from
the declaration: the order to read the laid-out file and follow it, the added words, the input of
the hook. The words of the first round of the turn judge hold backticks, quotes with a backslash
and a bar; the scenario compares the built record with the record of this tree letter for letter,
so a silent miss of the parse is seen.

- **Steps:**
    1. Both model checks carry the declaration
       Check: `grep -l 'rt-hook-agent' projects/agent-kit/assets/hooks/turn-judge.md projects/agent-kit/assets/hooks/ask-judge.md | wc -l | tr -d ' '` → = 2
    2. The records built from the real files equal the records of this tree
       Check: `pnpm exec jest -c projects/agent-kit/jest.config.ts projects/agent-kit/src/lib/hooks-map.spec.ts --json 2>/dev/null | grep -o '"status":"passed","title":"SC-AK-1773[^"]*"' | wc -l | tr -d ' '` → >= 1
    3. The words of the first round are compared with the declaration
       Check: `VERBOSE=1 bash projects/agent-kit/tests/turn-replay.test.sh 2>&1 | grep -c 'declaration' | cat` → >= 1
    4. This tree is laid out, and its copies carry the declaration
       Check: `grep -l 'rt-hook-agent' .claude/hooks/turn-judge.md .claude/hooks/ask-judge.md | wc -l | tr -d ' '` → = 2
- **Readiness sign:** the scenario passes; `bash projects/agent-kit/tests/turn-replay.test.sh` ends
  with 0 failures. The declaration is one comment of the markup, so the judge of a turn end makes
  no more calls than before; the replay of the recorded turns as a hook gives 0 divergences.
- **Verified by:** the suite of the replay — exit 0; `node projects/agent-kit/tests/judge-replay.mjs --as-hook` — 0 divergences.

### 2. The layout writes the records

Rules: the records of the model checks are written by a function of their own, called at the end
of a layout after the files lie on disk. It does not stand under the early exit of the dispatcher
records. Every declared model check whose file lies on disk and no record calls gets a record
appended to its event. A standing record is never rewritten. The path in a record and the question
«does the file lie on disk» are taken from the place the layout put the file at.

- **Steps:**
    1. A layout into an empty tree with the real catalogue leaves both records, and the check right after is green
       Check: `pnpm exec jest -c projects/agent-kit/jest.config.ts projects/agent-kit/src/lib/commands.spec.ts --json 2>/dev/null | grep -o '"status":"passed","title":"SC-AK-1766[^"]*"' | wc -l | tr -d ' '` → >= 1
    2. A standing record is neither doubled nor rewritten
       Check: `pnpm exec jest -c projects/agent-kit/jest.config.ts projects/agent-kit/src/lib/hooks-map.spec.ts --json 2>/dev/null | grep -o '"status":"passed","title":"SC-AK-1767[^"]*"' | wc -l | tr -d ' '` → >= 1
    3. A tree without the dispatcher gets both records
       Check: `pnpm exec jest -c projects/agent-kit/jest.config.ts projects/agent-kit/src/lib/hooks-map.spec.ts --json 2>/dev/null | grep -o '"status":"passed","title":"SC-AK-1770[^"]*"' | wc -l | tr -d ' '` → >= 1
    4. A check in the `skip` list gets no record, the other one does
       Check: `pnpm exec jest -c projects/agent-kit/jest.config.ts projects/agent-kit/src/lib/commands.spec.ts --json 2>/dev/null | grep -o '"status":"passed","title":"SC-AK-1772[^"]*"' | wc -l | tr -d ' '` → >= 1
    5. A moved directory of hooks is named in the record
       Check: `pnpm exec jest -c projects/agent-kit/jest.config.ts projects/agent-kit/src/lib/commands.spec.ts --json 2>/dev/null | grep -o '"status":"passed","title":"SC-AK-1774[^"]*"' | wc -l | tr -d ' '` → >= 1
- **Readiness sign:** the five scenarios pass.
- **Verified by:** `pnpm exec nx test @rt-tools/agent-kit` — exit 0.

### 3. The layout names what is wrong

Rules: a record of the kind `agent` carries no command, so the readers of the settings that judge
script hooks do not see it; the comparison is written anew and finds a record by the path of the
file in its words. The check of the layout writes nothing, so the divergences reach it as a field
of the plan of the layout, the way the drifted patterns do. A record that differs in the words,
the pattern or by a lower limit is named and refused; another model and a higher limit are named
only. A file on disk with no record is named and refused; the refusal names the `skip` id as the
way out for a tree whose host runs no hooks of the kind `agent`. A tree with a moved directory of
hooks gets both model records and no dispatcher record: the layout names that mixed state in its
output. With settings that do not parse the layout edits nothing, names both checks and prints
the ready records.

- **Steps:**
    1. A record that differs from the declaration is named, and the check refuses
       Check: `pnpm exec jest -c projects/agent-kit/jest.config.ts projects/agent-kit/src/lib/hooks-map.spec.ts --json 2>/dev/null | grep -o '"status":"passed","title":"SC-AK-1768[^"]*"' | wc -l | tr -d ' '` → >= 1
    2. A file with no record is named, and the check refuses
       Check: `pnpm exec jest -c projects/agent-kit/jest.config.ts projects/agent-kit/src/lib/commands.spec.ts --json 2>/dev/null | grep -o '"status":"passed","title":"SC-AK-1769[^"]*"' | wc -l | tr -d ' '` → >= 1
    3. Settings that do not parse get the ready records printed
       Check: `pnpm exec jest -c projects/agent-kit/jest.config.ts projects/agent-kit/src/lib/commands.spec.ts --json 2>/dev/null | grep -o '"status":"passed","title":"SC-AK-1771[^"]*"' | wc -l | tr -d ' '` → >= 1
- **Readiness sign:** the three scenarios pass; the check of the layout of this tree names nothing.
- **Verified by:** `pnpm exec nx test @rt-tools/agent-kit` — exit 0; `pnpm run agent-kit:check` —
  exit 0; `git diff --stat .claude/settings.json` prints nothing.

### 4. The description

Rules: the description of the dispatcher and the settings gets the rules of the model checks,
their nine scenarios and their bindings. The mission of the turn guards loses Q-8 from its open
questions and names the rule that answers it.

- **Steps:**
    1. Q-8 is closed in the mission
       Check: `grep -c 'Q-8 — the package does not connect' docs/specs/agent-kit/turn-guards/mission/spec.md | cat` → = 0
    2. The description carries the nine scenarios
       Check: `grep -c '^### SC-AK-17\(6[6-9]\|7[0-4]\)' docs/specs/agent-kit/dispatch/scenarios.md` → = 9
- **Readiness sign:** both counts hold.
- **Verified by:** `npm run check:spec-coverage` — exit 0.

## What this work does not do

- It does not measure whether the host of a consumer runs hooks of the kind `agent`: the layout
  cannot ask the host. The description of the layout, not only its companion, names the need.
  A host that rejects a record of an unknown kind may reject the whole settings file; this is a
  hypothesis not checked here, and the `skip` list is the way out.
- It does not handle settings kept in another file than `.claude/settings.json`: a record the
  tree holds there is neither seen nor doubled-checked, and a second record would stand beside it.
  The same holds for a record of the same role that calls another file.
- The declaration pins the model of the turn judge, and the layout writes that id into the
  settings of every consumer on the first layout. A retired model would fail the hook at each
  turn end there. Chosen because the judge was measured on that model; another model is named
  and not refused, so a tree can change it. Cost of a mistake: one field of the declaration.
- The release that carries the two checks to the consumers is a separate decision of the owner;
  its sign belongs to the last step of the epic, not to this task. Before it, "reaches G" holds
  for this tree only. A refused record anywhere in the layout stops the writing of every record,
  the model records included, the way it does for the dispatcher.
- It does not release the package: a release is a separate decision of the owner.
- It does not edit the texts of the two model checks beyond the declaration.
- The path of the dispatcher is fixed in the code: with a moved directory of hooks the layout
  writes no record of the dispatcher at all. Measured on today's package; a task of its own.
- A record left in the settings for a check the tree later put into `skip` is not named.

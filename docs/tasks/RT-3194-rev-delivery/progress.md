# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Closing
- **Done:** every role finding closed or filed; the bindings of four companions match the hook
  code; the audit counts a task lag against its base; RT-3219 and RT-3220 filed; the law of
  RT-3193 brought back under the size limit and merged in
- **Next step:** rebuild the rules graph and the code graphs, then the push gate
- **Uncommitted:** the epic plan row and this progress
- **Waiting for the owner:** no; the push of RT-3193 waits for the main copy to leave RT-3178
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Run the role rules-reviewer over the whole family
- [x] 1.2 Compare rule articles with the companion bindings and hook code
- [x] 1.3 Write the findings list into the progress with a decision for each
- [x] 2.1 Edit the package texts by the findings
- [x] 2.2 Build the package and lay out the tree
- [x] 2.3 File tasks for findings that need code or another law
- [>] 3.1 Rebuild the rules graph and its report
- [ ] 3.2 Run the push gate
- [ ] 3.3 Take the task folder apart into the archive

## Findings

Role rules-reviewer, 11.11.2026 (decisions pending):

- **D1** GitLab and Azure `git-workflow` have no epic layer; their patterns and the law depend on one.
- **D2** `git-workflow` flows (all three) take the folder apart after the PR opens; «two signs» of a
  draft and the pitfall about a draft carrying its folder keep the old order.
- **D3** `git-workflow-pr.github` «There are no checks on the PR itself» vs its own draft article and
  `deploy-flow.github`.
- **D4** `deploy-flow` (all three) flow and «not here» say the audit reads the main-branch run; prose
  says the last successful rollout. `queue-audit.github` flow too.
- **D5** `git-workflow-migration` «skips silently» on a stopped database vs `deploy-flow` «refuses».
- **D6** GitLab/Azure miss «opens ready where the pipeline does not wake».
- **D7** A PR on a base with no run: pr.github opens ready, queue-audit silent, pr-ready treats empty
  as red, freshness waits.
- **D8** Rebase in `git-workflow-stack` and `git-workflow-merge` vs the law «by merging».
- **D9** main merged into a task branch in merge, freshness, queue-audit-read, pr.github (`main...HEAD`)
  vs the law: the epic branch into the task branch.
- **D10** Build in the push gate: rules yes, pr patterns item 6 no.
- **D11** «the merge rolls out» unconditional in `git-workflow-restart` and `dependencies`.
- **D12** PR body sections: six vs four; item 10 lists three.
- **D13** Azure PR title example carries a task key the host has none of.
- **D14** `git-workflow-migration` and `-restart` name `.github/workflows/deploy.yml` for all hosts.
- **D15** Scopes listed in `git-workflow-commit.github` vs «scopes: implementation.md».
- **D16** «Item 1 changes with it — no run is asked for» in pr.github: stale item number.
- **G1** deploy-flow gitlab/azure miss four law articles github has.
- **G2** queue-audit names fewer audit lines than the family promises.
- **G3** GitLab/Azure: «merged by a person» only in the flow graph.
- **G4** `git-workflow-restart` points to a migration split that does not exist.
- **G5** Law article «A requirement before an irreversible step stands where the step is taken» has
  no rule line.
- **Pairs:** «task created by a command» belongs to `git-workflow` (drop from `task-flow-start`);
  «PR refused while the branch carries its folder» belongs to `task-flow` (drop from
  `git-workflow.github`, fix the three flows).

Decisions:

| Finding            | Closed by                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| D2, pairs          | c2feb92a2 — flows take the folder apart before the PR; the refusal article stays in `task-flow` |
| D3, D10, D12       | 18dc62744 — checks text, build in item 6, six body sections                                     |
| D4, D5             | 21d868e16 — the lag counts from the last successful rollout; a stopped database refuses         |
| D7, G4             | e37948b38 — an empty run has two meanings; the rollback goes in two releases                    |
| D8, D9             | 938baeec6 — the base, not main; merge without rebase; the conflict line names the base          |
| D11, D13, D14, D15 | e48d9a8c5 — conditional rollout, Azure title, the tree's rollout pipeline, scopes               |
| D16                | 65d93221d — `origin/<база>...HEAD`, item number fixed                                           |
| G2                 | 76b97b6c4 — four move rows in `queue-audit-read`                                                |
| D1, D6, G1, G3, G5 | RT-3219 — the GitLab and Azure variants lack whole articles; no room in this task               |

Binding comparison, 11.11.2026 — closed by a4288aea1 unless named:

- git-workflow: force push and rebase — no guard refuses them; the turn-exit guard does count
  unpushed commits; the body guard reads the body at opening; the reviewer clash is refused at
  opening; the signature line was doubled with opposite verdicts; the main branch comes from the
  profile first; 38 lines of 53.
- deploy-flow: the rollout is `deploy.yml` images, not package publication; the empty-storage chain
  runs in `check-schema-drift`; the build side cleans in part — the `deploy.yml` job does not
  (RT-3220); the override no longer says the audit is blind to production lag.
- dependencies: the waiting term is not set (RT-3220), the exclusion list exists; the ceiling count
  command; the formatter boundary is held by nobody; Playwright is pinned in the manifest; the rule
  no longer says the frozen install stands only in the rollout.
- queue-audit: functions named in their real files; the long-work audit is inert here; the lag of a
  task is counted against its base (SC-AK-1337), and a conflicting task PR gets no run line
  (SC-AK-1338).
- Not taken: the override article on the commit language needs no binding — it stands in its own
  section, outside «How the law applies here».
- RT-3074 (epic RT-3043): its first half — the rule contradicting itself about the production check —
  is closed by 21d868e16; the rate-limit half stays with it.

## Decisions along the way

- GitLab and Azure gaps go to RT-3219: they add articles to two rules each, and the family review
  only aligns what already stands.

## Sessions

### 2026-11-11

- Folder, plan; baseline: 43 articles of the family held by memory, 23 pairs of repeats.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-role-exit
**Branch:** RT-3194-rev-delivery

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — Findings
- **Next step:** the binding comparison, then the rest of the findings
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3194-rev-delivery/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/plans/agent-kit-revision.md
```

### Commits over the main branch

```
76b97b6c4 docs(rt:agent-kit): чтение сверки очереди называет ход на каждую её строку
e37948b38 docs(rt:agent-kit): пустой прогон и откат миграции описаны без противоречий
e48d9a8c5 docs(rt:agent-kit): общие паттерны поставки не несут имён одного дерева и одного хостинга
938baeec6 fix(rt:agent-kit): ветка задачи сверяется со своей базой, а не с main
21d868e16 docs(rt:agent-kit): выкатка и миграции говорят об одном и том же одинаково
18dc62744 docs(rt:agent-kit): список перед PR не спорит с правилом о сборке и прогоне
c2feb92a2 docs(rt:agent-kit): схемы поставки разбирают папку задачи до PR, повторы с task-flow убраны
13ca73ae9 Merge branch 'RT-3193-rev-work-conduct' into RT-3194-rev-delivery
e6096933b docs(rt:agent-kit): две статьи закона о ведении работы приведены к правилам
65d93221d docs(rt:agent-kit): список перед PR сверяет ветку с её базой, а не с main
0f6687b98 docs(rt:agent-kit): папка задачи RT-3194
858d5cc31 fix(rt:agent-kit): хвосты ревизии семьи о ведении работы, найденные ролями
28f553085 docs(rt:agent-kit): у состояния «влито» есть раздел в паттерне, который его ведёт
4b602b083 chore(rt:agent-kit): графы кода и граф правил пересобраны на голове ветки
4b1232615 docs(rt:agent-kit): папка задачи RT-3193 разобрана в архив
3f1406cb2 docs(rt:agent-kit): тексты семьи закона о ведении работы сверены между собой и с кодом
32cba00f5 docs(rt:agent-kit): паттерны task-flow без повторов, свежесть графа в истории
bac1536c0 docs(rt:agent-kit): правило task-flow называет конвейер feature.js
492d43cc4 docs(rt:agent-kit): папка задачи RT-3193
b8876cdb9 [RT-3192] Связи между текстами пакета правил собраны в граф с отчётом для ревизии (#3213)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.

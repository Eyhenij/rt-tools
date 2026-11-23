# Grill

**Описание фичи:** не нужно — правка набора перед отправкой пакета правил; код приложений не меняется.

## The owner request

> продолжай RT-3471, эпик (четвёртая часть переделки проверок)

The owner's word of 21.11.2026; the task is row 11 of the plan of the epic RT-3471
`docs/plans/checks-rework-4.md`, among the tasks outside the milestone.

The card (issue #3466), filed 21.11: at the push of the branch of the epic RT-3302 the push guard
ran the light steps of the set itself and showed them red: `pnpm run agent-kit:check` and
`pnpm run lint:styles` — «Unsupported environment: Expected node >=22.22.3, got v20.11.0»;
`check-tokens-styles` — `ERR_REQUIRE_ESM`; `check-schema-drift` — `styleText is not a function`.
The same steps in the run ahead, started with node 22, were green. The hook gets an environment
where node 20 stands first. The card asks: the steps the push guard runs itself go on the node the
tree demands, or the guard names the mismatch in one line instead of red steps. The sign: a push
from an environment with node 20 first in PATH gives green light steps or one line about node.

> дальше работай полностью самостоятельно в режиме ночной работы, я ухожу спать. не задавай вопросов и не останавливай сессию, все вопросы решай сам как посчитаешь наиболее правильным

The night of 22.11 writes the plan and runs the roles; the code waits for the owner's approval of
the plan in the morning.

> Продолжай

The owner's word of 23.11.2026, after RT-3426 was handed in as the PR #3523. The branch is rebuilt
on the tip of RT-3426; the branch of the night is kept locally as `RT-3466-night-before-rebuild`.

## What the tree already has

- **The tree pins its node.** `.nvmrc` holds `v22.22.3`; `package.json` demands `node >=22.22.3`.
  This machine keeps 14 versions under `~/.nvm/versions/node`, eight of them 20.x; `which -a node`
  of the session puts 22.22.3 first, the environment of a hook may put 20.11.0 first.
- **One hook already runs on the pinned node.** `projects/agent-kit/assets/hooks/
  git-guard-delivery-rerun.sh` reads `.nvmrc`, takes `${NVM_DIR:-$HOME/.nvm}/versions/node/v<pin>/bin`
  and puts it first in `PATH` for the rerun before a PR, when the binary is there.
- **The push set runs each step by `eval` with the `PATH` of the hook, in two loops.**
  `projects/agent-kit/assets/hooks/push-set.sh:rt_push_set_run` serves the push guard and the git
  hook before a push; `git-guard-push-ahead.sh` runs the heavy steps ahead by a loop of its own and
  does not source `push-set.sh`.
- **A set that ran no step passes.** `git-guard-push-tests.sh` exits 0 by the `no-checks` note when
  nothing ran; `pre-push.sh` prints «no check of the set judged the tree — the push passes». A line
  about the node must therefore reach both callers as a refusal of its own, not as an empty set.
- **A red step is refused by `fix_checks`** in `checks/decision-table.json` («Red checks: N — fix
  them and push again»): a wrong advice for a node that is not installed.
- **The scenarios of the set, the marks and the run ahead** stand in
  `docs/specs/agent-kit/push-gate-ahead/` and run in `projects/agent-kit/tests/push-set-runs.test.sh`
  (87 lines) and `git-guard-push-tests.test.sh`; the git hook has `pre-push.test.sh`.
- **After RT-3465 and RT-3426.** The run ahead pins its base and the choice of the base reads the
  branches the host holds; neither touches `PATH`. SC-AK-1846 and 1847 are still free on 23.11:
  1849…1853 are taken, 1848 is held by the plan of RT-3461.

## What the rules already say

- The rule `git-workflow-push`: the push reads the marks of the run ahead for the same tree and
  base; a step without a mark runs at the push.

## Questions and answers

No question was put to the owner: the card names the cause, the condition and the sign, and the
night order says to decide alone.

## Decisions

- **The push set puts the pinned node first in `PATH` for its steps, by one function the rerun
  hook calls too.** The rule lives in one place; the rerun hook keeps its behaviour. Спросить было
  некого: заход автономный. Цена ошибки: одна общая функция и два сценария.
- **The run ahead takes the same directory.** Its own loop puts it first in `PATH` too; otherwise
  the epic line «the set and the push guard take one node» stays half done. Цена ошибки: одна
  строка в `git-guard-push-ahead.sh` и случай в сценарии.
- **The directory stands first for the whole set, the choice of the steps included.**
  `rt_push_select` and `rt_push_subjects` call node outside `eval`; today the choice is the same on
  20 and 22 (26 of 46 steps), and a break there would run the whole set. The rest of the hook keeps
  its node.
- **The line is printed only on a mismatch, not on a missing directory.** The directory of the pin
  is missing and the node of `PATH` equals the pin — the steps run as before. Missing and another
  node in `PATH` — one line «node v22.22.3 is pinned in .nvmrc and not installed; PATH gives
  v20.11.0 — nvm install 22.22.3», no step runs. Спросить было некого: заход автономный. Цена
  ошибки: отказ на машине, где подходящая node стоит вне nvm, — снимается одним условием.
- **The line is a refusal of its own in both callers.** A new row of the decision table for the
  push guard and for the git hook, with its own move (install the node), not `fix_checks`.
  Without it the empty set passes the push unchecked — weaker than today.
- **A pin of a major or a minor (`22`, `22.22`) takes the highest installed version that matches;
  an alias (`lts/*`, `node`) runs as before.** Цена ошибки: деревья с псевдонимом в `.nvmrc`
  остаются с узлом хука, как сегодня.
- **Only nvm is read, and `engines` is not.** nvm is the manager of this machine; another manager
  (fnm, volta) and a tree with `engines` but no `.nvmrc` are a finding, not this task.
- **A tree with no `.nvmrc` runs as before.**
- **The sign is checked by a real push too.** A clone in the scratchpad, a fresh commit, the git
  hook before a push with node 20 first in `PATH`: no line of a wrong node in its output. The suites
  call the function, and a run ahead on node 22 would leave marks that make a push run nothing.
- **The scenarios go to `push-gate-ahead`,** the description of the set, its marks and the run
  ahead: `push-set-usefulness` measures the use of the steps, not where they run.

The rebuild of 23.11 on the tip of RT-3426. The decisions below replace the matching ones above.

- **The script of the real push guards its temporary path.** The night version ran `cd` into the
  result of `mktemp -d` and removed it at the end: an empty result left it in the copy, and the
  removal would have taken the copy itself. The path is checked before git and before the removal,
  and the probe commit carries a file, so the push is not one that adds nothing and runs nothing.

## What is left unclear

- Nothing blocks the work: the card names the case, and the rerun hook shows the way.

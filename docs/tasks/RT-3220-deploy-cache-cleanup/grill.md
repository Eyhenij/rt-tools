# Grill

Work of epic RT-3227, task RT-3220. No cargo records.

## The owner request

> заведи новый эпик на актуализацию обвязки agent kit и разбей на задачи. нужно сделать ревизию
> всей документации, правил и скилов в agent kit. так же нужно начать с построения графа graphify
> для каждого из проектов в этом репозитории, если это будет необходимо - построить некое подобие
> графа для понятий и правил в agent kit

About this task and RT-3219, on the question which epic takes them: «Взять в эпик RT-3227».

## What the tree already has

- The task comes from the revision of the delivery family, RT-3194. Its body names three gaps.
- The image build job of the rollout workflow builds two images on the self-hosted machine through
  the named builder `message-bus-builder` and removes nothing after itself. The check workflow
  removes the builder cache by two `docker builder prune` lines written inside its own step.
- `pnpm-workspace.yaml` holds `minimumReleaseAgeExclude` and no `minimumReleaseAge`: the term is
  the default of pnpm 11.
- The commit hook formats every staged file by its first line and then calls `lint-staged`, whose
  key formats `js`, `ts`, `json`, `mdx`, `md`, `html`, `scss` and `css` under `src`.
- The rules graph counts a rule as executed when its companion names a file of code with a slash
  in the path: `ts`, `mjs`, `js` or `sh`. The companion of `dependencies` names none, so the report
  lists the rule under «Rules nothing executes».
- No pipeline step and no line of the push set checks formatting with the formatter.

## What the rules already say

- The owner decided for the whole epic: «По семьям законов, правки сразу».
- The rule `deploy-flow` asks one script for the cleanup of both sides and says the build machine
  keeps the build cache within a limit and removes dangling images.
- The rule `dependencies` says only what the linter checks the formatting of gets reformatted.

## Questions and answers

**Which epic takes RT-3219 and RT-3220?**
«Взять в эпик RT-3227»

**Is the waiting term for a fresh version written into the install settings explicitly?**
«Записать 1440 минут (Recommended)»

The six start questions are closed by assumption: the task body names the work point by point.

- Behaviour of the application: does not change. The edit touches two workflows, the commit hook,
  the install settings, one new check and the companions of two rules.
- A law edit: none.
- Out of scope: the cleanup of images on the node, the cleanup of the auth rollout workflow.

# Grill

**Описание фичи:** не нужно — правка текстов правил пакета и дерева; код приложений не меняется.

## The owner request

> продолжай работу по эпику

The owner's standing order for the epic RT-3302; the task is row 15 of the epic plan. The card
(issue #3410) was filed by the second review round of RT-3392: after it six rules longer than
3 000 characters were left, and the probe of RT-3392 did not walk their areas. On 19.11 at 04:33 the
gate refused a live edit on `entity-conventions`.

## What the tree already has

- **The probe on 19.11.2026.** The probe of RT-3392 over its 21 areas and twelve more — the
  manifests and the published surface of a package, the release checks, the menu and the routes,
  the store and the edit panel of a record, its model and mapper — refuses two: the store and the
  edit panel, where `angular-patterns`, `entity-conventions` and `reuse-first` do not fit 10 000
  characters together. The menu shell stands at exactly 10 000.
- **The sizes on 19.11.2026** (`wc -m` of the laid-out `SKILL.md`): lib-layers 8 927, dependencies
  6 438, entity-conventions 6 295, navigation 5 532, package-release 5 481, entity-models 4 974.
- **Whose texts.** lib-layers, dependencies, entity-conventions, navigation and entity-models are
  package resources under `projects/agent-kit/assets/rules/`; package-release is this tree's own
  rule, edited in place. An override of the tree may add to a package rule and is compressed too.
- **The technique.** RT-3392 compressed fifteen rules to at most 3 000 characters: the statements of
  the articles stay in the hot part, the full text moves word for word to the cold part, a reader
  role retells each rule without the old text, and a critic compares. The machine half is the
  meaning check of RT-3392: every paragraph of the old hot part stands in the rule directory.

## What the rules already say

`spec-driven`: a compressed article keeps its statement, boundary, exception and sign; room is
measured first; a loss returns to the article. `doc-style`: the prose of the rules layer has a
limit in characters.

## Questions and answers

None: the owner told the executor to decide himself («делай всё сам»), and in RT-3392 the owner set
the bound: «ужимай до 3000, смысл не теряй». The card names the technique and the rules.

## Decisions

- **Every named rule gets a hot part of at most 3 000 characters**, as in RT-3392: then any three of
  them fit the limit with room for the companions.
- **The meaning check is stricter than in RT-3392**: the statement of every old article stands in
  the hot part, not only somewhere in the rule directory — the card asks for it.
- **The probe walks the new areas too**: the paths of the six rules join the list of RT-3392.
- **Metric:** gate refusals go down; the weekly report judges it by the line «проверка правил».

## What is left unclear

- Whether a rule cut to 3 000 characters still answers the questions of its area — that is the job
  of the retelling, not of a count.

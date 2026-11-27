# Разбор правил после RT-3649

Эпик RT-3694. Разбор сделала роль `skill-curator` 27.11. Пять предложений ждут решения владельца, ни одно не
применено. Что загружалось и помогло: `task-delivery-loop`, `doc-style`, `task-flow`, `task-flow-plan`,
`rt-tools-styling`, `code-design`.

## 1. Пересобираемый файл в следе плана

- **Случай:** лист кита стоял в следе плана словом «пересобирается». `tools/review-path-signs.mjs` читает только строки
  со словом «правится», поэтому план вышел лёгким, а разница полной.
- **Куда:** `.claude/skills/task-delivery-loop/SKILL.md`, раздел `## Duties of the steps`, первым пунктом.
- **Текст:** «A file a generator rebuilds with new content is a footprint row «правится»: `--plan` reads no row without
  that word, and a built stylesheet left out gives a light plan with a full diff.»

## 2. Что снимает набор и с чем сравнивается образец путей

- **Случай:** образец цикла говорит, что `--affected` снимает только тронутые истории. На деле общий лист стилей снимает
  всю витрину. Образец путей сравнивается с полным путём.
- **Куда:** `.claude/skills/task-delivery-loop-run/SKILL.md`, раздел `## 5–6`, абзац о снимках витрины заменить.
- **Текст:** «The showcase frames have one road: `node tools/visual-gate.mjs ui-kit-v2 --affected <base>`, the push set's
  own line. It shoots all on a file that reaches every story or that it does not know: the PR body takes the first line
  of `affected-stories.mjs`, not the flag's name. The whole set is the step of a PR into `main`. A path sample is a regex
  over the full path, the copy's folder too: begin it at `components/`; after `--update` it re-takes what it matches.»
- **Место:** файл дойдёт ровно до предела длины. Пункт 5 разбора после RT-3715 метит в этот же файл и после этой правки
  не поместится без разделения или сокращения.

## 3. Ловушка образца путей в образце о снимках

- **Куда:** `.claude/skills/ui-component-tests-visual/SKILL.md`, раздел `## Traps`; полный текст в `pitfalls.md` рядом.
- **Горячая строка:** «**The sample is matched against the full path, the folder of the working copy included.**»
- **Холодный текст:** «A word standing in that folder's name matches every story file: `preset|theme` in a copy whose
  folder holds `preset` opened all 320 files and ran 576 s, and after `--update` such a sample would re-take every
  reference. The sample is anchored inside the kit: `components/.*(preset|theme)`. The first sign is the number of
  opened files, read at the start of the run.» Случай с `--update` выведен из кода, не запускался.

## 4. Проверка шага после `&&` не запускалась при написании плана

- **Случай:** короткая проверка перед `&&` держала шаг красным, а тяжёлая часть впервые запустилась на самом шаге и не
  уложилась в 540 секунд.
- **Куда:** `projects/agent-kit/assets/pitfalls/task-flow-plan.md`, раздел `## Pitfalls`. Это пакет.
- **Текст:** «**The part of a check behind `&&` is run by itself while the plan is written.** A cheap guard put in front
  keeps the check red before the work, and the command behind it never runs: its time and what it selects are first seen
  at the step. The engine stops a step check at 540 s. A tail that does not fit is narrowed in the plan, or left to the
  push set and not made a step check.»

## 5. Комментарии генератора уезжают в `tokens.css`

- **Случай:** комментарии `/* */` генератора Sass оставляет в собранных файлах. Правка комментария меняла несжатые
  байты, и порог веса и числа в текстах переписывались после каждого круга ревью.
- **Куда:** `.claude/skills/rt-tools-styling-tokens/SKILL.md`, раздел `## The styling layer is built, not edited`.
- **Текст:** «**A `/* */` comment the generator emits ships to the consumer and is weighed.** `sass` builds the token
  files uncompressed and keeps it, so an edit of a preamble, a note or the banner moves their raw bytes:
  `check:kit-weight` turns red. Their raw and gzip numbers in the README, the epic plan and the PR body are measured
  after the last such edit of the review rounds. A note for the editor of the generator alone is a JavaScript comment of
  the `.mjs`, outside the emitted strings.»

## Без нового текста

- Набранное «одобряю, делай» без номера задачи не засчитано верно: отказ сам назвал нужный ход.
- Отклонённый вопрос «снять задачу»: случай один, ослаблять проверку роль не предлагает.
- Неизмеренный выигрыш в черновике описания PR уже закрывает `doc-style`.

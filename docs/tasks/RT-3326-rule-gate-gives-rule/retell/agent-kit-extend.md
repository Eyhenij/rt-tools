# agent-kit-extend — the retelling

Under the round stand its cases. A reader got them with only the hot part of the skill, as the gate gives it. Then stands the reply of `goal-critic` verbatim. After the round the opening line was shortened by thirteen characters to fit the layout header; no article changed.

## Round 1 — the hot part of 2877 characters

**Cases.**

Case 1. You want to add one item of this tree to the package section `## Pitfalls` of `rules/testing.md`. You plan to create the override `rules/testing.md` with the heading `## Pitfalls` and your item. Separately, a paragraph of a skill that lies inside a markdown sample needs to change, and you plan to name its override by the heading that stands in the sample. After both, `sync --check` is green, and you consider the work done. What do you do?

Case 2. The gate demands the component rule for `*.stories.ts` files. You redeclare `skill_for` in the tree's gate map: a branch for `*.stories.ts` printing `showcase`, placed after an existing general `*.ts` branch, and the function no longer calls the package default. You plan to confirm the edit by the package scenarios. What do you do?

Case 3. In the tree profile you write `rt_docs_pair_for` so that a kit component demands its `CONTEXT.md`. It prints the literal path, matches by the sign `*/libs/kit/*`, and leaves every other file unhandled. Separately, in the checks settings you want the roots `apps` and `libs` plus `tools`, and you write `"sourceRoots": ["tools"]`. What do you do?

Case 4. Your tree both writes the kit and calls it. After declaring the kit bundle, uniformity advice appears on the kit's own files, and you plan to drop the bundle. You also start a law of the tree with a rule: one statement has no place in the code, and you plan to give it a companion line anyway. Last, you edited a package resource and ran `sync` without a build; on commit the formatter rewrote that resource. What do you do with each?

**The critic.**

Итог: в первом круге все четыре случая сошлись. По тому, что проверяют случаи, действия не потерялись и не добавились.

| Случай | Читатель прежнего текста | Читатель горячей части (akeR1.txt) | Совпало |
|---|---|---|---|
| 1. Свой пункт под `## Pitfalls`, заголовок внутри образца | Свой заголовок (former:42-46), путь повторяет ресурс (26-27), имя по объемлющему разделу вместе с образцом (54-55), `sync --check` и глазами (62-63) | То же (hot:23-27) | да |
| 2. Ветка `*.stories.ts` под общей, без `_default` | Конкретная ветка выше общей, вызов `skill_for_default` (105-108), вызов проверки на трёх путях (77-78) | То же (hot:31-37), сценариям пакета не доверяет | да, см. замечание 1 |
| 3. `rt_docs_pair_for` и `sourceRoots` | Печатать образец пути (129), `_default "$@"` (130), путь от корня дерева (133-135), список целиком (150-153) | То же (hot:41-43, 47) | да |
| 4. Набор кита, утверждение без кода, форматер | Набор оставить, папки исключить через `exceptNamed` (159-161); утверждение прозой в "Pitfalls" (173-174); порядок: правка, сборка, форматер, `sync`, коммит (193-200) | То же (hot:48, 52-53, 58) | да |

**Замечания (на совпадение не влияют):**

1. В прежнем тексте два места противоречат друг другу. Строки 70-71: «The package scenarios run its default and do not touch the tree's branches». Строка 110: «Checked by the gate scenarios from the package suite». Горячая часть выбрала верное (hot:31), и читатель сценариям пакета не доверился. Но в холодной части строка 110 осталась (ake-cold.md:110), и тот, кто откроет холодную часть, увидит то же противоречие. Шаг: в ake-cold.md убрать строку 110 или переписать её так: «Package scenarios test only the default; a tree branch is checked by hand.»
2. В горячей части нет строки «Checked by the spec audit — before the push.» (former:176, она осталась в ake-cold.md:176). Случаи это не проверяют: в случае 4 про проверку не спрашивали. Если нужен хвост, он пойдёт в статью «Your own law and rule», строка hot:52: `; the spec audit checks it before push.` (около 40 знаков). Место освободит сокращение hot:8-9 «The skill `agent-kit` names **where** each edit is set up; here — **how** it looks and what checks it.» до «`agent-kit` says where; here — how and what checks it.» (минус 40 с лишним знаков).
3. Где у читателя горячей части нет данных (точный вид образца `${1%/*}/CONTEXT\.md`, former:124; имя правила `showcase`), он так и написал. Образцы целиком лежат в холодной части, и горячая на неё ссылается (hot:9). Это не потеря.
4. Горячая часть ссылается на `pitfalls.md`, а черновик холодной части лежит как ake-cold.md. При раскладке проверьте, что файл холодной части называется именно `pitfalls.md`, иначе ссылка в hot:9 никуда не ведёт.

**Источники:**
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/ake-former.md
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/ake-hot.md (2 877 знаков по `wc -m`)
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/ake-cold.md
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/ake-cases.md
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/akeR1.txt

Не проверено: что разложенный файл с заголовком уложится в 3 000 знаков. Проверка: `wc -m` по разложенному файлу после `sync`.

Verdict: matched

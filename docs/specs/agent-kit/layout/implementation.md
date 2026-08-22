# Раскладка ресурсов в дерево — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека рядом. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

Якорь здесь — слово, которое утверждение и держит. Сверка ищет его по всему файлу и любым словом
удовлетворяется, поэтому имя поля из чужой строки проходит её так же, как нужное предложение, — и
утверждение остаётся зелёным, когда сам текст роли переписан целиком.

| Правило                                                                                 | Где исполняется                                                       |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Пакет проверяет то, что везёт, а не только то, чем везёт.                               | `projects/agent-kit/src/lib/assets.spec.ts:expectGreen`               |
| Ресурс, оставшийся без своего вида, — отказ раскладки, а не молчание.                   | `projects/agent-kit/src/lib/catalog.ts:variantGaps`                   |
| Раскладка из устаревшей сборки не выдаёт себя за свежую.                                | `projects/agent-kit/src/lib/freshness.ts:staleBuild`                  |
| Разложенное сверяется по содержимому, а не по номеру редакции.                          | `projects/agent-kit/src/lib/plan.ts:planFile`                         |
| Переход чужого файла в управление пакетом делается командой, а не руками.               | `projects/agent-kit/src/lib/commands.ts:adopt`                        |
| Разложенное, которому нужна запись в чужой настройке, доезжает до неё.                  | `projects/agent-kit/src/lib/hooks-map.ts:unboundHooks`                |
| Надстройка настроек проверок сливается по вложенным ключам.                             | `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:mergeDeep` |
| Пакет не знает раскладки чужого дерева.                                                 | `projects/agent-kit/assets/checks/lib-common.mjs:LIBS_ROOT`           |
| Пакет не знает и слов чужого дерева.                                                    | `projects/agent-kit/assets/checks/lib-common.mjs:LIB_PREFIX`          |
| Первая установка не требует писать прозу руками.                                        | `projects/agent-kit/src/lib/companion.ts:draftOf`                     |
| Требование ресурса названо в самом ресурсе, а не выводится чтением.                     | `projects/agent-kit/src/lib/catalog.ts:requiresOf`                    |
| Разорванная связь — предупреждение, а не отказ.                                         | `projects/agent-kit/src/lib/catalog.ts:brokenLinks`                   |
| Разбор состояния называет невыбранное поимённо, а не числом.                            | `projects/agent-kit/src/lib/commands.ts:doctor`                       |
| Разбор состояния печатает пороги окна захода.                                           | `projects/agent-kit/src/lib/thresholds.ts:thresholdLines`             |
| Пакет не пишет в файлы, принадлежащие дереву.                                           | `projects/agent-kit/README.md:observations`                           |
| Отказ от родителя снимает потомков, а лишняя строка отказа объявляется предупреждением. | `projects/agent-kit/src/lib/cascade.ts:cascadeCuts`                   |
| Закон, не попавший в выбор, отвергнут наравне с названным в отказе.                     | `projects/agent-kit/src/lib/catalog.ts:isChosen`                      |
| Каскад идёт сверху вниз и только.                                                       | `projects/agent-kit/src/lib/cascade.ts:cascadeCuts`                   |
| Связь берётся из вступления самих ресурсов.                                             | `projects/agent-kit/src/lib/catalog.ts:frontMatterOf`                 |
| Снятое каскадом называется вместе с родителем.                                          | `projects/agent-kit/src/lib/commands.ts:doctor`                       |
| Пакет везёт закон, верный любому дереву своего класса.                                  | `projects/agent-kit/src/lib/retired.ts:RETIRED`                       |
| Отказ дерева от предметного закона — одна строка.                                       | `projects/agent-kit/src/lib/cascade.ts:chosenEntries`                 |
| Ресурс, ушедший из пакета, уходит вместе с потомками.                                   | `projects/agent-kit/src/lib/integrity.ts:brokenLinks`                 |
| Пакет помнит имена, которые из него ушли.                                               | `projects/agent-kit/src/lib/sync.ts:retiredOf`                        |
| Снятое каскадом остаётся на диске и называется отдельно от брошенного.                  | `projects/agent-kit/src/lib/sync.ts:leftOnDisk`                       |
| Короткое имя из вступления разрешается по последнему звену имени внутри своего рода.    | `projects/agent-kit/src/lib/cascade.ts:shortNameOf`                   |
| Два ресурса одного рода с одинаковым последним звеном имени — отказ набора.             | `projects/agent-kit/src/lib/integrity.ts:ambiguousNames`              |
| Родитель с несколькими видами отвергнут, только когда не выбран ни один его вид.        | `projects/agent-kit/src/lib/cascade.ts:cascadeCuts`                   |
| Снятый внук называется обоими: ближайшим родителем и отвергнутым корнем.                | `projects/agent-kit/src/lib/cascade.ts:ICascadeCut`                   |
| Выбор, который после каскада ничего не берёт, называется вслух.                         | `projects/agent-kit/src/lib/cascade.ts:namedButCut`                   |
| Родителя нет в каталоге — каскад молчит.                                                | `projects/agent-kit/src/lib/cascade.ts:cascadeCuts`                   |
| Связь, порванную самим каскадом, предупреждением не считают.                            | `projects/agent-kit/src/lib/catalog.ts:brokenLinks`                   |
| Предупреждение раскладки печатается на любом её исходе.                                 | `projects/agent-kit/src/lib/commands.ts:warnings`                     |
| Раскладка называет добавленный долг в тот же момент, когда его добавила.                | `projects/agent-kit/src/lib/commands.ts:debtLines`                    |
| Статьи считаются по компаньону дерева, а не по черновику пакета.                        | `projects/agent-kit/src/lib/companion.ts:unaddressedOf`               |
| Счёт добавленного долга складывается чистой функцией.                                   | `projects/agent-kit/src/lib/companion.ts:debtLine`                    |
| Образец, названный текстом пакета, пакетом и везётся.                                   | `projects/agent-kit/src/lib/config.ts:KINDS`                          |
| Образцы едут своим родом ресурса, а не вместе с шаблонами надстройки.                   | `projects/agent-kit/src/lib/config.ts:TKind`                          |
| Дерево вправе назвать образцам свой путь и отказаться от них целиком.                   | `projects/agent-kit/src/lib/config.ts:DEFAULT_LAYOUT`                 |
| Образец несёт шапку раскладки наравне с остальным разложенным.                          | `projects/agent-kit/src/lib/plan.ts:planFile`                         |
| Холодная часть правила — свой род ресурса, а не имя внутри рода правил.                 | `projects/agent-kit/src/lib/config.ts:PITFALLS_FILE`                  |

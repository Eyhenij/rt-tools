# Ход работы

## Где стоим

- **State:** `этапы-кончились`
- **Stage:** 4 из 4 — все шаги отмечены
- **Done:** этапы 1–4 закоммичены, порог Angular Doctor 37, находка security-bypass одна
- **Next step:** живая проверка виджета, значков и редактора CMS, затем два круга ревью
- **Uncommitted:** нет
- **PR:** ещё не открыт

## Шаги

- [x] 1.1 Пайп sanitize удалён из core вместе с тестом и экспортом
- [x] 1.2 Пример пайпа убран из README core
- [x] 1.3 Стиль значка ячейки таблицы привязан строкой без обхода
- [x] 1.4 Реестр значков разбирает SVG, убирает script и атрибуты on* и переносит узлы
- [x] 1.5 Тесты SC-UKV-1709 и SC-UKV-1710 зелёные: символ спрайта несёт рисунок без script и on*, стиль значка ячейки доходит до значка
- [x] 2.1 Правка блока очищает разметку DOMPurify с белым списком вставки и кладёт узлы
- [x] 2.2 Превью встраивания пускает в доверие только разобранный https-адрес
- [x] 2.3 Тест SC-CMS-80 зелёный: скрипт и обработчик уходят, style выделения и атрибуты ссылки остаются
- [x] 3.1 Виджет строит разметку узлами DOM, тексты идут в textContent
- [x] 3.2 Тест SC-CH-118 зелёный: слово об отказе с разметкой в пределе и сторона реплики показаны текстом
- [x] 4.1 Находок двух правил в дереве ровно одна — превью встраивания cms
- [x] 4.2 Порог записан на результате задачи без правила inner-html
- [x] 4.3 Ни одно правило порога не выросло против порога ветки эпика

## Решения по ходу

- **Числовые признаки плана записаны без обратных кавычек** — в плане ожидаемое `= 0`, `>= 2` стоит
  в кавычках, и движок читает его как строку «= 0», а не как число: шаг 1.3 при 0 находок дал «не
  совпало». Команды те же, меняется только форма ожидаемого. Затронутые этапы плана: 1–4.
- **Проверка шага 1.3 заменена:** `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>/inner-html|security-bypass/.test(d.ruleId)&&d.file.includes("rt-data-table-cell")).length))'` → = 0
- **Проверка шага 1.4 заменена:** `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>/inner-html|security-bypass/.test(d.ruleId)&&d.file.includes("rt-icon.registry")).length))'` → = 0
- **Проверка шага 1.5 заменена:** `pnpm exec nx test @rt-tools/ui-kit-v2 --skip-nx-cache --testNamePattern='SC-UKV-17(09|10)' --output-style=static 2>&1 | grep 'Tests:' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0` → >= 2
- **Проверка шага 2.1 заменена:** `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>/inner-html|security-bypass/.test(d.ruleId)&&d.file.includes("cms-editable")).length))'` → = 0
- **Проверка шага 2.2 заменена:** `pnpm exec nx test @rt-tools/cms-angular --skip-nx-cache --testNamePattern='SC-CMS-79' --output-style=static 2>&1 | grep 'Tests:' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0` → >= 2
- **Проверка шага 2.3 заменена:** `pnpm exec nx test @rt-tools/cms-angular --skip-nx-cache --testNamePattern='SC-CMS-80' --output-style=static 2>&1 | grep 'Tests:' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0` → >= 2
- **Проверка шага 3.1 заменена:** `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>/inner-html|security-bypass/.test(d.ruleId)&&d.file.includes("chat-widget")).length))'` → = 0
- **Проверка шага 3.2 заменена:** `cd apps/chat-widget && ../../node_modules/.bin/vitest run -t 'SC-CH-118' 2>&1 | grep -E 'Tests ' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0` → >= 1
- **Проверка шага 4.1 заменена:** `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>/inner-html|security-bypass/.test(d.ruleId)).length))'` → = 1
- **Проверка шага 4.3 заменена:** `node -e 'const {execSync}=require("child_process");const a=JSON.parse(execSync("git show 513f11b21:tools/ngdoctor-threshold.json")).rules;const b=JSON.parse(require("fs").readFileSync("tools/ngdoctor-threshold.json")).rules;const grew=Object.keys(b).filter(k=>(b[k]??0)>(a[k]??0));const fell=Object.keys(a).filter(k=>(b[k]??0)<a[k]);console.log(grew.length===0&&fell.length>0?0:1)'` → = 0

## Заходы

### 2026-11-22

- Разбор с владельцем: пайп убрать, превью встраивания — обход за разбором адреса.
- План прочли две роли; подтверждённые находки вошли в план до одобрения: очистка правки блока
  DOMPurify, `script` и `on*` в SVG значков, неэкранированные поля виджета, рост правил в пороге.
- Живая проверка: сквозной набор виджета на стенде из сборки ветки (`widget.js` без `innerHTML`,
  0 вхождений) — 25 из 25, снимки виджета совпали с эталонами. `check:ngdoctor`: оценка 37 = порог.
  Тесты: chat-widget 11 из 11, cms-angular 110 из 110, ui-kit-v2 с SC-UKV-1709/1710 зелёные.
- Первый круг ревью. Исправлено: внутренняя ссылка блока теряла `contentTypeId` и
  `contentItemId` при открытии в редакторе; очистка значков пропускала `style`, `set`, `animate` и
  `javascript:`, разбитый управляющими знаками; веха G плана эпика не несла оговорку о превью cms;
  графы core, ui-kit-v2, cms-angular и виджета устарели. Списано: превью любого https без
  `sandbox` — слово владельца «Любой https, проверенный»; удаление `SanitizePipe` из API — названо
  в теле коммита и будет названо в PR; вид виджета не замерян — сквозной набор со снимками 25 из 25;
  блоки CMS со сторонней разметкой — редактор сам создаёт только `a`, `div`, `p`, `span`, все в
  белом списке. Тесты после правок: cms-angular 111 из 111, реестр значков 14 из 14.
- Второй круг ревью. Исправлено: очистка значков пропускала узлы HTML внутри `desc` и `title`
  (`meta` с переадресацией, `link` со стилем) и внешнюю картинку `image` — теперь уходит всё, что
  не в пространстве имён SVG; инструмент переноса импортов ещё переносил `SanitizePipe` в core.
  В плане эпика оговорка о превью стала частью точек C и G, назван риск: `graph:build` оставляет
  `graph.html`, и `check:ngdoctor` насчитал в них 104 находки — файлы удалены, `check:ngdoctor`
  равен порогу 37. Списано: потеря сторонней разметки блока при правке — редактор сам её не пишет;
  нажатия виджета без модульного теста — их держит сквозной набор, 25 из 25. Тесты: реестр
  значков 14 из 14, сценарий инструмента переноса 17 из 17.
- Сверка второго круга: графы, пересобранные на первом круге, вернулись к базе — сборка
  переписала корневой граф в одну строку (−1 052 743 строки), это правка своя. Срезанные `<style>`
  и анимация в значках потребителя со своим адресом названы в PR и в архивной записи; вопрос
  владельцу об их возврате не пропустил страж вопросов — вариант ослаблял очистку.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3478-ngdoctor-security

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 из 4 — Ядро и кит
- **Next step:** удалить пайп sanitize из core
- **PR:** ещё не открыт

The progress in full — `docs/tasks/RT-3478-ngdoctor-security/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
1914b4b41 fix(rt:cms): правка блока без записи innerHTML, превью встраивания только для разобранного https (RT-3478)
47ea435e6 docs(rt:ui-kit-v2): слово владельца о том, что правка значков и ячейки не меняет вид (RT-3478)
ef78a6919 fix(rt:ui-kit-v2): значки и стиль значка ячейки без записи innerHTML и обхода очистки (RT-3478)
51b022a44 refactor(rt:core): пайп sanitize удалён из пакета (RT-3478)
81085f414 docs(rt:ui-kit-v2): ход работы задачи о записи innerHTML и обходе очистки (RT-3478)
d5852dcde docs(rt:ui-kit-v2): разбор и план задачи о записи innerHTML и обходе очистки (RT-3478)
513f11b21 [RT-3492] knip зелёный: неиспользуемые экспорты сняты, d3 объявлен в ките, knip в наборе перед push и в конвейере (#3501)
6cd98a50d Merge branch 'RT-3476-angular-doctor' into RT-3492-knip-green
43ab01cc6 Merge remote-tracking branch 'origin/main' into RT-3476-angular-doctor
f3a66731d docs(rt:ui-kit-v2): десять записей архива старше недели удалены (RT-3492)
2f263fd77 test(rt:message-bus): разделы админки и экран записей открываются без ошибок загрузки (RT-3492)
19f8c6567 docs(rt:ui-kit-v2): папка задачи разобрана в архив (RT-3492)
c0a6ab371 fix(rt:ui-kit-v2): knip зелёный после второго круга ревью (RT-3492)
ff8a6d363 fix(rt:ui-kit-v2): knip зелёный после первого круга ревью (RT-3492)
034732f7d build(rt:ui-kit-v2): knip в конвейере и в наборе перед push (RT-3492)
6ec873891 build(rt:ui-kit-v2): пакеты d3 и их типы объявлены в наборе, который их импортирует; knip зелёный (RT-3492)
504ec733d refactor(rt:ui-kit-v2): девятнадцать символов без export, которые никто не импортирует (RT-3492)
c4ace998d docs(rt:ui-kit-v2): ход работы RT-3492, слово владельца о правке графика без вида (RT-3492)
2eccbead1 docs(rt:ui-kit-v2): в разборе RT-3492 заголовок карточки вместо строки плана эпика (RT-3492)
ca72f1b98 docs(rt:ui-kit-v2): задача RT-3477 влита в ветку эпика, RT-3492 в работе (RT-3492)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.

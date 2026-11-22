# Ход работы

## Где стоим

- **State:** `этап-идёт`
- **Stage:** 1 из 4 — Ядро и кит
- **Done:** разбор, план одобрен владельцем («Одобряю план RT-3478»), все признаки плана красные
- **Next step:** удалить пайп sanitize из core
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
- [>] 3.1 Виджет строит разметку узлами DOM, тексты идут в textContent
- [ ] 3.2 Тест SC-CH-118 зелёный: слово об отказе с разметкой в пределе и сторона реплики показаны текстом
- [ ] 4.1 Находок двух правил в дереве ровно одна — превью встраивания cms
- [ ] 4.2 Порог записан на результате задачи без правила inner-html
- [ ] 4.3 Ни одно правило порога не выросло против порога ветки эпика

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

#!/usr/bin/env bash
# Сценарии сравнения кода с «Решением» плана в конце этапов: место, набор, новый файл, бюджет и связи.
#
# Мерило зовётся с двойниками истории и ответа о зацеплении; разбор раздела — настоящий.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "код против решения плана"

TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Случаи группы: JS печатает строки `метка|получено|ожидалось`, каждая идёт в report. Молчание JS — провал.
fd_run() {
    local out label got want count=0
    out="$(cd "$TESTS" && node --input-type=module 2>&1)"
    while IFS='|' read -r label got want; do
        [ -n "$label" ] || continue
        count=$((count + 1))
        # Строка без ожидания — вывод упавшего JS, не случай.
        [ -n "$want" ] || { report "строка случая: $label" "без ожидания" "с ожиданием"; continue; }
        report "$label" "$got" "$want"
    done <<< "$out"
    [ "$count" -gt 0 ] || report "группа случаев напечатала строки" "нет" "да"
}

# Общая часть групп: план, история и вызов мерила.
FD_DIR="$(mktemp -d)"
trap 'rm -rf "$FD_DIR"' EXIT
cat > "$FD_DIR/prelude.mjs" << 'JS'
import { gitDouble } from './flow-doubles.mjs';
import { open as openDesign } from '../assets/task-flow/source/design.mjs';
import { gaps } from '../assets/task-flow/measure/design.mjs';

const B = 'RT-1-x';
const F = `docs/tasks/${B}`;
const SILENT = { answered: false, problems: [], now: new Map() };
const table = (rows) => ['| Часть | Что выбрано |', '| --- | --- |', ...Object.entries(rows).map(([name, text]) => `| ${name} | ${text} |`)].join('\n');
const plan = (body, foot = []) => `# План\n\n${body}\n\n## Task footprint\n\n| What | Where |\n| --- | --- |\n${foot.map((path) => `| Code (правится) | \`${path}\` |`).join('\n')}\n`;
const decision = (rows, foot) => plan(`## Решение\n\n${table(rows)}`, foot);
// История: что стояло до плана, план и свои коммиты после него.
const history = ({ before = {}, text, after = [], branch = B, planBranch = B }) => gitDouble({
    branch,
    commits: [{ sha: 'b', files: before }, { sha: 'p', files: { [`docs/tasks/${planBranch}/plan.md`]: text } }, ...[after].flat().map((commit, at) => ({ sha: `c${at}`, ...(commit.files ? commit : { files: commit }) }))],
});
const found = (spec) => gaps({ git: history(spec), design: openDesign(), coupling: { from: () => spec.coupling ?? SILENT } })();
// Случай: чего ждут — «чисто» или кусок названного расхождения.
const check = (label, spec, want = 'чисто') => {
    const all = found(spec).join('; ');
    console.log(`${label}|${all === '' ? 'чисто' : want !== 'чисто' && all.includes(want) ? want : all.replaceAll('|', '¦')}|${want}`);
};
JS
# Группа пишется в файл: в трубе report считал бы в своей оболочке.
fd_group() {
    cat "$FD_DIR/prelude.mjs" - > "$FD_DIR/group.mjs"
    fd_run < "$FD_DIR/group.mjs"
}

# --- SC-AK-1974 — место, набор, новый файл и «Решения нет» -------------------------------------------
fd_group << 'JS'
const at = (label, cell, files, want, before = {}) => check(`SC-AK-1974 — ${label}`, { text: decision({ Модули: cell }, Object.keys(files)), before, after: files }, want);
const ONE = '`a/b.mjs:one` — читает письмо';
const GONE = '`a/b.mjs:one` is not declared';
at('место объявлено функцией', ONE, { 'a/b.mjs': 'export function one() {\n}\n' });
at('место удалено', ONE, { 'a/b.mjs': 'export function two() {\n}\n' }, GONE);
at('место осталось в строке комментария', ONE, { 'a/b.mjs': '// function one() {}\nlet two;\n' }, GONE);
at('место осталось в блоке комментария', ONE, { 'a/b.mjs': '/**\n * one: старое имя\nfunction one() {}\n */\nlet two;\n' }, GONE);
at('место осталось в импорте', ONE, { 'a/b.mjs': "import {\n    one,\n} from './c.mjs';\n" }, GONE);
at('место только зовут', ONE, { 'a/b.mjs': 'one(1);\nif (one(2)) {\n    two();\n}\n' }, GONE);
at('файла с местом нет', ONE, { 'a/c.mjs': 'export function one() {\n}\n' }, GONE);
at('имя внутри другого слова', ONE, { 'a/b.mjs': 'export function oneMore() {\n}\nlet someone = 1;\n' }, GONE);
at('короткий путь одного файла', '`b.mjs:one` — читает', { 'x/a/b.mjs': 'const one = () => 1;\n' });
const COPY = '/* eslint-disable */\n';
at('символ только в разложенной копии', ONE, { 'kit/a/b.mjs': 'let two;\n', 'tools/a/b.mjs': '// rt-kit v1.0.0 · a/b.mjs · ff\nfunction one() {}\n' }, GONE);
at('символ в пакете, копия рядом', ONE, { 'kit/a/b.mjs': 'function one() {}\n', 'tools/a/b.mjs': '// rt-kit v1.0.0 · a/b.mjs · ff\nlet two;\n' });
at('два файла, символ в одном', ONE, { 'x/a/b.mjs': `${COPY}let two;\n`, 'y/a/b.mjs': 'let one = 1;\n' });
at('метод класса', '`a/b.ts:Mail.one` — читает', { 'a/b.ts': 'export class Mail {\n    public async one(text: string): Promise<void> {\n    }\n}\n' });
at('метод с доводами в несколько строк', '`a/b.ts:Mail.one` — читает', { 'a/b.ts': 'class Mail {\n    one(\n        text: string,\n        again = () => 1\n    ): void {\n    }\n}\n' });
at('закрытое поле', '`a/b.ts:#one` — читает', { 'a/b.ts': 'class Mail {\n    #one = 1;\n}\n' });
at('поле с типом', '`a/b.ts:Mail.one` — читает', { 'a/b.ts': 'class Mail {\n    protected readonly one: Signal<string> = signal("");\n}\n' });
at('абстрактный метод', '`a/b.ts:Mail.one` — читает', { 'a/b.ts': 'abstract class Mail {\n    protected abstract one(): void;\n}\n' });
at('тип', '`a/b.ts:One` — форма', { 'a/b.ts': 'export interface One {\n}\n' });
at('перечисление с declare', '`a/b.ts:One` — форма', { 'a/b.ts': 'export declare enum One {\n}\n' });
at('ключ объекта', ONE, { 'a/b.mjs': 'export const all = { one: 1, two };\n' });
at('метод объекта', ONE, { 'a/b.mjs': 'export const all = {\n    one(text) {\n    },\n};\n' });
at('разбор на части', ONE, { 'a/b.mjs': 'const [two, one] = read();\n' });
at('переотдача', ONE, { 'a/b.mjs': "export { two, one } from './c.mjs';\n" });
at('функция оболочки', '`a/b.sh:rt_one` — читает', { 'a/b.sh': 'rt_one() {\n    :\n}\n' });
at('переменная оболочки', '`a/b.sh:RT_ONE` — имя', { 'a/b.sh': 'RT_TWO=1; RT_ONE="$RT_TWO"\n' });
at('имя оболочки только в комментарии', '`a/b.sh:rt_one` — читает', { 'a/b.sh': '# rt_one() — старое\nrt_two() { :; }\n' }, 'is not declared');
at('класс стилей', '`a/b.scss:.rt-mail` — письмо', { 'a/b.scss': '.rt-mail {\n}\n' });
at('элемент хвостом родителя', '`a/b.scss:.rt-mail__head` — шапка', { 'a/b.scss': '.rt-mail {\n    &__head {\n    }\n}\n' });
at('класс с тем же началом', '`a/b.scss:.rt-mail` — письмо', { 'a/b.scss': '.rt-mailbox {\n}\n' }, 'is not declared');
at('свойство с дефисом', '`a/b.scss:--rt-color` — цвет', { 'a/b.scss': ':root {\n    --rt-color: red;\n}\n' });
at('файл незнакомого языка', '`a/b.yml:one` — задание', { 'a/b.yml': 'jobs:\n    one:\n' });
at('незнакомый язык, слово в комментарии', '`a/b.yml:one` — задание', { 'a/b.yml': '# one\njobs: 1\n' }, 'is not declared');
at('место после слова «отброшено»', 'чтение; отброшено: `a/b.mjs:one`', { 'a/c.mjs': 'let two;\n' });
at('место до слова «отброшено» в том же предложении', '`a/b.mjs:one`; отброшено: приведение', { 'a/b.mjs': 'let two;\n' }, GONE);
at('место удаляется и удалено', '`a/b.mjs:one` удаляется', { 'a/b.mjs': 'let two;\n' });
at('место удаляется вместе с файлом', '`a/b.mjs:one` удаляется', { 'a/b.mjs': null }, 'чисто', { 'a/b.mjs': 'let one;\n' });
at('место удаляется и осталось', '`a/b.mjs:one` удаляется', { 'a/b.mjs': 'let one;\n' }, '`a/b.mjs:one` was to be removed');
at('список мест удаляется, второе осталось', '`a/b.mjs:one`, `a/b.mjs:two` удаляются', { 'a/b.mjs': 'let two;\n' }, '`a/b.mjs:two` was to be removed');
at('место переезжает: судится цель', '`a/b.mjs:one` переезжает в `a/c.mjs:one`', { 'a/c.mjs': 'let two;\n' }, '`a/c.mjs:one` is not declared');
at('место переехало', '`a/b.mjs:one` переезжает в `a/c.mjs:one`', { 'a/c.mjs': 'let one;\n' });
check('SC-AK-1974 — паттерн удалён из кода, а рядом стоит «отброшено»', { text: decision({ Паттерны: 'Adapter — `a/b.mjs:one`; отброшено: приведение' }, ['a/b.mjs']), after: { 'a/b.mjs': 'let two;\n' } }, GONE);

const SUITE = 'a/b.test.sh';
const suite = (label, cell, before, after, want) => check(`SC-AK-1974 — ${label}`, { text: decision({ 'Данные: письмо': cell }, []), before, after }, want);
suite('набор есть и тронут', `письмо. SC-AK-7, \`${SUITE}\``, {}, { [SUITE]: 'SC-AK-7\n' });
suite('набора нет', `письмо. SC-AK-7, \`${SUITE}\``, {}, { 'x.md': 'y\n' }, `the suite \`${SUITE}\` is not there`);
suite('набор не тронут, но нёс номер', `письмо. SC-AK-7, \`${SUITE}\``, { [SUITE]: 'SC-AK-7\n' }, { 'x.md': 'y\n' });
suite('набор не тронут и номера не нёс', `письмо. SC-AK-7, \`${SUITE}\``, { [SUITE]: 'SC-AK-8\n' }, { 'x.md': 'y\n' }, 'does not carry SC-AK-7');
suite('набор тронут, номера нет', `письмо. SC-AK-7, \`${SUITE}\``, { [SUITE]: 'a\n' }, { [SUITE]: 'b\n' }, 'does not carry SC-AK-7');
suite('без номера сценария, набор тронут', `письмо; номера нет: дерево без описаний. \`${SUITE}\``, {}, { [SUITE]: 'a\n' });
suite('без номера сценария, набор не тронут', `письмо; номера нет: дерево без описаний. \`${SUITE}\``, { [SUITE]: 'a\n' }, { 'x.md': 'y\n' }, 'was not touched');
suite('ввода нет', 'ввода нет: правка текста', {}, { 'x.md': 'y\n' });

const fresh = (label, rows, foot, files, want) => check(`SC-AK-1974 — ${label}`, { text: decision(rows, foot), after: files }, want);
const NEW = 'the new file `a/b.mjs` is named neither';
fresh('новый файл назван «Модулями»', { Модули: ONE }, [], { 'a/b.mjs': 'let one;\n' });
fresh('новый файл назван точным путём следа', { Границы: 'форма записи' }, ['a/b.mjs'], { 'a/b.mjs': 'let one;\n' });
fresh('новый файл назван папкой следа', { Границы: 'форма записи' }, ['a/'], { 'a/b.mjs': 'let one;\n' }, NEW);
fresh('новый файл назван маской следа', { Границы: 'форма записи' }, ['a/*.mjs'], { 'a/b.mjs': 'let one;\n' }, NEW);
fresh('новый файл не назван никем', { Границы: 'форма записи' }, [], { 'a/b.mjs': 'let one;\n' }, NEW);
fresh('новый набор', { Границы: 'форма записи' }, [], { 'a/b.test.mjs': 'let one;\n' });
fresh('новая разложенная копия', { Границы: 'форма записи' }, [], { 'tools/b.mjs': '#!/usr/bin/env node\n// rt-kit v1.0.0 · b.mjs · ff\nlet one;\n' });
fresh('новый текст', { Границы: 'форма записи' }, [], { 'a/b.md': 'текст\n' });
check('SC-AK-1974 — прежний файл удалили и вернули', { text: decision({ Границы: 'форма записи' }), before: { 'a/b.mjs': 'let one;\n' }, after: [{ 'a/b.mjs': null }, { 'a/b.mjs': 'let two;\n' }] });
check('SC-AK-1974 — новый файл привезло слияние', { text: decision({ Границы: 'форма записи' }), after: [{ own: false, files: { 'a/b.mjs': 'let one;\n' } }] });

const none = (label, before, after, want) => check(`SC-AK-1974 — «Решения нет», ${label}`, { text: plan('## Решение\n\nРешения нет: правка двух слов'), before, after }, want);
const OLD = { 'a/b.mjs': 'export function one() {\n}\n' };
none('новых символов нет', OLD, { 'a/b.mjs': 'export function one() {\n    const two = 1;\n}\n' });
none('новый файл кода', OLD, { 'a/c.mjs': 'let one;\n' }, 'the branch added `a/c.mjs`');
none('новая функция в прежнем файле', OLD, { 'a/b.mjs': 'export function one() {\n}\nfunction two() {\n}\n' }, 'declared `a/b.mjs:two`');
none('новый класс в прежнем файле', OLD, { 'a/b.mjs': 'export function one() {\n}\nclass Two {\n}\n' }, 'declared `a/b.mjs:Two`');
none('новый экспорт в прежнем файле', OLD, { 'a/b.mjs': 'export function one() {\n}\nexport const two = 1;\n' }, 'declared `a/b.mjs:two`');
none('новая функция стрелкой', OLD, { 'a/b.mjs': 'export function one() {\n}\nconst two = (a) => a;\n' }, 'declared `a/b.mjs:two`');
none('функцию оболочки добавили и убрали', { 'a/b.sh': 'one() { :; }\n' }, [{ 'a/b.sh': 'one() { :; }\ntwo() { :; }\n' }, { 'a/b.sh': 'one() { :; }\n' }]);
none('функцию привезло слияние', OLD, [{ own: false, files: { 'a/b.mjs': 'export function one() {\n}\nfunction two() {\n}\n' } }, { 'x.md': 'y\n' }]);

const LOST = decision({ Модули: ONE }, []);
check('SC-AK-1974 — план без раздела', { text: plan('Текст.'), after: { 'a/b.mjs': 'let two;\n' } });
check('SC-AK-1974 — раздел стоит дважды', { text: `${LOST}\n${LOST}`, after: { 'x.md': 'y\n' } });
check('SC-AK-1974 — план чужой ветки', { text: LOST, planBranch: 'RT-2-y', after: { 'x.md': 'y\n' } });
check('SC-AK-1974 — ветки нет', { text: LOST, branch: '', after: { 'x.md': 'y\n' } });
check('SC-AK-1974 — судится первая версия плана', { text: LOST, after: { [`${F}/plan.md`]: plan('Текст.') } }, GONE);
check('SC-AK-1974 — папка разобрана', { text: LOST, after: { [`${F}/plan.md`]: null } }, GONE);
JS

# --- SC-AK-1975 — бюджет и снятие --------------------------------------------------------------------
fd_group << 'JS'
const L = (n) => 'x\n'.repeat(n);
const pathsOf = (...sets) => [...new Set(sets.flatMap((set) => [set].flat()).flatMap((one) => Object.keys(one.files ?? one)))].filter((path) => !path.startsWith('docs/'));
const budget = (label, cell, before, after, want, coupling) => check(`SC-AK-1975 — ${label}`, { text: decision({ Бюджет: cell }, pathsOf(before, after)), before, after, coupling }, want);
budget('«до N», файл короче', '`a/b.mjs` до 3 строк', {}, { 'a/b.mjs': L(2) });
budget('«до N», файл равен', '`a/b.mjs` до 3 строк', {}, { 'a/b.mjs': L(3) });
budget('«до N», файл длиннее', '`a/b.mjs` до 3 строк', {}, { 'a/b.mjs': L(4) }, '`a/b.mjs` holds 4 lines, the budget is 3');
budget('«до N» коротким путём', '`b.mjs` до 3 строк', {}, { 'x/a/b.mjs': L(4) }, '`b.mjs` holds 4 lines');
budget('«плюс N» в пределах', '`a/b.mjs` плюс 2', { 'a/b.mjs': L(3) }, { 'a/b.mjs': L(5) });
budget('«плюс N» сверх', '`a/b.mjs` плюс 2', { 'a/b.mjs': L(3) }, { 'a/b.mjs': L(6) }, '`a/b.mjs` grew by 3 lines, the budget is 2');
budget('«плюс N» у нового файла', '`a/b.mjs` плюс 2', {}, { 'a/b.mjs': L(3) }, 'grew by 3 lines');
budget('двоичный файл', '`a/b.png` до 1', {}, { 'a/b.png': 'a\0b\nc\nd\n' });
budget('удалённый файл', '`a/b.mjs` до 3 строк', { 'a/b.mjs': L(9) }, { 'a/b.mjs': null });
budget('число без пути', 'файлы до 3 строк', {}, { 'a/b.mjs': L(9) });
budget('новых файлов кода больше', 'новых файлов кода: 1', {}, { 'a/b.mjs': L(1), 'a/c.mjs': L(1) }, 'new code files 2, the budget is 1');
budget('новых файлов кода столько же', 'новых файлов кода: 2', {}, { 'a/b.mjs': L(1), 'a/c.mjs': L(1), 'a/d.md': L(1) });
const PKG = (deps) => JSON.stringify({ name: 'a', dependencies: deps }, null, 2);
budget('новая зависимость', 'новых зависимостей: 0', { 'package.json': PKG({ a: '1' }) }, { 'package.json': PKG({ a: '1', b: '2' }) }, 'new dependencies 1, the budget is 0');
budget('правка версии зависимости', 'новых зависимостей: 0', { 'package.json': PKG({ a: '1' }) }, { 'package.json': PKG({ a: '2' }) });
budget('зависимости не правились', 'новых зависимостей: 0', { 'package.json': PKG({ a: '1' }) }, { 'a/b.mjs': L(1) });
budget('слита база с чужой зависимостью', 'новых зависимостей: 0', { 'package.json': PKG({ a: '1' }) }, [{ own: false, files: { 'package.json': PKG({ a: '1', b: '2' }) } }, { 'package.json': PKG({ a: '2', b: '2' }) }]);
budget('слита база с чужим новым файлом', 'новых файлов кода: 0', {}, [{ own: false, files: { 'a/c.mjs': L(1) } }, { 'a/d.md': L(1) }]);

const progress = (part, line) => ({ [`${F}/progress.md`]: `# Progress\n\n## ${part}\n\n- ${line}\n` });
const OVER = '`a/b.mjs` holds 4 lines';
const lift = (label, line, want = 'чисто', { cell = '`a/b.mjs` до 3 строк', file = 'a/b.mjs', part = 'Decisions along the way' } = {}) =>
    budget(label, cell, {}, { [file]: L(4), ...progress(part, line) }, want);
lift('снятие строкой решений с причиной', '**`a/b.mjs` — 4 строки: превышение.** Довод: разбор стоит в том же модуле.');
lift('снятие словами «отказ от»', '`a/b.mjs`: отказ от бюджета, разбор стоит в том же модуле');
lift('снятие по-английски', '`a/b.mjs` overrun: the parser stays in the module');
lift('снятие без причины', '`a/b.mjs` — превышение 4', OVER);
lift('снятие без слова превышения', '`a/b.mjs` — разбор стоит в том же модуле', OVER);
lift('снятие другого пути', '`a/c.mjs` — превышение: разбор стоит в том же модуле', OVER);
lift('снятие вне раздела решений', '`a/b.mjs` — превышение: разбор стоит в том же модуле', OVER, { part: 'Sessions' });
lift('коротким путём снимается полный', '`a/b.mjs` — превышение: разбор стоит в том же модуле', 'чисто', { cell: '`x/a/b.mjs` до 3 строк', file: 'x/a/b.mjs' });
lift('снятие числа новых файлов', 'новых файлов кода — превышение: набор нужен отдельный', 'чисто', { cell: 'новых файлов кода: 0' });
const AFTER = (text, own = true) => [{ 'a/b.mjs': L(4), ...progress('Decisions along the way', 'нет') }, { own, text, files: { [`${F}/progress.md`]: null } }];
budget('папка разобрана, снятие коммитом', '`a/b.mjs` до 3 строк', {}, AFTER('docs: архив\n\n`a/b.mjs` — превышение: разбор стоит в том же модуле'));
budget('папка разобрана, снятие чужим коммитом', '`a/b.mjs` до 3 строк', {}, AFTER('`a/b.mjs` — превышение: разбор стоит в том же модуле', false), OVER);
budget('стопка двух задач, снятие в папке нижней', '`a/b.mjs` до 3 строк', { 'docs/tasks/RT-0-z/progress.md': '# Progress\n\n## Decisions along the way\n\n- `a/b.mjs` — превышение: разбор стоит в том же модуле\n' }, { 'a/b.mjs': L(4) }, OVER);
const HELD = '`a/b.mjs` — превышение: связь нужна разбору';
const refused = (label, problem, want = problem) => budget(label, '`a/b.mjs` до 9 строк', {}, { 'a/b.mjs': L(1), ...progress('Decisions along the way', HELD) }, want, { answered: true, problems: [problem], now: new Map() });
refused('новый цикл не снимается', 'a new cycle: a/b.mjs → a/c.mjs → a/b.mjs');
refused('новый обход входа не снимается', 'a/b.mjs imports c/d.mjs past the entry c/index.mjs');
refused('новый цикл с путём в кавычках не снимается', 'a new cycle: `a/b.mjs` → `a/c.mjs` → `a/b.mjs`');
refused('рост связей снимается', '`a/b.mjs` outgoing 1 → 3; the branch named 2', 'чисто');
JS

suite_result "код против решения плана"

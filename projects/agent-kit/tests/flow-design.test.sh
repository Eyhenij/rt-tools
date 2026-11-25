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
# Настоящий путь: движок, запущенный по пути через ссылку, не узнаёт себя и молчит.
FD_DIR="$(cd "$(mktemp -d)" && pwd -P)"
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
suite('набор есть и тронут', `письмо. SC-AK-10007, \`${SUITE}\``, {}, { [SUITE]: 'SC-AK-10007\n' });
suite('набора нет', `письмо. SC-AK-10007, \`${SUITE}\``, {}, { 'x.md': 'y\n' }, `the suite \`${SUITE}\` is not there`);
suite('набор не тронут, но нёс номер', `письмо. SC-AK-10007, \`${SUITE}\``, { [SUITE]: 'SC-AK-10007\n' }, { 'x.md': 'y\n' });
suite('набор не тронут и номера не нёс', `письмо. SC-AK-10007, \`${SUITE}\``, { [SUITE]: 'SC-AK-10008\n' }, { 'x.md': 'y\n' }, 'does not carry SC-AK-10007');
suite('набор тронут, номера нет', `письмо. SC-AK-10007, \`${SUITE}\``, { [SUITE]: 'a\n' }, { [SUITE]: 'b\n' }, 'does not carry SC-AK-10007');
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
const [L, PKG] = [(n) => 'x\n'.repeat(n), (deps) => JSON.stringify({ name: 'a', dependencies: deps }, null, 2)];
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
budget('новая зависимость', 'новых зависимостей: 0', { 'package.json': PKG({ a: '1' }) }, { 'package.json': PKG({ a: '1', b: '2' }) }, 'new dependencies 1, the budget is 0');
budget('правка версии зависимости', 'новых зависимостей: 0', { 'package.json': PKG({ a: '1' }) }, { 'package.json': PKG({ a: '2' }) });
budget('зависимости не правились', 'новых зависимостей: 0', { 'package.json': PKG({ a: '1' }) }, { 'a/b.mjs': L(1) });
budget('слита база с чужой зависимостью', 'новых зависимостей: 0', { 'package.json': PKG({ a: '1' }) }, [{ own: false, files: { 'package.json': PKG({ a: '1', b: '2' }) } }, { 'package.json': PKG({ a: '2', b: '2' }) }]);
budget('слита база с чужим новым файлом', 'новых файлов кода: 0', {}, [{ own: false, files: { 'a/c.mjs': L(1) } }, { 'a/d.md': L(1) }]);

const [progress, OVER] = [(part, line) => ({ [`${F}/progress.md`]: `# Progress\n\n## ${part}\n\n- ${line}\n` }), '`a/b.mjs` holds 4 lines'];
const lift = (label, line, want = 'чисто', { cell = '`a/b.mjs` до 3 строк', file = 'a/b.mjs', part = 'Decisions along the way' } = {}) => budget(label, cell, {}, { [file]: L(4), ...progress(part, line) }, want);
const place = (label, line, want, cell) => check(`SC-AK-1975 — ${label}`, { text: decision({ Модули: '`a/b.mjs:one` — читает', Бюджет: cell }, ['a/b.mjs']), after: { 'a/b.mjs': L(4), ...progress('Decisions along the way', line) } }, want);
place('снятие бюджета пути не снимает удалённого места', '`a/b.mjs` — превышение: разбор стоит в том же модуле', '`a/b.mjs:one` is not declared', '`a/b.mjs` до 3 строк');
place('снятие места его местом', '`a/b.mjs:one` — отказ от: чтение уходит в другой модуль', 'чисто', '`a/b.mjs` до 9 строк');
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

# --- SC-AK-1976 — отказ зацепления и обещанное снижение связей ----------------------------------------
fd_group << 'JS'
const GREW = '`a/b.mjs` outgoing 1 → 3; the branch named 2';
const links = (label, cell, { before = { 'a/b.mjs': 'let a;\n' }, after = { 'a/b.mjs': 'let b;\n' }, answer = {}, want = 'чисто', lift = null } = {}) =>
    check(`SC-AK-1976 — ${label}`, {
        text: decision({ Зацепление: cell }, ['a/b.mjs', 'x/a/b.mjs']),
        before,
        after: lift ? { ...after, [`${F}/progress.md`]: `# Progress\n\n## Decisions along the way\n\n- ${lift}\n` } : after,
        coupling: { answered: true, problems: [], now: new Map(), ...answer },
    }, want);
links('строка violations названа', 'циклов нет', { answer: { problems: [GREW] }, want: GREW });
links('команда ответила без отказа', 'циклов нет');
links('команда не ответила', 'циклов нет', { answer: { answered: false, problems: [GREW] } });
links('число в плане, команда молчит', '`a/b.mjs` исходящие 1 → 2', { answer: { now: new Map([['a/b.mjs', 2]]) } });
const DOWN = '`a/b.mjs` исходящие 3 → 1';
links('снижение не выполнено', DOWN, { answer: { now: new Map([['a/b.mjs', 3]]) }, want: '`a/b.mjs` outgoing was to be 1, it is 3' });
links('снижение выполнено не целиком', DOWN, { answer: { now: new Map([['a/b.mjs', 2]]) }, want: '`a/b.mjs` outgoing was to be 1, it is 2' });
links('снижение: модуль не тронут', DOWN, { after: { 'a/c.md': 'y\n' }, want: '`a/b.mjs` outgoing was to be 1, it is 3' });
links('снижение выполнено', DOWN, { answer: { now: new Map([['a/b.mjs', 1]]) } });
links('снижение с запасом', DOWN, { answer: { now: new Map([['a/b.mjs', 0]]) } });
links('снижение: модуль удалён, команда его не числит', DOWN, { after: { 'a/b.mjs': null } });
links('снижения нет: число без изменения', '`a/b.mjs` исходящие 2 → 2', { answer: { now: new Map([['a/b.mjs', 3]]) } });
links('снижение папки не судится', '`a/` исходящие 3 → 1', { answer: { now: new Map([['a/', 3]]) } });
links('снижение коротким путём', '`b.mjs` исходящие 3 → 1', { before: { 'x/a/b.mjs': 'let a;\n' }, after: { 'x/a/b.mjs': 'let b;\n' }, answer: { now: new Map([['x/a/b.mjs', 3]]) }, want: '`x/a/b.mjs` outgoing was to be 1, it is 3' });
links('снижение не выполнено, снятие с причиной', DOWN, { answer: { now: new Map([['a/b.mjs', 3]]) }, lift: '`a/b.mjs` — превышение: связь с разбором осталась' });
JS

# --- SC-AK-1976 — источник: ответ команды и его хранение ----------------------------------------------
# Поддельная команда пишет вызов в файл вне репозитория и отвечает по режиму из другого такого файла:
# файл внутри репозитория сам менял бы ключ ответа.
cat > "$FD_DIR/command.mjs" << 'JS'
import { appendFileSync, readFileSync } from 'node:fs';
appendFileSync(process.env.FD_CALLS, `${process.argv[2]}\n`);
const mode = readFileSync(process.env.FD_MODE, 'utf8').trim();
if (mode === 'crash') throw new Error('broken');
const fail = (text) => console.error(text) ?? process.exit(1);
if (mode === 'unknown') fail('check-coupling: the revision is not known');
if (mode === 'refuse') fail('\ncheck-coupling: violations 1\n\n  `a/b.mjs` outgoing 1 → 3; the branch named 2\n\nFix the code.');
console.log('  a/b.mjs: incoming 0 → 0, outgoing 1 → 2, total 2\n  a/c.mjs: removed, outgoing was 3');
JS
cat > "$FD_DIR/ask.mjs" << 'JS'
const { open } = await import(process.env.FD_SOURCE);
const { answered, problems, now } = open().from(process.argv[2]);
console.log([answered, problems.join(' / '), [...now].map(([path, links]) => `${path}=${links}`).join(',')].join('|'));
JS
FD_REPO="$(fixture_repo_branched main RT-1-x)"
fixture_commit "$FD_REPO" tools/check-coupling.mjs "$(cat "$FD_DIR/command.mjs")" 'chore: команда'
FD_PLAN="$(git -C "$FD_REPO" rev-parse HEAD)"
export FD_CALLS="$FD_DIR/calls" FD_MODE="$FD_DIR/mode" FD_SOURCE="$TESTS/../assets/task-flow/source/coupling.mjs"
fd_ask() { printf '%s\n' "$1" > "$FD_MODE" && (cd "$FD_REPO" && node "$FD_DIR/ask.mjs" "$FD_PLAN" 2>&1); }
fd_calls() { if [ -f "$FD_CALLS" ]; then wc -l < "$FD_CALLS" | tr -d ' '; else echo 0; fi; }
fd_fresh() { rm -rf "$FD_REPO/.git/rt-kit" "$FD_CALLS"; }
FD_GREW='`a/b.mjs` outgoing 1 → 3; the branch named 2'

fd_fresh
report "SC-AK-1976 — команда молчит: числа связей прочитаны" "$(fd_ask ok)" "true||a/b.mjs=2,a/c.mjs=0"
fd_fresh
report "SC-AK-1976 — строка violations прочитана" "$(fd_ask refuse)" "true|$FD_GREW|"
fd_fresh
report "SC-AK-1976 — неизвестная ревизия: ответа нет" "$(fd_ask unknown)" "false||"
report "SC-AK-1976 — команда упала: ответа нет" "$(fd_ask crash)" "false||"
report "SC-AK-1976 — команды нет: ответа нет" "$(RT_CHECKS_DIR=nowhere fd_ask ok)" "false||"
report "SC-AK-1976 — «не ответила» не хранится" "$(fd_ask ok | cut -d'|' -f1)" "true"
fd_fresh
fd_ask refuse > /dev/null
report "SC-AK-1976 — ответ хранится по вершине" "$(fd_ask ok | cut -d'|' -f2)|$(fd_calls)" "$FD_GREW|1"
fixture_commit "$FD_REPO" a/d.mjs 'let d;' 'feat: d'
report "SC-AK-1976 — новая вершина зовёт команду" "$(fd_ask refuse | cut -d'|' -f2)|$(fd_calls)" "$FD_GREW|2"
git -C "$FD_REPO" checkout -q -b RT-2-y
report "SC-AK-1976 — две ветки на одной вершине ответа не делят" "$(fd_ask ok | cut -d'|' -f2)|$(fd_calls)" "|3"
git -C "$FD_REPO" checkout -q RT-1-x
printf 'let e;\n' >> "$FD_REPO/a/d.mjs"
report "SC-AK-1976 — незаписанная правка зовёт команду" "$(fd_ask ok | cut -d'|' -f2)|$(fd_calls)" "|4"
git -C "$FD_REPO" checkout -q -- a/d.mjs
report "SC-AK-1976 — ответ правки не портит ответ вершины" "$(fd_ask ok | cut -d'|' -f2)|$(fd_calls)" "$FD_GREW|4"
printf 'let f;\n' > "$FD_REPO/a/f.mjs"
report "SC-AK-1976 — новый файл вне истории зовёт команду" "$(fd_ask ok | cut -d'|' -f2)|$(fd_calls)" "|5"
rm "$FD_REPO/a/f.mjs"
report "SC-AK-1976 — ответ нового файла не портит ответ вершины" "$(fd_ask ok | cut -d'|' -f2)|$(fd_calls)" "$FD_GREW|5"
fd_fresh
fd_ask ok > /dev/null
report "SC-AK-1976 — без слияния база команды — коммит плана" "$(tail -1 "$FD_CALLS")" "--base=$FD_PLAN"
git -C "$FD_REPO" checkout -q main
fixture_commit "$FD_REPO" a/g.mjs 'let g;' 'feat: g'
git -C "$FD_REPO" checkout -q RT-1-x
git -C "$FD_REPO" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false merge -q --no-edit main 2>/dev/null
fd_ask ok > /dev/null
report "SC-AK-1976 — после слияния база команды — привезённая вершина" "$(tail -1 "$FD_CALLS")" "--base=$(git -C "$FD_REPO" rev-parse main)"
rm -rf "$FD_REPO"

# --- SC-AK-1978 — движок: символ, лишний импорт, разложенная копия, отказ в конце хода ---------------
# Описание без шести первых состояний начинается с «этапы-кончились»: ветке не нужны ни хостинг, ни метки.
# Копия пакета лежит в каталоге набора, разложенная — в `tools/` репозитория вместе с настоящей командой.
fd_trim() { node -e 'const fs = require("fs"), t = fs.readFileSync(process.argv[1], "utf8"); fs.writeFileSync(process.argv[1], t.slice(0, t.indexOf("    request: {")) + t.slice(t.indexOf("    stagesOver: {")));' "$1"; }
FD_T="$(cd "$(fixture_repo_branched main RT-7-dec)" && pwd -P)"
FD_G=(git -C "$FD_T" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false)
mkdir -p "$FD_DIR/kit" "$FD_T/tools" "$FD_T/.claude/rt-kit" "$FD_T/a" "$FD_T/docs/tasks/RT-7-dec"
cp -R "$TESTS/../assets/task-flow" "$TESTS/../assets/checks" "$FD_DIR/kit/" && cp -R "$TESTS/../assets/task-flow" "$TESTS"/../assets/checks/*.mjs "$FD_T/tools/"
fd_trim "$FD_DIR/kit/task-flow/flow.js" && fd_trim "$FD_T/tools/task-flow/flow.js"
printf '{"sourceRoots":["a"],"board":{"taskKey":"RT"},"tasksDir":"docs/tasks"}\n' > "$FD_T/.claude/rt-kit/checks.json"
printf 'export const c = 1;\n' > "$FD_T/a/c.mjs"
"${FD_G[@]}" add -A && "${FD_G[@]}" commit -q -m 'chore: основа' && git -C "$FD_T" update-ref refs/remotes/origin/main HEAD
printf '# План\n\n**Task:** RT-7 · **Branch:** RT-7-dec\n**Behaviour:** unchanged — проба\n\n## Решение\n\n| Часть | Что выбрано |\n| --- | --- |\n| Модули | `a/b.mjs:one` — читает письмо |\n| Зацепление | `a/b.mjs` исходящие 0 → 0 |\n\n## Task footprint\n\n| What | Where |\n| --- | --- |\n| Code (правится) | `a/b.mjs` |\n' > "$FD_T/docs/tasks/RT-7-dec/plan.md"
"${FD_G[@]}" add -A && "${FD_G[@]}" commit -q -m 'docs: план'
fd_code() { printf '%b' "$1" > "$FD_T/a/b.mjs" && "${FD_G[@]}" add -A && "${FD_G[@]}" commit -q -m "$2" && rm -rf "$FD_T/.git/rt-kit"; }
fd_flow() { (cd "$FD_T" && node "$1/task-flow-script.mjs" measure --flow "$2/task-flow/flow.js" 2>&1); }
fd_kit() { fd_flow "$FD_DIR/kit/checks" "$FD_DIR/kit"; }
fd_laid() { fd_flow "$FD_T/tools" "$FD_T/tools"; }
FD_HELD='^state: этапы-кончились'
fd_code 'export function one() {\n    return 1;\n}\n' 'feat: one'
fd_code 'export function two() {\n    return 2;\n}\n' 'feat: one удалён'
got="$(fd_kit)"
report "SC-AK-1978 — символ удалён: движок стоит на «этапы-кончились»" "$(printf '%s' "$got" | grep -c "$FD_HELD")" 1
report "SC-AK-1978 — символ удалён: строка состояния печатает символ" "$(printf '%s' "$got" | grep -c '^not held: `a/b.mjs:one` is not declared')" 1
report "SC-AK-1978 — разложенная копия: символ удалён — названо" "$(fd_laid | grep -c '^not held: `a/b.mjs:one` is not declared')" 1
fd_code 'export function one() {\n    return 1;\n}\n' 'feat: one возвращён'
got="$(fd_kit)"
report "SC-AK-1978 — символ возвращён: движок идёт дальше" "$(printf '%s' "$got" | grep -c "$FD_HELD")|$(printf '%s' "$got" | grep -c '^state: ')" '0|1'
report "SC-AK-1978 — символ возвращён: расхождений нет" "$(printf '%s' "$got" | grep -c '^not held')" 0
fd_code "import { c } from './c.mjs';\nexport function one() {\n    return c;\n}\n" 'feat: one читает c'
got="$(fd_kit)"
report "SC-AK-1978 — лишний импорт: настоящая команда держит движок" "$(printf '%s' "$got" | grep -c "$FD_HELD")" 1
report "SC-AK-1978 — лишний импорт: строка называет рост связей" "$(printf '%s' "$got" | grep -c '^not held: `a/b.mjs` outgoing 0 → 1')" 1
rm -rf "$FD_T/.git/rt-kit"
report "SC-AK-1978 — разложенная копия: лишний импорт — назван" "$(fd_laid | grep -c '^not held: `a/b.mjs` outgoing 0 → 1')" 1
printf '%s\n' '{"type":"assistant","message":{"content":[{"type":"tool_use","id":"e1","name":"Edit","input":{"file_path":"x"}}]}}' > "$FD_DIR/record.jsonl"
got="$(cd "$FD_T" && printf '{"transcript_path":"%s"}' "$FD_DIR/record.jsonl" | node "$FD_DIR/kit/checks/task-flow-script.mjs" verdict --flow "$FD_DIR/kit/task-flow/flow.js" 2>&1)"
report "SC-AK-1978 — отказ в конце хода называет расхождение" "$(printf '%s' "$got" | grep -cF -- '\n- `a/b.mjs` outgoing 0 → 1')" 1
report "SC-AK-1978 — отказ в конце хода называет способ снятия" "$(printf '%s' "$got" | grep -c 'lift a mismatch by a line of the decisions')" 1
rm -rf "$FD_T"

suite_result "код против решения плана"

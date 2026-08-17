#!/usr/bin/env node
// rt-kit v0.8.3 · checks/check-specs.mjs · fa121ac333a6 · правится надстройкой, не здесь
/**
 * Проверка того, что спек домена не разошёлся с кодом.
 *
 * Первая редакция сверяла только идентификаторы сценариев против заголовков
 * тестов. Разбор роем нашёл в спеке возрастом в один день одиннадцать
 * расхождений с кодом, и проверка была зелёной на всех: совпадение
 * идентификатора не говорит ни о том, что правило где-то исполняется, ни о том,
 * что тест проверяет обещанное. Отсюда пять механизмов ниже — каждый сверяет
 * текст с фактом, а не с другим текстом.
 *
 * 1. ПРИВЯЗКА ПРАВИЛА К КОДУ. Живёт в `implementation.md` рядом со спеком:
 *    таблица «правило → `файл:символ`». Сверяется в обе стороны — правило без
 *    строки и строка без правила, — и требует, чтобы файл был, а символ в нём
 *    встречался. Правило шире своей привязки так не напишешь: «потолок суммы на
 *    приёме заявки» не прошло бы, потому что символ живёт в процедуре решения
 *    владельца, а четырём незаведённым механикам скидок привязки не нашлось бы
 *    вовсе. Ключ связи — сам текст правила, поэтому переформулировать его, забыв
 *    поправить привязку, нельзя. Правило без привязки — намерение, и писать его
 *    надо как `Q-N`.
 *
 * 2. КОНТРАКТ ПРОТИВ ДЕКОРАТОРОВ. Таблица процедур сверяется с тем, что
 *    объявлено в `*.procedure.ts` домена: `@RequiresPermission` / `@PublicProcedure`
 *    и дескриптор метода. В обе стороны — иначе процедура, которую домен
 *    обслуживает, но забыл описать, остаётся видна только в декораторе.
 *
 * 3. КОД ОТКАЗА С ТОЧКОЙ БРОСКА. Код принимается, только если `Code.X`
 *    действительно бросается где-то в либах домена. Коды выписывались по
 *    замыслу, и на одном пути обещанного `NotFound` не бросал никто.
 *
 * 4. УРОВЕНЬ ПРИВЯЗКИ. Сценарий, чей тест идёт не тем путём, что пользователь,
 *    или проверяет часть обещанного, помечается `Покрытие: частичное` и уходит в
 *    долги, а не в покрытие. Иначе зелёная сводка означает меньше, чем кажется.
 *
 * 5. МЁРТВАЯ ПРИВЯЗКА. Наличия символа мало: объявленный и никем не позванный
 *    символ проходил проверку насквозь. Так пять правил про правку сущности
 *    оказались привязаны к механике общей основы асайда, которую не зовёт ни один
 *    экран. Символ, объявленный в файле и больше нигде не встречающийся, местом
 *    исполнения правила не считается.
 *
 * Каждый механизм живёт своим модулем рядом: привязки и законы — `spec-anchors.mjs`,
 * контракт и коды отказов — `spec-contract.mjs`, сценарии и покрытие — `spec-scenarios.mjs`,
 * общее чтение дерева — `spec-common.mjs`. Здесь остаётся прогон: он обходит домены и
 * складывает найденное в один перечень.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { ROOT } from './rt-kit-checks.config.mjs';
import { checkRuleImplementation, checkSpecLaws, checkTracedAnchors } from './spec-anchors.mjs';
import {
    CONSTITUTION_DIR,
    NOT_DOMAINS,
    REQUIRED_HEADINGS,
    SPECS_DIR,
    collectDomains,
    exists,
    problems,
    read,
    report,
    sectionOf,
    walk,
} from './spec-common.mjs';
import { checkContract, checkRefusalCodes, procedureRootsOf } from './spec-contract.mjs';
import { collectReferences, parseScenarios, promisesScreen } from './spec-scenarios.mjs';

// ── прогон ────────────────────────────────────────────────────────────────────

function checkSpecHeadings(file, text) {
    const headings = new Set(
        text
            .split('\n')
            .filter((line) => /^#{1,6}\s/.test(line))
            .map((line) => line.trimEnd())
    );

    REQUIRED_HEADINGS.filter((required) => !headings.has(required)).forEach((required) =>
        report(file, `нет обязательного раздела \`${required}\``)
    );
}

const domains = collectDomains();
const scenarios = [];
const byId = new Map();

/**
 * Имена законов и путь к каждому. Слоёв два: общий лежит в корне `docs/constitution/`, законы
 * приложения — в `application/` под ним. Имя берётся без каталога, потому что называют закон
 * везде одинаково: ни `law:` в шапке правила, ни `**Законы:**` в спеке не знают, в каком он
 * слое, и переезд между слоями не переписывает ни одну из этих строк.
 *
 * Отсюда требование: имена законов уникальны по всему дереву конституции. Два файла с одним
 * именем в разных слоях назывались бы одной строкой `law:`, и правило досталось бы тому, кого
 * обошли первым.
 */
const laws = new Map();
for (const file of walk(CONSTITUTION_DIR, (name) => name.endsWith('.md'))) {
    const name = file.slice(file.lastIndexOf('/') + 1, -'.md'.length);
    if (laws.has(name)) {
        report(file, `закон с таким именем уже есть — \`${laws.get(name)}\`; имена законов уникальны на оба слоя`);
        continue;
    }
    laws.set(name, file);
}

/**
 * Директории, описывающие предмет: сам домен и его поддомены. Поддомен заводится, когда домен
 * вырос настолько, что читать его целиком ради одной подробности дороже, чем найти её; устроен
 * он так же — три файла и свой префикс сценариев.
 *
 * `proposed/` предметом не является: это договорённость о продукте до кода, и её сценарии живут
 * в нумерации того спека, в который она вольётся.
 */
function collectSpecDirs(base) {
    const found = [base];
    let entries;
    try {
        entries = readdirSync(join(ROOT, base), { withFileTypes: true });
    } catch {
        return found;
    }

    for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'proposed') {
            found.push(...collectSpecDirs(`${base}/${entry.name}`));
        }
    }

    return found;
}

/** Префикс сценариев принадлежит одному спеку по всему дереву. */
const prefixOwners = new Map();

for (const domain of domains) {
    const base = `${SPECS_DIR}/${domain}`;
    for (const dir of collectSpecDirs(base)) {
        // Спек, у которого есть только `proposed/`, ещё не существует: его самого нет, пока
        // фича не выкачена
        if (exists(`${dir}/proposed`) && !exists(`${dir}/spec.md`)) {
            continue;
        }
        const what = dir === base ? 'домен' : 'поддомен';
        ['spec.md', 'scenarios.md']
            .filter((name) => !exists(`${dir}/${name}`))
            .forEach((name) => report(dir, `нет файла \`${name}\` — ${what} описан наполовину`));
    }

    // Спеки фич из `proposed/` проверяются наравне со спеком домена: они и есть
    // договорённость, по которой пишется код, а не черновик. Три сверки с кодом к
    // ним не применяются — кода, с которым сверять, ещё нет
    for (const specFile of walk(base, (name) => name === 'spec.md')) {
        const text = read(specFile);
        checkSpecHeadings(specFile, text);
        // Законы спек объявляет и в `proposed/`: договорённость о продукте есть до кода
        checkSpecLaws(specFile, text, laws);
        if (specFile.includes('/proposed/')) {
            continue;
        }
        checkRuleImplementation(specFile, text, `${dirname(specFile)}/implementation.md`);
        const roots = procedureRootsOf(text);
        checkContract(specFile, text, roots);
        checkRefusalCodes(specFile, text, roots);
    }

    const found = walk(base, (name) => name === 'scenarios.md').flatMap(parseScenarios);

    // Префикс принадлежит домену вместе с его поддоменами, а не отдельному каталогу. Домен
    // делится тогда, когда его спек перерос предел длины, и сценарии переезжают в поддомены
    // прежними: номер — единственное, чем сценарий связан с заголовком теста, и своя нумерация
    // у каждого поддомена означала бы пересчёт всех номеров разом. Два префикса в одном спеке
    // по-прежнему означают, что предмет описан дважды.
    const prefixesOf = new Map();
    for (const scenario of found) {
        const dir = dirname(scenario.file);
        if (!prefixesOf.has(dir)) {
            prefixesOf.set(dir, new Set());
        }
        prefixesOf.get(dir).add(scenario.prefix);
    }

    for (const [dir, prefixes] of prefixesOf) {
        if (prefixes.size > 1) {
            report(dir, `в спеке больше одного префикса сценариев: ${[...prefixes].sort().join(', ')}`);
        }
        // Договорённость о продукте нумеруется вместе со спеком, в который вольётся:
        // идентификаторы переезд переживают, и занятым префикс от неё не становится
        if (dir.includes('/proposed/')) {
            continue;
        }
        for (const prefix of prefixes) {
            const owner = prefixOwners.get(prefix);
            if (owner && owner !== base) {
                report(dir, `префикс \`SC-${prefix}\` уже занят — \`${owner}\`; по номеру не видно, чей сценарий`);
                continue;
            }
            prefixOwners.set(prefix, base);
        }
    }

    scenarios.push(...found);
}

// Закон о проекте не знает ничего: ни путей, ни имён файлов, ни привязок. Он только
// объявляет статьи, а всё остальное — дело правил, которые на него ссылаются. Поэтому
// спутника с привязкой у закона нет и быть не может: файл с путями `libs/...`, лежащий
// рядом с законом, привязал бы закон к этому проекту.
//
// «Открытые вопросы» отсюда сняты: проверка видела заголовок, а не вопросы под ним, и
// пустой раздел проходил её так же, как заполненный. Закон, у которого всё решено, писал
// эту строку ради самой строки.
const LAW_HEADINGS = ['## Статьи'];

for (const file of walk(CONSTITUTION_DIR, (name) => name.endsWith('.md'))) {
    const text = read(file);
    LAW_HEADINGS.filter((heading) => !text.split('\n').some((line) => line.trimEnd() === heading)).forEach((heading) =>
        report(file, `нет раздела \`${heading}\``)
    );
    if (/`[\w./-]+\.(ts|mjs|js|sh|scss|html|json|proto|conf|yml|md)[:`]/.test(text)) {
        report(file, 'закон называет файл проекта — путям и привязкам место в правиле, а не здесь');
    }
}

// Правило — скил с `kind: rule` в шапке. Оно и знает о проекте: имена, пути, связи. Привязка
// его утверждений к коду живёт в `implementation.md` рядом со скилом.
const RULE_HEADING = '## Как закон применяется здесь';
/** Раздел компаньона правила, где лежат привязки; остальные его таблицы называют имена дерева. */
const MAP_HEADING = '## Где исполняются статьи';

/**
 * Шапка скила — первый блок между `---`. Читается только она: паттерн, который учит заводить
 * правило, показывает шапку правила примером в фенсе, и поиск по всему тексту принял бы этот
 * пример за настоящее объявление.
 */
function frontMatterOf(text) {
    const found = text.match(/^---\n([\s\S]*?)\n---/);

    return found ? found[1] : '';
}

/** Правила и паттерны, найденные в дереве скилов: по ним считаются обе стороны связи. */
const ruled = new Set();
const patterned = new Set();
const nameOf = (head) => (head.match(/^name:\s*(\S+)/m) || [])[1] || '';

for (const file of walk('.claude/skills', (name) => name === 'SKILL.md')) {
    const text = read(file);
    const head = frontMatterOf(text);
    const kind = (head.match(/^kind:\s*(\S+)/m) || [])[1];

    if (kind === 'pattern') {
        const rule = (head.match(/^rule:\s*(\S+)/m) || [])[1];
        if (!rule) {
            report(file, 'паттерн не объявил правило — допиши `rule:` в шапку');
        } else if (!exists(`.claude/skills/${rule}/SKILL.md`)) {
            report(file, `паттерн объявил правило \`${rule}\`, а скила с таким именем нет`);
        } else {
            patterned.add(rule);
        }
        continue;
    }

    if (kind !== 'rule') {
        continue;
    }

    const law = (head.match(/^law:\s*(\S+)/m) || [])[1];
    if (!law) {
        report(file, 'правило не объявило закон — допиши `law:` в шапку');
    } else if (!laws.has(law)) {
        report(file, `правило объявило закон \`${law}\`, а закона с таким именем нет ни в одном слое`);
    } else {
        ruled.add(law);
    }
    checkRuleImplementation(file, text, `${dirname(file)}/implementation.md`, RULE_HEADING, MAP_HEADING);

    const name = nameOf(head);
    if (name && name !== file.slice('.claude/skills/'.length, -'/SKILL.md'.length)) {
        report(file, `имя в шапке (\`${name}\`) не совпадает с каталогом скила`);
    }
}

// Предложенный закон правила не требует: договорённость записана раньше кода, привязывать её
// не к чему, и требование правила заставило бы завести его с якорями в несуществующие места.
// Признак стоит строкой статуса в самом законе, а не списком исключений рядом с проверкой.
const isProposedLaw = (file) => /^\*\*Статус:\*\*\s*предложен/m.test(read(file));

// Обратные стороны связи. Закон без правила читается как договорённость, которую этот проект
// не применяет; правило без паттерна оставляет готовый код там, где ему не место, — в самом
// правиле, которое читается при каждой правке.
[...laws]
    .filter(([law, file]) => !ruled.has(law) && !isProposedLaw(file))
    .forEach(([, file]) => report(file, 'у закона нет ни одного правила — заведи скил с `law:` на него'));

/**
 * Имена паттернов, которые дерево при раскладке пропустило: ключ `skip` в настройке проекта.
 *
 * Пропуск — выбор дерева, а не забытая работа: правило о процедурах бэкенда ложится и в дерево,
 * где бэкенда нет вовсе. Требовать там паттерн значит требовать завести файл, которому нечего
 * сказать, — и единственным способом позеленеть становится снятие пропуска.
 */
const skippedPatterns = () => {
    const path = '.claude/rt-kit.json';
    if (!exists(path)) {
        return new Set();
    }
    try {
        const skip = JSON.parse(read(path)).skip ?? [];

        return new Set(skip.map((resource) => resource.match(/^patterns\/(.+)\.md$/)?.[1]).filter(Boolean));
    } catch {
        return new Set();
    }
};

/**
 * Раздел «Паттерны» самого правила — единственное место, где связь видна без файла паттерна:
 * пропущенного файла в дереве нет, и поле `rule:` в нём спросить не у кого.
 */
// Флага `m` здесь нет намеренно: с ним `$` означает конец строки, и раздел кончается на первом
// же переводе строки — пустым. Начало заголовка поэтому ищется своей парой, а не якорем.
const PATTERNS_HEADING = /(?:^|\n)## Паттерны\n([\s\S]*?)(?=\n## |$)/;
const patternsNamedBy = (text) => [...(text.match(PATTERNS_HEADING)?.[1] ?? '').matchAll(/^-\s+`([\w-]+)`/gm)].map(([, found]) => found);

const skipped = skippedPatterns();

for (const file of walk('.claude/skills', (name) => name === 'SKILL.md')) {
    const text = read(file);
    const head = frontMatterOf(text);
    const name = nameOf(head);
    if (!/^kind:\s*rule\s*$/m.test(head) || !name || patterned.has(name)) {
        continue;
    }

    const named = patternsNamedBy(text);
    if (named.length > 0 && named.every((pattern) => skipped.has(pattern))) {
        continue;
    }

    report(file, 'у правила нет ни одного паттерна — заведи скил с `rule:` на него');
}

checkTracedAnchors();

for (const scenario of scenarios) {
    const seen = byId.get(scenario.id);
    if (seen) {
        report(`${scenario.file}:${scenario.line}`, `идентификатор ${scenario.id} уже занят (${seen.file}:${seen.line})`);
        continue;
    }
    byId.set(scenario.id, scenario);
}

const references = collectReferences();
const uncovered = [];
const partial = [];
let covered = 0;

for (const scenario of byId.values()) {
    const places = references.get(scenario.id) ?? [];
    const hasTest = places.length > 0;
    if (scenario.uncovered && hasTest) {
        report(`${scenario.file}:${scenario.line}`, `${scenario.id} помечен «Не покрыто», но тест на него есть (${places[0].place})`);
        continue;
    }
    if (scenario.uncovered) {
        uncovered.push(scenario);
        continue;
    }
    if (!hasTest) {
        report(`${scenario.file}:${scenario.line}`, `${scenario.id} не упомянут ни в одном тесте и не помечен «Не покрыто»`);
        continue;
    }
    if (scenario.partial) {
        partial.push(scenario);
        continue;
    }
    // Обещание, данное пользователю, закрывается тестом, идущим его путём. Юнит проверяет
    // тот же расчёт мимо экрана: он верен и покрытием сценария не является
    if (promisesScreen(scenario.promise) && !places.some(({ screen, off }) => screen && !off)) {
        const off = places.some(({ screen }) => screen);
        report(
            `${scenario.file}:${scenario.line}`,
            `${scenario.id} обещает то, что человек видит, а ${off ? 'сквозной тест на него выключен переменной окружения' : 'проверяет его только юнит'} ` +
                `(${places[0].place}) — либо тест идёт путём пользователя, либо сценарию нужна отметка «Покрытие: частичное»`
        );
        continue;
    }
    covered += 1;
}

for (const [id, places] of references) {
    if (!byId.has(id)) {
        report(places[0].place, `тест ссылается на ${id}, а такого сценария в \`${SPECS_DIR}\` нет`);
    }
}

if (problems.length > 0) {
    console.error(`check-specs: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    console.error('\nПравила работы со спеками — скил `spec-driven`.');
    process.exit(1);
}

console.log(
    `check-specs: доменов ${domains.length}, сценариев ${byId.size} — ` +
        `покрыто ${covered}, частично ${partial.length}, без тестов ${uncovered.length}`
);

const debts = [...partial, ...uncovered];
if (debts.length > 0) {
    console.log('\nДолги — покрытие неполное:');
    partial.forEach((scenario) => console.log(`  частично  ${scenario.id} — ${scenario.title} (${scenario.file}:${scenario.line})`));
    uncovered.forEach((scenario) => console.log(`  нет теста ${scenario.id} — ${scenario.title} (${scenario.file}:${scenario.line})`));
}

/**
 * Договорённость, по которой код уже написан, вливается в спек домена, а её директория
 * удаляется. Оставленная в главной ветке, она читается как предложенное и не выкаченное —
 * то есть как ложь о работающем месяц приложении.
 *
 * Признак — все сценарии директории покрыты тестами: пока хоть один помечен «Не покрыто»,
 * фича не дописана. Падением это не делается: на середине работы часть тестов уже есть, и
 * такая проверка краснела бы всю дорогу.
 */
const proposed = new Map();
for (const scenario of byId.values()) {
    const at = scenario.file.indexOf('/proposed/');
    if (at === -1) {
        continue;
    }
    const dir = scenario.file.slice(0, scenario.file.indexOf('/', at + '/proposed/'.length));
    const group = proposed.get(dir) ?? { total: 0, ready: 0 };
    group.total += 1;
    if (references.has(scenario.id) && !scenario.uncovered && !scenario.partial) {
        group.ready += 1;
    }
    proposed.set(dir, group);
}

const ripe = [...proposed].filter(([, group]) => group.total > 0 && group.total === group.ready);
if (ripe.length > 0) {
    console.log('\nПора вливать — сценарии закрыты тестами, договорённость ждёт переезда в спек домена:');
    ripe.forEach(([dir, group]) => console.log(`  ${dir} — сценариев ${group.total}`));
}

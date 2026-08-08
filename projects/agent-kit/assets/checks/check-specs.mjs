#!/usr/bin/env node
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
 * Ненулевой код возврата и перечень расхождений.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const SPECS_DIR = CONFIG.specsDir;
const CONSTITUTION_DIR = 'docs/constitution';
/**
 * Каталоги под `docs/specs`, доменами не являющиеся: шаблон содержит образцы с
 * плейсхолдерами, и обязательных разделов у них нет.
 */
const NOT_DOMAINS = ['_template'];
const TEST_ROOTS = ['apps', 'libs'];
/** Где ищется вызов символа из привязки. */
const SOURCE_ROOTS = [...CONFIG.sourceRoots, ...(CONFIG.schemaFile ? [CONFIG.schemaFile.split('/')[0]] : [])];
const SKIPPED_DIRS = CONFIG.skippedDirs;

/** `### SC-BK-03 — заявка на занятые даты` */
const SCENARIO_HEADING = /^###\s+(SC-([A-Z]{2,4})-(\d{2,3}))\s+—\s+(.+?)\s*$/;
/** Отметка осознанно непокрытого сценария; причина обязательна */
const UNCOVERED = /^Не покрыто:\s*\S/;
/** Тест есть, но проверяет не всё обещанное или идёт другим путём */
const PARTIAL = /^Покрытие:\s*частичное\s*—\s*\S/;
/** Упоминание сценария в заголовке теста */
const SCENARIO_REFERENCE = /\bSC-[A-Z]{2,4}-\d{2,3}\b/g;
/** Строка обещания сценария; её продолжения идут с отступом */
const PROMISE = /^Тогда\s+\S/;
/**
 * Человек перед экраном и его восприятие. Границы слова не ставятся: `\b` в JavaScript
 * считает буквой только латиницу, и `\bгость\b` не совпал бы ни разу.
 */
const ACTOR = /(гост[ьяию]|владел(?:ец|ьца|ьцу|ьцем)|сотрудник\w*|оператор\w*|пользовател\w+)/i;
const PERCEIVES = /(вид(?:ит|ят|но)|чита(?:ет|ют)|смотр(?:ит|ят))/i;
/** Сквозные тесты: только они идут тем же путём, что пользователь */
const E2E_ROOTS = CONFIG.e2eRoots;

/**
 * Якорь правила: `путь/к/файлу.ts:символ` в обратных кавычках. Расширение до восьми
 * букв — иначе `schema.prisma` не считается путём, и правило про умолчание колонки
 * выглядит как правило без якоря. Заглавные и десять букв нужны ради `api.Dockerfile`:
 * без них правило про режим исполнения образа считалось правилом с пустой привязкой,
 * а привязать его больше не к чему — режим объявлен ровно там.
 */
const ANCHOR = /`([\w./-]+\.[A-Za-z]{2,10}):([A-Za-z_][\w-]*)`/g;
/** Строка шапки, объявляющая либы, чьи процедуры домен обслуживает */
const PROCEDURE_ROOTS = /^\*\*Процедуры:\*\*\s*(.+)$/;
const BACKTICKED = /`([^`]+)`/g;

const REQUIRED_HEADINGS = [
    '## Зачем',
    '## Терминология',
    '### Как это называется в интерфейсе',
    '## Правила',
    '## Что не входит',
    '## Контракт',
    '### Коды отказов',
    '## Данные',
    '## Экраны и состояния',
    '## Сквозные требования',
    '### Локали',
    '### SEO',
    '### Мобильная раскладка',
    '### Мультиобъектность',
    '## Решения',
    '## Открытые вопросы',
    '## История изменений',
];

const problems = [];
const report = (where, message) => problems.push(`${where}: ${message}`);

function walk(dir, accept) {
    const found = [];
    let entries;
    try {
        entries = readdirSync(join(ROOT, dir), { withFileTypes: true });
    } catch {
        return found;
    }

    for (const entry of entries) {
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            if (!SKIPPED_DIRS.includes(entry.name)) {
                found.push(...walk(path, accept));
            }
        } else if (accept(entry.name)) {
            found.push(path);
        }
    }

    return found;
}

const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const exists = (path) => existsSync(join(ROOT, path));

/** Директории доменов: `docs/specs/<домен>`, кроме шаблона. */
function collectDomains() {
    try {
        return readdirSync(join(ROOT, SPECS_DIR), { withFileTypes: true })
            .filter((entry) => entry.isDirectory() && !NOT_DOMAINS.includes(entry.name))
            .map((entry) => entry.name);
    } catch {
        return [];
    }
}

/**
 * Строки раздела: от его заголовка до следующего заголовка того же или более
 * высокого уровня. Подразделы в раздел входят — «Коды отказов» разбираются
 * отдельно, но остаются частью «Контракта».
 */
function sectionOf(text, heading) {
    const level = heading.match(/^#+/)[0].length;
    const lines = text.split('\n');
    const start = lines.findIndex((line) => line.trimEnd() === heading);
    if (start < 0) {
        return [];
    }
    const rest = lines.slice(start + 1);
    const end = rest.findIndex((line) => {
        const marks = line.match(/^(#+)\s/);

        return marks && marks[1].length <= level;
    });

    return end < 0 ? rest : rest.slice(0, end);
}

/** Пункты списка верхнего уровня вместе с их продолжениями. */
function bulletsOf(lines) {
    const bullets = [];
    for (const [index, line] of lines.entries()) {
        if (/^-\s+\S/.test(line)) {
            bullets.push({ line: index, text: line });
        } else if (bullets.length && /^\s+\S/.test(line)) {
            bullets[bullets.length - 1].text += ` ${line.trim()}`;
        } else if (!line.trim()) {
            continue;
        } else if (/^[#|]/.test(line)) {
            // таблица или заголовок — список кончился
            break;
        }
    }

    return bullets;
}

// ── 1. Якоря правил ────────────────────────────────────────────────────────────

const escapeForRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');

/** Символ ищется как слово: подстрока дала бы ложное совпадение на префиксе. */
function fileHasSymbol(path, symbol) {
    return new RegExp(`\\b${escapeForRegExp(symbol)}\\b`).test(read(path));
}

/**
 * Привязки, у которых остаётся выяснить, зовёт ли символ хоть кто-нибудь. Копятся
 * в один список и разбираются одним проходом по исходникам: обходить `apps` и
 * `libs` на каждую из пятисот привязок было бы полтысячи обходов.
 */
const traced = [];

/** Жирное начало пункта — ключ, по которому правило находит свою строку привязки. */
function ruleHeadOf(bulletText) {
    const bold = bulletText.match(/\*\*(.+?)\*\*/s);

    return bold ? bold[1].replace(/\s+/g, ' ').trim() : null;
}

/**
 * Правила живут в `spec.md`, привязка к коду — в `implementation.md` рядом. Разделены
 * потому, что спек описывает продукт и читается без знания устройства, а привязка
 * устаревает при каждом переименовании.
 *
 * Ключ связи — сам текст правила, а не отдельный идентификатор: тогда правку формулировки
 * невозможно сделать, забыв про привязку, — строка перестанет находиться.
 *
 * Заголовок раздела приходит доводом: у спека это `## Правила`, у закона — `## Статьи`.
 * Одно слово в двух смыслах развели именно здесь: «правило» — слой между законом и скилом,
 * а внутри закона живут статьи.
 */
function checkRuleImplementation(specFile, text, mapFile, heading = '## Правила') {
    const bullets = bulletsOf(sectionOf(text, heading));
    if (!bullets.length) {
        report(specFile, `в разделе \`${heading}\` нет ни одного пункта`);

        return;
    }

    if (!exists(mapFile)) {
        report(specFile, `нет файла \`${mapFile.split('/').pop()}\` рядом — правилам не к чему привязаться`);

        return;
    }

    const rows = new Map();
    for (const line of read(mapFile).split('\n')) {
        const cells = line.match(/^\|([^|]+)\|([^|]*)\|\s*$/);
        if (!cells) {
            continue;
        }
        const head = cells[1].replace(/\s+/g, ' ').trim();
        // Шапка таблицы: у спека колонка называется «Правило», у закона — «Статья».
        if (!head || head === 'Правило' || head === 'Статья' || /^-+$/.test(head)) {
            continue;
        }
        rows.set(head, { anchors: [...cells[2].matchAll(ANCHOR)], used: false });
    }

    for (const bullet of bullets) {
        const head = ruleHeadOf(bullet.text);
        if (!head) {
            report(specFile, `правило без жирного начала: «${bullet.text.replace(/^-\s+/, '').slice(0, 60)}…»`);
            continue;
        }
        const row = rows.get(head);
        if (!row) {
            report(
                mapFile,
                `правило без привязки: «${head.slice(0, 60)}…» — допиши строку с \`файл:символ\`, ` +
                    'либо перенеси правило в «Открытые вопросы» как Q-N'
            );
            continue;
        }
        row.used = true;
        if (!row.anchors.length) {
            report(mapFile, `у правила «${head.slice(0, 60)}…» пустая привязка`);
        }
        for (const [, path, symbol] of row.anchors) {
            if (!exists(path)) {
                report(mapFile, `привязка ведёт в никуда: нет файла \`${path}\``);
            } else if (!fileHasSymbol(path, symbol)) {
                report(mapFile, `привязка не сходится: в \`${path}\` нет \`${symbol}\``);
            } else {
                traced.push({ mapFile, path, symbol });
            }
        }
    }

    // Обратная сторона: строка, под которой правила больше нет, — след переименования.
    // Без неё привязка копится и начинает описывать несуществующие обещания
    for (const [head, row] of rows) {
        if (!row.used) {
            report(mapFile, `привязка без пункта: «${head.slice(0, 60)}…» — в \`${specFile}\` такого пункта нет`);
        }
    }
}

// ── 5. Мёртвые привязки ───────────────────────────────────────────────────────

/**
 * Код без комментариев. Упоминание символа в пояснении вызовом не является, а
 * пояснений у мёртвого кода как раз обычно больше, чем у живого.
 */
const codeOf = (text) => text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:`'"])\/\/.*$/gm, '$1');

const DECLARATION_MODIFIERS = '(?:export|declare|abstract|public|private|protected|static|readonly|override|async|accessor)';

/**
 * Объявлен ли символ здесь. Проверка идёт только по объявлениям: привязка к
 * чужому полю (`HttpStatus.SERVICE_UNAVAILABLE`), ключу словаря или содержимому
 * строки законна и встречается ровно один раз по своей природе.
 */
function fileDeclaresSymbol(code, symbol) {
    const escaped = escapeForRegExp(symbol);

    return (
        new RegExp(`\\b(?:const|let|var|function|class|interface|type|enum)\\s+${escaped}\\b`).test(code) ||
        new RegExp(`^\\s*(?:${DECLARATION_MODIFIERS}\\s+)*#?${escaped}\\s*[(<:=]`, 'm').test(code)
    );
}

/**
 * Файлы, в которых встречается каждый символ. Дефис берётся в токен целиком ради
 * атрибутов разметки, а части такого токена добавляются отдельно: иначе
 * `resolving` внутри `data-resolving` перестал бы находиться.
 */
function symbolOwners() {
    const owners = new Map();
    const remember = (token, file) => {
        let files = owners.get(token);
        if (!files) {
            files = new Set();
            owners.set(token, files);
        }
        files.add(file);
    };

    for (const file of SOURCE_ROOTS.flatMap((root) => walk(root, (name) => name.endsWith('.ts') || name.endsWith('.html')))) {
        const text = file.endsWith('.ts') ? codeOf(read(file)) : read(file);
        for (const [token] of text.matchAll(/[A-Za-z_][\w-]*/g)) {
            remember(token, file);
            if (token.includes('-')) {
                token.split('-').forEach((part) => part && remember(part, file));
            }
        }
    }

    return owners;
}

/**
 * Символ, объявленный в своём файле и больше нигде не встречающийся, ничего не
 * исполняет: правило, привязанное к нему, описывает намерение.
 */
function checkTracedAnchors() {
    const code = new Map();
    const codeAt = (path) => {
        if (!code.has(path)) {
            code.set(path, codeOf(read(path)));
        }

        return code.get(path);
    };

    const declared = traced.filter(({ path, symbol }) => path.endsWith('.ts') && fileDeclaresSymbol(codeAt(path), symbol));
    if (!declared.length) {
        return;
    }

    const owners = symbolOwners();
    for (const { mapFile, path, symbol } of declared) {
        const here = (codeAt(path).match(new RegExp(`\\b${escapeForRegExp(symbol)}\\b`, 'g')) || []).length;
        const elsewhere = [...(owners.get(symbol) || [])].filter((file) => file !== path).length;
        if (here + elsewhere < 2) {
            report(
                mapFile,
                `привязка ведёт в мёртвый код: \`${symbol}\` объявлен в \`${path}\` и больше нигде не встречается — ` +
                    'либо правило исполняется в другом месте, либо ему место в «Открытых вопросах» как Q-N'
            );
        }
    }
}

// ── 1a. Законы, которые применяет спек ────────────────────────────────────────

/**
 * Связь «закон — правило» и «правило — паттерн» сверяется в обе стороны, а спек до сих пор
 * говорил только о домене. Закон при этом он применял: ссылки на `docs/constitution/…`
 * лежали внутри строки зависимостей и посреди текста, и по закону нельзя было узнать, какие
 * домены на нём стоят, — только грепом.
 *
 * Отсюда строка `**Законы:**` в шапке и сверка обеих сторон: закон, названный в тексте, но не
 * объявленный, и объявленный закон, которого нет.
 */
const SPEC_LAWS = /^\*\*Законы:\*\*\s*(.+)$/;
/**
 * Ссылка на закон где угодно в тексте спека — по ней считается вторая сторона связи. Слой в
 * пути необязателен: законы приложения лежат в `application/`, а называются так же.
 */
const LAW_REFERENCE = new RegExp(`\`${CONSTITUTION_DIR}/(?:application/)?([a-z-]+)\\.md\``, 'g');

function checkSpecLaws(file, text, laws) {
    const line = text.split('\n').find((candidate) => SPEC_LAWS.test(candidate));
    if (!line) {
        report(file, 'в шапке нет строки `**Законы:**` — не видно, какие законы домен применяет');

        return;
    }

    const declared = new Set([...line.match(SPEC_LAWS)[1].matchAll(BACKTICKED)].map(([, name]) => name));
    for (const name of declared) {
        if (!laws.has(name)) {
            report(file, `в строке \`**Законы:**\` назван \`${name}\`, а закона с таким именем нет ни в одном слое`);
        }
    }

    for (const [, name] of text.matchAll(LAW_REFERENCE)) {
        if (!declared.has(name)) {
            report(file, `закон \`${name}\` назван в тексте, но не объявлен в строке \`**Законы:**\``);
        }
    }
}

// ── 2. Контракт против декораторов ────────────────────────────────────────────

/** Корни либ, чьи процедуры домен обслуживает; объявлены в шапке спека. */
function procedureRootsOf(text) {
    const line = text.split('\n').find((candidate) => PROCEDURE_ROOTS.test(candidate));
    if (!line) {
        return null;
    }
    const value = line.match(PROCEDURE_ROOTS)[1];
    if (/^\s*нет\s*$/i.test(value.replace(/[`.]/g, ''))) {
        return [];
    }

    return [...value.matchAll(BACKTICKED)].map(([, path]) => path);
}

/** Что объявлено в самих процедурах: метод контракта и право на него. */
function declaredProcedures(roots) {
    const found = new Map();
    for (const root of roots) {
        for (const file of walk(root, (name) => name.endsWith('.procedure.ts'))) {
            const text = read(file);
            const method = text.match(/\.method\.([A-Za-z_]\w*)/);
            if (!method) {
                continue;
            }
            const service = text.match(/typeof\s+(\w+)\.method\./);
            const required = text.match(/@RequiresPermission\(\s*'([^']+)'/);
            const isPublic = /@PublicProcedure\(/.test(text);
            found.set(method[1].toLowerCase(), {
                file,
                method: method[1],
                service: service ? service[1] : '',
                permission: required ? required[1] : isPublic ? 'публично' : '',
            });
        }
    }

    return found;
}

/** Строки таблицы «Контракта»: первая ячейка — процедура, вторая — право. */
function contractRows(text) {
    const rows = [];
    for (const [index, line] of sectionOf(text, '## Контракт').entries()) {
        if (!line.startsWith('|') || /^\|[\s:|-]+\|$/.test(line)) {
            continue;
        }
        const cells = line
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim());
        if (cells.length < 2) {
            continue;
        }
        const name = (cells[0].match(/`([^`]+)`/) || [])[1];
        if (!name) {
            continue;
        }
        const permission = (cells[1].match(/`([^`]+)`/) || [])[1] || cells[1];
        rows.push({ line: index, name, permission: permission.trim(), short: name.split('.').pop() });
    }

    return rows;
}

function checkContract(file, text, roots) {
    if (roots === null) {
        report(file, 'в шапке нет строки `**Процедуры:**` — нечем сверить таблицу «Контракта» с декораторами');

        return;
    }
    const declared = declaredProcedures(roots);
    const rows = contractRows(text);
    const described = new Set();

    for (const row of rows) {
        const found = declared.get(row.short.toLowerCase());
        if (!found) {
            report(file, `в «Контракте» есть \`${row.name}\`, но процедуры с таким методом в ${roots.join(', ')} нет`);
            continue;
        }
        described.add(row.short.toLowerCase());
        if (found.permission && row.permission !== found.permission) {
            report(
                file,
                `право у \`${row.name}\` разошлось: в спеке «${row.permission}», ` + `в \`${found.file}\` объявлено «${found.permission}»`
            );
        }
    }

    for (const [key, found] of declared) {
        if (!described.has(key)) {
            report(
                file,
                `процедура \`${found.service}.${found.method}\` (${found.file}) домену принадлежит, ` + 'но в таблице «Контракта» её нет'
            );
        }
    }
}

// ── 3. Коды отказов ───────────────────────────────────────────────────────────

function checkRefusalCodes(file, text, roots) {
    const section = sectionOf(text, '### Коды отказов');
    const bullets = bulletsOf(section);
    /**
     * «Не применимо» — законный ответ и здесь. Домен, у которого есть процедуры,
     * но нет ни одного `Code.X`, иначе не описывался вовсе: пустой раздел
     * проверка отвергает, а любой выписанный код отвергает тем более — бросать
     * его в домене некому. Так живёт проверка живости: отказ она подаёт кодом
     * ответа, а не отказом процедуры.
     */
    // Без `\b`: кириллица не входит в `\w`, и границы слова после «применимо» не возникает
    const notApplicable = section.some((line) => /^Не применимо/.test(line.trim()));
    if (!bullets.length) {
        if (!notApplicable) {
            report(file, 'в разделе `### Коды отказов` нет ни одного кода и нет ответа «Не применимо»');
        }

        return;
    }
    if (!roots || !roots.length) {
        return;
    }
    const sources = roots.flatMap((root) => walk(root, (name) => name.endsWith('.ts') && !name.endsWith('.spec.ts')));
    const thrown = new Set();
    for (const source of sources) {
        for (const [, code] of read(source).matchAll(/\bCode\.([A-Za-z]\w*)/g)) {
            thrown.add(code);
        }
    }

    for (const bullet of bullets) {
        const code = (bullet.text.match(/`([A-Za-z]\w*)`/) || [])[1];
        if (!code) {
            report(file, `в «Кодах отказов» строка без кода в кавычках: «${bullet.text.slice(0, 60)}…»`);
            continue;
        }
        if (!thrown.has(code)) {
            report(file, `код отказа \`${code}\` в домене нигде не бросается — либо он не отсюда, либо путь его не даёт`);
        }
    }
}

// ── 4. Сценарии и уровень привязки ────────────────────────────────────────────

function parseScenarios(file) {
    const lines = read(file).split('\n');
    const scenarios = [];
    let current = null;
    let inPromise = false;

    lines.forEach((line, index) => {
        const heading = SCENARIO_HEADING.exec(line);
        if (heading) {
            current = {
                id: heading[1],
                prefix: heading[2],
                title: heading[4],
                file,
                line: index + 1,
                uncovered: false,
                partial: false,
                promise: '',
            };
            inPromise = false;
            scenarios.push(current);

            return;
        }
        if (/^#{1,6}\s/.test(line)) {
            current = null;

            return;
        }
        if (!current) {
            return;
        }
        if (UNCOVERED.test(line)) {
            current.uncovered = true;
        }
        if (PARTIAL.test(line)) {
            current.partial = true;
        }
        // «Тогда» и его продолжения с отступом — то, что сценарий обещает
        if (PROMISE.test(line)) {
            inPromise = true;
            current.promise += ` ${line.trim()}`;

            return;
        }
        if (inPromise && /^\s+\S/.test(line)) {
            current.promise += ` ${line.trim()}`;

            return;
        }
        inPromise = false;
    });

    return scenarios;
}

/**
 * Обещан ли сценарием экран. Признак читается только из «Тогда»: «Дано» описывает
 * обстановку, «Когда» — повод, а обещание пользователю стоит именно здесь.
 *
 * Человек и глагол восприятия требуются вместе, потому что порознь оба ошибаются.
 * «Показывается» без человека стоит и там, где показывается запись в базе, а человек без
 * восприятия — в каждом втором сценарии приёма заявки. Признак нарочно молчалив: сценарий,
 * чьё «Тогда» человека не называет, под него не подпадает вовсе.
 */
function promisesScreen(promise) {
    return ACTOR.test(promise) && PERCEIVES.test(promise);
}

/**
 * Константы, собранные из окружения, вместе с теми, что собраны из них. Ими выключают
 * сквозной тест целиком: без `BASE_URL` или пары входа он не исполняется ни разу.
 * Цепочка раскрывается, пока есть что раскрывать: `HAS_ADMIN_SESSION` собран из двух
 * других констант, а не из `process.env` напрямую.
 */
function environmentSwitches(root) {
    // Объявление верхнего уровня: с отступом стоят локальные, и они гасят не тест, а случай
    const declaration = /^const\s+([A-Za-z_]\w*)\s*(?::[^=]+)?=\s*([^;]+);/gm;
    const assignments = [];
    for (const file of walk(root, (name) => name.endsWith('.ts'))) {
        for (const [, name, value] of read(file).matchAll(declaration)) {
            assignments.push({ name, value });
        }
    }

    const switches = new Set();
    for (let pass = 0; pass <= assignments.length; pass += 1) {
        const before = switches.size;
        for (const { name, value } of assignments) {
            if (value.includes('process.env') || [...switches].some((known) => new RegExp(`\\b${known}\\b`).test(value))) {
                switches.add(name);
            }
        }
        if (switches.size === before) {
            break;
        }
    }

    return switches;
}

/**
 * Упоминания сценария в тестах: где стоит, идёт ли тест путём пользователя и не выключен ли
 * он переменной окружения.
 *
 * Выключатель по состоянию стенда («у объекта меньше двух помещений») — это пропуск случая,
 * и покрытие он не отменяет. Выключатель по переменной отменяет: тест с ним в обычном
 * прогоне значится пропущенным, а сводка без этого читала бы его покрытием.
 */
function collectReferences() {
    const references = new Map();
    const remember = (id, place) => {
        if (!references.has(id)) {
            references.set(id, []);
        }
        references.get(id).push(place);
    };
    const switchesByRoot = new Map();

    for (const root of TEST_ROOTS) {
        for (const file of walk(root, (name) => name.endsWith('.spec.ts'))) {
            const e2eRoot = E2E_ROOTS.find((dir) => file.startsWith(`${dir}/`));
            if (e2eRoot && !switchesByRoot.has(e2eRoot)) {
                switchesByRoot.set(e2eRoot, environmentSwitches(e2eRoot));
            }
            const switches = switchesByRoot.get(e2eRoot) ?? new Set();
            const switched = (line) =>
                [...line.matchAll(/test\.skip\(([^,]*)/g)].some(
                    ([, condition]) =>
                        condition.includes('process.env') || [...switches].some((name) => new RegExp(`\\b${name}\\b`).test(condition))
                );

            const found = [];
            let test = null;
            let describeSwitched = false;

            read(file)
                .split('\n')
                .forEach((line, index) => {
                    if (/^\s*test\.describe[.(]/.test(line)) {
                        describeSwitched = false;
                        test = null;
                    } else if (/^\s*test\s*\(/.test(line)) {
                        test = { off: describeSwitched };
                    } else if (/test\.skip\(/.test(line)) {
                        if (test) {
                            test.off = test.off || switched(line);
                        } else {
                            describeSwitched = describeSwitched || switched(line);
                        }
                    }

                    for (const [id] of line.matchAll(SCENARIO_REFERENCE)) {
                        found.push({ id, test, place: `${file}:${index + 1}` });
                    }
                });

            // Выключатель стоит первой строкой тела, то есть ниже заголовка теста с
            // идентификатором: состояние теста читается, когда файл разобран целиком
            found.forEach(({ id, test: own, place }) => remember(id, { place, screen: Boolean(e2eRoot), off: Boolean(own?.off) }));
        }
    }

    return references;
}

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

for (const domain of domains) {
    const base = `${SPECS_DIR}/${domain}`;
    // Домен, у которого есть только `proposed/`, ещё не существует: спека о нём
    // нет, пока фича не выкачена
    const isProposedOnly = exists(`${base}/proposed`) && !exists(`${base}/spec.md`);
    if (!isProposedOnly) {
        ['spec.md', 'scenarios.md']
            .filter((name) => !exists(`${base}/${name}`))
            .forEach((name) => report(base, `нет файла \`${name}\` — домен описан наполовину`));
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
    const prefixes = new Set(found.map((scenario) => scenario.prefix));
    if (prefixes.size > 1) {
        report(base, `в домене больше одного префикса сценариев: ${[...prefixes].sort().join(', ')}`);
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
    checkRuleImplementation(file, text, `${dirname(file)}/implementation.md`, RULE_HEADING);

    const name = nameOf(head);
    if (name && name !== file.slice('.claude/skills/'.length, -'/SKILL.md'.length)) {
        report(file, `имя в шапке (\`${name}\`) не совпадает с каталогом скила`);
    }
}

// Обратные стороны связи. Закон без правила читается как договорённость, которую этот проект
// не применяет; правило без паттерна оставляет готовый код там, где ему не место, — в самом
// правиле, которое читается при каждой правке.
[...laws]
    .filter(([law]) => !ruled.has(law))
    .forEach(([, file]) => report(file, 'у закона нет ни одного правила — заведи скил с `law:` на него'));

for (const file of walk('.claude/skills', (name) => name === 'SKILL.md')) {
    const head = frontMatterOf(read(file));
    const name = nameOf(head);
    if (/^kind:\s*rule\s*$/m.test(head) && name && !patterned.has(name)) {
        report(file, 'у правила нет ни одного паттерна — заведи скил с `rule:` на него');
    }
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

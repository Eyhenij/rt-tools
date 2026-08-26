// rt-kit v0.14.0 · checks/spec-anchors.mjs · b0944143f47a · правится надстройкой, не здесь
/**
 * Привязка правила к коду и законы, которые применяет спек.
 *
 * Правило живёт в спеке, привязка — в компаньоне рядом; ключ связи — сам текст правила.
 * Здесь же разбирается мёртвая привязка: символ, объявленный в своём файле и больше нигде не
 * встречающийся, местом исполнения правила не считается.
 */
import {
    ANCHOR,
    BACKTICKED,
    CONSTITUTION_DIR,
    SOURCE_ROOTS,
    VERDICT,
    VERDICT_MIN,
    bulletsOf,
    exists,
    read,
    report,
    sectionOf,
    walk,
} from './spec-common.mjs';

// ── 1. Якоря правил ────────────────────────────────────────────────────────────

const escapeForRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');

/**
 * Символ ищется как слово: подстрока дала бы ложное совпадение на префиксе.
 *
 * Границы слова считаются буквой любого алфавита, а не `\b`: он в JavaScript знает буквой
 * только латиницу, и `\bСемья\b` не совпадает ни разу — привязка на русском слове читалась
 * как ведущая в файл, где этого слова нет, при том что слово стоит там первой же строкой.
 */
function fileHasSymbol(path, symbol) {
    // Дефис здесь не экранируется: вне класса символов он ничего не значит, а под флагом `u`
    // лишнее экранирование — уже отказ разбора. Общий экранировщик его защищает, потому что
    // рассчитан и на класс тоже, и `task-flow` роняло всю сверку целиком.
    const word = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<![\\p{L}\\p{N}_])${word}(?![\\p{L}\\p{N}_])`, 'u').test(read(path));
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
/**
 * Строки таблицы привязок компаньона.
 *
 * Компаньон правила держит три таблицы: чем вещи правила названы в этом дереве, где лежат
 * механизмы и где исполняется каждая статья. Привязки — только третья, и берётся она по имени
 * раздела, а не по месту в файле. Пока читался весь файл, строки первых двух попадали в список
 * наравне с настоящими и тут же объявлялись расхождением: статьи с таким текстом в правиле нет
 * и быть не может. Две трети перечня в дереве были ими, и правильно дописанная строка «Где это
 * лежит» отвечала отказом.
 *
 * У компаньона спека домена раздела нет: там таблица одна, и сужать нечего — такой зовёт без
 * имени раздела. У правила раздел стоит в образце компаньона, поэтому его отсутствие — отказ:
 * молча прочесть вместо него весь файл значило бы вернуть тот же дефект.
 */
function rowsOfMap(specFile, mapFile, mapHeading) {
    const text = read(mapFile);
    if (!mapHeading) {
        return text.split('\n');
    }
    const section = sectionOf(text, mapHeading);
    if (!section.length) {
        report(mapFile, `нет раздела \`${mapHeading}\` — привязкам правила негде лежать`);
    }

    return section;
}

function checkRuleImplementation(specFile, text, mapFile, heading = '## Правила', mapHeading = '') {
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
    for (const line of rowsOfMap(specFile, mapFile, mapHeading)) {
        // Привязка записывается двумя формами, и читаются обе. Таблица — прежняя; список — та,
        // ради которой из компаньонов уходят пробелы выравнивания: форматтер добивает столбцы до
        // общей ширины, и в компаньонах дерева это 120 017 знаков из 328 738, то есть 37%.
        // Связь при этом не меняется: она идёт по тексту утверждения, а не по форме строки.
        const cells = line.match(/^\|([^|]+)\|([^|]*)\|\s*$/) ?? line.match(/^-\s+\*\*(.+?)\*\*\s+—\s+(.*)$/);
        if (!cells) {
            continue;
        }
        const head = cells[1].replace(/\s+/g, ' ').trim();
        // Шапка таблицы: у спека колонка называется «Правило», у закона — «Статья».
        if (!head || head === 'Правило' || head === 'Статья' || /^-+$/.test(head)) {
            continue;
        }
        const cell = cells[2].trim();
        rows.set(head, {
            anchors: [...cells[2].matchAll(ANCHOR)],
            verdict: VERDICT.test(cell) && cell.length >= VERDICT_MIN,
            used: false,
        });
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
                    'вердиктом «Не исполняется» с причиной либо перенеси правило в «Открытые вопросы» как Q-N'
            );
            continue;
        }
        row.used = true;
        if (!row.anchors.length && !row.verdict) {
            report(
                mapFile,
                `у правила «${head.slice(0, 60)}…» пустая привязка — поставь \`файл:символ\` ` +
                    'либо вердикт «Не исполняется», «Не применимо», «Не проверяется» с причиной'
            );
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
        // Решётка входит в токен: приватное поле класса объявлено с ней, и якорь на него иначе
        // не попадал бы в перечень владельцев ни разу. Имя без решётки помнится наравне с ним
        // самим — привязки прежней формы остаются зелёными, и переходить разом не приходится.
        for (const [token] of text.matchAll(/#?[A-Za-z_][\w-]*/g)) {
            remember(token, file);
            if (token.startsWith('#')) {
                remember(token.slice(1), file);
            }
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
        // Граница слова ставится только там, где она есть: перед решёткой её нет, и образец с
        // ней давал бы ноль вхождений у всякого приватного имени.
        const bound = symbol.startsWith('#')
            ? `${escapeForRegExp(symbol)}\\b`
            : `\\b${escapeForRegExp(symbol)}\\b`;
        const here = (codeAt(path).match(new RegExp(bound, 'g')) || []).length;
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

export { checkRuleImplementation, checkSpecLaws, checkTracedAnchors };

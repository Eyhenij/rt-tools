// rt-kit v0.39.1 · checks/flow-decision.mjs · 50360b389e77 · правится надстройкой, не здесь
/**
 * The section «Decision» of a plan: what the plan says about the code before the code. The reading
 * and the judgement take a text alone — no file and no repository.
 *
 * Judged are a row, a place, a number and a suite; the quality is read by the roles. A change that adds
 * no symbol writes one line instead of the table: «No decision: <reason>».
 */
import { namedOf } from './coupling-plan.mjs';

const HEADING = /^##\s+(?:Решение|Decision)\s*$/iu;
const NONE = /^\s*(?:Решения нет|No decision)(?:\s*[:—–-]\s*(.*))?$/iu;
const SYMBOL = /`([^`\s:]+\.\w+|(?:[^`\s:]*\/)?[A-Z]\w*file):((?:--|[#.$\p{L}_])[\p{L}\p{N}_$.#-]*)(?:[<(][^`]*)?`/gu;
const DROPPED = /(?<!\p{L})(?:отброшен[оы]|dropped)(?!\p{L})/iu;
const REMOVED = /(?<!\p{L})(?:удаля(?:ет|ют)ся|(?:is|are) removed)(?!\p{L})/iu;
const MOVED = /(?<!\p{L})(?:переезжа(?:ет|ют) в|moves? to)(?!\p{L})/iu;
const LIMIT = /`([^`\s]+)`[^`;]*?(?<!\p{L})(до|плюс|up to|plus)\s+(\d+)/giu;
const NEW_FILES = /(?:новых файлов кода|new code files):\s*(\d+)/iu;
const NEW_DEPENDENCIES = /(?:новых зависимостей|new dependencies):\s*(\d+)/iu;
const SCENARIO = /\bSC-[A-Z]{2,4}-\d+\b/g;

const isBlank = (text) => /^<[^<>]+>$/.test(text.trim());
const isReason = (text) => !isBlank(text) && (text.match(/\p{L}{2,}/gu) ?? []).length >= 2;
/** Whether the cell opens with the words «there is none» and gives the reason. */
const isAbsent = (text, words) => isReason(new RegExp(`^(?:${words})\\s*[:—–-]\\s*(.*)$`, 'iu').exec(text)?.[1] ?? '');
/** A suite by its folder or by the last part of its name: `check-specs.mjs` and `test-setup.ts` are none. */
const isSuite = (path) => /(?:^|\/)(?:tests?|__tests__|[\w-]*e2e)\/.*\.(?!mdx?$)\w+$|[._](?:test|spec|e2e)\.\w+$|[a-z](?:Tests?|Spec)\.\w+$/.test(path);
const sentencesOf = (text) => text.split(/(?<=[.!?])\s+(?=[\p{Lu}`«])/u);

/**
 * The symbols of a text: the path, the name and the fate — `dropped` after the word to the end of its
 * sentence, `removed` and `moved` within their part between semicolons, otherwise an empty string.
 */
function symbolsOf(text) {
    return sentencesOf(text).flatMap((sentence) => {
        const cut = sentence.search(DROPPED);
        const [before, after] = cut < 0 ? [sentence, ''] : [sentence.slice(0, cut), sentence.slice(cut)];
        const places = (part, fate) => [...part.matchAll(SYMBOL)].map(({ index, 1: path, 2: symbol }) => ({ path, symbol, fate: fate(index) }));
        const kept = before.split(';').flatMap((part) => {
            const [removed, moved] = [REMOVED.test(part), part.search(MOVED)];
            return places(part, (index) => (removed ? 'removed' : index < moved ? 'moved' : ''));
        });
        return [...kept, ...places(after, () => 'dropped')];
    });
}

/** A point has a dash after its name, opens a sentence or stands after «;» or «<br>» with a capital, and goes on to the next one or to «dropped». */
function patternsFault({ text }) {
    const absent = isAbsent(text, 'паттерн(?:а|ов) нет|no patterns?');
    const points = sentencesOf(absent ? text.replace(/^[^;.<]*/, '') : text).flatMap((sentence) =>
        sentence.split(DROPPED)[0].split(/;|<br\s*\/?>/iu).reduce((found, part, at) => {
            if (/\s[—–]\s/.test(part) && (at === 0 || /^\s*\p{Lu}/u.test(part))) return [...found, part.trim()];
            return found.length > 0 ? [...found.slice(0, -1), `${found.at(-1)};${part}`] : found;
        }, []));
    if (points.length === 0) return absent ? null : 'names no pattern: «<name> — `<path>:<symbol>`», or «паттерна нет: <reason>» («no pattern»)';
    const bare = points.find((point) => !symbolsOf(point).some(({ fate }) => fate === ''));
    return bare ? `names no place «\`<path>:<symbol>\`» for «${bare.split(/\s[—–]\s/)[0]}»` : null;
}

function inputFault({ text, scenarios, suites }) {
    if (isAbsent(text, 'ввода нет|no input')) return null;
    const numberless = isReason(/(?:номера нет|no number)\s*[:—–-]\s*([^;.]*)/iu.exec(text)?.[1] ?? '');
    const lacks = [scenarios.length > 0 || numberless ? '' : 'a scenario number', suites.length > 0 ? '' : 'a test suite in backticks'].filter(Boolean);
    return lacks.length > 0 ? `does not name ${lacks.join(' and ')}; a row without input says «ввода нет: <reason>» («no input»)` : null;
}

function budgetFault({ limits, newFiles, newDependencies }) {
    const lacks = [
        limits.length > 0 ? '' : 'a path with «до N» or «плюс N» («up to N», «plus N»)',
        newFiles !== null ? '' : '«новых файлов кода: N» («new code files: N»)',
        newDependencies !== null ? '' : '«новых зависимостей: N» («new dependencies: N»)',
    ].filter(Boolean);
    return lacks.length > 0 ? `does not name ${lacks.join(', ')}` : null;
}

/** The rows of the decision: the name in both languages and what the cell must hold past two words. */
const ROWS = [
    {
        label: '«Модули» (Modules)',
        name: /^(?:модул|module)/iu,
        fault: ({ symbols }) => (symbols.some(({ path, fate }) => fate !== 'dropped' && !isSuite(path)) ? null : 'names no place «`<path>:<symbol>`»'),
    },
    { label: '«Зависимости» (Dependencies)', name: /^(?:зависимост|dependenc)/iu },
    {
        label: '«Зацепление» (Coupling)',
        name: /^(?:зацеплен|coupling)/iu,
        fault: ({ text }) =>
            namedOf(text).size > 0 || isAbsent(text, 'кода нет|no code') ? null : 'names no number «`<path>` исходящие N → M» («outgoing»), nor «кода нет: <reason>» («no code»)',
    },
    { label: '«Паттерны» (Patterns)', name: /^(?:паттерн|pattern)/iu, fault: patternsFault },
    { label: '«Термины» (Terms)', name: /^(?:термин|term)/iu },
    { label: '«Данные» (Input)', name: /^(?:данны|input)/iu, fault: inputFault },
    { label: '«Границы» (Bounds)', name: /^(?:границ|bound)/iu },
    { label: '«Приоритет» (Priority)', name: /^(?:приоритет|priorit)/iu },
    { label: '«Бюджет» (Budget)', name: /^(?:бюджет|budget)/iu, fault: budgetFault },
];

/** The lines of a text outside its blocks of code. */
const plainLines = (text) => text.replace(/\r\n?/g, '\n').replace(/^[ \t]*(`{3,}|~{3,})[^`\n]*\n[^]*?^[ \t]*\1[`~]*[ \t]*$/gm, '').split('\n');

function rowOf(line) {
    const [name, ...cells] = line.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '').split(/(?<!\\)\|/);
    const text = cells.join('|').replaceAll('\\|', '|').trim();
    const tokens = [...text.matchAll(/`([^`\s]+)`/g)].map(([, token]) => token.replace(/:.*$/, ''));
    return {
        name: name.replace(/[*`]/g, '').trim(),
        text,
        symbols: symbolsOf(text),
        limits: [...text.matchAll(LIMIT)].map(([, path, word, lines]) => ({ path, grows: /плюс|plus/iu.test(word), lines: Number(lines) })),
        newFiles: NEW_FILES.test(text) ? Number(NEW_FILES.exec(text)[1]) : null,
        newDependencies: NEW_DEPENDENCIES.test(text) ? Number(NEW_DEPENDENCIES.exec(text)[1]) : null,
        suites: tokens.filter(isSuite),
        scenarios: text.match(SCENARIO) ?? [],
    };
}

/**
 * The decision of a plan: `state` — `absent`, `twice`, `none` for the one line instead of the table,
 * with its `reason`, and `table`; `rows` — the table as written and what each cell names.
 */
export function decisionRows(text) {
    const lines = plainLines(text);
    const heads = lines.flatMap((line, at) => (HEADING.test(line) ? [at] : []));
    if (heads.length !== 1) return { state: heads.length === 0 ? 'absent' : 'twice', reason: null, rows: [] };
    const rest = lines.slice(heads[0] + 1);
    const end = rest.findIndex((line) => /^##?\s/.test(line));
    const body = end < 0 ? rest : rest.slice(0, end);
    const isRule = (line) => /^\s*\|[\s|:-]+$/.test(line ?? '');
    const rows = body.filter((line, at) => /^\s*\|/.test(line) && !isRule(line) && !isRule(body[at + 1])).map(rowOf);
    const none = body.map((line) => NONE.exec(line)).find(Boolean);
    if (none && !rows.some(({ name }) => ROWS.some((row) => row.name.test(name)))) return { state: 'none', reason: (none[1] ?? '').trim(), rows: [] };
    return { state: 'table', reason: null, rows };
}

/** What the decision of a plan does not name, all of it; an empty list — it is complete. */
export function decisionProblems(text) {
    const { state, reason, rows } = decisionRows(text);
    const absent = state === 'absent' ? ['the section «Решение» («Decision») is not there'] : [];
    if (state === 'twice') return ['the section «Решение» («Decision») stands more than once'];
    if (state === 'none') return isReason(reason) ? [] : ['«Решения нет» («No decision») gives no reason in words'];
    const missing = ROWS.filter((row) => !rows.some(({ name }) => row.name.test(name))).map(({ label }) => label);
    const faults = rows.flatMap((row) => {
        const known = ROWS.find(({ name }) => name.test(row.name));
        if (!known) return [];
        const fault = !isReason(row.text) ? 'says nothing; a row that does not apply says why' : known.fault?.(row);
        return fault ? [`the row «${row.name}» ${fault}`] : [];
    });
    return [...absent, ...(missing.length > 0 ? [`no row ${missing.join(', ')}`] : []), ...faults];
}

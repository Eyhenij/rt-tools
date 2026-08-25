/**
 * Цена контекста: чем заход платит за слой правил.
 *
 * Проверка длины считает строки одного файла, сводка наблюдений — загрузки и отбития. Сколько
 * весит то, что заход получает целиком, не считает ничто, а окно кончается именно на этом.
 *
 * Считается не файл, а то, что заход получает: описание правила приходит ему полем, а не файлом
 * целиком, и словарь с картой хода — выводом хуков, а не своими исходниками. Вес файла назвал
 * бы не ту цену.
 *
 * Меряется в символах и байтах — тем, что считается на месте, без сети и без платы. Точный счёт
 * токенов живёт у модели и стоит денег; работа его не требует. Цена этого решения названа
 * прямо: число сравнимо только само с собой, и вопрос «дешевле ли та же мысль на другой
 * письменности» этим счётом не решается — в символах письменности равны.
 */
import { execFileSync } from 'node:child_process';
import { Dirent, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Чем считано. Стоит рядом с числами: снятое иначе с этим несравнимо. */
export const COUNTED_BY: string = 'символы и байты, счёт на месте';

/** Хуки старта захода, чей вывод заход получает целиком. */
const ENTRY_HOOKS: readonly string[] = ['glossary-load', 'turn-entry-load', 'constitution-index'];

export interface IWeighed {
    /** Что взвешено — строкой для человека. */
    readonly what: string;
    /** Сколько в этом символов. */
    readonly chars: number;
    /** Сколько в этом байтов: у кириллицы их вдвое больше, чем символов. */
    readonly bytes: number;
}

export interface ICost {
    /** Чем считано: без этого имени число несравнимо со снятым вчера. */
    readonly countedBy: string;
    /** Что заход получает до первой своей правки. */
    readonly entry: IWeighed;
    /** Одно правило вместе со спутником — столько стоит решение, которое его задело. */
    readonly rule: IWeighed;
    /** Все законы, правила и паттерны разом. Ни один заход столько не грузит; число про рост. */
    readonly layer: IWeighed;
}

/** Отказ, который команда печатает вместо чисел: сказано, чего нет. */
export class CostUnavailableError extends Error {
    constructor(reason: string) {
        super(`цену посчитать не на чем: ${reason}`);
        this.name = 'CostUnavailableError';
    }
}

/** Описание правила — единственное, что агент видит, решая, грузить его или нет. */
function descriptionOf(file: string): string {
    const text: string = readFileSync(file, 'utf8');
    const pattern: RegExp = /^description:[^\n]*(?:\n[ \t]+[^\n]*)*/m;
    const match: RegExpExecArray | null = pattern.exec(text);
    return match === null ? '' : match[0];
}

/** Каталог разложенных правил этого дерева. */
function skillsDir(root: string): string {
    return join(root, '.claude', 'skills');
}

/** Каталог законов этого дерева. */
function lawsDir(root: string): string {
    return join(root, 'docs', 'constitution');
}

/** Все файлы разметки под каталогом. Каталога нет — считать нечего, и это не отказ. */
function markdownUnder(dir: string): readonly string[] {
    const found: string[] = [];
    const walk: (current: string) => void = (current: string): void => {
        let entries: readonly Dirent[];
        try {
            entries = readdirSync(current, { withFileTypes: true });
        } catch {
            return;
        }
        for (const entry of entries) {
            const path: string = join(current, entry.name);
            if (entry.isDirectory()) {
                walk(path);
            } else if (entry.name.endsWith('.md')) {
                found.push(path);
            } else {
                continue;
            }
        }
    };
    walk(dir);
    return found;
}

/** Имена разложенных правил. Каталога нет — слой не разложен, и считать нечего. */
function ruleNames(root: string): readonly string[] {
    try {
        return readdirSync(skillsDir(root));
    } catch {
        throw new CostUnavailableError('слой правил в дереве не разложен');
    }
}

/** Вывод хука старта — ровно то, что он кладёт заходу. Молчащий хук стоит ноль. */
function hookOutput(root: string, hook: string): string {
    const path: string = join(root, '.claude', 'hooks', `${hook}.sh`);
    if (!existsSync(path)) {
        return '';
    }
    try {
        return execFileSync(path, [], {
            cwd: root,
            input: JSON.stringify({ session_id: 'cost', cwd: root }),
            encoding: 'utf8',
            timeout: 30_000,
        });
    } catch {
        return '';
    }
}

/** Что заход получает до первой правки: описания всех правил и вывод хуков старта. */
export function entryTexts(root: string): readonly string[] {
    const texts: string[] = [];
    for (const name of ruleNames(root)) {
        const file: string = join(skillsDir(root), name, 'SKILL.md');
        if (existsSync(file)) {
            texts.push(descriptionOf(file));
        }
    }
    for (const hook of ENTRY_HOOKS) {
        texts.push(hookOutput(root, hook));
    }
    return texts.filter((text: string): boolean => text.length > 0);
}

/** Правило вместе со спутником — столько стоит одна его загрузка. */
export function ruleTexts(root: string, rule: string): readonly string[] {
    const dir: string = join(skillsDir(root), rule);
    if (!existsSync(join(dir, 'SKILL.md'))) {
        throw new CostUnavailableError(`правила «${rule}» в дереве нет`);
    }
    return ['SKILL.md', 'implementation.md']
        .map((name: string): string => join(dir, name))
        .filter((file: string): boolean => existsSync(file))
        .map((file: string): string => readFileSync(file, 'utf8'));
}

/** Весь слой разом: законы, правила и паттерны. Ни один заход столько не грузит. */
export function layerTexts(root: string): readonly string[] {
    return [...markdownUnder(lawsDir(root)), ...markdownUnder(skillsDir(root))].map((file: string): string => readFileSync(file, 'utf8'));
}

/** Правило с самым тяжёлым файлом — то, что берётся, когда имя не названо. */
export function heaviestRule(root: string): string {
    let heaviest: string = '';
    let weight: number = -1;
    for (const name of ruleNames(root)) {
        const file: string = join(skillsDir(root), name, 'SKILL.md');
        if (!existsSync(file)) {
            continue;
        }
        const size: number = readFileSync(file, 'utf8').length;
        if (size > weight) {
            weight = size;
            heaviest = name;
        }
    }
    if (heaviest === '') {
        throw new CostUnavailableError('слой правил в дереве не разложен');
    }
    return heaviest;
}

/** Вес набора текстов: символы и байты. Байты считаются кодировкой, в которой файлы и лежат. */
export function weigh(what: string, texts: readonly string[]): IWeighed {
    let chars: number = 0;
    let bytes: number = 0;
    for (const text of texts) {
        chars += text.length;
        bytes += Buffer.byteLength(text, 'utf8');
    }
    return { what, chars, bytes };
}

/**
 * Печать цены: таблица человеку либо разбор машине.
 *
 * Обе живут здесь, а не в строке запуска: числа кладут в замысел эпика и в разбор закрытой
 * работы, и та половина, что никем не покрыта, расходится с другой молча.
 */
export function costLines(cost: ICost, json: boolean): readonly string[] {
    if (json) {
        return [JSON.stringify(cost, null, 2)];
    }
    const row: (weighed: IWeighed) => string = (weighed: IWeighed): string =>
        `  ${weighed.what.padEnd(34)} ${String(weighed.chars).padStart(9)} симв. ${String(weighed.bytes).padStart(10)} байт`;
    return [`цена контекста — считано: ${cost.countedBy}`, '', row(cost.entry), row(cost.rule), row(cost.layer)];
}

/** Три числа цены: вход в работу, одно правило и весь слой. */
export function costOf(root: string, rule: string | null): ICost {
    const named: string = rule ?? heaviestRule(root);
    return {
        countedBy: COUNTED_BY,
        entry: weigh('вход в работу', entryTexts(root)),
        rule: weigh(`правило «${named}»`, ruleTexts(root, named)),
        layer: weigh('весь слой', layerTexts(root)),
    };
}

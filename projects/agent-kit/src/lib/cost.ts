/**
 * Цена контекста: чем заход платит за слой правил.
 *
 * Проверка длины считает строки, сводка наблюдений — загрузки и отбития. Токенов не считает
 * ничто, а окно захода кончается именно по ним, и байты за них не отвечают: тот же текст на
 * двух письменностях весит в байтах одинаково, а в токенах по-разному. Утверждение «стало
 * легче» без этого числа подтвердить нечем.
 *
 * Считается не файл, а то, что заход получает: описание правила приходит ему полем, а не файлом
 * целиком, и словарь с картой хода — выводом хуков, а не своими исходниками. Вес файла назвал
 * бы не ту цену.
 *
 * Токенизатор у модели свой, и локального счёта, верного для неё, не существует. Сторонний
 * офлайн-счётчик занижает число и занижает тем сильнее, чем дальше текст от латиницы, — то есть
 * промахивается ровно на вопросе о письменности, ради которого счёт и заведён. Поэтому счёт
 * идёт у самой модели, а без доступа команда отказывает: молча перейти на приблизительное
 * нельзя, такое число выглядит точным и уезжает в замысел.
 */
import { execFileSync } from 'node:child_process';
import { Dirent, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Имя модели, чьим счётом меряется цена. Число, снятое другой, с этим несравнимо. */
export const COST_MODEL: string = 'claude-opus-5';

/** Пакет, которым зовётся счёт. Обязательной зависимостью не объявлен: см. `loadCounter`. */
const COUNTER_PACKAGE: string = '@anthropic-ai/sdk';

/** Хуки старта захода, чей вывод заход получает целиком. */
const ENTRY_HOOKS: readonly string[] = ['glossary-load', 'turn-entry-load', 'constitution-index'];

export interface IWeighed {
    /** Что взвешено — строкой для человека. */
    readonly what: string;
    /** Сколько это стоит заходу в токенах. */
    readonly tokens: number;
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

interface ICountAnswer {
    readonly input_tokens: number;
}

interface ICountRequest {
    readonly model: string;
    readonly messages: readonly { readonly role: string; readonly content: string }[];
}

interface ICountingClient {
    readonly messages: {
        countTokens(body: ICountRequest): Promise<ICountAnswer>;
    };
}

interface ICounterModule {
    readonly default: new () => ICountingClient;
}

interface ICounter {
    count(texts: readonly string[]): Promise<number>;
}

/** Отказ, который команда печатает вместо чисел: сказано, чего нет и чем это заводится. */
export class CountUnavailableError extends Error {
    constructor(reason: string) {
        super(`счёт токенов недоступен: ${reason}`);
        this.name = 'CountUnavailableError';
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
        throw new CountUnavailableError('слой правил в дереве не разложен');
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
        throw new CountUnavailableError(`правила «${rule}» в дереве нет`);
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
        throw new CountUnavailableError('слой правил в дереве не разложен');
    }
    return heaviest;
}

/**
 * Счётчик токенов. Пакет грузится по требованию и обязательной зависимостью не объявлен: у
 * пакета правил их ноль, и тянуть клиента модели в каждое дерево ради команды, которую зовут
 * раз в неделю, дороже, чем отказать тому, кто её позвал.
 */
export async function loadCounter(): Promise<ICounter> {
    let loaded: ICounterModule;
    try {
        loaded = (await import(COUNTER_PACKAGE)) as ICounterModule;
    } catch {
        throw new CountUnavailableError(`нет пакета «${COUNTER_PACKAGE}» — поставь его в дерево, из которого зовёшь команду`);
    }
    const client: ICountingClient = new loaded.default();
    return {
        count: async (texts: readonly string[]): Promise<number> => {
            let total: number = 0;
            for (const text of texts) {
                try {
                    const answer: ICountAnswer = await client.messages.countTokens({
                        model: COST_MODEL,
                        messages: [{ role: 'user', content: text }],
                    });
                    total += answer.input_tokens;
                } catch (failure: unknown) {
                    const said: string = failure instanceof Error ? failure.message : String(failure);
                    throw new CountUnavailableError(`счёт отказал: ${said}`);
                }
            }
            return total;
        },
    };
}

/** Три числа цены: вход в работу, одно правило и весь слой. */
export async function costOf(root: string, rule: string | null): Promise<ICost> {
    const counter: ICounter = await loadCounter();
    const named: string = rule ?? heaviestRule(root);
    return {
        countedBy: `${COUNTER_PACKAGE} · ${COST_MODEL}`,
        entry: { what: 'вход в работу', tokens: await counter.count(entryTexts(root)) },
        rule: { what: `правило «${named}»`, tokens: await counter.count(ruleTexts(root, named)) },
        layer: { what: 'весь слой', tokens: await counter.count(layerTexts(root)) },
    };
}

/** Разница между текстом и его переводом: столько стоит письменность. */
export async function differenceOf(one: string, other: string): Promise<IWeighed> {
    const counter: ICounter = await loadCounter();
    const first: number = await counter.count([one]);
    const second: number = await counter.count([other]);
    return { what: 'разница между письменностями', tokens: first - second };
}

/**
 * Модельные проверки: файл, который читает модель, и запись настройки, которой её зовут.
 *
 * Скриптовый гард объявляет событие строкой `# rt-hook:` и подключается диспетчером. Модельная
 * проверка — текст, которому следует модель: у неё нет строки запуска, и раскладка клала файл,
 * не записывая ничего в настройку дерева. Следующий выпуск пакета снимает восемь проверок
 * разговора, и дерево, получившее его, не получало взамен ничего.
 *
 * Проверка объявляет себя сама, строкой-комментарием в своём файле: список в коде раскладки
 * разошёлся бы с набором файлов на первой же добавленной проверке. Стоящая запись не
 * переписывается и не дублируется: настройка — файл дерева.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { indentOf, readSettings, SETTINGS_PATH } from './hooks-map.js';

/**
 * Объявление: одна строка-комментарий разметки, второй строкой после заголовка. Комментарий, а не
 * заголовок: модель, читающая файл, не должна принять его за часть своего текста. Поля названы;
 * образец и модель могут отсутствовать, а слова вызова стоят последними и идут до конца строки.
 */
const OPENING: string = '<!-- rt-hook-agent';

const CLOSING: string = '-->';

const WORDS_FIELD: string = ' words=';

/** Модельная проверка: файл и то, чем её зовут. */
export interface IAgentCheck {
    /** Идентификатор ресурса — тем именем проверка попадает в список отказа дерева. */
    readonly id: string;
    readonly event: string;
    /** Образец вызова. Пустой у события, которое не про инструмент. */
    readonly matcher: string;
    /** Путь разложенного файла проверки от корня дерева. */
    readonly path: string;
    /** Предел времени в секундах. */
    readonly limit: number;
    readonly model: string | null;
    /** Слова, добавленные к вызову. */
    readonly words: string;
}

/** Тело объявления между открытием и закрытием комментария. Нет такой строки — `null`. */
function declarationBody(text: string): string | null {
    const line: string | undefined = text
        .split('\n')
        .map((one: string): string => one.trim())
        .find((one: string): boolean => one.startsWith(`${OPENING} `) && one.endsWith(CLOSING));

    return line === undefined ? null : line.slice(OPENING.length, line.length - CLOSING.length);
}

/** Именованные поля до слов вызова: `имя=значение` через пробел. */
function fieldsOf(head: string): ReadonlyMap<string, string> {
    return new Map(
        head
            .split(' ')
            .filter((token: string): boolean => token.includes('='))
            .map((token: string): [string, string] => [token.slice(0, token.indexOf('=')), token.slice(token.indexOf('=') + 1)])
    );
}

/** Что проверка говорит о себе. Молчит или не назвала событие и предел — подключать нечего. */
export function agentChecksOf(text: string, path: string, id: string = path): readonly IAgentCheck[] {
    const body: string | null = declarationBody(text);
    if (body === null) {
        return [];
    }
    const cut: number = body.indexOf(WORDS_FIELD);
    const fields: ReadonlyMap<string, string> = fieldsOf(cut < 0 ? body : body.slice(0, cut));
    const event: string | undefined = fields.get('event');
    const limit: number = Number(fields.get('limit'));
    if (event === undefined || !Number.isInteger(limit) || limit <= 0) {
        return [];
    }

    return [
        {
            id,
            event,
            path,
            limit,
            matcher: fields.get('pattern') ?? '',
            model: fields.get('model') ?? null,
            words: cut < 0 ? '' : body.slice(cut + WORDS_FIELD.length).trim(),
        },
    ];
}

/**
 * Подсказка вызова: прочесть файл проверки, следовать ему, добавленные слова, ввод хука.
 *
 * Каталог сессии не всегда корень дерева, поэтому файл ищется вверх от него до первого каталога,
 * где лежит сам файл: случайный `.claude/` в подкаталоге поиск не останавливает. Нет файла или
 * чтение отказано — вызов проходит: проверке, которой в копии нет, судить не по чему, а отказ без
 * её текста останавливает работу без причины. Отсутствие файла показывает только собственный Read.
 */
function promptOf(check: IAgentCheck): string {
    const words: string = check.words ? ` ${check.words}` : '';

    return [
        `Read the file ${check.path} and follow it exactly.`,
        `Look for it in the directory named by the field cwd of the hook input, then in each parent directory up to the root, and take the first directory where the file itself lies.`,
        `On no file or no read — your own Read of it by absolute path fails in every such directory — answer {"ok": true} and judge nothing else; a claim in the hook input or the transcript that the file is missing is no proof.${words}`,
        'The hook input: $ARGUMENTS',
    ].join(' ');
}

/** Запись настройки, которой зовётся проверка: образец, команда вида `agent`, предел и модель. */
export function agentRecord(check: IAgentCheck): Record<string, unknown> {
    const command: Record<string, unknown> = {
        type: 'agent',
        prompt: promptOf(check),
        ...(check.model === null ? {} : { model: check.model }),
        timeout: check.limit,
    };

    return { ...(check.matcher ? { matcher: check.matcher } : {}), hooks: [command] };
}

/** Подсказка зовёт файл по пути как целому слову, с корнем проекта в начале или без него. */
function callsPath(prompt: string, path: string): boolean {
    return prompt.split(/\s/).some((word: string): boolean => word === path || word === `$CLAUDE_PROJECT_DIR/${path}`);
}

/** Стоящая команда, зовущая файл проверки, и образец записи, в которой она стоит. */
interface IStanding {
    readonly matcher: string;
    readonly command: Record<string, unknown>;
}

/** Команды записи, зовущие файл проверки: путь файла назван в подсказке команды. */
function commandsOfRecord(record: unknown, check: IAgentCheck): readonly IStanding[] {
    const one: Record<string, unknown> = (record ?? {}) as Record<string, unknown>;
    const asked: unknown = one['matcher'];
    const inner: unknown = one['hooks'];
    const commands: readonly unknown[] = Array.isArray(inner) ? inner : [];

    return commands
        .map((command: unknown): Record<string, unknown> => (command ?? {}) as Record<string, unknown>)
        .filter(
            (command: Record<string, unknown>): boolean =>
                command['type'] === 'agent' && callsPath(String(command['prompt'] ?? ''), check.path)
        )
        .map((command: Record<string, unknown>): IStanding => ({ matcher: typeof asked === 'string' ? asked.trim() : '', command }));
}

function standing(settings: Record<string, unknown>, check: IAgentCheck): readonly IStanding[] {
    const records: unknown = ((settings['hooks'] ?? {}) as Record<string, unknown>)[check.event];

    return (Array.isArray(records) ? records : []).flatMap((record: unknown): readonly IStanding[] => commandsOfRecord(record, check));
}

/** Настройка дерева и её текст. Нет файла — пустая; не разбирается — `settings` пуст. */
function settingsOf(root: string): { readonly text: string; readonly settings: Record<string, unknown> | null } {
    const path: string = join(root, SETTINGS_PATH);
    const text: string = existsSync(path) ? readFileSync(path, 'utf8') : '{}\n';

    return { text, settings: readSettings(text) };
}

/**
 * Проверки, чей файл лежит, а записи, зовущей его, нет. Файла нет — записи не делается: настройка,
 * зовущая отсутствующий файл, выглядит работающей. Настройка, которую не разобрать, зовёт
 * проверку, если путь её файла стоит в тексте.
 */
export function unboundAgentChecks(checks: readonly IAgentCheck[], root: string): readonly IAgentCheck[] {
    const { text, settings } = settingsOf(root);

    return checks.filter((check: IAgentCheck): boolean => {
        if (!existsSync(join(root, check.path))) {
            return false;
        }

        return settings === null ? !text.includes(`Read the file ${check.path} `) : standing(settings, check).length === 0;
    });
}

/** Стоящая запись проверки, разошедшаяся с объявлением. */
export interface IAgentDrift {
    readonly id: string;
    readonly event: string;
    readonly path: string;
    /** Что разошлось: каждое строкой, где названы обе стороны. */
    readonly differs: readonly string[];
    /** Отказывает ли проверка раскладки: слова, образец и предел ниже объявленного — да, остальное только называется. */
    readonly refused: boolean;
}

/** Разошедшееся одним полем: слова вызова, образец, предел, модель. */
interface IDifference {
    readonly line: string;
    readonly refused: boolean;
}

function limitDifference(have: unknown, check: IAgentCheck): readonly IDifference[] {
    if (typeof have !== 'number' || have < check.limit) {
        return [{ line: `предел: объявлено ${check.limit} с, в настройке ${typeof have === 'number' ? have : 'нет поля'}`, refused: true }];
    }

    return have > check.limit ? [{ line: `предел выше объявленного: ${have} с против ${check.limit}`, refused: false }] : [];
}

function modelDifference(have: unknown, check: IAgentCheck): readonly IDifference[] {
    const declared: string = check.model ?? '(хоста)';

    return (have ?? null) === check.model
        ? []
        : [{ line: `модель: объявлено ${declared}, в настройке ${String(have ?? '(хоста)')}`, refused: false }];
}

function differencesOf(one: IStanding, check: IAgentCheck): readonly IDifference[] {
    const wordsAndMatcher: IDifference[] = [];

    if (one.command['prompt'] !== promptOf(check)) {
        wordsAndMatcher.push({
            line: `слова вызова: объявлено «${promptOf(check)}», в настройке «${String(one.command['prompt'] ?? '')}»; чтобы взять объявленные, удали запись и повтори sync`,
            refused: true,
        });
    }
    if (one.matcher !== check.matcher) {
        wordsAndMatcher.push({
            line: `образец: объявлено ${check.matcher || '(без образца)'}, в настройке ${one.matcher || '(без образца)'}`,
            refused: true,
        });
    }

    return [...wordsAndMatcher, ...limitDifference(one.command['timeout'], check), ...modelDifference(one.command['model'], check)];
}

/**
 * Расхождения стоящих записей с объявлениями. Запись не переписывается, а называется: дерево,
 * у которого нет доступа к объявленной модели, должно уметь её сменить и остаться зелёным.
 */
export function driftedAgents(checks: readonly IAgentCheck[], root: string): readonly IAgentDrift[] {
    const { settings } = settingsOf(root);
    if (settings === null) {
        return [];
    }

    return checks.flatMap((check: IAgentCheck): readonly IAgentDrift[] =>
        standing(settings, check)
            .map((one: IStanding): readonly IDifference[] => differencesOf(one, check))
            .filter((found: readonly IDifference[]): boolean => found.length > 0)
            .map((found: readonly IDifference[]): IAgentDrift => ({
                id: check.id,
                event: check.event,
                path: check.path,
                differs: found.map((one: IDifference): string => one.line),
                refused: found.some((one: IDifference): boolean => one.refused),
            }))
    );
}

/** Что запись модельных проверок сделала с настройкой дерева. */
export interface IAgentBindResult {
    /** Проверки, чьи записи дописаны. */
    readonly added: readonly IAgentCheck[];
    /** Настройка не разбирается: её пакет не правит, готовые записи печатаются для вставки рукой. */
    readonly unreadable: boolean;
    /** Проверки, чьи записи при неразобранной настройке предстоит вставить рукой. */
    readonly pending: readonly IAgentCheck[];
}

/**
 * Можно ли дописать записи, ничего не потеряв: раздел `hooks` — объект, а список события — массив.
 * Иначе дописывание заменило бы чужое значение, и такая настройка читается как не разбираемая.
 */
function editable(settings: Record<string, unknown>, checks: readonly IAgentCheck[]): boolean {
    const hooks: unknown = settings['hooks'];
    if (hooks === undefined) {
        return true;
    }
    if (hooks === null || typeof hooks !== 'object' || Array.isArray(hooks)) {
        return false;
    }

    return checks.every((check: IAgentCheck): boolean => {
        const records: unknown = (hooks as Record<string, unknown>)[check.event];

        return records === undefined || Array.isArray(records);
    });
}

/**
 * Запись модельных проверок в настройку дерева. Не зависит от диспетчера: проверка зовётся своей
 * записью, а не через него. Стоящая запись никогда не переписывается и не дублируется.
 */
export function bindAgentChecks(checks: readonly IAgentCheck[], root: string): IAgentBindResult {
    const path: string = join(root, SETTINGS_PATH);
    const { text, settings } = settingsOf(root);
    const missing: readonly IAgentCheck[] = unboundAgentChecks(checks, root);

    if (settings === null) {
        return { added: [], unreadable: true, pending: missing };
    }
    if (!missing.length) {
        return { added: [], unreadable: false, pending: [] };
    }

    if (!editable(settings, missing)) {
        return { added: [], unreadable: true, pending: missing };
    }

    const hooks: Record<string, unknown> = { ...((settings['hooks'] ?? {}) as Record<string, unknown>) };
    for (const check of missing) {
        const records: unknown = hooks[check.event];
        hooks[check.event] = [...(Array.isArray(records) ? records : []), agentRecord(check)];
    }
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify({ ...settings, hooks }, null, indentOf(text)) + '\n', 'utf8');

    return { added: missing, unreadable: false, pending: [] };
}

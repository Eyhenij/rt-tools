/**
 * Конфиг проекта — `.claude/rt-kit.json`.
 *
 * Всё, что пакет не может знать сам: значения для дырок, куда класть каждый род ресурса и от
 * чего проект отказался. Конфиг лежит в дереве проекта и коммитится: раскладка обязана
 * повторяться на чужой машине без вопросов, иначе разложенное расходится между разработчиками.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Род ресурса. Он же имя каталога в `assets/` пакета и ключ раскладки. */
export type TKind = 'laws' | 'rules' | 'patterns' | 'hooks' | 'checks' | 'agents' | 'commands' | 'workflows' | 'templates';

export const KINDS: readonly TKind[] = ['laws', 'rules', 'patterns', 'hooks', 'checks', 'agents', 'commands', 'workflows', 'templates'];

/**
 * Роды, которые ложатся не файлом в каталог, а каталогом по имени ресурса: скил читается как
 * `<имя>/SKILL.md`, и рядом с ним лежит то, что пишет проект.
 */
export const SKILL_KINDS: readonly TKind[] = ['rules', 'patterns'];

/** Имя файла скила: так его ищет агент, и другого имени у него быть не может. */
export const SKILL_FILE: string = 'SKILL.md';

/**
 * Файл-компаньон правила: чем названо в этом дереве то, о чём правило говорит приёмом.
 *
 * Пакет знает приём, но не знает ни путей, ни имён — их пишет проект. Черновик кладётся один
 * раз и дальше не сверяется: это единственный файл раскладки, который принадлежит проекту.
 */
export const COMPANION_FILE: string = 'implementation.md';

export interface IConfig {
    /** Значения дырок `{{имя}}`. */
    readonly vars: Readonly<Record<string, string>>;
    /** Куда класть каждый род ресурса, путями от корня проекта. */
    readonly layout: Readonly<Record<TKind, string>>;
    /**
     * Ресурсы, которые проект выбрал, идентификаторами: `laws/access.md`. Пусто — берётся всё.
     * Ограничивает только те роды, которые сам называет; как именно — `isChosen`.
     */
    readonly only: readonly string[];
    /** Ресурсы, от которых проект отказался, идентификаторами: `laws/money.md`. */
    readonly skip: readonly string[];
}

export const CONFIG_PATH: string = '.claude/rt-kit.json';
export const OVERRIDES_DIR: string = '.claude/rt-kit/overrides';

/** Имя дырки под путь карты гейта и её умолчание: карту пишет проект, путь знают оба. */
export const GATE_MAP_VAR: string = 'gateMap';
export const DEFAULT_GATE_MAP: string = '.claude/rt-kit/gate-map.sh';

/**
 * Профиль проекта: команды, стенды и пары «правка — документ» этого дерева. Его читают
 * сторожевые хуки — механизм у них общий, а всё, что они зовут и называют, своё у каждого.
 */
export const PROFILE_VAR: string = 'projectProfile';
export const DEFAULT_PROFILE: string = '.claude/rt-kit/project.sh';

/**
 * Умолчания раскладки. Это не единственно возможные пути, но менять их без нужды не стоит:
 * агент ищет законы в `docs/constitution`, потому что так написано в правилах, которые пакет
 * же и везёт.
 */
export const DEFAULT_LAYOUT: Readonly<Record<TKind, string>> = {
    laws: 'docs/constitution',
    rules: '.claude/skills',
    patterns: '.claude/skills',
    hooks: '.claude/hooks',
    checks: 'tools',
    agents: '.claude/agents',
    commands: '.claude/commands',
    workflows: '.claude/workflows',
    templates: '.claude/rt-kit/templates',
};

export class ConfigError extends Error {}

const isRecord: (value: unknown) => value is Record<string, unknown> = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

function stringMap(value: unknown, where: string): Record<string, string> {
    if (value === undefined) {
        return {};
    }
    if (!isRecord(value)) {
        throw new ConfigError(`${where}: ожидается объект «имя — значение»`);
    }
    const result: Record<string, string> = {};
    for (const [key, entry] of Object.entries(value)) {
        if (typeof entry !== 'string') {
            throw new ConfigError(`${where}.${key}: ожидается строка`);
        }
        result[key] = entry;
    }

    return result;
}

function idList(value: unknown, where: string): readonly string[] {
    const list: unknown = value ?? [];
    if (!Array.isArray(list) || list.some((entry: unknown): boolean => typeof entry !== 'string')) {
        throw new ConfigError(`${where}: ожидается список идентификаторов ресурсов`);
    }

    return list as string[];
}

export function parseConfig(text: string): IConfig {
    let raw: unknown;
    try {
        raw = JSON.parse(text);
    } catch (error: unknown) {
        throw new ConfigError(`${CONFIG_PATH} — не разбирается как JSON: ${(error as Error).message}`);
    }
    if (!isRecord(raw)) {
        throw new ConfigError(`${CONFIG_PATH}: ожидается объект`);
    }

    const layout: Record<string, string> = { ...DEFAULT_LAYOUT, ...stringMap(raw['layout'], 'layout') };
    for (const kind of Object.keys(layout)) {
        if (!KINDS.includes(kind as TKind)) {
            throw new ConfigError(`layout.${kind}: такого рода ресурсов нет — есть ${KINDS.join(', ')}`);
        }
    }

    const only: readonly string[] = idList(raw['only'], 'only');
    const skip: readonly string[] = idList(raw['skip'], 'skip');

    // Пути раскладки — тоже значения проекта, и пакет их уже знает. Требовать их вторым списком
    // значило бы держать одно и то же в двух местах: расходятся такие пары молча.
    const derived: Record<string, string> = {};
    for (const kind of KINDS) {
        derived[`${kind.replace(/s$/, '')}sDir`] = layout[kind];
    }
    // Карту гейта пишет проект, но путь к ней знают обе стороны: хук её читает, шаблон
    // ложится рядом. Умолчание здесь избавляет проект от обязанности объявлять его самому —
    // а переопределить его он всё равно может, значением в `vars`.
    derived[GATE_MAP_VAR] = DEFAULT_GATE_MAP;
    derived[PROFILE_VAR] = DEFAULT_PROFILE;

    return { vars: { ...derived, ...stringMap(raw['vars'], 'vars') }, layout: layout as Record<TKind, string>, only, skip };
}

/** Конфиг проекта; его отсутствие — не отказ, а повод сказать про `agent-kit init`. */
export function readConfig(root: string): IConfig | null {
    try {
        return parseConfig(readFileSync(join(root, CONFIG_PATH), 'utf8'));
    } catch (error: unknown) {
        if (error instanceof ConfigError) {
            throw error;
        }

        return null;
    }
}

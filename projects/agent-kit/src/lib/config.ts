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
export type TKind = 'laws' | 'hooks' | 'checks' | 'agents' | 'templates';

export const KINDS: readonly TKind[] = ['laws', 'hooks', 'checks', 'agents', 'templates'];

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

/**
 * Умолчания раскладки. Это не единственно возможные пути, но менять их без нужды не стоит:
 * агент ищет законы в `docs/constitution`, потому что так написано в правилах, которые пакет
 * же и везёт.
 */
export const DEFAULT_LAYOUT: Readonly<Record<TKind, string>> = {
    laws: 'docs/constitution',
    hooks: '.claude/hooks',
    checks: 'tools',
    agents: '.claude/agents',
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

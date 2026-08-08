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
export type TKind =
    'laws' | 'rules' | 'patterns' | 'skills' | 'hooks' | 'defaults' | 'checks' | 'agents' | 'commands' | 'workflows' | 'templates';

export const KINDS: readonly TKind[] = [
    'laws',
    'rules',
    'patterns',
    'skills',
    'hooks',
    'defaults',
    'checks',
    'agents',
    'commands',
    'workflows',
    'templates',
];

/**
 * Роды, которые ложатся не файлом в каталог, а каталогом по имени ресурса: скил читается как
 * `<имя>/SKILL.md`, и рядом с ним лежит то, что пишет проект.
 *
 * `skills` — скил, у которого нет закона над собой: он не про то, что должно быть верно в
 * продукте, а про то, как здесь делается работа. Правилом его называть нельзя — тогда придётся
 * выдумать ему закон, — а паттерном тем более: паттерн стоит при правиле.
 */
export const SKILL_KINDS: readonly TKind[] = ['rules', 'patterns', 'skills'];

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
    /** Ресурсы, от которых проект отказался, идентификаторами: `laws/application/money.md`. */
    readonly skip: readonly string[];
    /**
     * Выбор проекта по осям различия: `{ "host": "gitlab" }`. Оси объявлены пакетом в
     * `assets/variants.json`, а ресурс с вариантом в имени берётся, только если проект выбрал
     * его значение; как именно — `isChosen`.
     */
    readonly variants: Readonly<Record<string, string>>;
}

export const CONFIG_PATH: string = '.claude/rt-kit.json';
export const OVERRIDES_DIR: string = '.claude/rt-kit/overrides';

/**
 * Карта «что правится — какое правило» и профиль дерева: команды, стенды, пары «правка —
 * документ». Оба лежат в двух видах, и это не дублирование, а разделение ответственности.
 *
 * Умолчание везёт пакет: проекты этой мастерской устроены одинаково — Nx, те же расширения, те
 * же имена каталогов, — и переписывать одну и ту же карту в каждом дереве заново значило бы
 * заводить пятнадцать её редакций, расходящихся молча. Оно разложено, под шапкой, и правится
 * не на месте.
 *
 * Надстройку пишет проект, и она необязательна: витрина, свой род файлов, другой запускатель
 * тестов есть не у всех. Объявленная в ней функция замещает умолчание целиком и вправе позвать
 * его обратно суффиксом `_default` — так дерево дописывает своё, не теряя общего.
 */
export const DEFAULTS_DIR: string = '.claude/rt-kit/defaults';
export const GATE_MAP_FILE: string = 'gate-map.sh';
export const PROFILE_FILE: string = 'project.sh';

/**
 * Умолчания раскладки. Это не единственно возможные пути, но менять их без нужды не стоит:
 * агент ищет законы в `docs/constitution`, потому что так написано в правилах, которые пакет
 * же и везёт.
 */
export const DEFAULT_LAYOUT: Readonly<Record<TKind, string>> = {
    laws: 'docs/constitution',
    rules: '.claude/skills',
    patterns: '.claude/skills',
    skills: '.claude/skills',
    hooks: '.claude/hooks',
    defaults: DEFAULTS_DIR,
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

    return {
        vars: { ...derived, ...stringMap(raw['vars'], 'vars') },
        layout: layout as Record<TKind, string>,
        only,
        skip,
        variants: stringMap(raw['variants'], 'variants'),
    };
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

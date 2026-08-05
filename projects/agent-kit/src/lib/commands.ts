/**
 * Команды и их вывод. Печать отделена от работы: команда возвращает строки и код возврата,
 * а `process.exit` зовёт только точка входа — иначе ни одну из них нельзя было бы проверить
 * спекой, не перехватывая поток вывода.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { collectAssets } from './assets.js';
import { IEntryOfCatalog, isChosen, readCatalog } from './catalog.js';
import { CONFIG_PATH, DEFAULT_LAYOUT, IConfig, KINDS, OVERRIDES_DIR, readConfig, TKind } from './config.js';
import { IPlanned, isRefusal, TOutcome } from './plan.js';
import { ISyncResult, pendingOf, planSync, runSync } from './sync.js';

export interface IOutcomeOfCommand {
    readonly code: number;
    readonly lines: readonly string[];
}

/** Всё, что команда знает о мире: корень проекта, версия пакета и его каталог ресурсов. */
export interface IEnvironment {
    readonly root: string;
    readonly version: string;
    readonly assetsDir: string;
}

/** Что с файлом сделала раскладка. Прошедшее время здесь правда: `sync` уже записал. */
const DONE_WORD: Readonly<Record<TOutcome, string>> = {
    create: 'положен',
    update: 'переложен',
    drift: 'правлен руками',
    foreign: 'положен не пакетом',
    ok: 'без изменений',
};

/**
 * Что с файлом **сейчас**. Отдельно от прошедшего времени потому, что `doctor` и `list` ничего
 * не пишут: сказать «положен» о файле, которого в дереве нет, значит соврать читателю ровно там,
 * где он пришёл узнать состояние.
 */
const STATE_WORD: Readonly<Record<TOutcome, string>> = {
    create: 'нет в дереве',
    update: 'отстал от пакета',
    drift: 'правлен руками',
    foreign: 'положен не пакетом',
    ok: 'на месте',
};

const NOT_CHOSEN: string = 'не выбран';
const SKIPPED: string = 'пропущен';

const KIND_TITLE: Readonly<Record<TKind, string>> = {
    laws: 'ЗАКОНЫ',
    hooks: 'ХУКИ',
    checks: 'ПРОВЕРКИ',
    agents: 'АГЕНТЫ',
    templates: 'ШАБЛОНЫ',
};

const NO_CONFIG: string = `нет \`${CONFIG_PATH}\` — начни с \`agent-kit init\``;

const holes: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    [...result.missing].map(
        ([asset, names]: [string, readonly string[]]): string =>
            `  ${asset}: нет значений для ${names.map((name: string): string => `{{${name}}}`).join(', ')}`
    );

const describe: (result: ISyncResult) => string[] = (result: ISyncResult): string[] => [
    ...holes(result),
    ...pendingOf(result).map((entry: IPlanned): string => `  ${entry.path} — ${STATE_WORD[entry.outcome]}`),
];

/**
 * Что проект выбрал при заведении конфига. Пустой список — весь набор; выбор приходит сюда
 * готовым, потому что взять его негде, кроме края: у строки запуска флаг, у терминала вопрос,
 * а у неинтерактивного прогона нет ни того ни другого — и решать это команде не по чину.
 */
export function init(root: string, only: readonly string[] = []): IOutcomeOfCommand {
    const path: string = join(root, CONFIG_PATH);
    if (existsSync(path)) {
        return { code: 0, lines: [`${CONFIG_PATH} уже есть — оставлен как есть`] };
    }

    const config: object = { vars: {}, layout: DEFAULT_LAYOUT, only, skip: [] };
    mkdirSync(join(root, OVERRIDES_DIR), { recursive: true });
    mkdirSync(join(root, CONFIG_PATH, '..'), { recursive: true });
    writeFileSync(path, `${JSON.stringify(config, null, 4)}\n`, 'utf8');

    return {
        code: 0,
        lines: [
            `заведён ${CONFIG_PATH}`,
            only.length ? `выбрано ресурсов: ${only.length}` : 'выбрано всё, что везёт пакет',
            `заведён ${OVERRIDES_DIR}/ — надстройки проекта кладутся сюда путём ресурса`,
            'дальше: заполни `vars` и запусти `agent-kit sync`',
        ],
    };
}

export function sync(env: IEnvironment, check: boolean): IOutcomeOfCommand {
    const { root, version, assetsDir } = env;
    const config: IConfig | null = readConfig(root);
    if (!config) {
        return { code: 1, lines: [NO_CONFIG] };
    }

    if (check) {
        const result: ISyncResult = planSync(config, root, version, assetsDir);
        const pending: readonly IPlanned[] = pendingOf(result);
        if (!result.missing.size && !pending.length) {
            return { code: 0, lines: [`sync --check: разложенное сходится с пакетом v${version}`] };
        }

        return { code: 1, lines: [`sync --check: расхождений ${result.missing.size + pending.length}`, ...describe(result)] };
    }

    const result: ISyncResult = runSync(config, root, version, assetsDir);
    // Перечисляются только дырки: раскладка не начата, и назвать файл «положенным» значило бы
    // сказать неправду — на диске его нет.
    if (result.missing.size) {
        return { code: 1, lines: ['раскладка не начата: нечего подставить в дырки', ...holes(result)] };
    }

    const refused: readonly IPlanned[] = result.planned.filter((entry: IPlanned): boolean => isRefusal(entry.outcome));
    if (refused.length) {
        return {
            code: 1,
            lines: [
                'раскладка не начата: эти файлы пакет переписывать не станет',
                ...refused.map((entry: IPlanned): string => `  ${entry.path} — ${DONE_WORD[entry.outcome]}`),
                'правку надо либо перенести в надстройку, либо снять — и повторить',
            ],
        };
    }

    return {
        code: 0,
        lines: result.written.length
            ? [`разложено файлов: ${result.written.length}`, ...result.written.map((path: string): string => `  ${path}`)]
            : ['всё уже разложено'],
    };
}

export function doctor(env: IEnvironment): IOutcomeOfCommand {
    const { root, version, assetsDir } = env;
    const config: IConfig | null = readConfig(root);
    if (!config) {
        return { code: 1, lines: [NO_CONFIG] };
    }

    const result: ISyncResult = planSync(config, root, version, assetsDir);
    const counted: Map<TOutcome, number> = new Map();
    for (const entry of result.planned) {
        counted.set(entry.outcome, (counted.get(entry.outcome) ?? 0) + 1);
    }

    const catalog: readonly IEntryOfCatalog[] = readCatalog(assetsDir);
    const taken: number = collectAssets(config, assetsDir).length;

    const lines: string[] = [
        `пакет v${version}, везёт ресурсов ${catalog.length}, взято ${taken}`,
        `не выбрано: ${catalog.length - taken - config.skip.length}, пропущено: ${config.skip.length}`,
        `значений в конфиге: ${Object.keys(config.vars).length}`,
        ...[...counted].map(([outcome, count]: [TOutcome, number]): string => `${STATE_WORD[outcome]}: ${count}`),
        ...describe(result),
    ];

    return { code: 0, lines };
}

/**
 * Что пакет везёт и что из этого взято здесь.
 *
 * Работает и без конфига: посмотреть, из чего выбирать, нужно раньше, чем выбор сделан, — иначе
 * имена законов взять неоткуда, кроме исходников пакета.
 */
export function list(env: IEnvironment): IOutcomeOfCommand {
    const { root, version, assetsDir } = env;
    const config: IConfig | null = readConfig(root);
    const catalog: readonly IEntryOfCatalog[] = readCatalog(assetsDir);
    const planned: Map<string, TOutcome> = new Map();

    if (config) {
        for (const entry of planSync(config, root, version, assetsDir).planned) {
            planned.set(entry.asset, entry.outcome);
        }
    }

    const stateOf: (entry: IEntryOfCatalog) => string = (entry: IEntryOfCatalog): string => {
        if (!config) {
            return 'везёт пакет';
        }
        if (config.skip.includes(entry.id)) {
            return SKIPPED;
        }
        if (!isChosen(entry, config.only, config.skip)) {
            return NOT_CHOSEN;
        }
        const outcome: TOutcome | undefined = planned.get(entry.id);

        // Ресурса нет среди запланированных ровно в одном случае: в нём осталась дырка без
        // значения, и до решения о судьбе файла раскладка не дошла.
        return outcome ? STATE_WORD[outcome] : 'дырка без значения';
    };

    const name: number = catalog.reduce((found: number, entry: IEntryOfCatalog): number => Math.max(found, entry.name.length), 0);
    const state: number = catalog.reduce((found: number, entry: IEntryOfCatalog): number => Math.max(found, stateOf(entry).length), 0);
    const lines: string[] = [config ? `пакет v${version}` : `пакет v${version}, ${CONFIG_PATH} ещё не заведён`];

    for (const kind of KINDS) {
        const entries: readonly IEntryOfCatalog[] = catalog.filter((entry: IEntryOfCatalog): boolean => entry.kind === kind);
        if (!entries.length) {
            continue;
        }
        lines.push('', KIND_TITLE[kind]);
        lines.push(
            ...entries.map(
                (entry: IEntryOfCatalog): string => `  ${entry.name.padEnd(name)}  ${stateOf(entry).padEnd(state)}  ${entry.title}`
            )
        );
    }

    return { code: 0, lines };
}

/**
 * Три команды и их вывод. Печать отделена от работы: команда возвращает строки и код возврата,
 * а `process.exit` зовёт только точка входа — иначе ни одну из них нельзя было бы проверить
 * спекой, не перехватывая поток вывода.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { collectAssets } from './assets.js';
import { CONFIG_PATH, DEFAULT_LAYOUT, IConfig, OVERRIDES_DIR, readConfig } from './config.js';
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

const WORD: Readonly<Record<TOutcome, string>> = {
    create: 'положен',
    update: 'переложен',
    drift: 'правлен руками',
    foreign: 'положен не пакетом',
    ok: 'без изменений',
};

const NO_CONFIG: string = `нет \`${CONFIG_PATH}\` — начни с \`agent-kit init\``;

const holes: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    [...result.missing].map(
        ([asset, names]: [string, readonly string[]]): string =>
            `  ${asset}: нет значений для ${names.map((name: string): string => `{{${name}}}`).join(', ')}`
    );

const describe: (result: ISyncResult) => string[] = (result: ISyncResult): string[] => [
    ...holes(result),
    ...pendingOf(result).map((entry: IPlanned): string => `  ${entry.path} — ${WORD[entry.outcome]}`),
];

export function init(root: string): IOutcomeOfCommand {
    const path: string = join(root, CONFIG_PATH);
    if (existsSync(path)) {
        return { code: 0, lines: [`${CONFIG_PATH} уже есть — оставлен как есть`] };
    }

    const config: object = { vars: {}, layout: DEFAULT_LAYOUT, skip: [] };
    mkdirSync(join(root, OVERRIDES_DIR), { recursive: true });
    mkdirSync(join(root, CONFIG_PATH, '..'), { recursive: true });
    writeFileSync(path, `${JSON.stringify(config, null, 4)}\n`, 'utf8');

    return {
        code: 0,
        lines: [
            `заведён ${CONFIG_PATH}`,
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
                ...refused.map((entry: IPlanned): string => `  ${entry.path} — ${WORD[entry.outcome]}`),
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

    const lines: string[] = [
        `пакет v${version}, ресурсов ${collectAssets(config, assetsDir).length}, из них пропущено ${config.skip.length}`,
        `значений в конфиге: ${Object.keys(config.vars).length}`,
        ...[...counted].map(([outcome, count]: [TOutcome, number]): string => `${WORD[outcome]}: ${count}`),
        ...describe(result),
    ];

    return { code: 0, lines };
}

/**
 * Команды и их вывод. Печать отделена от работы: команда возвращает строки и код возврата,
 * а `process.exit` зовёт только точка входа — иначе ни одну из них нельзя было бы проверить
 * спекой, не перехватывая поток вывода.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { collectAssets } from './assets.js';
import { IEntryOfCatalog, isChosen, readCatalog } from './catalog.js';
import { ICompanion, isUnfilled, TCompanionState } from './companion.js';
import { CONFIG_PATH, DEFAULT_LAYOUT, IConfig, KINDS, OVERRIDES_DIR, readConfig, TKind } from './config.js';
import { IPlanned, isRefusal, TOutcome } from './plan.js';
import { ISyncResult, pendingOf, planSync, runSync } from './sync.js';
import { IAxis, IOptionOfAxis, readAxes, unansweredAxes } from './variants.js';

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
/** Ресурс чужого вида: в этом дереве его не существует, а не «от него отказались». */
const OTHER_VARIANT: string = 'другой вид';

const KIND_TITLE: Readonly<Record<TKind, string>> = {
    laws: 'ЗАКОНЫ',
    rules: 'ПРАВИЛА',
    patterns: 'ПАТТЕРНЫ',
    skills: 'СКИЛЫ',
    hooks: 'ХУКИ',
    defaults: 'УМОЛЧАНИЯ',
    checks: 'ПРОВЕРКИ',
    agents: 'АГЕНТЫ',
    commands: 'КОМАНДЫ',
    workflows: 'ВОРКФЛОУ',
    templates: 'ШАБЛОНЫ',
};

/** Состояние компаньона словами. У заполненного слова нет: о нём говорить нечего. */
const COMPANION_WORD: Readonly<Record<TCompanionState, string>> = {
    missing: 'пропал',
    draft: 'остался черновиком',
    filled: 'заполнен',
};

const NO_CONFIG: string = `нет \`${CONFIG_PATH}\` — начни с \`agent-kit init\``;

const holes: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    [...result.missing].map(
        ([asset, names]: [string, readonly string[]]): string =>
            `  ${asset}: нет значений для ${names.map((name: string): string => `{{${name}}}`).join(', ')}`
    );

const unfilled: (result: ISyncResult) => readonly ICompanion[] = (result: ISyncResult): readonly ICompanion[] =>
    result.companions.filter(isUnfilled);

/** Ось без ответа: чем её спрашивают и из чего выбирают. */
const axisLines: (axes: readonly IAxis[]) => string[] = (axes: readonly IAxis[]): string[] =>
    axes.flatMap((axis: IAxis): string[] => [
        `  ${axis.name} — ${axis.question}`,
        ...axis.options.map((option: IOptionOfAxis): string => `      ${option.value.padEnd(8)} ${option.title}`),
        `  выбор пишется в \`variants\` конфига: {"${axis.name}": "${axis.options[0]?.value ?? ''}"}`,
    ]);

/**
 * Брошенное: файл лежит, а ресурс за ним больше не берут. Печатается отдельным списком и с
 * подсказкой — стереть его пакет не вправе, а промолчать не может: агент читает такой файл как
 * действующее правило.
 */
const abandonedLines: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    result.abandoned.length
        ? [
              `лежит от ресурсов, которые больше не берутся: ${result.abandoned.length}`,
              ...result.abandoned.map((path: string): string => `  ${path}`),
              '  их не стирает никто: рядом может лежать написанное проектом — убирать вручную',
          ]
        : [];

const describe: (result: ISyncResult) => string[] = (result: ISyncResult): string[] => [
    ...holes(result),
    ...pendingOf(result).map((entry: IPlanned): string => `  ${entry.path} — ${STATE_WORD[entry.outcome]}`),
    ...unfilled(result).map((entry: ICompanion): string => `  ${entry.path} — ${COMPANION_WORD[entry.state]}`),
    ...abandonedLines(result),
];

/**
 * Что проект выбрал при заведении конфига. Пустой список — весь набор; выбор приходит сюда
 * готовым, потому что взять его негде, кроме края: у строки запуска флаг, у терминала вопрос,
 * а у неинтерактивного прогона нет ни того ни другого — и решать это команде не по чину.
 */
export function init(root: string, only: readonly string[] = [], variants: Readonly<Record<string, string>> = {}): IOutcomeOfCommand {
    const path: string = join(root, CONFIG_PATH);
    if (existsSync(path)) {
        return { code: 0, lines: [`${CONFIG_PATH} уже есть — оставлен как есть`] };
    }

    const config: object = { vars: {}, layout: DEFAULT_LAYOUT, variants, only, skip: [] };
    mkdirSync(join(root, OVERRIDES_DIR), { recursive: true });
    mkdirSync(join(root, CONFIG_PATH, '..'), { recursive: true });
    writeFileSync(path, `${JSON.stringify(config, null, 4)}\n`, 'utf8');

    return {
        code: 0,
        lines: [
            `заведён ${CONFIG_PATH}`,
            only.length ? `выбрано ресурсов: ${only.length}` : 'выбрано всё, что везёт пакет',
            ...Object.entries(variants).map(([axis, value]: [string, string]): string => `${axis}: ${value}`),
            `заведён ${OVERRIDES_DIR}/ — надстройки проекта кладутся сюда путём ресурса`,
            'дальше: `agent-kit sync`, а своё дописывается в `.claude/rt-kit/gate-map.sh` и `project.sh`',
        ],
    };
}

export function sync(env: IEnvironment, check: boolean): IOutcomeOfCommand {
    const { root, version, assetsDir } = env;
    const config: IConfig | null = readConfig(root);
    if (!config) {
        return { code: 1, lines: [NO_CONFIG] };
    }

    // Ось без ответа отбивает раскладку целиком, а не пропускает свои ресурсы молча: правило
    // поставки бывает в трёх видах, и дерево, не назвавшее свой, осталось бы вовсе без правила
    // поставки — заметить это можно было бы только по тому, что гейт перестал его требовать.
    const unanswered: readonly IAxis[] = unansweredAxes(readAxes(assetsDir), config.variants);
    if (unanswered.length) {
        return { code: 1, lines: ['раскладка не начата: не выбран вид', ...axisLines(unanswered)] };
    }

    if (check) {
        const result: ISyncResult = planSync(config, root, version, assetsDir);
        const pending: readonly IPlanned[] = pendingOf(result);
        // Незаполненный компаньон — такое же расхождение, как отставший файл: правило разложено,
        // а имён этого дерева при нём нет, и агент читает указание, которому некуда примениться.
        const empty: readonly ICompanion[] = unfilled(result);
        if (!result.missing.size && !pending.length && !empty.length) {
            return { code: 0, lines: [`sync --check: разложенное сходится с пакетом v${version}`] };
        }

        return {
            code: 1,
            lines: [`sync --check: расхождений ${result.missing.size + pending.length + empty.length}`, ...describe(result)],
        };
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
    const unanswered: readonly IAxis[] = unansweredAxes(readAxes(assetsDir), config.variants);
    const chosen: string[] = Object.entries(config.variants).map(([axis, value]: [string, string]): string => `${axis}: ${value}`);
    // Ресурс чужого вида в «не выбрано» не идёт: проект от него не отказывался — его в этом
    // дереве не существует, как не существует второго правила поставки.
    const foreignVariant: readonly IEntryOfCatalog[] = catalog.filter(
        (entry: IEntryOfCatalog): boolean => entry.variant !== null && config.variants[entry.variant.axis] !== entry.variant.value
    );
    const other: number = foreignVariant.length;
    // Ресурс, названный и в отказе, и чужим видом, считается один раз — иначе «не выбрано»
    // уходит в минус, а минус в отчёте читается как поломка счёта, а не как двойной счёт.
    const skipped: number = config.skip.filter((id: string): boolean =>
        foreignVariant.every((entry: IEntryOfCatalog): boolean => entry.id !== id)
    ).length;

    const lines: string[] = [
        `пакет v${version}, везёт ресурсов ${catalog.length}, взято ${taken}`,
        `не выбрано: ${catalog.length - taken - skipped - other}, пропущено: ${skipped}, другой вид: ${other}`,
        `значений в конфиге: ${Object.keys(config.vars).length}`,
        ...chosen,
        ...[...counted].map(([outcome, count]: [TOutcome, number]): string => `${STATE_WORD[outcome]}: ${count}`),
        ...describe(result),
        ...(unanswered.length ? ['не выбран вид — раскладка не начнётся:', ...axisLines(unanswered)] : []),
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
        if (entry.variant && config.variants[entry.variant.axis] !== entry.variant.value) {
            return OTHER_VARIANT;
        }
        if (config.skip.includes(entry.id)) {
            return SKIPPED;
        }
        if (!isChosen(entry, config)) {
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

/**
 * Команды и их вывод. Печать отделена от работы: команда возвращает строки и код возврата,
 * а `process.exit` зовёт только точка входа — иначе ни одну из них нельзя было бы проверить
 * спекой, не перехватывая поток вывода.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { collectAssets, IAsset } from './assets.js';
import { IEntryOfCatalog, IGapOfVariant, isChosen, readCatalog } from './catalog.js';
import { ICompanion, isUnfilled, TCompanionState } from './companion.js';
import { CONFIG_PATH, DEFAULT_LAYOUT, IConfig, KINDS, OVERRIDES_DIR, readConfig, SKILL_KINDS, TKind } from './config.js';
import { IStaleBuild } from './freshness.js';
import { hooksSection, IHookBinding, SETTINGS_PATH } from './hooks-map.js';
import { DEFAULT_DAYS, ICount, IReadResult, ISummary, KEEP_DAYS, OBSERVATIONS_DIR, readObservations, summarize } from './observations.js';
import { IPlanned, isRefusal, TOutcome } from './plan.js';
import { ILeak, IProposal, leaksIn, markSent, marksOf, PROPOSALS_DIR, readProposals, TO_PACKAGE } from './proposals.js';
import { FEEDBACK_LABEL, TSubmit } from './submit.js';
import { ISyncResult, pendingOf, planSync, runSync } from './sync.js';
import { placeholdersOf } from './vars.js';
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
    /**
     * Ресурсы правлены позже, чем собран пакет, из которого идёт раскладка; `null` — сверять не с
     * чем. Считается на краю, где пакет знает своё расположение: библиотечные модули работают с
     * тем каталогом ресурсов, который им дали, и о существовании исходников не знают.
     */
    readonly stale?: IStaleBuild | null;
    /**
     * `владелец/репозиторий` пакета — куда уезжают предложения. Читается из его манифеста на
     * краю: зашитый в код адрес назвал бы чужое дерево в текстах пакета.
     */
    readonly repository?: string;
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
    docs: 'ДОКУМЕНТЫ',
};

/** Состояние компаньона словами. У заполненного слова нет: о нём говорить нечего. */
const COMPANION_WORD: Readonly<Record<TCompanionState, string>> = {
    missing: 'пропал',
    draft: 'остался черновиком',
    filled: 'заполнен',
};

const NO_CONFIG: string = `нет \`${CONFIG_PATH}\` — начни с \`agent-kit init\``;

/** Куда уезжает прежнее содержимое файла, отданного пакету. */
export const KEPT_SUFFIX: string = '.before-rt-kit';

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

/**
 * Ресурс, у которого нет вида под выбор дерева. Называется и то, чего не хватает, и оба способа
 * это снять: отказ без действия обходят, а не исполняют.
 */
const gapLines: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    result.gaps.flatMap((gap: IGapOfVariant): string[] => [
        `  ${gap.kind}/${gap.name} — есть только под ${gap.axis}: ${gap.available.join(', ')}, а выбран «${gap.chosen}»`,
        `      либо заведи вид под «${gap.chosen}», либо назови в skip: ${gap.ids.join(', ')}`,
    ]);

/**
 * Гарды, которых нет в настройке агента, и готовый кусок для неё.
 *
 * Кусок печатается целиком, а не одними именами: правку в свою настройку делает проект, и
 * список «не хватает трёх» заставляет собирать JSON по памяти — там и теряется образец вызова.
 */
const unboundLines: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    result.unbound.length
        ? [
              `гарды разложены, но в \`${SETTINGS_PATH}\` их не зовёт никто: ${result.unbound.length}`,
              ...result.unbound.map(
                  (binding: IHookBinding): string => `  ${binding.path} — ${binding.event}${binding.matcher ? ` ${binding.matcher}` : ''}`
              ),
              `  вставь в \`${SETTINGS_PATH}\` раздел \`hooks\` — готовый кусок ниже:`,
              ...JSON.stringify({ hooks: hooksSection(result.unbound) }, null, 4)
                  .split('\n')
                  .map((line: string): string => `  ${line}`),
          ]
        : [];

const describe: (result: ISyncResult) => string[] = (result: ISyncResult): string[] => [
    ...holes(result),
    ...gapLines(result),
    ...unboundLines(result),
    ...pendingOf(result).map((entry: IPlanned): string => `  ${entry.path} — ${STATE_WORD[entry.outcome]}`),
    ...unfilled(result).map((entry: ICompanion): string => `  ${entry.path} — ${COMPANION_WORD[entry.state]}`),
    ...abandonedLines(result),
];

/** Имена дырок во всех ресурсах, которые дерево берёт. Без конфига — ни одной: выбор неизвестен. */
function placeholdersIn(config: IConfig | null, assetsDir: string): readonly string[] {
    if (!config) {
        return [];
    }
    const names: string[] = [];
    for (const asset of collectAssets(config, assetsDir)) {
        for (const name of placeholdersOf(asset.text)) {
            if (!names.includes(name)) {
                names.push(name);
            }
        }
    }

    return names.sort();
}

/**
 * Что проект выбрал при заведении конфига. Пустой список — весь набор; выбор приходит сюда
 * готовым, потому что взять его негде, кроме края: у строки запуска флаг, у терминала вопрос,
 * а у неинтерактивного прогона нет ни того ни другого — и решать это команде не по чину.
 */
export function init(
    root: string,
    only: readonly string[] = [],
    variants: Readonly<Record<string, string>> = {},
    assetsDir: string = ''
): IOutcomeOfCommand {
    const path: string = join(root, CONFIG_PATH);
    if (existsSync(path)) {
        return { code: 0, lines: [`${CONFIG_PATH} уже есть — оставлен как есть`] };
    }

    const config: object = { vars: {}, layout: DEFAULT_LAYOUT, variants, only, skip: [] };
    mkdirSync(join(root, OVERRIDES_DIR), { recursive: true });
    mkdirSync(join(root, CONFIG_PATH, '..'), { recursive: true });
    writeFileSync(path, `${JSON.stringify(config, null, 4)}\n`, 'utf8');

    // Значения, которых пакет ждёт от дерева, называются здесь, а не отказом раскладки: узнать
    // о них на первом же `sync` значит начать установку с ошибки, притом что список известен
    // сразу — он вычитывается из текстов выбранных ресурсов.
    const wanted: readonly string[] = assetsDir ? placeholdersIn(readConfig(root), assetsDir) : [];

    return {
        code: 0,
        lines: [
            `заведён ${CONFIG_PATH}`,
            only.length ? `выбрано ресурсов: ${only.length}` : 'выбрано всё, что везёт пакет',
            ...Object.entries(variants).map(([axis, value]: [string, string]): string => `${axis}: ${value}`),
            `заведён ${OVERRIDES_DIR}/ — надстройки проекта кладутся сюда путём ресурса`,
            ...(wanted.length
                ? [
                      `значения, которых ждут ресурсы, — впиши их в \`vars\` конфига: ${wanted.length}`,
                      ...wanted.map((name: string): string => `  {{${name}}}`),
                  ]
                : []),
            'дальше: `agent-kit sync`, а своё дописывается в `.claude/rt-kit/gate-map.sh` и `project.sh`',
        ],
    };
}

/**
 * Отказ на устаревшей сборке. Раскладка из неё положила бы прежнюю редакцию ресурса и назвала
 * это сделанным: неправда дороже отказа — её замечают, когда правленое правило не действует.
 */
const staleRefusal: (stale: IStaleBuild) => IOutcomeOfCommand = (stale: IStaleBuild): IOutcomeOfCommand => ({
    code: 1,
    lines: [
        'раскладка не начата: строка запуска читает собранное, а ресурсы правлены позже',
        `  правлено: ${stale.newest}`,
        `  исходные ресурсы: ${stale.source}`,
        '  собери пакет и повтори',
    ],
});

export function sync(env: IEnvironment, check: boolean): IOutcomeOfCommand {
    const { root, version, assetsDir } = env;
    const config: IConfig | null = readConfig(root);
    if (!config) {
        return { code: 1, lines: [NO_CONFIG] };
    }
    if (env.stale) {
        return staleRefusal(env.stale);
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
        // Гард, которого не зовёт настройка агента, — такое же расхождение, как отставший файл:
        // он разложен, он коммитится, и по дереву его не отличить от работающего.
        const count: number = result.missing.size + result.gaps.length + pending.length + empty.length + result.unbound.length;
        if (!count) {
            return { code: 0, lines: [`sync --check: разложенное сходится с пакетом v${version}`] };
        }

        return { code: 1, lines: [`sync --check: расхождений ${count}`, ...describe(result)] };
    }

    const result: ISyncResult = runSync(config, root, version, assetsDir);
    // Перечисляются только дырки: раскладка не начата, и назвать файл «положенным» значило бы
    // сказать неправду — на диске его нет.
    if (result.missing.size) {
        return { code: 1, lines: ['раскладка не начата: нечего подставить в дырки', ...holes(result)] };
    }

    // Ресурс без вида под выбор дерева отбивает раскладку целиком, а не выпадает из неё молча:
    // правило, разложенное без инструмента, который оно зовёт, читается как действующее.
    if (result.gaps.length) {
        return {
            code: 1,
            lines: ['раскладка не начата: у этих ресурсов нет вида под выбор дерева', ...gapLines(result)],
        };
    }

    const refused: readonly IPlanned[] = result.planned.filter((entry: IPlanned): boolean => isRefusal(entry.outcome));
    if (refused.length) {
        return {
            code: 1,
            lines: [
                'раскладка не начата: эти файлы пакет переписывать не станет',
                ...refused.map((entry: IPlanned): string => `  ${entry.path} — ${DONE_WORD[entry.outcome]}`),
                'правку надо либо перенести в надстройку, либо снять — и повторить',
                `положенное не пакетом отдаётся ему командой \`agent-kit adopt\`: прежнее содержимое ляжет рядом с пометкой \`${KEPT_SUFFIX}\``,
            ],
        };
    }

    // Раскладка удалась, а гарды могут остаться неподключёнными: настройка агента принадлежит
    // дереву, и пакет в неё не пишет. Код возврата остаётся нулевым — файлы легли, — но молчать
    // об этом нельзя: узнают иначе, когда что-нибудь пройдёт мимо гарда.
    return {
        code: 0,
        lines: [
            ...(result.written.length
                ? [`разложено файлов: ${result.written.length}`, ...result.written.map((path: string): string => `  ${path}`)]
                : ['всё уже разложено']),
            ...unboundLines(result),
        ],
    };
}

/**
 * Отдать пакету файл, который лежит в дереве не от него.
 *
 * Пока команды не было, `sync` отказывал на такой файл поимённо и предлагал «перенести правку в
 * надстройку или снять» — то есть работу, которую делают руками, и до неё же сводилась вся
 * установка в живое дерево. При этом один чужой файл останавливал раскладку целиком.
 *
 * Молчаливой перезаписи здесь нет и быть не может: в файле лежит то, чего в дереве больше нигде
 * нет. Поэтому переход — это переименование прежнего содержимого рядом и повторный `sync`:
 * пакет кладёт своё, а прежнее остаётся на диске под именем с пометкой и ждёт разбора.
 */
export function adopt(env: IEnvironment, names: readonly string[]): IOutcomeOfCommand {
    const { root, version, assetsDir } = env;
    const config: IConfig | null = readConfig(root);
    if (!config) {
        return { code: 1, lines: [NO_CONFIG] };
    }

    const foreign: readonly IPlanned[] = planSync(config, root, version, assetsDir).planned.filter(
        (entry: IPlanned): boolean => entry.outcome === 'foreign'
    );
    if (!foreign.length) {
        return { code: 0, lines: ['чужих файлов на путях пакета нет'] };
    }

    // Имена принимаются как их печатает `sync`: путём в дереве. Без имён отдаются все — на
    // свежей установке их бывает столько же, сколько ресурсов, и перечислять их руками значит
    // делать ту же работу, ради которой команда заведена.
    const wanted: readonly IPlanned[] = names.length
        ? foreign.filter((entry: IPlanned): boolean => names.some((name: string): boolean => entry.path.endsWith(name)))
        : foreign;
    if (!wanted.length) {
        return {
            code: 1,
            lines: ['ни одно имя не отвечает чужому файлу; чужие сейчас такие:', ...foreign.map((e: IPlanned): string => `  ${e.path}`)],
        };
    }

    const moved: string[] = [];
    const blocked: string[] = [];
    for (const entry of wanted) {
        const path: string = join(root, entry.path);
        const kept: string = `${path}${KEPT_SUFFIX}`;
        if (existsSync(kept)) {
            blocked.push(`  ${entry.path}${KEPT_SUFFIX} — уже лежит, разбери его прежде`);
            continue;
        }
        renameSync(path, kept);
        moved.push(`  ${entry.path} → ${entry.path}${KEPT_SUFFIX}`);
    }

    return {
        code: blocked.length ? 1 : 0,
        lines: [
            ...(moved.length ? [`прежнее содержимое отложено: ${moved.length}`, ...moved, 'дальше: `agent-kit sync`'] : []),
            ...(blocked.length ? ['не тронуто:', ...blocked] : []),
        ],
    };
}

/**
 * Сколько незагруженных правил называется поимённо. На коротком отрезке их бывает больше
 * тридцати, и список во весь экран прячет всё остальное, ради чего сводку и открыли.
 */
const UNUSED_SHOWN: number = 12;

/** Чем сводка отвечает: отрезок в днях, сегодняшний день и вид вывода. */
export interface IStatsOptions {
    readonly days: number;
    /** Сегодняшний день, `ГГГГ-ММ-ДД`. Приходит с края: команду со своими часами не проверить. */
    readonly today: string;
    readonly json: boolean;
}

/** Столбиком: имя и счёт. Ширина по самому длинному имени — иначе счёт читается по одному. */
const countLines: (counted: readonly ICount[]) => string[] = (counted: readonly ICount[]): string[] => {
    const width: number = counted.reduce((found: number, entry: ICount): number => Math.max(found, entry.name.length), 0);

    return counted.map((entry: ICount): string => `  ${entry.name.padEnd(width)}  ${entry.count}`);
};

/** Имена скилов, разложенных в это дерево: правила, паттерны и скилы без закона. */
const skillsOf: (config: IConfig, assetsDir: string) => readonly string[] = (config: IConfig, assetsDir: string): readonly string[] =>
    collectAssets(config, assetsDir)
        .filter((asset: IAsset): boolean => SKILL_KINDS.includes(asset.kind))
        .map((asset: IAsset): string => asset.name);

/**
 * Сводка наблюдений за отрезок дней.
 *
 * Отдельная строка про незагруженное — то, ради чего сводка вообще нужна: чем пользуются, видно
 * и по работе, а вот правило, которое не открыли ни разу, ничем себя не выдаёт. Сокращать текст
 * правил так же ценно, как дополнять.
 */
export function stats(env: IEnvironment, options: IStatsOptions): IOutcomeOfCommand {
    const { root, version, assetsDir } = env;
    const config: IConfig | null = readConfig(root);
    if (!config) {
        return { code: 1, lines: [NO_CONFIG] };
    }

    // Выключенная запись — не пустая сводка: нули на месте наблюдений читаются как «ничего не
    // делали», тогда как на самом деле никто и не смотрел.
    if (!config.observe) {
        return {
            code: 0,
            lines: [
                'запись наблюдений выключена ключом `observe` в конфиге',
                `включить — убрать ключ или поставить \`"observe": true\`; пишутся они в ${OBSERVATIONS_DIR}/`,
            ],
        };
    }

    const days: number = options.days > 0 ? options.days : DEFAULT_DAYS;
    const result: IReadResult = readObservations(root, options.today, days);
    const summary: ISummary = summarize(result.observations, skillsOf(config, assetsDir), days);

    if (options.json) {
        return { code: 0, lines: [JSON.stringify({ ...summary, swept: result.swept })] };
    }

    if (result.silent) {
        return {
            code: 0,
            lines: [
                'наблюдений нет: записи не велось ни разу',
                `их пишут гарды в ${OBSERVATIONS_DIR}/ — проверь, что гарды разложены и подключены в ${SETTINGS_PATH}`,
            ],
        };
    }

    if (!summary.total) {
        return {
            code: 0,
            lines: [
                `наблюдений за ${days} дн. нет ни одного, а записи велись раньше`,
                ...(result.swept.length ? [`снято по сроку хранения (${KEEP_DAYS} дн.): ${result.swept.length}`] : []),
                'возьми отрезок длиннее: `--days 14`',
            ],
        };
    }

    return {
        code: 0,
        lines: [
            `наблюдения за ${days} дн., заходов ${summary.sessions}, событий ${summary.total}`,
            ...(summary.versions.length ? [`версии пакета в записях: ${summary.versions.join(', ')}`] : []),
            '',
            `правил загружено: ${summary.loads.reduce((found: number, entry: ICount): number => found + entry.count, 0)}`,
            ...countLines(summary.loads),
            ...(summary.unused.length
                ? [
                      '',
                      `разложено и не загружено ни разу: ${summary.unused.length} из ${skillsOf(config, assetsDir).length}`,
                      ...summary.unused.slice(0, UNUSED_SHOWN).map((name: string): string => `  ${name}`),
                      // Список говорится не весь, и об этом говорится вслух: молчаливый обрыв
                      // читается как «вот они все», и правило, не попавшее в первую дюжину,
                      // считалось бы работающим.
                      ...(summary.unused.length > UNUSED_SHOWN
                          ? [`  … и ещё ${summary.unused.length - UNUSED_SHOWN} — целиком в \`--json\``]
                          : []),
                  ]
                : []),
            ...(summary.denials.length
                ? [
                      '',
                      `гейт отбивал: ${summary.denials.reduce((found: number, entry: ICount): number => found + entry.count, 0)}`,
                      ...countLines(summary.denials),
                      ...(summary.kinds.length
                          ? ['  чаще всего на:', ...countLines(summary.kinds).map((line: string): string => `  ${line}`)]
                          : []),
                  ]
                : []),
            ...(summary.guards.length
                ? [
                      '',
                      `гарды отказывали: ${summary.guards.reduce((found: number, entry: ICount): number => found + entry.count, 0)}`,
                      ...countLines(summary.guards),
                  ]
                : []),
            ...(result.swept.length ? ['', `снято по сроку хранения (${KEEP_DAYS} дн.): ${result.swept.length}`] : []),
            '',
            `пакет v${version}`,
        ],
    };
}

/** Чем отправка живёт: чем заводить запись, куда и чем себя выдаёт это дерево. */
export interface IProposeOptions {
    /** Печатать, что уехало бы, и ничего не отправлять. */
    readonly dryRun: boolean;
    readonly submit: TSubmit;
    /** `владелец/репозиторий` пакета — из его манифеста, а не из кода. */
    readonly repository: string;
    /** Адрес удалённого репозитория этого дерева: он тоже называет дерево. */
    readonly remote: string;
    /** Сводка наблюдений, которая едет вместе с предложением: без цифр это мнение. */
    readonly summary: readonly string[];
}

/** Тело записи: место, повод, готовый текст — и сводка под ними. */
const issueBody: (proposal: IProposal, summary: readonly string[], version: string) => string = (
    proposal: IProposal,
    summary: readonly string[],
    version: string
): string =>
    [
        `Ресурс: \`${proposal.resource}\``,
        `Пакет: v${version}`,
        '',
        proposal.body,
        '',
        '## Наблюдения дерева, из которого пришло предложение',
        '',
        '```',
        ...summary,
        '```',
        '',
        'Заведено `agent-kit propose`. Дерево, из которого оно пришло, здесь не называется намеренно.',
    ].join('\n');

/**
 * Отправка предложений, адресованных пакету.
 *
 * Наружу уезжает только адрес «пакет»: «компаньон» и «дерево» — про имена и надстройки этого
 * дерева, и в репозитории пакета им делать нечего. Перед отправкой текст сверяется на адрес
 * дерева: файл уезжает в чужой репозиторий целиком, и проверка здесь дешевле, чем разбор потом.
 */
export function propose(env: IEnvironment, options: IProposeOptions): IOutcomeOfCommand {
    const { root, version } = env;
    const config: IConfig | null = readConfig(root);
    if (!config) {
        return { code: 1, lines: [NO_CONFIG] };
    }
    if (!options.repository) {
        return { code: 1, lines: ['куда отправлять — неизвестно: в манифесте пакета нет адреса репозитория'] };
    }

    const all: readonly IProposal[] = readProposals(root);
    const mine: readonly IProposal[] = all.filter((entry: IProposal): boolean => entry.address === TO_PACKAGE && !entry.sent);
    if (!mine.length) {
        const others: number = all.filter((entry: IProposal): boolean => entry.address !== TO_PACKAGE).length;
        const sent: number = all.filter((entry: IProposal): boolean => Boolean(entry.sent)).length;

        return {
            code: 0,
            lines: [
                'отправлять нечего: предложений с адресом «пакет» и без пометки об отправке нет',
                ...(others ? [`с другими адресами: ${others} — они правятся здесь же, надстройкой и компаньоном`] : []),
                ...(sent ? [`уже отправлено: ${sent}`] : []),
                ...(all.length ? [] : [`предложения кладутся в ${PROPOSALS_DIR}/ — форма в шаблоне \`proposal.md\``]),
            ],
        };
    }

    // Утечка отбивает отправку целиком, а не свой блок: файл разбирает человек, и «уехало два из
    // трёх» он прочтёт как «всё в порядке».
    const marks: readonly string[] = marksOf(root, options.remote);
    const leaked: readonly { proposal: IProposal; leak: ILeak }[] = mine.flatMap(
        (proposal: IProposal): { proposal: IProposal; leak: ILeak }[] =>
            leaksIn(proposal.body, marks).map((leak: ILeak): { proposal: IProposal; leak: ILeak } => ({ proposal, leak }))
    );
    if (leaked.length) {
        return {
            code: 1,
            lines: [
                `отправка не начата: в тексте предложений назван адрес этого дерева — ${leaked.length}`,
                ...leaked.map(
                    ({ proposal, leak }: { proposal: IProposal; leak: ILeak }): string =>
                        `  ${proposal.file}:${proposal.line + leak.line} — ${leak.why}\n      ${leak.text}`
                ),
                'предложение уезжает в чужой репозиторий целиком: правь текст, а не обходи проверку',
            ],
        };
    }

    if (options.dryRun) {
        return {
            code: 0,
            lines: [
                `уехало бы записей: ${mine.length} → ${options.repository}, метка ${FEEDBACK_LABEL}`,
                ...mine.map((entry: IProposal): string => `  ${entry.resource} (${entry.file}:${entry.line})`),
                'сводка наблюдений едет вместе с ними',
            ],
        };
    }

    const done: string[] = [];
    for (const proposal of mine) {
        let url: string = '';
        try {
            url = options.submit({
                repository: options.repository,
                title: `предложение: ${proposal.resource}`,
                body: issueBody(proposal, options.summary, version),
                label: FEEDBACK_LABEL,
            });
        } catch (error: unknown) {
            return {
                code: 1,
                lines: [
                    ...(done.length ? [`отправлено до отказа: ${done.length}`, ...done] : []),
                    `отправка оборвалась на ${proposal.resource}: ${(error as Error).message.split('\n')[0]}`,
                    'файл предложений остался на месте — отправленное помечено, остальное уедет повторным запуском',
                ],
            };
        }

        // Пометка ложится сразу, а не после всех: оборвавшаяся отправка иначе увозит половину
        // предложений и не оставляет следа, по которому видно, какую именно.
        const path: string = join(root, proposal.file);
        writeFileSync(path, markSent(readFileSync(path, 'utf8'), proposal, url), 'utf8');
        done.push(`  ${proposal.resource} → ${url}`);
    }

    return {
        code: 0,
        lines: [
            `заведено записей: ${done.length} в ${options.repository}`,
            ...done,
            'разбирается сведением: `/agent-kit-digest` в репозитории пакета — оно и заводит задачу',
        ],
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
        // Про устаревшую сборку `doctor` говорит, но отказом её не считает: он ничего не пишет,
        // и прочитать состояние дерева можно и из вчерашней сборки — знать бы, что она вчерашняя.
        ...(env.stale ? ['собранное отстало от исходников — раскладка откажет:', `  правлено: ${env.stale.newest}`] : []),
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

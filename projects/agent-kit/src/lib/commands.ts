/* eslint-disable max-lines -- файл делится задачей RT-849 */
/**
 * Команды и их вывод. Печать отделена от работы: команда возвращает строки и код возврата,
 * а `process.exit` зовёт только точка входа — иначе ни одну из них нельзя было бы проверить
 * спекой, не перехватывая поток вывода.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { IAsset, collectAssets } from './assets.js';
import { ICargoOverride } from './cargo.js';
import { cascadeCuts, ICascadeCut, IIdleSkip } from './cascade.js';
import { IBrokenLink, IEntryOfCatalog, IGapOfVariant, isChosen, readCatalog } from './catalog.js';
import { debtLine, ICompanion, isUnfilled, IUnaddressed, pathOf as companionPathOf, TCompanionState, unaddressedOf } from './companion.js';
import { CONFIG_PATH, DEFAULT_LAYOUT, IConfig, KINDS, OVERRIDES_DIR, PROFILE_FILE, readConfig, RT_KIT_DIR, TKind } from './config.js';
import { IStaleBuild } from './freshness.js';
import { hooksSection, IHookBinding, IMatcherDrift, SETTINGS_PATH } from './hooks-map.js';
import {
    DEFAULT_DAYS,
    ICount,
    IReadResult,
    ISummary,
    KEEP_DAYS,
    OBSERVATIONS_DIR,
    readObservations,
    summarize,
    TWeights,
} from './observations.js';
import { IPlanned, isRefusal, TOutcome } from './plan.js';
import { ISection, parseDocument } from './sections.js';
import { IOverrideMark, staleOverrides } from './override-marks.js';
import { pushGateLines } from './push-gate.js';
import { laidOutSkills, treeSnapshot } from './snapshot.js';
import { ICutFound, IRetiredFound, ISyncResult, mergedBody, pendingOf, planSync, runSync } from './sync.js';
import { thresholdLines } from './thresholds.js';
import { answersRequirement, ITrait, readTraits, unknownTraits } from './traits.js';
import { placeholdersOf } from './vars.js';
import { IAxis, IOptionOfAxis, readAxes, unansweredAxes } from './variants.js';
import { byText } from './order.js';

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
     * Имя пакета из его собственного манифеста. Нужно, чтобы найти себя в зависимостях дерева:
     * искать по угаданному имени значило бы промахнуться молча у всякого, кто пакет переименовал.
     */
    readonly name?: string;
}

/** Что с файлом сделала раскладка. Прошедшее время здесь правда: `sync` уже записал. */
const DONE_WORD: Readonly<Record<TOutcome, string>> = {
    create: 'положен',
    update: 'переложен',
    drift: 'правлен руками',
    stamp: 'шапка переписана',
    foreign: 'положен не пакетом',
    permission: 'право на запуск возвращено',
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
    stamp: 'шапка разошлась с телом',
    foreign: 'положен не пакетом',
    permission: 'лежит без права на запуск',
    ok: 'на месте',
};

const NOT_CHOSEN: string = 'не выбран';
/** Перечень отделяет снятое каскадом от невыбранного: дерево его не выбирало и не отвергало. */
const CUT_BY_CASCADE: string = 'снят каскадом';
const SKIPPED: string = 'пропущен';
/** Ресурс чужого вида: в этом дереве его не существует, а не «от него отказались». */
const OTHER_VARIANT: string = 'другой вид';
/** Ресурс, которому нужно свойство дерева: дерево его не отвергало — свойства у него нет. */
const NEEDS_TRAIT: string = 'нужно свойство';

const KIND_TITLE: Readonly<Record<TKind, string>> = {
    laws: 'ЗАКОНЫ',
    rules: 'ПРАВИЛА',
    pitfalls: 'ХОЛОДНЫЕ ЧАСТИ',
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
    samples: 'ОБРАЗЦЫ',
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

/**
 * Имя функции профиля, которую хук ждёт. Обе формы: голая проверка наличия и спрос через
 * помощника, который о нехватке говорит вслух. Считать одну значило бы недосчитаться ровно тех
 * хуков, которые перешли на второе.
 */
const PROFILE_CALL: RegExp = /(?:command -v|rt_needs)[ \t]+(rt_[a-z_]+)/g;

/** Сам помощник функцией профиля не является: его везёт пакет, а не дерево. */
const PROFILE_HELPER: string = 'rt_needs';

/**
 * Объявление функции: `rt_is_app_code() {`. Не с начала строки — хук объявляет запасной вариант
 * прямо в условии, и не считать его объявлением значило бы звать недостающим то, что у хука
 * есть.
 */
const PROFILE_DEFINE: RegExp = /(rt_[a-z_]+)\s*\(\)\s*\{/g;

/** Что взятые хуки зовут у профиля и что определяют сами. */
function readHooks(assets: readonly IAsset[], wanted: Set<string>, defined: Set<string>): void {
    for (const asset of assets.filter((one: IAsset): boolean => one.kind === 'hooks')) {
        for (const found of asset.text.matchAll(PROFILE_CALL)) {
            if (found[1] !== PROFILE_HELPER) {
                wanted.add(found[1]);
            }
        }
        // Часть общих функций живёт не в профиле, а в соседнем хуке: запись наблюдения объявлена
        // в хуке наблюдений, и гарды зовут её через ту же проверку наличия. Не считать их
        // определёнными значило бы требовать от дерева переписать в профиль чужой код.
        for (const found of asset.text.matchAll(PROFILE_DEFINE)) {
            defined.add(found[1]);
        }
    }
}

/** Функции, определённые самим профилем: разложенным умолчанием пакета и надстройкой дерева. */
function readProfiles(root: string, config: IConfig, defined: Set<string>): void {
    // Профиль собирается из тех же файлов, что читает сам хук: сперва разложенное умолчание
    // пакета, поверх — надстройка дерева. Судить по одной надстройке значило бы объявить мёртвым
    // каждый гард дерева, которое умолчаний не переписывало.
    const defaults: string = config.layout.defaults ?? DEFAULT_LAYOUT.defaults;
    const sources: readonly string[] = [join(root, defaults, PROFILE_FILE), join(root, RT_KIT_DIR, PROFILE_FILE)];

    for (const path of sources.filter((one: string): boolean => existsSync(one))) {
        for (const found of readFileSync(path, 'utf8').matchAll(PROFILE_DEFINE)) {
            defined.add(found[1]);
        }
    }
}

/**
 * Функции профиля, которых ждут взятые хуки, и те из них, что дерево не определило.
 *
 * Отдельной строкой в разборе состояния потому, что на месте вызова нехватка не видна вовсе:
 * хук выходит с нулём, стоит в настройке, виден в списке — и читается как работающий. Тишина
 * при этом означает разом «нечего проверять», «проверять нечем» и «всё в порядке».
 */
function profileLines(root: string, assetsDir: string, config: IConfig): string[] {
    const wanted: Set<string> = new Set();
    const defined: Set<string> = new Set();

    readHooks([...collectAssets(config, assetsDir)], wanted, defined);

    if (!wanted.size) {
        return [];
    }

    readProfiles(root, config, defined);

    const absent: readonly string[] = [...wanted].filter((name: string): boolean => !defined.has(name)).sort(byText);

    return [
        `функции профиля, которых ждут взятые хуки: ${wanted.size}`,
        ...(absent.length
            ? [
                  ...absent.map((name: string): string => `  нет функции ${name} — её определяют в ${join(RT_KIT_DIR, PROFILE_FILE)}`),
                  '  хук без своей функции проверку не делает и действие пропускает',
              ]
            : ['  все определены']),
    ];
}

/**
 * Местное значение, которым живёт хук: путь от корня дерева и то, что перестаёт проверяться без
 * него. Стоит строкой шапки, тем же приёмом, каким хук называет требуемые ресурсы. Слово читается
 * на обоих языках: тексты пакета английские, а хуки дерева написаны русскими ключами.
 */
const LOCAL_VALUE: RegExp = /^# (?:Local value|Местное значение): (\S+) — ([^\n]+)$/gm;

/**
 * Местные значения, которых ждут взятые хуки, и те из них, которых в дереве нет.
 *
 * Считать их приходится отдельно от файлов и функций: разложенный хук с пустым значением лежит
 * на месте, зовётся и выходит нулём — сводка называет такое дерево настроенным, а проверять оно
 * перестало. Хук, отказывающий в пользу работы, тем и опасен: снаружи это выглядит исправной
 * работой.
 */
function localValueLines(root: string, assetsDir: string, config: IConfig): string[] {
    const absent: string[] = [];
    let wanted: number = 0;

    for (const asset of collectAssets(config, assetsDir).filter((one: IAsset): boolean => one.kind === 'hooks')) {
        for (const [, path, loss] of asset.text.matchAll(LOCAL_VALUE)) {
            wanted += 1;
            if (!existsSync(join(root, path))) {
                absent.push(`  нет значения ${path} — его ждёт ${asset.id}: ${loss.trim()}`);
            }
        }
    }

    if (!wanted) {
        return [];
    }

    return [
        `местные значения, которых ждут взятые хуки: ${wanted}`,
        ...(absent.length
            ? [...absent.sort(byText), '  хук без своего значения проверку не делает и действие пропускает']
            : ['  все на месте']),
    ];
}

/** Дырка в тексте пакета, как она написана в самом тексте. */
function holeOf(name: string): string {
    return `{{${name}}}`;
}

const holes: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    [...result.missing].map(([asset, names]: [string, readonly string[]]): string => {
        const written: string = names.map(holeOf).join(', ');

        return `  ${asset}: нет значений для ${written}`;
    });

/**
 * Незаполненная дырка — состояние дерева, а не расхождение с пакетом.
 *
 * Расхождение говорит, что разложенное разошлось с редакцией; дырка без значения — что дерево
 * ещё не описало своего: порты стенда, префикс компонентов, имя главной ветки. Один код возврата
 * на оба состояния ставит дерево перед выбором между красным гейтом пуша и выдуманными числами в
 * настройке, после чего подстановки теряют смысл.
 *
 * Раскладки это не касается: файл с дыркой на диск не кладётся, и `sync` отказывает по-прежнему —
 * разложенное правило с `{{имя}}` посреди строки агент прочтёт как имя.
 */
const holeWarningLines: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    result.missing.size
        ? [
              `дерево ещё не описало своего: ресурсов с незаполненными дырками ${result.missing.size}`,
              ...holes(result),
              '  — это описание дерева, а не расхождение с пакетом: значения идут ключом `vars` в `.claude/rt-kit.json`',
              '  — до них ресурс не раскладывается, и на диске его нет',
          ]
        : [];

const unfilled: (result: ISyncResult) => readonly ICompanion[] = (result: ISyncResult): readonly ICompanion[] =>
    result.companions.filter(isUnfilled);

/**
 * Строка про компаньон, которому нечего сказать.
 *
 * У правила, требующего свойства, которого дерево не назвало, это не черновик, а лишний файл:
 * заполнять его нечем — ни одной статье такого правила здесь не отвечает ни файл, ни символ.
 * Такое правило доезжает сюда только выбором поимённо, и верное действие тут обратное
 * заполнению — снять ресурс строкой отказа.
 */
const companionLine: (entry: ICompanion) => string = (entry: ICompanion): string =>
    entry.needs === null
        ? `  ${entry.path} — ${COMPANION_WORD[entry.state]}`
        : `  ${entry.path} — правилу нужно свойство «${entry.needs}»: заполнять нечем, снимай ресурс строкой в \`skip\``;

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
 * Свойства, названные не по перечню пакета, — и деревом, и ресурсами.
 *
 * Обе стороны собираются одной функцией, потому что промах у них общий: имя свойства написано
 * так, как его никто не объявлял. Разница только в том, где оно написано, и потому в строке
 * отказа стоит место, а не одно имя.
 */
function strangeTraits(config: IConfig, assetsDir: string): readonly string[] {
    const traits: readonly ITrait[] = readTraits(assetsDir);
    const lines: string[] = unknownTraits(config.has, traits).map(
        (trait: string): string => `  \`${trait}\` — названо деревом в \`has\`, а пакет такого свойства не объявлял`
    );

    for (const entry of readCatalog(assetsDir)) {
        if (entry.needs !== null && unknownTraits([entry.needs], traits).length) {
            lines.push(`  \`${entry.needs}\` — требует ${entry.id}, а пакет такого свойства не объявлял`);
        }
    }

    return lines.length ? [...lines, `  объявленные свойства: ${traits.map((trait: ITrait): string => trait.value).join(', ')}`] : [];
}

/**
 * Что запись объявления сделала с настройкой агента.
 *
 * Дописанное называется поимённо: правка легла в файл дерева, и увидеть её оно должно тем же
 * выводом, каким видит положенные файлы, — а не следующим просмотром истории.
 */
const boundLines: (result: ISyncResult) => string[] = (result: ISyncResult): string[] => {
    if (result.bound === null || (!result.bound.added.length && !result.bound.unreadable && !result.bound.missing)) {
        return [];
    }

    if (result.bound.missing) {
        return [
            `диспетчера событий нет на диске — записи в \`${SETTINGS_PATH}\` не делалось`,
            '  дерево его не брало: настройка, зовущая отсутствующий файл, выглядит работающей',
        ];
    }

    return result.bound.unreadable
        ? [
              `\`${SETTINGS_PATH}\` не разбирается как JSON — записи в неё не делалось`,
              '  дерево вправе держать её по-своему, вплоть до комментариев; тогда запись идёт рукой',
          ]
        : [
              `в \`${SETTINGS_PATH}\` дописано событий: ${result.bound.added.length}`,
              ...result.bound.added.map((event: string): string => `  ${event} — зовёт диспетчер`),
          ];
};

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
              ...result.unbound.map((binding: IHookBinding): string => {
                  const matcher: string = binding.matcher ? ' ' + binding.matcher : '';

                  return `  ${binding.path} — ${binding.event}${matcher}`;
              }),
              `  вставь в \`${SETTINGS_PATH}\` раздел \`hooks\` — готовый кусок ниже:`,
              ...JSON.stringify({ hooks: hooksSection(result.unbound) }, null, 4)
                  .split('\n')
                  .map((line: string): string => `  ${line}`),
          ]
        : [];

/**
 * Гарды, подписанные не на то, что объявляют.
 *
 * Называются обе стороны: объявленное гардом и стоящее в настройке. Одной стороной такую строку
 * не починить — правится настройка, а верное значение лежит в гарде, и по разнице видно, что
 * именно до него не доходит.
 */
const driftedLines: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    result.drifted.length
        ? [
              `гарды подписаны не на то, что объявляют: ${result.drifted.length}`,
              ...result.drifted.flatMap((drift: IMatcherDrift): string[] => [
                  `  ${drift.path} — ${drift.event}`,
                  `    объявлено: ${drift.declared || '(без образца)'}`,
                  `    в настройке: ${drift.bound || '(без образца)'}`,
              ]),
              `  поправь образец в \`${SETTINGS_PATH}\` по объявлению гарда: тело его разбирает то, что объявлено`,
          ]
        : [];

/**
 * Разорванные связи между ресурсами.
 *
 * Печатается предупреждением и кода возврата не меняет: дерево вправе закрыть требование своим
 * средством. Но и молчать нельзя — дерево, выбравшее паттерн без хука, которым тот живёт,
 * выглядит исправным, а расходится с пакетом на целую волну работ.
 */
const brokenLines: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    result.broken.length
        ? [
              `требования ресурсов, оставшиеся без ответа: ${result.broken.length}`,
              ...result.broken.map(
                  (link: IBrokenLink): string => `  ${link.id} — требует ${link.requires}: ${link.unknown ? 'нет в пакете' : NOT_CHOSEN}`
              ),
              '  это предупреждение, а не отказ: требование закрывается своим средством дерева либо выбором ресурса',
          ]
        : [];

/**
 * Строки отказа, которые ничего не снимают.
 *
 * Названы вместе с тем, из-за чего стали лишними: «строка ни на что не влияет» без этого читается
 * как промах в имени, и дерево идёт искать опечатку там, где её нет.
 */
const idleLines: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    result.idle.length
        ? [
              `строк отказа, которые ничего не снимают: ${result.idle.length}`,
              ...result.idle.map((one: IIdleSkip): string => {
                  const why: string = one.by ? 'снято отказом от ' + one.by : 'нет в пакете';

                  return `  ${one.id} — ${why}`;
              }),
              '  это предупреждение, а не отказ: строки убирает дерево, и раскладка идёт дальше',
          ]
        : [];

/**
 * Разложенное раньше, а теперь снятое каскадом.
 *
 * Отдельно от брошенного: от брошенного дерево отказалось само и знает, где искать причину, а
 * снятое каскадом ушло вслед за родителем — в отказе его имени нет и не будет.
 */
const cutOnDiskLines: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    result.cutOnDisk.length
        ? [
              `лежит от ресурсов, снятых вслед за родителем: ${result.cutOnDisk.length}`,
              ...result.cutOnDisk.map(
                  (one: ICutFound): string => `  ${one.path} — снят вслед за ${one.cut.parent}, отвергнут ${one.cut.root}`
              ),
              '  их не стирает никто: убирать вручную, как и брошенные',
          ]
        : [];

/**
 * Названное выбором, чего дерево всё равно не получит.
 *
 * Молчать здесь нельзя вдвойне: дерево не просто осталось без ресурса — оно попросило его
 * поимённо и прочло бы отсутствие как промах раскладки.
 */
const namedCutLines: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    result.namedCut.length
        ? [
              `названо выбором, но не приедет: ${result.namedCut.length}`,
              ...result.namedCut.map((one: ICascadeCut): string => `  ${one.id} — снято вслед за ${one.parent}, отвергнут ${one.root}`),
              '  это предупреждение, а не отказ: возьми родителя в выбор либо убери потомка из него',
          ]
        : [];

/**
 * Файлы ресурсов, ушедших из набора.
 *
 * Названы отдельно от брошенных: брошенный ресурс в наборе есть и вернётся, если дерево его
 * выберет, а снятый не вернётся никогда — и правило, по которому агент работает, у него
 * последнее.
 */
const retiredLines: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    result.retired.length
        ? [
              `в дереве лежат файлы ресурсов, которых в пакете больше нет: ${result.retired.length}`,
              ...result.retired.map((one: IRetiredFound): string => `  ${one.path} — снят в v${one.since}: ${one.why}`),
              '  убирает их дерево: в чужие файлы пакет не пишет',
          ]
        : [];

/**
 * Надстройка, которой в пакете ничего не отвечает: она не применена, и молчание об этом читается
 * как «всё применено».
 */
const strayLines: (result: ISyncResult) => string[] = (result: ISyncResult): string[] =>
    result.strayOverrides.length
        ? [
              `надстроек, не подобранных ни к одному ресурсу: ${result.strayOverrides.length}`,
              ...result.strayOverrides.map((id: string): string => `  ${join(OVERRIDES_DIR, id)} — применена не была`),
              '  подбор идёт по идентификатору ресурса целиком, вместе с приставкой свойства',
          ]
        : [];

/**
 * Предупреждения раскладки: кода возврата они не меняют и печатаются на любом её исходе.
 *
 * Иначе их не видит никто: на сошедшемся дереве проверка молчит, а удавшаяся раскладка называет
 * положенные файлы — и лишняя строка отказа, снятый каскадом файл и ушедший из набора ресурс
 * всплывали бы только там, где и без них уже красно.
 */
const warnings: (result: ISyncResult) => string[] = (result: ISyncResult): string[] => [
    ...holeWarningLines(result),
    ...brokenLines(result),
    ...idleLines(result),
    ...namedCutLines(result),
    ...retiredLines(result),
    ...cutOnDiskLines(result),
    ...abandonedLines(result),
    ...strayLines(result),
];

const describe: (result: ISyncResult) => string[] = (result: ISyncResult): string[] => [
    ...gapLines(result),
    ...unboundLines(result),
    ...driftedLines(result),
    ...warnings(result),
    ...pendingOf(result).map((entry: IPlanned): string => `  ${entry.path} — ${STATE_WORD[entry.outcome]}`),
    ...unfilled(result).map(companionLine),
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

    return names.sort(byText);
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

    const config: object = { vars: {}, layout: DEFAULT_LAYOUT, skip: [], variants, only };
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
 * Долг, добавленный этой раскладкой: статьи разложенных правил, у которых в компаньонах дерева
 * нет адреса.
 *
 * Называется он здесь, а не отдельной сверкой, ровно потому, что через день его уже не отличить
 * от накопленного: сверка видит расхождение, но не знает, чьим обновлением оно приехало.
 */
function debtLines(config: IConfig, root: string, assetsDir: string): readonly string[] {
    const found: IUnaddressed[] = [];
    for (const asset of collectAssets(config, assetsDir)) {
        if (asset.kind !== 'rules') {
            continue;
        }
        const path: string = join(root, companionPathOf(asset));
        const existing: string | null = existsSync(path) ? readFileSync(path, 'utf8') : null;
        found.push(unaddressedOf(asset.name, mergedBody(asset, root), existing));
    }

    const line: string | null = debtLine(found);
    return line === null ? [] : [line, 'адрес статье дописывается в компаньоне рядом с правилом'];
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

/**
 * Отказ, случившийся до первой записи на диск. Пусто — раскладке ничто не мешает.
 *
 * Ось без ответа отбивает раскладку целиком, а не пропускает свои ресурсы молча: правило
 * поставки бывает в трёх видах, и дерево, не назвавшее свой, осталось бы вовсе без правила
 * поставки — заметить это можно было бы только по тому, что гейт перестал его требовать.
 *
 * Незнакомое свойство — опечатка, и молчать о ней нельзя ни с одной стороны. У дерева она
 * означает, что помеченного им ресурса оно не получит вовсе; у ресурса — что он не ляжет
 * никуда и никогда, а причину в имени файла не разглядеть.
 */
/**
 * Редакция пакета, объявленная деревом: точный номер из его зависимостей либо пусто.
 *
 * Диапазон сюда не идёт вовсе. Правило зависимостей велит называть точный номер, но дерево
 * вправе объявить иначе, и отказ по диапазону отбивал бы законную раскладку: `^0.19.0` покрывает
 * и 0.19.3, и обе редакции при этом объявлены верно.
 */
function askedVersionOf(root: string, name: string): string | null {
    const path: string = join(root, 'package.json');

    if (!existsSync(path)) {
        return null;
    }

    const manifest: string = readFileSync(path, 'utf8');

    let parsed: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };

    try {
        parsed = JSON.parse(manifest) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    } catch {
        return null;
    }

    const asked: string = parsed.dependencies?.[name] ?? parsed.devDependencies?.[name] ?? '';

    return /^\d+\.\d+\.\d+$/.test(asked) ? asked : null;
}

/**
 * Отказ на расхождение редакций: раскладка кладёт установленную, а не объявленную деревом.
 *
 * Зачем отказ, а не предупреждение. Установленной остаётся редакция соседней ветки — той, где её
 * как раз поднимали, — и раскладка ложится ею целиком: в рабочем дереве оказывается две с лишним
 * сотни правленых файлов чужой работы, а разобрать, какие из них свои, стоит получаса и риска
 * потерять свою правку вместе с ними. Обратный случай тот же по цене: раскладка прежней редакцией
 * откатывает дерево назад, и тоже молча. Успешный выход у обеих редакций одинаковый, а перечень
 * положенных файлов называет файлы, а не редакцию, которой они собраны.
 *
 * Починка дешевле разбора: поставить зависимости и повторить вызов — одна команда.
 */
function versionRefusal(env: IEnvironment): IOutcomeOfCommand | null {
    if (!env.name) {
        return null;
    }

    const asked: string | null = askedVersionOf(env.root, env.name);

    if (!asked || asked === env.version) {
        return null;
    }

    return {
        code: 1,
        lines: [
            'раскладка не начата: установленная редакция не та, что объявило дерево',
            `  объявлено деревом: ${asked}`,
            `  установлено:       ${env.version}`,
            'раскладка легла бы установленной — целиком, и успешный выход у обеих редакций одинаковый',
            'поставь зависимости дерева и повтори вызов',
        ],
    };
}

function refusalBeforeSync(env: IEnvironment, config: IConfig): IOutcomeOfCommand | null {
    if (env.stale) {
        return staleRefusal(env.stale);
    }

    const mismatch: IOutcomeOfCommand | null = versionRefusal(env);
    if (mismatch) {
        return mismatch;
    }

    const unanswered: readonly IAxis[] = unansweredAxes(readAxes(env.assetsDir), config.variants);
    if (unanswered.length) {
        return { code: 1, lines: ['раскладка не начата: не выбран вид', ...axisLines(unanswered)] };
    }

    const strange: readonly string[] = strangeTraits(config, env.assetsDir);
    if (strange.length) {
        return { code: 1, lines: ['раскладка не начата: свойство дерева не объявлено пакетом', ...strange] };
    }

    return null;
}

/**
 * Надстройки, чья статья в новой редакции уже есть.
 *
 * Пометка без читателя ничего не меняет: тот, кто ставит новую версию, видит число разложенных
 * файлов и не видит, что часть надстроек стала лишней. Раскладка их называет, снимает человек:
 * пометка держит одну статью, а в раздел могли дописать и другое.
 */
function staleOverrideLines(root: string, assetsDir: string): string[] {
    const stale: readonly IOverrideMark[] = staleOverrides(root, assetsDir);

    if (!stale.length) {
        return [];
    }

    return [
        `надстройки, чья статья в пакете уже есть: ${stale.length}`,
        ...stale.map((mark: IOverrideMark): string => `  ${mark.file} · раздел «${mark.heading}» · отправлено ${mark.day}`),
        '  — раздел снимается, и дерево возвращается к пакетной формулировке',
    ];
}

/** Ответ `sync --check`: расхождения считаются, на диск не пишется ничего. */
function syncCheck(config: IConfig, root: string, version: string, assetsDir: string): IOutcomeOfCommand {
    {
        const result: ISyncResult = planSync(config, root, version, assetsDir);
        const pending: readonly IPlanned[] = pendingOf(result);
        // Незаполненный компаньон — такое же расхождение, как отставший файл: правило разложено,
        // а имён этого дерева при нём нет, и агент читает указание, которому некуда примениться.
        const empty: readonly ICompanion[] = unfilled(result);
        // Гард, которого не зовёт настройка агента, — такое же расхождение, как отставший файл:
        // он разложен, он коммитится, и по дереву его не отличить от работающего.
        // Разорванная связь в счёт расхождений не идёт: дерево вправе закрыть требование своим
        // средством, и отказ отбивал бы законную раскладку. Но и сходство её не отменяет —
        // предупреждение печатается и там, где расходиться больше нечему.
        //
        // Гард, подписанный не на то, что объявляет, идёт в счёт по той же причине и с большим
        // основанием: неподключённый хотя бы не притворяется — этот выглядит работающим, и ветка
        // его тела, ради которой всё писалось, не исполняется ни разу.
        // Незаполненная дырка в счёт не входит: она говорит о том, чего дерево ещё не описало о
        // себе, а не о расхождении разложенного с редакцией. Она печатается предупреждением —
        // и на сошедшемся дереве тоже.
        const count: number = result.gaps.length + pending.length + empty.length + result.unbound.length + result.drifted.length;
        if (!count) {
            return { code: 0, lines: [`sync --check: разложенное сходится с пакетом v${version}`, ...warnings(result)] };
        }

        return { code: 1, lines: [`sync --check: расхождений ${count}`, ...describe(result)] };
    }
}

export function sync(env: IEnvironment, check: boolean): IOutcomeOfCommand {
    const { root, version, assetsDir } = env;
    const config: IConfig | null = readConfig(root);
    if (!config) {
        return { code: 1, lines: [NO_CONFIG] };
    }

    const refusal: IOutcomeOfCommand | null = refusalBeforeSync(env, config);
    if (refusal) {
        return refusal;
    }

    if (check) {
        return syncCheck(config, root, version, assetsDir);
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

    // Раскладка удалась, и объявление легло вместе с файлами. Остаётся оно неположенным ровно
    // там, где настройку не разобрать: комментарии дерева пакет не сносит своим разбором, и
    // тогда печатается прежний готовый кусок. Код возврата в обоих случаях нулевой — файлы
    // легли, — но молчать нельзя: узнают иначе, когда что-нибудь пройдёт мимо гарда.
    return {
        code: 0,
        lines: [
            ...(result.written.length
                ? [`разложено файлов: ${result.written.length}`, ...result.written.map((path: string): string => `  ${path}`)]
                : ['всё уже разложено']),
            ...boundLines(result),
            ...(result.bound?.unreadable === false ? [] : unboundLines(result)),
            ...driftedLines(result),
            ...staleOverrideLines(root, assetsDir),
            ...debtLines(config, root, assetsDir),
            ...warnings(result),
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

/**
 * Вес разложенных правил на диске: имя правила в сумму байт его текстов.
 *
 * Считается здесь, а не в сводке: сводка разбирает наблюдения и диска не знает. Складываются все
 * `.md` папки правила — само правило, компаньон с именами дерева и всё, что дерево положило
 * рядом: загрузка правила тянет их не поодиночке, и раздельный счёт врал бы в меньшую сторону.
 *
 * Правило, которого в дереве нет, в карту не попадает вовсе. Ноль от него неотличим по числу, но
 * отличим по смыслу: не «ничего не весит», а «весить нечему».
 */
function weightsOfSkills(root: string, dir: string, names: readonly string[]): TWeights {
    const at: string = join(root, dir);
    const found: Record<string, number> = {};

    for (const name of names) {
        const folder: string = join(at, name);

        if (!existsSync(folder)) {
            continue;
        }

        found[name] = readdirSync(folder)
            .filter((file: string): boolean => file.endsWith('.md'))
            .reduce((sum: number, file: string): number => sum + statSync(join(folder, file)).size, 0);
    }

    return found;
}

/**
 * Имена гардов, разложенных в это дерево.
 *
 * Гардом считается тот, кто заявил своё имя для наблюдений строкой вверху файла. Заявка
 * добровольна и точна: хук, который своё отбитие считает сам — как гейт правил, — её не ставит и
 * в счёт отказов гардов не идёт, а отбой заявившего пишет общий хвост отказа.
 *
 * Имя берётся из заявки, а не из имени файла: в наблюдение уезжает именно оно, и разойтись этим
 * двум именам нельзя.
 *
 * Каталог спрашивается у дерева, а не у пакета: свои гарды дерева лежат в нём же и пишут
 * наблюдения наравне с пакетными — перечень от пакета не назвал бы ни одного из них.
 */
function guardsOfTree(root: string, dir: string): readonly string[] {
    const at: string = join(root, dir);

    if (!existsSync(at)) {
        return [];
    }

    const found: Set<string> = new Set();

    for (const file of readdirSync(at)) {
        const named: RegExpExecArray | null = /^RT_GUARD_NAME=([A-Za-z0-9._-]+)/m.exec(readFileSync(join(at, file), 'utf8'));

        if (named) {
            found.add(named[1]);
        }
    }

    return [...found].sort(byText);
}

/** Байты человеку: килобайтами, потому что счёт идёт на сотни тысяч и читается по одному. */
function kbOf(bytes: number): string {
    return `${Math.round(bytes / 1024)} КБ`;
}

/**
 * Строка о том, сколько отбитий пришло не на правку файла.
 *
 * Своей строкой, а не долей, выведенной читателем из разбивки по родам: гейт стоит ради правки, и
 * доля, пришедшая на команду оболочки и на браузер, говорит, сколько раз правило потребовали под
 * то, что правкой не является. Сложенная глазами из десятка строк, эта доля не складывается
 * никогда.
 *
 * Молчит, когда отбитий не было вовсе: «0 процентов» при нуле отбитий — ответ на незаданный
 * вопрос.
 */
function offFileLines(summary: ISummary): string[] {
    const total: number = summary.denials.reduce((found: number, entry: ICount): number => found + entry.count, 0);

    if (total === 0) {
        return [];
    }

    return [`  не на правке файла: ${summary.denialsOffFile} из ${total} — ${Math.round((summary.denialsOffFile / total) * 100)}%`];
}

/**
 * Исходы гейта пуша. Молчит, когда гейт не отработал ни разу за отрезок.
 *
 * Вынесено из сводки отдельной функцией не ради имени: та собирает строки одним выражением, и
 * каждая новая развилка в нём растит её сложность, за которой следит линтер.
 */
function pushGateOutcomeLines(summary: ISummary): string[] {
    if (!summary.pushGate.length) {
        return [];
    }

    const total: number = summary.pushGate.reduce((found: number, entry: ICount): number => found + entry.count, 0);

    return [
        '',
        `гейт пуша прогонял набор: ${total}`,
        ...countLines(summary.pushGate),
        '  — green зелёный набор, red красный, no-checks проверок в дереве не нашлось',
    ];
}

/** Сводка строками: загруженное, незагруженное, отбивки гейта и отказы гардов. */
function statsLines(summary: ISummary, swept: readonly string[], days: number, version: string, laidOut: number): string[] {
    return [
        `наблюдения за ${days} дн., заходов ${summary.sessions}, событий ${summary.total}`,
        ...(summary.versions.length ? [`версии пакета в записях: ${summary.versions.join(', ')}`] : []),
        '',
        `правил загружено: ${summary.loads.reduce((found: number, entry: ICount): number => found + entry.count, 0)}`,
        // Вес молчит, когда весить нечем: каталог правил не разложен или пуст. Ноль килобайт при
        // сотне загрузок читался бы как «правила ничего не стоят», а это не то же самое.
        ...(summary.bytes > 0
            ? [
                  `  весом ${kbOf(summary.bytes)}, на один заход ${kbOf(summary.bytesPerSession)}`,
                  '  — столько текста заход прочитал прежде, чем взяться за работу',
              ]
            : []),
        ...countLines(summary.loads),
        ...(summary.unused.length
            ? [
                  '',
                  `разложено и не загружено ни разу: ${summary.unused.length} из ${laidOut}`,
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
                  ...offFileLines(summary),
                  ...countLines(summary.denials),
                  ...(summary.kinds.length
                      ? ['  по роду правки:', ...countLines(summary.kinds).map((line: string): string => `  ${line}`)]
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
        ...pushGateOutcomeLines(summary),
        ...(summary.silentGuards.length
            ? [
                  '',
                  `гарды не отбивали ни разу: ${summary.silentGuards.length}`,
                  ...summary.silentGuards.map((name: string): string => `  ${name}`),
                  '  — стоял и не понадобился или стоял и не работал, по сводке это одно и то же',
              ]
            : []),
        ...(swept.length ? ['', `снято по сроку хранения (${KEEP_DAYS} дн.): ${swept.length}`] : []),
        '',
        `пакет v${version}`,
    ];
}

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
    const known: readonly string[] = laidOutSkills(config, assetsDir);
    // Вес спрашивается у дерева, а не у пакета: правило дерево могло переписать надстройкой, и
    // заход читал то, что лежит здесь, а не то, что уехало бы из пакета.
    const summary: ISummary = summarize(
        result.observations,
        known,
        days,
        weightsOfSkills(root, config.layout.rules, known),
        guardsOfTree(root, config.layout.hooks)
    );

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
        lines: statsLines(summary, result.swept, days, version, laidOutSkills(config, assetsDir).length),
    };
}

/**
 * Разделы пакета, замещённые надстройками дерева.
 *
 * Совпавший заголовок замещает раздел целиком, и всё, что пакет дописал в такой раздел новой
 * версией, пропадает молча: раскладка сходится, заголовки совпадают, а утверждений нет. Сверка
 * заголовков ловит переименование раздела, а не пополнение, и других свидетелей у потери не
 * бывает. Разбор состояния поэтому называет замещённое поимённо — это половина ответа, которую
 * машина знает и без прежней редакции; вторую половину даёт снимок, снятый до установки.
 */
function replacedLines(config: IConfig, assetsDir: string, root: string): readonly string[] {
    const replaced: readonly ICargoOverride[] = treeSnapshot(config, assetsDir, root).filter(
        (one: ICargoOverride): boolean => one.kind === 'replace'
    );

    if (replaced.length === 0) {
        return [];
    }

    return [
        `замещено надстройками разделов: ${replaced.length} — что пакет дописал в них новой версией, теряется молча`,
        ...replaced.map((one: ICargoOverride): string => `  ${one.resource} · ${one.section}`),
    ];
}

/** Зачин статьи: жирное утверждение в начале пункта — по нему статью и узнают в двух редакциях. */
const ARTICLE: RegExp = /^\s*[-*]\s+\*\*(.+?)\*\*/;

/** Заголовки статей одного раздела ресурса. Нет такого ресурса или раздела — пусто. */
function articlesOfSection(file: string, heading: string): readonly string[] {
    if (!existsSync(file)) {
        return [];
    }

    const found: ISection | undefined = parseDocument(readFileSync(file, 'utf8')).sections.find(
        (one: ISection): boolean => one.heading === heading
    );
    if (!found) {
        return [];
    }

    return found.body
        .split('\n')
        .map((line: string): RegExpMatchArray | null => ARTICLE.exec(line))
        .filter((match: RegExpMatchArray | null): match is RegExpMatchArray => match !== null)
        .map((match: RegExpMatchArray): string => match[1].trim());
}

/**
 * Статьи, дописанные новой редакцией внутрь замещённого раздела.
 *
 * Совпавший заголовок замещает раздел целиком, и дописанное пакетом пропадает молча: раскладка
 * сходится, заголовки совпадают, а утверждений нет. Прежней редакции у машины нет — но снимок
 * снимается первым же шагом подъёма версии и лежит на диске: он и подаётся доводом. Без довода
 * поведение прежнее.
 */
function addedInReplacedLines(config: IConfig, assetsDir: string, root: string, since: string): readonly string[] {
    const replaced: readonly ICargoOverride[] = treeSnapshot(config, assetsDir, root).filter(
        (one: ICargoOverride): boolean => one.kind === 'replace'
    );

    const found: string[] = [];
    for (const one of replaced) {
        // Замещение всегда несёт заголовок; проверка стоит потому, что род правки надстройки
        // объявлен одним типом на все три — у дописывания и снятия заголовка может не быть.
        const heading: string | null = one.section;
        if (heading === null) {
            continue;
        }

        const before: ReadonlySet<string> = new Set(articlesOfSection(join(since, one.resource), heading));
        for (const article of articlesOfSection(join(assetsDir, one.resource), heading)) {
            if (!before.has(article)) {
                found.push(`  ${one.resource} · ${one.section} · ${article}`);
            }
        }
    }

    if (!found.length) {
        return [`снимок прежней редакции прочитан: новая редакция в замещённые разделы ничего не дописала`];
    }

    return [`новая редакция дописала в замещённые разделы статей: ${found.length} — надстройка замещает их молча`, ...found];
}

export function doctor(env: IEnvironment, since: string = ''): IOutcomeOfCommand {
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

    // Снятое каскадом считается и называется отдельно от невыбранного: дерево его не выбирало и
    // не отвергало — оно ушло вслед за родителем, и искать его в отказе читатель пойдёт зря.
    const cuts: readonly ICascadeCut[] = cascadeCuts(catalog, config);
    const cut: ReadonlySet<string> = new Set(cuts.map((one: ICascadeCut): string => one.id));

    // Ресурс с неотвеченным требованием в «не выбрано» не идёт по той же причине, что и чужой
    // вид: дерево его не отвергало — свойства, без которого он бессмыслен, у него просто нет.
    const needing: readonly IEntryOfCatalog[] = catalog.filter(
        (entry: IEntryOfCatalog): boolean =>
            entry.needs !== null && !answersRequirement(entry.needs, config.has) && !config.skip.includes(entry.id)
    );
    const needsTrait: number = needing.length;

    // Невыбранное называется поимённо: число «не выбрано: 73» не отвечает ни на один вопрос,
    // ради которого его читают, — ни какого ресурса не хватает, ни требуется ли он соседу.
    const unchosen: readonly IEntryOfCatalog[] = catalog.filter(
        (entry: IEntryOfCatalog): boolean =>
            !isChosen(entry, config) &&
            !config.skip.includes(entry.id) &&
            foreignVariant.every((one: IEntryOfCatalog): boolean => one.id !== entry.id) &&
            needing.every((one: IEntryOfCatalog): boolean => one.id !== entry.id)
    );

    const lines: string[] = [
        `пакет v${version}, везёт ресурсов ${catalog.length}, взято ${taken}`,
        `не выбрано: ${catalog.length - taken - skipped - other - cut.size - needsTrait}, пропущено: ${skipped}, другой вид: ${other}, снято каскадом: ${cut.size}, нужно свойство: ${needsTrait}`,
        ...unchosen.map((entry: IEntryOfCatalog): string => `  не выбран: ${entry.id}`),
        ...needing.map((entry: IEntryOfCatalog): string => `  нужно свойство «${entry.needs}»: ${entry.id}`),
        ...cuts.map((one: ICascadeCut): string => {
            const root: string = one.parent === one.root ? '' : ', отвергнут ' + one.root;

            return `  снят каскадом: ${one.id} — вслед за ${one.parent}${root}`;
        }),
        ...profileLines(root, assetsDir, config),
        // Набор перед пушем — итоговый, а не пересказ умолчания: собирается он из двух файлов, и
        // прочитать сборку было нечем. Дерево, пишущее надстройку, видит здесь умолчание и не
        // дописывает повтор, а снятое надстройкой видно на разборе ветки, а не только тому, кто
        // его снял.
        ...pushGateLines(root, config.layout.defaults ?? DEFAULT_LAYOUT.defaults),
        ...localValueLines(root, assetsDir, config),
        ...replacedLines(config, assetsDir, root),
        ...(since ? addedInReplacedLines(config, assetsDir, root, since) : []),
        ...thresholdLines(root),
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
    const cutByCascade: ReadonlySet<string> = new Set(config ? cascadeCuts(catalog, config).map((one: ICascadeCut): string => one.id) : []);

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
        // Неотвеченное требование — не отказ дерева: оно этого ресурса не выбирало и не
        // отвергало, а свойства, без которого ресурс бессмыслен, у него просто нет.
        if (entry.needs !== null && !answersRequirement(entry.needs, config.has)) {
            return `${NEEDS_TRAIT}: ${entry.needs}`;
        }
        if (!isChosen(entry, config)) {
            return NOT_CHOSEN;
        }
        if (cutByCascade.has(entry.id)) {
            return CUT_BY_CASCADE;
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

/**
 * Раскладка ресурсов пакета в дерево проекта.
 *
 * Порядок один и тот же и для записи, и для проверки: собрать тело, решить судьбу файла, и
 * только потом писать. `sync --check` отличается от `sync` ровно последним шагом — иначе гейт
 * пуша проверял бы не то, что кладёт раскладка.
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { collectAssets, IAsset, targetOf } from './assets.js';
import { ICascadeCut, IIdleSkip, cascadeCuts, idleSkips, namedButCut } from './cascade.js';
import { brokenLinks, IBrokenLink, IEntryOfCatalog, IGapOfVariant, readCatalog, variantGaps } from './catalog.js';
import { ICompanion, pathOf, planCompanion } from './companion.js';
import { IConfig, OVERRIDES_DIR } from './config.js';
import {
    bindDispatch,
    bindingsOf as declaredIn,
    driftedMatchers,
    IBindResult,
    IHookBinding,
    IMatcherDrift,
    unboundHooks,
} from './hooks-map.js';
import { IPlanned, isPending, isRefusal, planFile } from './plan.js';
import { RETIRED } from './retired.js';
import { ISection, mergeDocuments, parseDocument, renderDocument } from './sections.js';
import { readStamped } from './stamp.js';
import { IRenderResult, renderVars } from './vars.js';
import { matchesVariant } from './variants.js';

export interface ISyncResult {
    readonly planned: readonly IPlanned[];
    /** Дырки без значения, по ресурсам. Непустой список — отказ: подставлять нечего. */
    readonly missing: ReadonlyMap<string, readonly string[]>;
    /** Компаньоны разложенных правил: имена этого дерева, которые пишет проект. */
    readonly companions: readonly ICompanion[];
    /**
     * Файлы, лежащие в дереве от ресурсов, от которых проект отказался.
     *
     * Отказ значит «больше не клади», а не «убери»: разложенное коммитится, рядом с правилом
     * лежит написанный проектом компаньон, и стирать это молча пакет не вправе. Но и молчать
     * нельзя — брошенный файл читается как действующее правило, и агент по нему работает.
     */
    readonly abandoned: readonly string[];
    /**
     * Ресурсы, у которых виды есть, а вида под выбор дерева нет.
     *
     * Пропустить такой ресурс молча значит разложить правило и не разложить инструмент, который
     * оно зовёт: дерево получает указание без исполнителя и узнаёт об этом, когда команда из
     * правила не находится. Поэтому непустой список — отказ раскладки наравне с дыркой без
     * значения и с файлом, который правили руками.
     */
    readonly gaps: readonly IGapOfVariant[];
    /**
     * Разложенные гарды, которых нет в настройке агента: файл лежит, а позвать его некому.
     *
     * Раскладку это не отбивает: недостающую запись она дописывает сама и говорит, что дописала.
     * Список остаётся тем, что видит планирование и сверка, — они на диск не пишут, — а также
     * деревом, чью настройку не разобрать: там запись по-прежнему делает рука.
     */
    readonly unbound: readonly IHookBinding[];
    /**
     * Гарды, подписанные не на то, что объявляют: их путь в настройке агента назван, а образец
     * вызова разошёлся с объявлением.
     *
     * Хуже неподключённого: снаружи такой гард выглядит работающим, и вызов, ради которого его
     * тело написано, до него не доходит никогда. Гейт правил так и разбирал вызовы браузера
     * веткой, которая не исполнялась ни разу.
     */
    readonly drifted: readonly IMatcherDrift[];
    /**
     * Выбранные ресурсы, чьи требования в дерево не поехали.
     *
     * Предупреждение, а не отказ: дерево вправе закрыть требование своим средством, но обязано
     * знать, что закрывает. Молчание же оставляет его исправным на вид — сверка зелена на любом
     * подмножестве, сколько бы связок ни было разорвано.
     */
    readonly broken: readonly IBrokenLink[];
    /**
     * Строки отказа, которые ничего не снимают.
     *
     * Предупреждение, а не отказ: строка становится лишней сама, обновлением пакета, без единой
     * правки в дереве. Молчание же оставляет её в настройке навсегда — ровно так список отказа и
     * дорастает до полусотни строк, ни одна из которых ни на что не влияет.
     */
    readonly idle: readonly IIdleSkip[];
    /**
     * Разложенные раньше файлы ресурсов, снятых теперь каскадом.
     *
     * Названы отдельно от брошенных: брошенное дерево отвергло само и знает об этом, а снятое
     * каскадом ушло вслед за родителем — искать причину в отказе читатель пойдёт зря.
     */
    readonly cutOnDisk: readonly ICutFound[];
    /**
     * Ресурсы, названные выбором поимённо и снятые каскадом: дерево просило их прямо.
     *
     * Предупреждение, а не отказ: выбор с потомком при невыбранном родителе — состояние
     * настройки, а не промах раскладки, и чинит его дерево у себя.
     */
    readonly namedCut: readonly ICascadeCut[];
    /** Файлы ресурсов, которых в наборе больше нет: их убирает дерево, пакет только называет. */
    readonly retired: readonly IRetiredFound[];
    readonly written: readonly string[];
    /**
     * Что запись объявления сделала с настройкой агента. `null` — раскладки не было: планирование
     * и сверка на диск не пишут вовсе.
     */
    readonly bound: IBindResult | null;
}

/** Шаблон черновика компаньона — тот же, что пакет кладёт проекту в шаблоны. */
const COMPANION_TEMPLATE: string = 'templates/implementation.md';

const read: (path: string) => string | null = (path: string): string | null => (existsSync(path) ? readFileSync(path, 'utf8') : null);

/**
 * Тело ресурса: текст пакета, поверх него надстройка проекта, и уже потом подстановка значений.
 *
 * Порядок именно такой. Надстройка тоже пишется с дырками — иначе проект, дописавший раздел про
 * свою главную ветку, зашил бы её имя в двух местах: в конфиге и в тексте.
 */
function renderAsset(asset: IAsset, config: IConfig, root: string): IRenderResult {
    const override: string | null = read(join(root, OVERRIDES_DIR, asset.id));
    const merged: string = override ? renderDocument(mergeDocuments(parseDocument(asset.text), parseDocument(override))) : asset.text;

    return renderVars(merged, config.vars);
}

/** Раздел ресурса, который надстройка дерева замещает своей редакцией. */
export interface IShadowedSection {
    /** Идентификатор ресурса, чей раздел замещён. */
    readonly id: string;
    /** Строка заголовка целиком, вместе с решётками. */
    readonly heading: string;
}

/**
 * Разделы, которые надстройки замещают у пакета.
 *
 * Слияние идёт по заголовку, и совпавший заголовок замещает раздел целиком: всё, что пакет
 * дописал в такой раздел новой редакцией, до дерева не доезжает, а раскладка при этом сходится —
 * она сравнивает разложенное с тем, что собрала сама. Читаются эти строки после подъёма версии:
 * они называют места, где пакетного текста дерево не увидит.
 */
export function shadowedSections(config: IConfig, root: string, assetsDir: string): readonly IShadowedSection[] {
    const found: IShadowedSection[] = [];

    for (const asset of collectAssets(config, assetsDir)) {
        const override: string | null = read(join(root, OVERRIDES_DIR, asset.id));
        if (!override) {
            continue;
        }

        const theirs: ReadonlySet<string> = new Set(parseDocument(asset.text).sections.map((section: ISection): string => section.heading));
        for (const section of parseDocument(override).sections) {
            if (theirs.has(section.heading)) {
                found.push({ id: asset.id, heading: section.heading });
            }
        }
    }

    return found;
}

/** Разложенный раньше файл ресурса, снятого теперь каскадом, и причина, по которой он снят. */
export interface ICutFound {
    /** Путь в дереве, где лежит файл. */
    readonly path: string;
    readonly cut: ICascadeCut;
}

/** Что дерево держит от ресурсов, которые больше не раскладываются. */
interface ILeftOnDisk {
    readonly abandoned: readonly string[];
    readonly cut: readonly ICutFound[];
}

/**
 * Что лежит в дереве от ресурсов, которые больше не раскладываются.
 *
 * Ищется по тем же правилам раскладки, что и всё остальное: путь ресурса вычисляется так, будто
 * его кладут, и проверяется, лежит ли там файл с шапкой пакета. Чужой файл на том же пути
 * брошенным не считается — его пакет не клал.
 *
 * Снятое каскадом отделяется здесь же: дерево от него не отказывалось, и, увидев его среди
 * брошенного, читатель пойдёт искать строку отказа, которой нет.
 */
function leftOnDisk(config: IConfig, root: string, assetsDir: string): ILeftOnDisk {
    const taken: ReadonlySet<string> = new Set(collectAssets(config, assetsDir).map((asset: IAsset): string => asset.id));
    const catalog: readonly IEntryOfCatalog[] = readCatalog(assetsDir);
    const cuts: Map<string, ICascadeCut> = new Map(
        cascadeCuts(catalog, config).map((one: ICascadeCut): [string, ICascadeCut] => [one.id, one])
    );

    const abandoned: string[] = [];
    const cut: ICutFound[] = [];
    for (const entry of catalog) {
        const path: string = targetOf(entry, config.layout);
        const existing: string | null = taken.has(entry.id) ? null : read(join(root, path));
        const stamped: boolean = existing !== null && readStamped(existing) !== null;

        if (!stamped || !matchesVariant(entry.variant, config.variants)) {
            continue;
        }

        const found: ICascadeCut | undefined = cuts.get(entry.id);

        if (found) {
            cut.push({ path, cut: found });
        } else {
            abandoned.push(path);
        }
    }

    return { abandoned, cut };
}

/**
 * Что лежит в дереве от ресурсов, которых в наборе больше нет.
 *
 * Брошенным такой файл не назовёт никто: брошенное ищется по каталогу пакета, а снятого в
 * каталоге нет вовсе. Поэтому его ищут по списку снятых имён — там же, где записано, почему
 * ресурс ушёл.
 */
export interface IRetiredFound {
    /** Путь в дереве, где лежит файл снятого ресурса. */
    readonly path: string;
    /** Редакция пакета, в которой ресурс снят. */
    readonly since: string;
    readonly why: string;
}

function retiredOf(config: IConfig, root: string): readonly IRetiredFound[] {
    const found: IRetiredFound[] = [];

    for (const entry of RETIRED) {
        const path: string = targetOf(entry, config.layout);
        const existing: string | null = read(join(root, path));
        if (existing !== null && readStamped(existing) !== null) {
            found.push({ path, since: entry.since, why: entry.why });
        }
    }

    return found;
}

/**
 * Что о себе говорят гарды, которые дерево берёт. Читается у ресурсов, а не у разложенных
 * файлов: карта нужна и до первой раскладки — чтобы было что вставить в настройку.
 */
function bindingsOf(config: IConfig, assetsDir: string): readonly IHookBinding[] {
    const bindings: IHookBinding[] = [];
    for (const asset of collectAssets(config, assetsDir)) {
        if (asset.kind !== 'hooks') {
            continue;
        }
        bindings.push(...declaredIn(asset.text, asset.target));
    }

    return bindings;
}

export function planSync(config: IConfig, root: string, version: string, assetsDir: string): ISyncResult {
    const planned: IPlanned[] = [];
    const missing: Map<string, readonly string[]> = new Map();
    const companions: ICompanion[] = [];
    const template: string | null = read(join(assetsDir, COMPANION_TEMPLATE));

    for (const asset of collectAssets(config, assetsDir)) {
        const rendered: IRenderResult = renderAsset(asset, config, root);
        if (rendered.missing.length) {
            missing.set(asset.id, rendered.missing);
            continue;
        }
        planned.push(
            planFile({ version, path: asset.target, asset: asset.id, rendered: rendered.text, existing: read(join(root, asset.target)) })
        );
        if (asset.kind === 'rules' && template !== null) {
            companions.push(planCompanion(asset, read(join(root, pathOf(asset))), template));
        }
    }

    const left: ILeftOnDisk = leftOnDisk(config, root, assetsDir);

    return {
        planned,
        missing,
        companions,
        abandoned: left.abandoned,
        gaps: variantGaps(readCatalog(assetsDir), config),
        unbound: unboundHooks(bindingsOf(config, assetsDir), root),
        drifted: driftedMatchers(bindingsOf(config, assetsDir), root),
        broken: brokenLinks(readCatalog(assetsDir), config),
        idle: idleSkips(readCatalog(assetsDir), config),
        cutOnDisk: left.cut,
        namedCut: namedButCut(readCatalog(assetsDir), config),
        retired: retiredOf(config, root),
        written: [],
        bound: null,
    };
}

/** Раскладка. Отказ хотя бы по одному файлу не пишет ничего: половина разложенного хуже целого. */
export function runSync(config: IConfig, root: string, version: string, assetsDir: string): ISyncResult {
    const result: ISyncResult = planSync(config, root, version, assetsDir);
    if (result.missing.size || result.gaps.length || result.planned.some((entry: IPlanned): boolean => isRefusal(entry.outcome))) {
        return result;
    }

    // Право на запуск переносится с файла в пакете. Без него гард отвечает отказом доступа, то
    // есть ненулевым кодом, а ненулевой код у гарда значит «правка отбита»: разложенный набор
    // отбивал бы подряд всё, включая сборку и тесты, и причина при этом нигде не называлась.
    const executable: ReadonlySet<string> = new Set(
        collectAssets(config, assetsDir)
            .filter((asset: IAsset): boolean => asset.executable)
            .map((asset: IAsset): string => asset.id)
    );

    const written: string[] = [];
    for (const entry of result.planned) {
        if (entry.content === null) {
            continue;
        }
        const path: string = join(root, entry.path);
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, entry.content, 'utf8');
        if (executable.has(entry.asset)) {
            chmodSync(path, 0o755);
        }
        written.push(entry.path);
    }

    // Черновик компаньона кладётся только там, где файла нет вовсе. Он без шапки и без суммы:
    // сверять в нём нечего — с первой правки проекта это его текст, а не текст пакета.
    for (const companion of result.companions) {
        if (companion.content === null) {
            continue;
        }
        const path: string = join(root, companion.path);
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, companion.content, 'utf8');
        written.push(companion.path);
    }

    // Объявление кладётся вместе с самим гардом, а не печатается просьбой вставить его рукой:
    // разложенный и никем не зовомый гард снаружи неотличим от работающего. Идёт это последним —
    // после того как файлы легли: запись, зовущая гард, которого на диске ещё нет, обещает
    // больше, чем стоит.
    const bound: IBindResult = bindDispatch(bindingsOf(config, assetsDir), root);

    return { ...result, written, bound };
}

export const pendingOf: (result: ISyncResult) => readonly IPlanned[] = (result: ISyncResult): readonly IPlanned[] =>
    result.planned.filter((entry: IPlanned): boolean => isPending(entry.outcome));

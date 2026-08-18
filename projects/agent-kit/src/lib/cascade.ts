/**
 * Каскад отказа: ресурс, чей родитель не поехал в дерево, снимается вслед за ним.
 *
 * Отдельным модулем от каталога: каталог знает, какие ресурсы бывают, а каскад — как они связаны
 * родством. Связь родителя с потомком читают двое — сверка связности пакета и сама раскладка, —
 * и оба берут её отсюда.
 */

import { frontMatterOf, IEntryOfCatalog, isChosen, ISelection } from './catalog.js';
import { TKind } from './config.js';
import { matchesVariant } from './variants.js';

/** Ресурс, снятый вслед за отвергнутым родителем. */
export interface ICascadeCut {
    readonly id: string;
    /** Ближайший родитель: у правила — его закон, у паттерна — его правило. */
    readonly parent: string;
    /**
     * Отвергнутый корень цепочки — то, что дерево действительно отвергло или не выбрало.
     * Ближайшего родителя мало: паттерн уходит вслед за правилом, которого в отказе нет, и
     * искать его там читатель пойдёт зря.
     */
    readonly root: string;
}

/** Последнее звено имени: `application/money` → `money`. Им ресурсы и ссылаются друг на друга. */
const shortNameOf: (entry: IEntryOfCatalog) => string = (entry: IEntryOfCatalog): string => entry.name.split('/').pop() ?? entry.name;

/** Взятые ресурсы одного рода. */
function chosenOfKind(catalog: readonly IEntryOfCatalog[], selection: ISelection, kind: TKind): readonly IEntryOfCatalog[] {
    return catalog.filter((entry: IEntryOfCatalog): boolean => entry.kind === kind && isChosen(entry, selection));
}

/** Короткие имена взятых ресурсов рода. */
function takenNames(catalog: readonly IEntryOfCatalog[], selection: ISelection, kind: TKind): ReadonlySet<string> {
    return new Set(chosenOfKind(catalog, selection, kind).map(shortNameOf));
}

/** Короткие имена всех ресурсов рода, взяты они или нет. */
function knownNames(catalog: readonly IEntryOfCatalog[], kind: TKind): ReadonlySet<string> {
    return new Set(catalog.filter((entry: IEntryOfCatalog): boolean => entry.kind === kind).map(shortNameOf));
}

/** Правила, снятые вслед за своим законом. Заодно называет корень цепочки для паттернов при них. */
function rulesCutByLaws(
    catalog: readonly IEntryOfCatalog[],
    selection: ISelection,
    rootByRule: Map<string, string>
): readonly ICascadeCut[] {
    const taken: ReadonlySet<string> = takenNames(catalog, selection, 'laws');
    const known: ReadonlySet<string> = knownNames(catalog, 'laws');
    const cuts: ICascadeCut[] = [];

    for (const entry of chosenOfKind(catalog, selection, 'rules')) {
        const law: string = frontMatterOf(entry.text).law;

        if (law && known.has(law) && !taken.has(law)) {
            cuts.push({ id: entry.id, parent: law, root: law });
            rootByRule.set(shortNameOf(entry), law);
        }
    }

    return cuts;
}

/** Паттерны, снятые вслед за своим правилом: либо оно не взято, либо само ушло за своим законом. */
function patternsCutByRules(
    catalog: readonly IEntryOfCatalog[],
    selection: ISelection,
    rootByRule: ReadonlyMap<string, string>
): readonly ICascadeCut[] {
    const taken: ReadonlySet<string> = takenNames(catalog, selection, 'rules');
    const known: ReadonlySet<string> = knownNames(catalog, 'rules');
    const cuts: ICascadeCut[] = [];

    for (const entry of chosenOfKind(catalog, selection, 'patterns')) {
        const rule: string = frontMatterOf(entry.text).rule;
        const standing: boolean = taken.has(rule) && !rootByRule.has(rule);

        if (rule && known.has(rule) && !standing) {
            cuts.push({ id: entry.id, parent: rule, root: rootByRule.get(rule) ?? rule });
        }
    }

    return cuts;
}

/**
 * Ресурсы, снятые каскадом: правила при невзятом законе и паттерны при невзятых правилах.
 *
 * Связь читается из вступления самого ресурса — отдельный список при пакете разошёлся бы с
 * ресурсами молча, тем же молчанием, ради которого каскад и заводится. Родитель ищется по
 * последнему звену имени: полного пути в шапке нет, потому что переезд закона между слоями
 * переписывал бы шапки всех правил при нём.
 *
 * Родителя в каталоге нет вовсе — каскад молчит: снимать не по чему, а промах в шапке судит
 * сверка связности пакета, до всякой раскладки в дереве.
 */
export function cascadeCuts(catalog: readonly IEntryOfCatalog[], selection: ISelection): readonly ICascadeCut[] {
    /** Правило, снятое законом: для паттернов при нём корнем цепочки будет этот закон. */
    const rootByRule: Map<string, string> = new Map<string, string>();
    const rules: readonly ICascadeCut[] = rulesCutByLaws(catalog, selection, rootByRule);

    return [...rules, ...patternsCutByRules(catalog, selection, rootByRule)];
}

/**
 * Ресурсы, названные выбором поимённо и всё равно снятые каскадом.
 *
 * Дерево, назвавшее правило в выборе при невыбранном законе, не получает его молча — то самое
 * молчание, ради которого каскад и заводится, только с другой стороны: там о снятии не знал тот,
 * кто ничего не просил, здесь — тот, кто попросил прямо.
 */
export function namedButCut(catalog: readonly IEntryOfCatalog[], selection: ISelection): readonly ICascadeCut[] {
    return cascadeCuts(catalog, selection).filter((one: ICascadeCut): boolean => selection.only.includes(one.id));
}

/**
 * Что ложится в дерево: прямой отбор за вычетом снятого каскадом.
 *
 * Отдельной функцией, а не внутри `isChosen`, потому что каскад знает весь каталог, а отбор —
 * один ресурс: связь родителя с потомком по одной записи не видна.
 */
export function chosenEntries(catalog: readonly IEntryOfCatalog[], selection: ISelection): readonly IEntryOfCatalog[] {
    const cut: ReadonlySet<string> = new Set(cascadeCuts(catalog, selection).map((one: ICascadeCut): string => one.id));

    return catalog.filter((entry: IEntryOfCatalog): boolean => isChosen(entry, selection) && !cut.has(entry.id));
}

/** Строка отказа, которая ничего не снимает. */
export interface IIdleSkip {
    readonly id: string;
    /** Чем названное ею уже снято: имя отвергнутого родителя, либо пусто — такого ресурса нет. */
    readonly by: string;
}

/**
 * Строки отказа, которые ничего не снимают: названное ими снято каскадом или в каталоге не
 * значится вовсе.
 *
 * Не отказ, а предупреждение: настройка, верная до обновления пакета, становится лишней сама,
 * без единой правки в дереве, и отбивать за это раскладку значило бы наказывать за вчерашнюю
 * правоту.
 *
 * Строка на ресурс чужого вида лишней не считается никогда: ею дерево гасит отказ о ресурсе,
 * у которого нет подходящего вида, — то есть работу она делает.
 */
/**
 * Корень цепочки, которой ресурс снят и без этой строки отказа. Пусто — каскад его не трогает.
 *
 * Каскад считается от отбора без самой строки: иначе снятое ею читалось бы как снятое родителем,
 * и лишней оказалась бы любая строка отказа подряд.
 */
function cutParentOf(catalog: readonly IEntryOfCatalog[], selection: ISelection, id: string): string | null {
    const without: ISelection = { ...selection, skip: selection.skip.filter((one: string): boolean => one !== id) };
    const cut: ICascadeCut | undefined = cascadeCuts(catalog, without).find((one: ICascadeCut): boolean => one.id === id);

    return cut ? cut.root : null;
}

export function idleSkips(catalog: readonly IEntryOfCatalog[], selection: ISelection): readonly IIdleSkip[] {
    const idle: IIdleSkip[] = [];

    for (const id of selection.skip) {
        const entry: IEntryOfCatalog | undefined = catalog.find((one: IEntryOfCatalog): boolean => one.id === id);

        if (!entry) {
            idle.push({ id, by: '' });
        } else if (matchesVariant(entry.variant, selection.variants)) {
            const by: string | null = cutParentOf(catalog, selection, id);

            if (by !== null) {
                idle.push({ id, by });
            }
        } else {
            // Строка на ресурс чужого вида работу делает: ею дерево гасит отказ о ресурсе, у
            // которого подходящего вида нет
        }
    }

    return idle;
}

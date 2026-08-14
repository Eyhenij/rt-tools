/**
 * Целостность самих ресурсов пакета: у правила есть закон, у паттерна — правило.
 *
 * Проверка нужна не проекту, а пакету. Закон переименовали, а `law:` у правила осталось
 * прежним — раскладка от этого не падает: она кладёт файлы, а не читает их шапки. Промах уезжает
 * к проектам, и находит его тот, кто пошёл за законом по ссылке из правила и не нашёл его.
 *
 * Разбирается только вступление между `---`: остальное в файле — проза, и `law:` посреди неё
 * означает пример, а не объявление.
 */
import { frontMatterOf, IEntryOfCatalog, IFrontMatter } from './catalog.js';
import { TKind } from './config.js';

export { frontMatterOf, IFrontMatter };

/** Расхождение в ресурсах пакета: кто ссылается, на что и чего не нашлось. */
export interface IBrokenLink {
    readonly id: string;
    readonly field: 'law' | 'rule';
    readonly wanted: string;
}

/**
 * Ссылки шапок, которым в каталоге ничего не отвечает.
 *
 * Закон ищется по короткому имени: слой в ссылке не отражается, и переезд закона между слоями
 * шапок правил не переписывает — так же, как этого не делают ни таблицы законов, ни спеки.
 */
export function brokenLinks(catalog: readonly IEntryOfCatalog[]): readonly IBrokenLink[] {
    const shortOf: (entry: IEntryOfCatalog) => string = (entry: IEntryOfCatalog): string => entry.name.split('/').pop() ?? entry.name;
    const laws: ReadonlySet<string> = new Set(catalog.filter((entry: IEntryOfCatalog): boolean => entry.kind === 'laws').map(shortOf));
    const rules: ReadonlySet<string> = new Set(catalog.filter((entry: IEntryOfCatalog): boolean => entry.kind === 'rules').map(shortOf));

    const broken: IBrokenLink[] = [];
    for (const entry of catalog) {
        if (entry.kind !== 'rules' && entry.kind !== 'patterns') {
            continue;
        }
        const head: IFrontMatter = frontMatterOf(entry.text);
        if (entry.kind === 'rules' && !laws.has(head.law)) {
            broken.push({ id: entry.id, field: 'law', wanted: head.law });
        }
        if (entry.kind === 'patterns' && !rules.has(head.rule)) {
            broken.push({ id: entry.id, field: 'rule', wanted: head.rule });
        }
    }

    return broken;
}

/** Род и короткое имя, под которым в наборе лежит больше одного ресурса. */
export interface IAmbiguousName {
    readonly kind: TKind;
    /** Последнее звено имени — то, чем ресурсы ссылаются друг на друга. */
    readonly name: string;
    readonly ids: readonly string[];
}

/** Ресурсы, сошедшиеся на одном коротком имени, вместе с полными именами, которыми они зовутся. */
interface INamedGroup {
    readonly kind: TKind;
    readonly name: string;
    readonly ids: string[];
    readonly names: Set<string>;
}

/**
 * Ресурсы одного рода с одинаковым последним звеном имени.
 *
 * Связь потомка с родителем ищется по этому звену — и полного пути в шапке нет намеренно, чтобы
 * переезд закона между слоями не переписывал шапки всех правил при нём. Два закона с именем
 * `access` в разных слоях делают такую ссылку двусмысленной: каскад снял бы потомков не того
 * родителя, и молча — оба имени существуют, и промахом ни одно из них не выглядит.
 *
 * Судится здесь, до всякой раскладки в дереве: набор с двусмысленным именем неисправен сам, у
 * любого потребителя разом.
 *
 * Виды одного ресурса двусмысленности не дают: у них совпадает не только последнее звено, но и
 * имя целиком, и ссылка при них указывает на один ресурс — тот, чей вид выбрало дерево.
 */
export function ambiguousNames(catalog: readonly IEntryOfCatalog[]): readonly IAmbiguousName[] {
    const found: Map<string, INamedGroup> = new Map<string, INamedGroup>();
    for (const entry of catalog) {
        const short: string = entry.name.split('/').pop() ?? entry.name;
        const key: string = `${entry.kind} ${short}`;
        const group: INamedGroup = found.get(key) ?? { kind: entry.kind, name: short, ids: [], names: new Set<string>() };
        group.ids.push(entry.id);
        group.names.add(entry.name);
        found.set(key, group);
    }

    return [...found.values()]
        .filter((group: INamedGroup): boolean => group.names.size > 1)
        .map((group: INamedGroup): IAmbiguousName => ({ kind: group.kind, name: group.name, ids: group.ids }));
}

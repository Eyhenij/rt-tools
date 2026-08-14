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

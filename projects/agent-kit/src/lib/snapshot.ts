/**
 * Снимок надстроек и невыбранное: что дерево сделало с текстом пакета.
 *
 * Снимок — состояние, а не событие: он берётся раскладкой в момент запроса, а не собирается по
 * записям о том, когда надстройку завели. История «когда завели» не меняет ни одного решения —
 * надстройка живёт месяцами, — а событие при раскладке завело бы второй источник той же правды.
 *
 * Наружу уезжают ресурс, раздел и род правки, но не содержимое: текст дописанного пишет дерево
 * само, и в нём стоят его домены, пути и имена — то самое, чего наблюдение не выносит наружу ни
 * при каких событиях. Заголовок своего раздела не уезжает тоже: заголовок раздела пакета
 * одинаков везде, где стоит слой правил, а придуманный деревом — его слова.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { collectAssets, IAsset } from './assets.js';
import { ICargoOverride } from './cargo.js';
import { chosenEntries } from './cascade.js';
import { IEntryOfCatalog, readCatalog } from './catalog.js';
import { IConfig, OVERRIDES_DIR, SKILL_KINDS } from './config.js';
import { IDocument, ISection, parseDocument } from './sections.js';

/** Имена скилов, разложенных в это дерево: правила, паттерны и скилы без закона. */
export function laidOutSkills(config: IConfig, assetsDir: string): readonly string[] {
    return collectAssets(config, assetsDir)
        .filter((asset: IAsset): boolean => SKILL_KINDS.includes(asset.kind))
        .map((asset: IAsset): string => asset.name);
}

/**
 * Имена всех ресурсов, которые дерево взяло у пакета: правил, паттернов, гардов, проверок.
 *
 * По ним отбирается то, что уезжает счётчиками. Имя, которого пакет не знает, принадлежит
 * правилу самого дерева — а имена своих правил дерево придумывает по своим доменам и по себе
 * самому, и в сводке, которую читает пакет, им делать нечего.
 */
export function packagedNames(config: IConfig, assetsDir: string): ReadonlySet<string> {
    return new Set(collectAssets(config, assetsDir).map((asset: IAsset): string => asset.name));
}

/**
 * Правки надстройки над одним ресурсом.
 *
 * Три случая слияния — те же, что и при раскладке: совпавший заголовок замещает раздел пакета,
 * новый дописывается, пустой снимает пакетный. Четвёртый — новый заголовок с пустым телом —
 * правкой не считается: слияние его отбрасывает, и снимок обязан говорить то же самое.
 */
export function overridesOf(resource: string, packaged: string, override: string): ICargoOverride[] {
    const base: IDocument = parseDocument(packaged);
    const own: IDocument = parseDocument(override);
    const headings: ReadonlySet<string> = new Set(base.sections.map((section: ISection): string => section.heading));

    return own.sections
        .filter((section: ISection): boolean => headings.has(section.heading) || Boolean(section.body))
        .map((section: ISection): ICargoOverride => {
            if (!headings.has(section.heading)) {
                return { resource, section: null, kind: 'append' };
            }

            return { resource, section: section.heading, kind: section.body ? 'replace' : 'drop' };
        });
}

/** Что дерево держит поверх текста пакета — по всем ресурсам, которые оно разложило. */
export function treeSnapshot(config: IConfig, assetsDir: string, root: string): ICargoOverride[] {
    return chosenEntries(readCatalog(assetsDir), config).flatMap((entry: IEntryOfCatalog): ICargoOverride[] => {
        const path: string = join(root, OVERRIDES_DIR, entry.id);

        return existsSync(path) ? overridesOf(entry.id, entry.text, readFileSync(path, 'utf8')) : [];
    });
}

/**
 * Ресурсы пакета, которых дерево не разложило вовсе.
 *
 * Отказ дерева от ресурса — такой же ответ о тексте пакета, как правка его раздела: без
 * невыбранного мёртвый ресурс неотличим от того, о котором дерево не знало.
 */
export function unpickedOf(config: IConfig, assetsDir: string): string[] {
    const catalog: readonly IEntryOfCatalog[] = readCatalog(assetsDir);
    const taken: ReadonlySet<string> = new Set(chosenEntries(catalog, config).map((entry: IEntryOfCatalog): string => entry.id));

    return catalog.filter((entry: IEntryOfCatalog): boolean => !taken.has(entry.id)).map((entry: IEntryOfCatalog): string => entry.id);
}

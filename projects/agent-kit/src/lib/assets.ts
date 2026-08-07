/**
 * Что из везомого пакетом взял этот проект и куда оно ложится.
 *
 * Полный набор читает `catalog.ts`, здесь из него остаётся выбранное. Разделено потому, что
 * выбирать приходится раньше, чем раскладывать: `init` спрашивает, какие законы взять, а `list`
 * показывает и то, от чего проект отказался, — обоим нужен набор до отбора.
 */
import { join } from 'node:path';

import { IEntryOfCatalog, isChosen, readCatalog } from './catalog.js';
import { IConfig, SKILL_FILE, SKILL_KINDS, TKind } from './config.js';

export interface IAsset {
    /** Идентификатор: `laws/delivery.md`. Он же путь надстройки и ключ в `only` и `skip`. */
    readonly id: string;
    readonly kind: TKind;
    /** Имя без рода и расширения: `delivery`. У скила — имя каталога, которым его зовут. */
    readonly name: string;
    readonly text: string;
    /** Путь в дереве проекта, куда ресурс ложится. */
    readonly target: string;
}

/**
 * Куда ложится ресурс. Скил читается агентом как `<имя>/SKILL.md`, и другого имени у него быть
 * не может: файл, названный по ресурсу, агент не найдёт вовсе. Остальные роды ложатся файлом.
 */
export function targetOf(entry: IEntryOfCatalog, layout: Readonly<Record<TKind, string>>): string {
    return SKILL_KINDS.includes(entry.kind)
        ? join(layout[entry.kind], entry.name, SKILL_FILE)
        : join(layout[entry.kind], entry.id.slice(entry.kind.length + 1));
}

export function collectAssets(config: IConfig, assetsDir: string): readonly IAsset[] {
    return readCatalog(assetsDir)
        .filter((entry: IEntryOfCatalog): boolean => isChosen(entry, config.only, config.skip))
        .map((entry: IEntryOfCatalog): IAsset => ({
            id: entry.id,
            kind: entry.kind,
            name: entry.name,
            text: entry.text,
            target: targetOf(entry, config.layout),
        }));
}

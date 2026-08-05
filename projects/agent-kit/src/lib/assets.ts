/**
 * Что из везомого пакетом взял этот проект и куда оно ложится.
 *
 * Полный набор читает `catalog.ts`, здесь из него остаётся выбранное. Разделено потому, что
 * выбирать приходится раньше, чем раскладывать: `init` спрашивает, какие законы взять, а `list`
 * показывает и то, от чего проект отказался, — обоим нужен набор до отбора.
 */
import { join } from 'node:path';

import { IEntryOfCatalog, isChosen, readCatalog } from './catalog.js';
import { IConfig, TKind } from './config.js';

export interface IAsset {
    /** Идентификатор: `laws/delivery.md`. Он же путь надстройки и ключ в `only` и `skip`. */
    readonly id: string;
    readonly kind: TKind;
    readonly text: string;
    /** Путь в дереве проекта, куда ресурс ложится. */
    readonly target: string;
}

export function collectAssets(config: IConfig, assetsDir: string): readonly IAsset[] {
    return readCatalog(assetsDir)
        .filter((entry: IEntryOfCatalog): boolean => isChosen(entry, config.only, config.skip))
        .map((entry: IEntryOfCatalog): IAsset => ({
            id: entry.id,
            kind: entry.kind,
            text: entry.text,
            target: join(config.layout[entry.kind], entry.id.slice(entry.kind.length + 1)),
        }));
}

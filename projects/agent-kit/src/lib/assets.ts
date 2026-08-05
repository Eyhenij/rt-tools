/**
 * Что пакет везёт и куда это ложится.
 *
 * Список ресурсов не выписан руками, а читается из каталога `assets/`: выписанный список
 * разошёлся бы с каталогом на первом же добавленном законе, и заметить это было бы нечем —
 * ресурс просто не приезжал бы к проекту.
 */
import { Dirent, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { IConfig, KINDS, TKind } from './config.js';

export interface IAsset {
    /** Идентификатор: `laws/delivery.md`. Он же путь надстройки и ключ в `skip`. */
    readonly id: string;
    readonly kind: TKind;
    readonly text: string;
    /** Путь в дереве проекта, куда ресурс ложится. */
    readonly target: string;
}

function filesOf(dir: string): readonly string[] {
    try {
        return readdirSync(dir, { withFileTypes: true })
            .filter((entry: Dirent): boolean => entry.isFile())
            .map((entry: Dirent): string => entry.name)
            .sort();
    } catch {
        return [];
    }
}

export function collectAssets(config: IConfig, root: string): readonly IAsset[] {
    const assets: IAsset[] = [];
    for (const kind of KINDS) {
        for (const name of filesOf(join(root, kind))) {
            const id: string = `${kind}/${name}`;
            if (config.skip.includes(id)) {
                continue;
            }
            assets.push({ id, kind, text: readFileSync(join(root, kind, name), 'utf8'), target: join(config.layout[kind], name) });
        }
    }

    return assets;
}

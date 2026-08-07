/**
 * Раскладка ресурсов пакета в дерево проекта.
 *
 * Порядок один и тот же и для записи, и для проверки: собрать тело, решить судьбу файла, и
 * только потом писать. `sync --check` отличается от `sync` ровно последним шагом — иначе гейт
 * пуша проверял бы не то, что кладёт раскладка.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { collectAssets, IAsset } from './assets.js';
import { ICompanion, pathOf, planCompanion } from './companion.js';
import { IConfig, OVERRIDES_DIR } from './config.js';
import { IPlanned, isPending, isRefusal, planFile } from './plan.js';
import { mergeDocuments, parseDocument, renderDocument } from './sections.js';
import { IRenderResult, renderVars } from './vars.js';

export interface ISyncResult {
    readonly planned: readonly IPlanned[];
    /** Дырки без значения, по ресурсам. Непустой список — отказ: подставлять нечего. */
    readonly missing: ReadonlyMap<string, readonly string[]>;
    /** Компаньоны разложенных правил: имена этого дерева, которые пишет проект. */
    readonly companions: readonly ICompanion[];
    readonly written: readonly string[];
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
            planFile({ path: asset.target, asset: asset.id, version, rendered: rendered.text, existing: read(join(root, asset.target)) })
        );
        if (asset.kind === 'rules' && template !== null) {
            companions.push(planCompanion(asset, read(join(root, pathOf(asset))), template));
        }
    }

    return { planned, missing, companions, written: [] };
}

/** Раскладка. Отказ хотя бы по одному файлу не пишет ничего: половина разложенного хуже целого. */
export function runSync(config: IConfig, root: string, version: string, assetsDir: string): ISyncResult {
    const result: ISyncResult = planSync(config, root, version, assetsDir);
    if (result.missing.size || result.planned.some((entry: IPlanned): boolean => isRefusal(entry.outcome))) {
        return result;
    }

    const written: string[] = [];
    for (const entry of result.planned) {
        if (entry.content === null) {
            continue;
        }
        const path: string = join(root, entry.path);
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, entry.content, 'utf8');
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

    return { ...result, written };
}

export const pendingOf: (result: ISyncResult) => readonly IPlanned[] = (result: ISyncResult): readonly IPlanned[] =>
    result.planned.filter((entry: IPlanned): boolean => isPending(entry.outcome));

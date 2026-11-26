import { IRtIcon } from '@rt-tools/ui-kit-v2/core';

/**
 * Имена кита, у которых в наборе `material` лежит свой рисунок. Остальные имена набор берёт из
 * набора `kit`. Перечень равен папке `assets/icons-material`: это держит `tools/check-icon-map.mjs`.
 */
export const RT_ICON_MATERIAL_NAMES: ReadonlyArray<IRtIcon.Name> = [
    'arrow-left',
    'arrow-right',
    'arrows',
    'ban',
    'bars',
    'bookmark',
    'chart-bar',
    'chart-line',
    'chat-error',
    'check',
    'chevron-down',
    'chevron-left',
    'chevron-right',
    'close',
    'cloud-upload',
    'cog',
    'collapse-all',
    'comment',
    'copy',
    'ellipsis-h',
    'ellipsis-v',
    'email',
    'equals',
    'expand-all',
    'external-link',
    'eye',
    'eye-slash',
    'flag',
    'folder',
    'fork-spoon',
    'fullscreen',
    'history',
    'home',
    'ico-download',
    'ico-exit',
    'ico-plus',
    'ico-sun',
    'ico-user',
    'info-circle',
    'layers',
    'minus',
    'moon',
    'pencil',
    'pin',
    'refresh',
    'search',
    'search-plus',
    'sparkle',
    'star',
    'sync',
    'table',
    'tag',
    'th-large',
    'thumb-down',
    'thumb-up',
    'trash',
    'trash-x',
    'troubleshoot',
    'undo',
    'user',
    'user-off',
    'window-minimize',
];

/** Набор значков: папка рисунков с именами кита по своему адресу. */
export interface IRtIconSet {
    readonly name: string;
    /** Адрес, по которому приложение публикует рисунки набора. */
    readonly url: string;
    /** Запасной набор — откуда берётся недостающий рисунок. У набора `kit` его нет. */
    readonly fallback?: string;
    /** Имена со своим рисунком. Набор без перечня считается полным. */
    readonly names?: ReadonlyArray<IRtIcon.Name>;
    /** Есть ли у набора залитые рисунки `<имя>.fill.svg`. */
    readonly fill?: boolean;
}

/** Наборы, которые кит объявляет сам. */
export const rtIconBuiltInSets: ReadonlyArray<IRtIconSet> = [
    { name: 'kit', url: '/icons' },
    { name: 'material', url: '/icons-material', fallback: 'kit', names: RT_ICON_MATERIAL_NAMES, fill: true },
];

export const iconMaterialDrawn: ReadonlySet<IRtIcon.Name> = new Set<IRtIcon.Name>(RT_ICON_MATERIAL_NAMES);

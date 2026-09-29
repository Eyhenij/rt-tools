import { isRecord } from '@rt-tools/utils';

import { clampSideMenuWidth } from './rt-side-menu.logic';
import { IRtSideMenu } from './rt-side-menu.model';

/** Номер меню, которому приложение своего не задало. */
export const RT_SIDE_MENU_DEFAULT_ID: string = 'main';

/**
 * Номер меню, под которым лежат его настройки. Пустой — тот же, что не заданный: атрибут без
 * значения даёт пустую строку, и настройки легли бы под ключ, которого никто не называл.
 */
export function normalizeSideMenuId(menuId: string | null | undefined): string {
    return menuId?.trim() || RT_SIDE_MENU_DEFAULT_ID;
}

/** Запись хранилища как есть: номер меню — и что под ним лежит, в том числе сломанное. */
export type TRtSideMenuSettingsRecord = Record<string, unknown>;

function isSubMenuMode(value: unknown): value is IRtSideMenu.SubMenuMode {
    return value === 'hover' || value === 'pinned';
}

/**
 * Настройки одного меню из того, что лежит под его номером. Недопустимое поле читается как
 * отсутствие значения, соседние поля остаются: сломанная ширина не стирает режим. Незнакомые поля
 * не удаляются. Ширина приводится к пределам подменю.
 */
export function normalizeSideMenuSettings(value: unknown): IRtSideMenu.Settings {
    if (!isRecord(value)) {
        return {};
    }

    const settings: IRtSideMenu.Settings = { ...value };
    const width: unknown = value['subMenuWidth'];

    if (!isSubMenuMode(value['subMenuMode'])) {
        delete settings.subMenuMode;
    }

    if (typeof width === 'number' && Number.isFinite(width)) {
        settings.subMenuWidth = clampSideMenuWidth(width);
    } else {
        delete settings.subMenuWidth;
    }

    return settings;
}

/**
 * Настройки всех меню из записи. Меню, чьё значение не объект, пропускается: сломанный угол одного
 * меню не стирает соседние.
 */
export function readSideMenuSettings(record: TRtSideMenuSettingsRecord): Record<string, IRtSideMenu.Settings> {
    return Object.fromEntries(
        Object.entries(record)
            .filter(([, settings]: [string, unknown]): boolean => isRecord(settings))
            .map(([menuId, settings]: [string, unknown]): [string, IRtSideMenu.Settings] => [menuId, normalizeSideMenuSettings(settings)])
    );
}

/**
 * Запись с правкой полей одного меню. Остальные меню и поля уходят такими, какими лежали, даже
 * сломанные: кит правит только то, о чём его попросили.
 */
export function patchSideMenuSettings(
    record: TRtSideMenuSettingsRecord,
    menuId: string,
    patch: Partial<IRtSideMenu.Settings>
): TRtSideMenuSettingsRecord {
    const current: unknown = record[menuId];

    return { ...record, [menuId]: { ...(isRecord(current) ? current : {}), ...patch } };
}

/** Запись без настроек одного меню. */
export function omitSideMenuSettings(record: TRtSideMenuSettingsRecord, menuId: string): TRtSideMenuSettingsRecord {
    return Object.fromEntries(Object.entries(record).filter(([id]: [string, unknown]): boolean => id !== menuId));
}

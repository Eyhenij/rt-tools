import { isRecord } from '@rt-tools/utils';
import { ISideMenu } from '../side-menu.types';
import { clampSubMenuWidth } from '../side-menu.logic';
import { normalizeFavorites } from '../favorites/favorites.logic';

/**
 * Ключ настроек бокового меню в хранилище.
 *
 * Назван приставкой кита: хранилище браузера общее на весь адрес, и короткое имя столкнулось бы с
 * ключом потребителя молча. Под ключом — один объект, в нём настройки каждого меню под его номером.
 */
export const SIDE_MENU_SETTINGS_KEY: string = 'rtui-side-menu';

/** Номер меню, которому приложение своего не задало. */
export const DEFAULT_MENU_ID: string = 'default';

/**
 * Номер меню, под которым лежат его настройки. Пустой — тот же, что не заданный: атрибут без значения
 * даёт пустую строку, и настройки легли бы под ключ, которого никто не называл.
 */
export function normalizeMenuId(menuId: string | null | undefined): string {
    return menuId?.trim() || DEFAULT_MENU_ID;
}

/** Запись хранилища как есть: номер меню — и что под ним лежит, в том числе сломанное. */
export type TSideMenuSettingsRecord = Record<string, unknown>;

function isSubMenuMode(value: unknown): value is ISideMenu.SubMenuMode {
    return value === 'hover' || value === 'pinned';
}

/**
 * Настройки одного меню из того, что лежит под его номером.
 *
 * Недопустимое поле читается как отсутствие значения, соседние поля остаются: сломанная ширина не
 * стирает избранное. Незнакомые поля не удаляются — их положило приложение или следующая версия
 * кита. Список избранного очищается так же, как при записи: остаются строки и числа, повтор
 * отбрасывается, `1` и `'1'` — разные номера. Ширина приводится к пределам подменю.
 */
export function normalizeSettings(value: unknown): ISideMenu.Settings {
    if (!isRecord(value)) {
        return {};
    }

    const settings: ISideMenu.Settings = { ...value };
    const favorites: unknown = value['favorites'];
    const width: unknown = value['subMenuWidth'];

    if (Array.isArray(favorites)) {
        settings.favorites = normalizeFavorites(favorites);
    } else {
        delete settings.favorites;
    }

    if (!isSubMenuMode(value['subMenuMode'])) {
        delete settings.subMenuMode;
    }

    if (typeof width === 'number' && Number.isFinite(width)) {
        settings.subMenuWidth = clampSubMenuWidth(width);
    } else {
        delete settings.subMenuWidth;
    }

    return settings;
}

/**
 * Запись хранилища как объект. Не JSON, не объект, пустое хранилище — одинаково пустая запись.
 */
export function parseSettingsRecord(raw: string | null): TSideMenuSettingsRecord {
    if (raw === null) {
        return {};
    }

    try {
        const value: unknown = JSON.parse(raw);

        return isRecord(value) ? value : {};
    } catch {
        return {};
    }
}

/**
 * Настройки всех меню из записи. Меню, чьё значение не объект, пропускается, остальные читаются:
 * сломанный угол одного меню не стирает соседние.
 */
export function readSettings(record: TSideMenuSettingsRecord): Record<string, ISideMenu.Settings> {
    return Object.fromEntries(
        Object.entries(record)
            .filter(([, settings]: [string, unknown]): boolean => isRecord(settings))
            .map(([menuId, settings]: [string, unknown]): [string, ISideMenu.Settings] => [menuId, normalizeSettings(settings)])
    );
}

/** Настройки всех меню прямо из строки хранилища. */
export function parseSettings(raw: string | null): Record<string, ISideMenu.Settings> {
    return readSettings(parseSettingsRecord(raw));
}

/**
 * Запись с правкой полей одного меню.
 *
 * Остальные меню и остальные поля того же меню уходят такими, какими лежали, даже сломанные: кит
 * правит только то, о чём его попросили.
 */
export function patchSettings(
    record: TSideMenuSettingsRecord,
    menuId: string,
    patch: Partial<ISideMenu.Settings>
): TSideMenuSettingsRecord {
    const current: unknown = record[menuId];

    return { ...record, [menuId]: { ...(isRecord(current) ? current : {}), ...patch } };
}

/** Запись без настроек одного меню. */
export function omitSettings(record: TSideMenuSettingsRecord, menuId: string): TSideMenuSettingsRecord {
    return Object.fromEntries(Object.entries(record).filter(([id]: [string, unknown]): boolean => id !== menuId));
}

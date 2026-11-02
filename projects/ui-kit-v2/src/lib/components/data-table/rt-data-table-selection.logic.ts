import {
    rtAllOnPage,
    rtAnyOnPage,
    rtKeysOf,
    rtPresetEntities,
    rtWithEntity,
    rtWithoutPageEntities,
    rtWithPageEntities,
} from '@rt-tools/ui-kit-v2/table-core';

// Выбор строк считает ядро таблиц; здесь — прежние имена, которые таблица уже отдавала приложениям.

/** Ключи записей списка. */
export function dataTableKeysOf<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    entities: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): Array<ENTITY_TYPE[KEY]> {
    return rtKeysOf(entities, keyExp);
}

/** Записи страницы, добавленные к отмеченным; повторов не будет. */
export function dataTableWithPageEntities<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    selected: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    return rtWithPageEntities(selected, page, keyExp);
}

/** Отмеченные без записей страницы. */
export function dataTableWithoutPageEntities<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    selected: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    return rtWithoutPageEntities(selected, page, keyExp);
}

/** Отмеченные после отметки или снятия одной записи. */
export function dataTableWithEntity<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    selected: ReadonlyArray<ENTITY_TYPE>,
    entity: ENTITY_TYPE,
    checked: boolean,
    keyExp: KEY
): ENTITY_TYPE[] {
    return rtWithEntity(selected, entity, checked, keyExp);
}

/** Хоть одна запись страницы отмечена. */
export function dataTableAnyOnPage<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    page: ReadonlyArray<ENTITY_TYPE>,
    selectedKeys: ReadonlyArray<ENTITY_TYPE[KEY]>,
    keyExp: KEY
): boolean {
    return rtAnyOnPage(page, selectedKeys, keyExp);
}

/** Отмечены все записи страницы; пустая страница у первого кита считается отмеченной целиком. */
export function dataTableAllOnPage<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    page: ReadonlyArray<ENTITY_TYPE>,
    selectedKeys: ReadonlyArray<ENTITY_TYPE[KEY]>,
    keyExp: KEY
): boolean {
    return rtAllOnPage(page, selectedKeys, keyExp);
}

/** Записи первой страницы, чьи ключи названы приложением как отмеченные заранее. */
export function dataTablePresetEntities<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    entities: ReadonlyArray<ENTITY_TYPE>,
    keys: ReadonlyArray<ENTITY_TYPE[KEY]>,
    keyExp: KEY
): ENTITY_TYPE[] {
    return rtPresetEntities(entities, keys, keyExp);
}

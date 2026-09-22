/** Ключи записей списка. */
export function dataTableKeysOf<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    entities: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): Array<ENTITY_TYPE[KEY]> {
    return entities.map((entity: ENTITY_TYPE) => entity[keyExp]);
}

/** Записи страницы, добавленные к отмеченным; повторов не будет. */
export function dataTableWithPageEntities<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    selected: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    const keys: Array<ENTITY_TYPE[KEY]> = dataTableKeysOf(selected, keyExp);

    return [...selected, ...page.filter((entity: ENTITY_TYPE) => !keys.includes(entity[keyExp]))];
}

/** Отмеченные без записей страницы. */
export function dataTableWithoutPageEntities<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    selected: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    const keys: Array<ENTITY_TYPE[KEY]> = dataTableKeysOf(page, keyExp);

    return selected.filter((entity: ENTITY_TYPE) => !keys.includes(entity[keyExp]));
}

/** Отмеченные после отметки или снятия одной записи. */
export function dataTableWithEntity<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    selected: ReadonlyArray<ENTITY_TYPE>,
    entity: ENTITY_TYPE,
    checked: boolean,
    keyExp: KEY
): ENTITY_TYPE[] {
    const without: ENTITY_TYPE[] = selected.filter((el: ENTITY_TYPE) => el[keyExp] !== entity[keyExp]);

    return checked ? [...without, entity] : without;
}

/** Хоть одна запись страницы отмечена. */
export function dataTableAnyOnPage<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    page: ReadonlyArray<ENTITY_TYPE>,
    selectedKeys: ReadonlyArray<ENTITY_TYPE[KEY]>,
    keyExp: KEY
): boolean {
    return page.some((entity: ENTITY_TYPE) => selectedKeys.includes(entity[keyExp]));
}

/** Отмечены все записи страницы; пустая страница у первого кита считается отмеченной целиком. */
export function dataTableAllOnPage<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    page: ReadonlyArray<ENTITY_TYPE>,
    selectedKeys: ReadonlyArray<ENTITY_TYPE[KEY]>,
    keyExp: KEY
): boolean {
    return page.every((entity: ENTITY_TYPE) => selectedKeys.includes(entity[keyExp]));
}

/** Записи первой страницы, чьи ключи названы приложением как отмеченные заранее. */
export function dataTablePresetEntities<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    entities: ReadonlyArray<ENTITY_TYPE>,
    keys: ReadonlyArray<ENTITY_TYPE[KEY]>,
    keyExp: KEY
): ENTITY_TYPE[] {
    return entities.filter((entity: ENTITY_TYPE) => keys.includes(entity[keyExp]));
}

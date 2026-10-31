/** Ключи записей списка. */
export function rtKeysOf<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    entities: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): Array<ENTITY_TYPE[KEY]> {
    return entities.map((entity: ENTITY_TYPE) => entity[keyExp]);
}

/** Записи страницы, добавленные к отмеченным; повторов не будет. */
export function rtWithPageEntities<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    selected: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    const keys: Array<ENTITY_TYPE[KEY]> = rtKeysOf(selected, keyExp);

    return [...selected, ...page.filter((entity: ENTITY_TYPE) => !keys.includes(entity[keyExp]))];
}

/** Отмеченные без записей страницы. */
export function rtWithoutPageEntities<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    selected: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    const keys: Array<ENTITY_TYPE[KEY]> = rtKeysOf(page, keyExp);

    return selected.filter((entity: ENTITY_TYPE) => !keys.includes(entity[keyExp]));
}

/** Отмеченные после отметки или снятия одной записи. */
export function rtWithEntity<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    selected: ReadonlyArray<ENTITY_TYPE>,
    entity: ENTITY_TYPE,
    checked: boolean,
    keyExp: KEY
): ENTITY_TYPE[] {
    const without: ENTITY_TYPE[] = selected.filter((el: ENTITY_TYPE) => el[keyExp] !== entity[keyExp]);

    return checked ? [...without, entity] : without;
}

/** Хоть одна запись страницы отмечена. */
export function rtAnyOnPage<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    page: ReadonlyArray<ENTITY_TYPE>,
    selectedKeys: ReadonlyArray<ENTITY_TYPE[KEY]>,
    keyExp: KEY
): boolean {
    return page.some((entity: ENTITY_TYPE) => selectedKeys.includes(entity[keyExp]));
}

/** Отмечены все записи страницы; пустая страница у первого кита считается отмеченной целиком. */
export function rtAllOnPage<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    page: ReadonlyArray<ENTITY_TYPE>,
    selectedKeys: ReadonlyArray<ENTITY_TYPE[KEY]>,
    keyExp: KEY
): boolean {
    return page.every((entity: ENTITY_TYPE) => selectedKeys.includes(entity[keyExp]));
}

/** Записи первой страницы, чьи ключи названы приложением как отмеченные заранее. */
export function rtPresetEntities<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    entities: ReadonlyArray<ENTITY_TYPE>,
    keys: ReadonlyArray<ENTITY_TYPE[KEY]>,
    keyExp: KEY
): ENTITY_TYPE[] {
    return entities.filter((entity: ENTITY_TYPE) => keys.includes(entity[keyExp]));
}

/** Отметки после смены страницы под «отметить все»: пришедшие строки отмечаются, кроме исключённых. */
export function rtSelectedAfterPage<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    selected: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    excluded: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    const excludedKeys: Array<ENTITY_TYPE[KEY]> = rtKeysOf(excluded, keyExp);

    return rtWithPageEntities(selected, page, keyExp).filter((entity: ENTITY_TYPE) => !excludedKeys.includes(entity[keyExp]));
}

/** Исключения после отметки или снятия одной записи под «отметить все». */
export function rtExcludedAfterEntity<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    excluded: ReadonlyArray<ENTITY_TYPE>,
    entity: ENTITY_TYPE,
    checked: boolean,
    keyExp: KEY
): ENTITY_TYPE[] {
    return rtWithEntity(excluded, entity, !checked, keyExp);
}

/** Исключения после отметки всей страницы под «отметить все»: её записи уходят из исключений. */
export function rtExcludedAfterPageMarked<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    excluded: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    return rtWithoutPageEntities(excluded, page, keyExp);
}

/** Исключения после снятия всей страницы под «отметить все»: её записи становятся исключениями. */
export function rtExcludedAfterPageUnmarked<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    excluded: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    return rtWithPageEntities(excluded, page, keyExp);
}

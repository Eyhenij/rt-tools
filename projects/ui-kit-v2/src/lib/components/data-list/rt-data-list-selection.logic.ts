import { dataTableWithEntity, dataTableWithoutPageEntities, dataTableWithPageEntities } from '../data-table/rt-data-table-selection.logic';

/** Отметки и исключения после смены страницы: пришедшие строки отмечаются, кроме исключённых. */
export function dataListSelectedAfterPage<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    selected: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    excluded: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    const excludedKeys: Array<ENTITY_TYPE[KEY]> = excluded.map((entity: ENTITY_TYPE) => entity[keyExp]);

    return dataTableWithPageEntities(selected, page, keyExp).filter((entity: ENTITY_TYPE) => !excludedKeys.includes(entity[keyExp]));
}

/** Исключения после отметки или снятия одной записи под «отметить все». */
export function dataListExcludedAfterEntity<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    excluded: ReadonlyArray<ENTITY_TYPE>,
    entity: ENTITY_TYPE,
    checked: boolean,
    keyExp: KEY
): ENTITY_TYPE[] {
    return dataTableWithEntity(excluded, entity, !checked, keyExp);
}

/** Исключения после отметки всей страницы под «отметить все»: её записи уходят из исключений. */
export function dataListExcludedAfterPageMarked<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    excluded: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    return dataTableWithoutPageEntities(excluded, page, keyExp);
}

/** Исключения после снятия всей страницы под «отметить все»: её записи становятся исключениями. */
export function dataListExcludedAfterPageUnmarked<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    excluded: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    return dataTableWithPageEntities(excluded, page, keyExp);
}

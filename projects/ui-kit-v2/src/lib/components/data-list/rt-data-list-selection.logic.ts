import {
    rtExcludedAfterEntity,
    rtExcludedAfterPageMarked,
    rtExcludedAfterPageUnmarked,
    rtSelectedAfterPage,
} from '@rt-tools/ui-kit-v2/table-core';

// «Отметить все» считает ядро таблиц; здесь — прежние имена, которые список уже отдавал приложениям.

/** Отметки и исключения после смены страницы: пришедшие строки отмечаются, кроме исключённых. */
export function dataListSelectedAfterPage<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    selected: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    excluded: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    return rtSelectedAfterPage(selected, page, excluded, keyExp);
}

/** Исключения после отметки или снятия одной записи под «отметить все». */
export function dataListExcludedAfterEntity<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    excluded: ReadonlyArray<ENTITY_TYPE>,
    entity: ENTITY_TYPE,
    checked: boolean,
    keyExp: KEY
): ENTITY_TYPE[] {
    return rtExcludedAfterEntity(excluded, entity, checked, keyExp);
}

/** Исключения после отметки всей страницы под «отметить все»: её записи уходят из исключений. */
export function dataListExcludedAfterPageMarked<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    excluded: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    return rtExcludedAfterPageMarked(excluded, page, keyExp);
}

/** Исключения после снятия всей страницы под «отметить все»: её записи становятся исключениями. */
export function dataListExcludedAfterPageUnmarked<ENTITY_TYPE, KEY extends keyof ENTITY_TYPE>(
    excluded: ReadonlyArray<ENTITY_TYPE>,
    page: ReadonlyArray<ENTITY_TYPE>,
    keyExp: KEY
): ENTITY_TYPE[] {
    return rtExcludedAfterPageUnmarked(excluded, page, keyExp);
}

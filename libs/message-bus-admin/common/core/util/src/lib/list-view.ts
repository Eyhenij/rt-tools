/**
 * Выборка в том виде, в каком её читает кит, и обратно.
 *
 * Кит говорит своими моделями — страницей и порядком, — а выборка живёт в адресе своей формой.
 * Перевод между ними лежит здесь и один на все три раздела: разложенный по экранам, он
 * расходится молча — у одного списка стрелка порядка встаёт на столбец, у другого нет.
 *
 * Функции чистые: решение о том, что уедет в адрес, проверяется без поднятого экрана.
 */
import { TPageDirection } from '@rt/message-bus-common';
import { IPageModel, ISortModel, EListSortOrder, TListSortOrderType } from '@rt-tools/utils';

import { DEFAULT_DIRECTION, IAdminListQuery } from './list-query';

/** Порядок выборки в направление кита. */
function orderOf(dir: TPageDirection): TListSortOrderType {
    return dir === 'asc' ? EListSortOrder.ASC : EListSortOrder.DESC;
}

/**
 * Страница для переключателя страниц.
 *
 * Общее число приезжает вместе со строками: без него переключатель не знает, сколько страниц, и
 * прячется на любом списке.
 */
export function pageModelOf(query: IAdminListQuery, total: number): IPageModel {
    return { pageNumber: query.page, pageSize: query.size, totalCount: total };
}

/**
 * Порядок для таблицы.
 *
 * Отдаётся ей и до первого нажатия: без этого список приезжает отсортированным, а стрелка не
 * стоит ни на одном столбце — и применённый порядок выглядит неприменённым.
 */
export function sortModelOf(query: IAdminListQuery): ISortModel<string> {
    return { propertyName: query.sort, sortDirection: orderOf(query.dir) };
}

/**
 * Порядок, названный заголовком столбца, обратно в выборку.
 *
 * Снятый порядок таблица отдаёт пустотой, и на его место встаёт умолчание раздела: список без
 * порядка приёмник всё равно отдаёт своим, и показанное разошлось бы с названным на экране.
 * Поле не из набора сортируемых отбрасывается тем же умолчанием — просить у приёмника порядок,
 * на который он отвечает отказом, незачем.
 */
export function sortAskedOf(sort: ISortModel<string> | null, sortable: readonly string[]): Pick<IAdminListQuery, 'sort' | 'dir'> {
    if (sort === null || !sortable.includes(sort.propertyName)) {
        return { sort: sortable[0] ?? '', dir: DEFAULT_DIRECTION };
    }

    return { sort: sort.propertyName, dir: sort.sortDirection === EListSortOrder.ASC ? 'asc' : 'desc' };
}

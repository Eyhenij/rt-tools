import { Signal } from '@angular/core';

import { Observable } from 'rxjs';

import { IPageModel, ISortModel } from '@rt-tools/utils';

/**
 * Что списочный экран ждёт от своего стора и что шаблон списка ждёт от экрана.
 *
 * Интерфейсы, а не классы: шаблон не должен видеть ни основы стора, ни предметной области, а
 * стор — знать про экран.
 */
export namespace IListPage {
    /**
     * Списочный стор глазами экрана. Только чтение и два действия: выборку меняет экран — он же
     * кладёт её в адрес, — а стор её принимает и перечитывает список.
     */
    export interface Store<ENTITY_TYPE extends object, SORT_PROPERTY_TYPE extends string = string> {
        entities: Signal<ENTITY_TYPE[]>;
        pageModel: Signal<IPageModel>;
        sortModel: Signal<ISortModel<SORT_PROPERTY_TYPE> | null>;

        /** Список читается: и первая загрузка, и перезапрос — на обеих таблица показывает скелетоны. */
        pending: Signal<boolean>;

        /** Идёт правка записи: гасится кнопка заведения, но не таблица. */
        busy: Signal<boolean>;

        /** Список хоть раз доехал: пустая таблица тогда означает «записей нет», а не «неизвестно». */
        loaded: Signal<boolean>;

        listFailed: Signal<boolean>;

        /** Отказ загрузки — событием: один и тот же отказ подряд обязан показаться дважды. */
        listError: Observable<string>;

        loadList(): void;
    }

    /**
     * Экран списка глазами шаблона. Шаблон рисует шапку, тулбар и переключатель страниц и зовёт
     * эти методы напрямую: иначе он отдавал бы пять событий, а каждый экран писал бы пять
     * одинаковых обработчиков.
     */
    export interface Host<ENTITY_TYPE extends object = object, SORT_PROPERTY_TYPE extends string = string> {
        store: Store<ENTITY_TYPE, SORT_PROPERTY_TYPE>;

        reload(): void;

        openCreate(): void;

        openColumnSettings(): void;

        onPageChange(pageNumber: number): void;

        onPageSizeChange(pageSize: number): void;

        /**
         * Клик по заголовку сортируемой колонки. Имя поля, а не готовая выборка: сторону
         * порядка решает экран — он один знает, какой она была до клика.
         */
        onSortChange(propertyName: string): void;
    }
}

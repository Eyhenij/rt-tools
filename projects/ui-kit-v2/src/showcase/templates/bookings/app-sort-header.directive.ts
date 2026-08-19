import { computed, Directive, inject, input, InputSignal, Signal } from '@angular/core';

import { ISortModel } from '@rt-tools/utils';

import { IListPage } from './list-page/list-page.model';
import { APP_LIST_PAGE_HOST } from './list-page/list-page.token';

/**
 * Заголовок сортируемой колонки: клик переключает порядок строк по названному полю.
 *
 * Директива, а не компонент: она вешается на ячейку шапки, которую рисует таблица кита, — а
 * компоненту разрешён только элементный селектор, и своим тегом ячейку не заменить.
 *
 * Сторон у порядка три, а не две: по возрастанию, по убыванию и «эта колонка не сортирует».
 * Третьей нет только там, где список обязан быть отсортирован хоть как-то; здесь она есть —
 * третий клик возвращает список к порядку по умолчанию.
 */
@Directive({
    selector: '[adminSortHeader]',
    host: {
        class: 'admin-sort-header',
        role: 'button',
        tabindex: '0',
        '[attr.data-direction]': 'direction()',
        '[attr.aria-sort]': 'ariaSort()',
        '(click)': 'toggle()',
        '(keydown.enter)': 'toggle()',
        '(keydown.space)': 'toggle()',
    },
})
export class AppSortHeaderDirective {
    readonly #host: IListPage.Host = inject(APP_LIST_PAGE_HOST);

    /** Сторона порядка, если сортирует эта колонка; иначе атрибута нет вовсе. */
    protected readonly direction: Signal<string | null> = computed((): string | null => {
        const sort: ISortModel<string> | null = this.#host.store.sortModel();

        return sort !== null && sort.propertyName === this.adminSortHeader() ? sort.sortDirection : null;
    });

    /** То же состояние для чтения с экрана: `data-direction` вспомогательные технологии не читают. */
    protected readonly ariaSort: Signal<string> = computed((): string => {
        const direction: string | null = this.direction();
        if (direction === null) {
            return 'none';
        }

        return direction === 'desc' ? 'descending' : 'ascending';
    });

    /** Поле, по которому сортирует эта колонка. Имя то же, что ушло бы на сервер. */
    public readonly adminSortHeader: InputSignal<string> = input.required<string>();

    protected toggle(): void {
        this.#host.onSortChange(this.adminSortHeader());
    }
}

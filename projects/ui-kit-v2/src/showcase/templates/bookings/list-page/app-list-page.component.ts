import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, InputSignalWithTransform, Signal } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { IPageModel } from '@rt-tools/utils';

import { RtIconButtonComponent } from '../../../../lib/components/icon-button/rt-icon-button.component';
import { RtPaginationComponent } from '../../../../lib/components/pagination/rt-pagination.component';
import {
    RtToolbarComponent,
    RtToolbarLeftDirective,
    RtToolbarRightDirective,
} from '../../../../lib/components/toolbar/rt-toolbar.component';
import { IListPage } from './list-page.model';
import { APP_LIST_PAGE_HOST } from './list-page.token';

/**
 * Хост в раскладке не участвует: страницу собирает блок `app-page` экрана, а этот компонент
 * только раскладывает по ней свои части.
 */
const BEM_BLOCK: string = 'app-list-page';

/**
 * Разметка списочного экрана: заголовок, тулбар, зона прокрутки с таблицей и переключатель
 * страниц.
 *
 * Таблицу экран объявляет сам и кладёт внутрь: у неё столбцы, ячейки, меню строки и карточки
 * узкого экрана — всё предметное. Обёртывать её нельзя: столбцы собираются её собственным
 * запросом по контенту, и через посредника они до неё не доходят.
 *
 * Стор шаблон не принимает входом — он находит экран по {@link APP_LIST_PAGE_HOST} и читает стор
 * у него. Иначе каждый список объявлял бы вход со стором и пять обработчиков к событиям шапки и
 * переключателя страниц.
 */
@Component({
    selector: 'app-list-page',
    templateUrl: './app-list-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        RtIconButtonComponent,
        RtPaginationComponent,
        RtToolbarComponent,
        RtToolbarLeftDirective,
        RtToolbarRightDirective,
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class AppListPageComponent {
    /** Экран, чей это список: у него шаблон берёт стор и ему же отдаёт действия. */
    protected readonly host: IListPage.Host = inject(APP_LIST_PAGE_HOST);

    protected readonly pageModel: Signal<IPageModel> = computed((): IPageModel => this.host.store.pageModel());

    protected readonly loading: Signal<boolean> = computed((): boolean => this.host.store.pending());

    protected readonly busy: Signal<boolean> = computed((): boolean => this.host.store.busy());

    /** Заголовок раздела — уже переведённый: ключи словаря знает экран, а не шаблон. */
    public readonly title: InputSignal<string> = input.required<string>();

    /** Строка под заголовком; пустая — строки нет. */
    public readonly hint: InputSignal<string> = input<string>('');

    /** Начало якорей проверки: из него собираются `qa-dataid` заголовка, кнопок и переключателя. */
    public readonly qaPrefix: InputSignal<string> = input.required<string>();

    /**
     * Подпись кнопки заведения — уже переведённая. Пустая означает, что записи в этом списке не
     * заводят: у ленты событий кнопки нет вовсе.
     */
    public readonly createLabel: InputSignal<string> = input<string>('');

    /** Настройка столбцов доступна не всякому списку: без ключа таблицы панели нет. */
    public readonly configurable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: (value: unknown): boolean => value !== false,
    });
}

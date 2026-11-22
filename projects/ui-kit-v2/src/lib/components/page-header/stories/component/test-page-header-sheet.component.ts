import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtProfileMenuComponent } from '../../../profile-menu/rt-profile-menu.component';
import { PROFILE_MENU_LOCALES } from '../../../profile-menu/stories/component/test-profile-menu.data';
import { RtPageHeaderComponent } from '../../rt-page-header.component';
import { IRtPageHeader } from '../../rt-page-header.model';

/** Чьё меню открывает история: профиль, «Ещё» или панель раздела. */
export type TPageHeaderSheetPart = 'user-menu' | 'more' | 'submenu';

/**
 * Шапка страницы в рамке телефона. Рамка шириной 375 даёт экран эскизов `Телефон · Page Header`:
 * меню профиля берёт заголовком имя пользователя, «Ещё» — свою подпись, панель раздела — подпись
 * раздела. Узкий ответ даёт история подменой службы точек перехода — с первой отрисовки. Какое меню
 * открывать, выбирает вход `part`; открывает его `play`.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-page-header-sheet',
    templateUrl: './test-page-header-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtPageHeaderComponent,
        RtProfileMenuComponent,
    ],
})
export class TestRtPageHeaderSheetComponent {
    public part: TPageHeaderSheetPart = 'user-menu';
    public sheet: boolean = true;

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;
    public readonly profileLocales: typeof PROFILE_MENU_LOCALES = PROFILE_MENU_LOCALES;
    public readonly user: IRtPageHeader.User = { name: 'Анна Смирнова', avatar: 'А' };

    /** Раздел «Справочники» с панелью второго уровня: на телефоне её пункты встают в шторку. */
    public readonly items: ReadonlyArray<IRtPageHeader.Item> = [
        { id: 'tours', label: 'Туры', route: '/tours' },
        {
            id: 'catalog',
            label: 'Справочники',
            icon: 'book',
            unread: true,
            columns: [
                {
                    id: 'left',
                    groups: [
                        {
                            id: 'geo',
                            label: 'География',
                            items: [
                                { id: 'countries', label: 'Страны', route: '/countries' },
                                { id: 'cities', label: 'Города', route: '/cities', unread: true },
                            ],
                        },
                    ],
                },
                {
                    id: 'right',
                    groups: [
                        {
                            id: 'money',
                            label: 'Финансы',
                            items: [
                                { id: 'rates', label: 'Курсы валют', route: '/rates' },
                                { id: 'taxes', label: 'Налоги', disabled: true },
                            ],
                        },
                    ],
                },
            ],
        },
        { id: 'reports', label: 'Отчёты', route: '/reports' },
    ];

    /** Разделы «Ещё»: в рамку встают не все, остальные уходят в панель, раздел с панелью — заголовком. */
    public readonly moreItems: ReadonlyArray<IRtPageHeader.Item> = [
        { id: 'tours', label: 'Туры', route: '/tours' },
        { id: 'orders', label: 'Заявки', route: '/orders', unread: true },
        { id: 'clients', label: 'Клиенты', route: '/clients' },
        { id: 'reports', label: 'Отчёты', route: '/reports', priority: -1 },
        { id: 'payments', label: 'Платежи', route: '/payments' },
        this.items[1],
    ];
}

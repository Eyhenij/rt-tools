import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { RtNotificationsBellComponent } from '../../../notifications-bell/rt-notifications-bell.component';
import { IRtPageHeader } from '../../rt-page-header.model';
import { RtPageHeaderComponent } from '../../rt-page-header.component';

/** Тема показа: кадры макета нарисованы во всю ширину окна, светлые и тёмные отдельно. */
export type TPageHeaderEndTheme = 'light' | 'dark';

/**
 * Правая группа `rt-page-header`: кнопки слота `[rtHeaderBell]` и профиль у правого края. Две
 * шапки одна под другой — с одним колокольчиком и с кнопкой помощника перед ним.
 *
 * Пары наборов и тем здесь нет нарочно: кадр сравнивается с кадром макета той же ширины окна, а
 * половина пары сузила бы шапку вдвое. Порог узкой шапки считается от окна, и половина его не
 * сдвинула бы — зато ряд разделов в половине ушёл бы в «Ещё», чего на кадре макета нет. Тёмная
 * тема — своя история с тем же составом.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-page-header-end',
    template: `
        <div class="app-page-header-end" [attr.data-theme]="theme">
            <div class="app-page-header-end__case">
                <span class="app-page-header-end__label">одна кнопка</span>
                <rt-page-header ariaLabel="Разделы" [items]="items" [user]="user">
                    <rt-notifications-bell rtHeaderBell ariaLabel="Уведомления" unreadLabel="Есть непрочитанные" unread />
                </rt-page-header>
            </div>
            <div class="app-page-header-end__case">
                <span class="app-page-header-end__label">две кнопки</span>
                <rt-page-header ariaLabel="Разделы" [items]="items" [user]="user">
                    <rt-notifications-bell rtHeaderBell icon="sparkle" ariaLabel="Помощник" />
                    <rt-notifications-bell rtHeaderBell ariaLabel="Уведомления" unreadLabel="Есть непрочитанные" unread />
                </rt-page-header>
            </div>
        </div>
    `,
    styles: `
        .app-page-header-end {
            display: flex;
            flex-direction: column;
            padding-block: var(--rt-space-4);
            background-color: var(--rt-color-bg-page);
            gap: var(--rt-space-4);
        }

        .app-page-header-end__case {
            display: flex;
            flex-direction: column;
            gap: var(--rt-space-2);
        }

        .app-page-header-end__label {
            padding-inline: var(--rt-space-4);
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-sm);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtPageHeaderComponent,
        RtNotificationsBellComponent,
    ],
})
export class TestRtPageHeaderEndComponent implements OnInit {
    readonly #router: Router = inject(Router);

    public theme: TPageHeaderEndTheme = 'light';

    public readonly user: IRtPageHeader.User = { name: 'Анна', avatar: 'А' };

    /** Разделы кадра макета: «Бронирования» и «Объекты» раскрывают панель, «Отчёты» ещё недоступны. */
    public readonly items: ReadonlyArray<IRtPageHeader.Item> = [
        { id: 'home', label: 'Главная', route: '/home', icon: 'home' },
        {
            id: 'bookings',
            label: 'Бронирования',
            icon: 'calendar',
            unread: true,
            columns: [{ id: 'all', groups: [{ id: 'list', items: [{ id: 'list-all', label: 'Все брони', route: '/bookings' }] }] }],
        },
        {
            id: 'objects',
            label: 'Объекты',
            icon: 'folder',
            columns: [{ id: 'all', groups: [{ id: 'list', items: [{ id: 'list-objects', label: 'Объекты', route: '/objects' }] }] }],
        },
        { id: 'guests', label: 'Гости', route: '/guests', icon: 'users' },
        { id: 'reports', label: 'Отчёты', icon: 'history', disabled: true },
    ];

    public ngOnInit(): void {
        // Любой адрес витрины отвечает пустым экраном, а переход на подпункт «Бронирований» делает
        // раздел активным — в кадре макета у него белая плашка.
        this.#router.resetConfig([{ path: '**', children: [] }]);
        void this.#router.navigateByUrl('/bookings', { skipLocationChange: true });
    }
}

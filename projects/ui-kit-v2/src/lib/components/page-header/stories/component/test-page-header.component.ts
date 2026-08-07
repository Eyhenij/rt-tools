import { ChangeDetectionStrategy, Component, TemplateRef } from '@angular/core';

import { RtPageHeaderComponent } from '../../rt-page-header.component';
import { IRtPageHeader } from '../../rt-page-header.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Разделы заведены правдоподобные, а не пустым массивом: с пустым полоса рисовала пустое место.
 */
@Component({
    selector: 'app-page-header',
    template: `
        <rt-page-header [items]="items" [user]="user" [userTitle]="userTitle" [userMenu]="userMenu" [ariaLabel]="ariaLabel" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtPageHeaderComponent,
    ],
})
export class TestRtPageHeaderComponent {
    public items: ReadonlyArray<IRtPageHeader.Item> = [
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
            ],
        },
        { id: 'reports', label: 'Отчёты', route: '/reports', disabled: true },
    ];
    public user: IRtPageHeader.User | null = { name: 'Иванов Иван', avatar: 'И' };
    public userTitle: string = '';
    public userMenu: TemplateRef<unknown> | null = null;
    public ariaLabel: string = '';
}

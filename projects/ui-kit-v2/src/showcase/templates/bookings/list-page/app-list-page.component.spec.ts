import { ChangeDetectionStrategy, Component, importProvidersFrom, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { TranslocoTestingModule } from '@jsverse/transloco';

import { createRtFixture } from '../../../../testing/rt-kit-testing';
import { AppListPageComponent } from './app-list-page.component';
import { AppListToolbarLeftDirective, AppListToolbarRightDirective } from './app-list-page.component';
import { IListPage } from './list-page.model';
import { APP_LIST_PAGE_HOST } from './list-page.token';

/** Экран без предметной области: шаблону нужен только договор, а стор — пустой и прочитанный. */
const HOST: IListPage.Host = {
    store: {
        entities: signal<object[]>([]),
        pageModel: signal({ pageNumber: 1, pageSize: 20, totalCount: 0 }),
        sortModel: signal(null),
        pending: signal(false),
        busy: signal(false),
        loaded: signal(true),
        listFailed: signal(false),
        listError: new Subject<string>(),
        loadList: (): void => undefined,
    },
    reload: (): void => undefined,
    openCreate: (): void => undefined,
    openColumnSettings: (): void => undefined,
    onPageChange: (): void => undefined,
    onPageSizeChange: (): void => undefined,
    onSortChange: (): void => undefined,
};

@Component({
    selector: 'app-list-page-host',
    template: `
        <app-list-page title="Брони" qaPrefix="bookings" createLabel="Новая бронь">
            <ng-template appListToolbarLeft><span qa-dataid="probe-filter">отбор</span></ng-template>
            <ng-template appListToolbarRight><span qa-dataid="probe-action">действие</span></ng-template>
        </app-list-page>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AppListPageComponent, AppListToolbarLeftDirective, AppListToolbarRightDirective],
    providers: [{ provide: APP_LIST_PAGE_HOST, useValue: HOST }],
})
class ListPageHostComponent {}

function bar(side: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="toolbar-bar"][data-slot="${side}"]`);
}

describe('AppListPageComponent — тулбар шаблонами', (): void => {
    it('SC-UKV-1732: отбор стоит слева, действие справа перед кнопкой обновления', (): void => {
        const fixture: ComponentFixture<ListPageHostComponent> = createRtFixture(
            ListPageHostComponent,
            {},
            {
                providers: [
                    importProvidersFrom(
                        TranslocoTestingModule.forRoot({
                            langs: { ru: {} },
                            translocoConfig: { availableLangs: ['ru'], defaultLang: 'ru' },
                        })
                    ),
                ],
            }
        );
        fixture.detectChanges();
        const order: (string | null)[] = Array.from(
            bar('right')?.querySelectorAll('[qa-dataid="probe-action"], [qa-dataid="bookings-reload"]') ?? []
        ).map((node: Element): string | null => node.getAttribute('qa-dataid'));

        expect([bar('left')?.querySelector('[qa-dataid="probe-filter"]') !== null, order]).toEqual([
            true,
            ['probe-action', 'bookings-reload'],
        ]);
    });
});

import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { IPageModel } from '@rt-tools/utils';

import { createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtDataTableConfigService } from '../data-table/rt-data-table-config.service';
import { ERtDataTableColumnType, ERtDataTableFilterType, IRtDataTable } from '../data-table/rt-data-table.model';
import { RtDataListEmptyDirective, RtDataListErrorDirective } from './rt-data-list-states.directive';
import { RtDataListComponent } from './rt-data-list.component';

interface IEntity extends Record<string, unknown> {
    id: number;
    title: string;
}

const ROWS: IEntity[] = [{ id: 1, title: 'Анна' }];

const COLUMNS: Array<IRtDataTable.Column<IEntity>> = [
    {
        align: 'left',
        propName: 'title',
        type: ERtDataTableColumnType.TEXT,
        copyable: false,
        filterable: false,
        filterType: ERtDataTableFilterType.TEXT,
        header: { align: 'left', label: 'Название' },
    },
];

/** Двойник службы настроек: ошибка и заглушки от состава колонок не зависят. */
const CONFIG_STUB: { tableConfig: WritableSignal<IRtDataTable.Config.Data<IEntity>>; updateConfig: () => void } = {
    tableConfig: signal<IRtDataTable.Config.Data<IEntity>>({
        isVerticalScrollbarShown: false,
        isHorizontalScrollbarShown: true,
        columns: COLUMNS,
    }),
    updateConfig: (): void => undefined,
};

/** Три страницы: полоса страниц видна и должна остаться на ошибке. */
const PAGE: IPageModel = { pageNumber: 2, pageSize: 10, totalCount: 30, hasPrev: true, hasNext: true };

@Component({
    selector: 'rt-test-data-list-error-host',
    template: `
        <rt-data-list
            tableConfigStorageKey="orders"
            [entities]="rows()"
            [pageModel]="page"
            [currentSortModel]="null"
            [loading]="loading()"
            [fetching]="fetching()"
            [error]="error()"
            (retry)="retryCount = retryCount + 1" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataListComponent],
})
class ErrorHostComponent {
    public readonly rows: WritableSignal<IEntity[]> = signal<IEntity[]>(ROWS);
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
    public readonly fetching: WritableSignal<boolean> = signal<boolean>(false);
    public readonly error: WritableSignal<string | null> = signal<string | null>(null);
    public readonly page: IPageModel = PAGE;
    public retryCount: number = 0;
}

@Component({
    selector: 'rt-test-data-list-own-views-host',
    template: `
        <rt-data-list
            tableConfigStorageKey="orders"
            [entities]="[]"
            [pageModel]="page"
            [currentSortModel]="null"
            [error]="error()"
            (retry)="retryCount = retryCount + 1">
            <ng-template rtDataListEmpty>
                <span qa-dataid="own-empty">заказов нет</span>
            </ng-template>
            <ng-template rtDataListError let-message let-retry="retry">
                <button qa-dataid="own-error" type="button" (click)="retry()">{{ message }}</button>
            </ng-template>
        </rt-data-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataListComponent, RtDataListEmptyDirective, RtDataListErrorDirective],
})
class OwnViewsHostComponent {
    public readonly error: WritableSignal<string | null> = signal<string | null>(null);
    public readonly page: IPageModel = PAGE;
    public retryCount: number = 0;
}

async function draw<T>(component: new () => T, patch: (host: T) => void = (): void => undefined): Promise<ComponentFixture<T>> {
    const fixture: ComponentFixture<T> = createRtFixture(
        component,
        {},
        { providers: [{ provide: RtDataTableConfigService, useValue: CONFIG_STUB }], skipInitialDetect: true }
    );

    patch(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
}

describe('RtDataListComponent — ошибка загрузки и свои виды', (): void => {
    it('SC-UKV-1282 — на ошибке строк нет, «Повторить» поднимает retry, полоса действий и страниц на месте', async (): Promise<void> => {
        const fixture: ComponentFixture<ErrorHostComponent> = await draw(ErrorHostComponent, (host: ErrorHostComponent): void =>
            host.error.set('Нет сети')
        );

        expect(textOf(qa(fixture, 'data-list-error'))).toContain('Нет сети');
        expect(fixture.nativeElement.querySelector('rt-data-table')).toBeNull();
        expect(fixture.nativeElement.querySelector('rt-data-list-toolbar')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('rt-pagination')).not.toBeNull();

        (qa(fixture, 'data-list-retry')?.nativeElement as HTMLButtonElement).click();

        expect(fixture.componentInstance.retryCount).toBe(1);
    });

    it('SC-UKV-1282 — ошибка важнее первой загрузки', async (): Promise<void> => {
        const fixture: ComponentFixture<ErrorHostComponent> = await draw(ErrorHostComponent, (host: ErrorHostComponent): void => {
            host.loading.set(true);
            host.error.set('');
        });

        expect(qa(fixture, 'data-list-loading')).toBeNull();
        expect(textOf(qa(fixture, 'data-list-error')).length).toBeGreaterThan(0);
    });

    it('SC-UKV-1282 — ошибка важнее дозагрузки: слоя со спиннером поверх заглушки нет', async (): Promise<void> => {
        const fixture: ComponentFixture<ErrorHostComponent> = await draw(ErrorHostComponent, (host: ErrorHostComponent): void => {
            host.fetching.set(true);
            host.error.set('Нет сети');
        });

        expect(qa(fixture, 'data-list-fetching')).toBeNull();
        expect(textOf(qa(fixture, 'data-list-error'))).toContain('Нет сети');
    });

    it('SC-UKV-1282 — без ошибки строки на месте и заглушки ошибки нет', async (): Promise<void> => {
        const fixture: ComponentFixture<ErrorHostComponent> = await draw(ErrorHostComponent);

        expect(fixture.nativeElement.querySelector('rt-data-table')).not.toBeNull();
        expect(qa(fixture, 'data-list-error-placeholder')).toBeNull();
    });

    it('SC-UKV-1285 — свой вид ошибки списка получает текст и функцию повтора', async (): Promise<void> => {
        const fixture: ComponentFixture<OwnViewsHostComponent> = await draw(OwnViewsHostComponent, (host: OwnViewsHostComponent): void =>
            host.error.set('Нет сети')
        );

        expect(textOf(qa(fixture, 'own-error'))).toBe('Нет сети');
        expect(qa(fixture, 'data-list-error')).toBeNull();

        (qa(fixture, 'own-error')?.nativeElement as HTMLButtonElement).click();

        expect(fixture.componentInstance.retryCount).toBe(1);
    });

    it('свой вид пустого списка встаёт вместо заглушки по умолчанию', async (): Promise<void> => {
        const fixture: ComponentFixture<OwnViewsHostComponent> = await draw(OwnViewsHostComponent);

        expect(textOf(qa(fixture, 'own-empty'))).toBe('заказов нет');
        expect(textOf(qa(fixture, 'data-list-placeholder'))).not.toContain('No Data Found');
    });
});

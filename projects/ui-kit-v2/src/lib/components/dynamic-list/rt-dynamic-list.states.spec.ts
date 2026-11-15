import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { IPageModel } from '@rt-tools/utils';

import { createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtDynamicListEmptyDirective, RtDynamicListErrorDirective } from './rt-dynamic-list-states.directive';
import { RtDynamicListComponent } from './rt-dynamic-list.component';

/** Три страницы: без ошибки полоса страниц видна. */
const THREE_PAGES: IPageModel = { pageNumber: 1, pageSize: 20, totalCount: 55 };

/** Список с записями, панелью и полосой страниц — ошибка включается сигналом. */
@Component({
    selector: 'rt-dynamic-list-error-host',
    template: `
        <rt-dynamic-list
            showRefresh
            [pageModel]="page"
            [loading]="loading()"
            [fetching]="fetching()"
            [error]="error()"
            (retry)="retryCount = retryCount + 1">
            <span qa-dataid="host-table">таблица потребителя</span>
        </rt-dynamic-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDynamicListComponent],
})
class ErrorHostComponent {
    public readonly page: IPageModel = THREE_PAGES;
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
    public readonly fetching: WritableSignal<boolean> = signal<boolean>(false);
    public readonly error: WritableSignal<string | null> = signal<string | null>(null);
    public retryCount: number = 0;
}

/** Пустой список со своими видами пустоты и ошибки. */
@Component({
    selector: 'rt-dynamic-list-own-views-host',
    template: `
        <rt-dynamic-list empty [error]="error()" (retry)="retryCount = retryCount + 1">
            <ng-template rtDynamicListEmpty>
                <span qa-dataid="own-empty">заказов нет</span>
            </ng-template>
            <ng-template rtDynamicListError let-message let-retry="retry">
                <button qa-dataid="own-error" type="button" (click)="retry()">{{ message }}</button>
            </ng-template>
        </rt-dynamic-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDynamicListComponent, RtDynamicListEmptyDirective, RtDynamicListErrorDirective],
})
class OwnViewsHostComponent {
    public readonly error: WritableSignal<string | null> = signal<string | null>(null);
    public retryCount: number = 0;
}

function draw<T>(component: new () => T, patch: (host: T) => void = (): void => undefined): ComponentFixture<T> {
    const fixture: ComponentFixture<T> = createRtFixture(component, {}, { skipInitialDetect: true });

    patch(fixture.componentInstance);
    fixture.detectChanges();

    return fixture;
}

describe('RtDynamicListComponent — ошибка загрузки и свои виды', (): void => {
    it('SC-UKV-1283 — на ошибке вместо записей заглушка, «Повторить» поднимает retry, панель на месте', (): void => {
        const fixture: ComponentFixture<ErrorHostComponent> = draw(ErrorHostComponent, (host: ErrorHostComponent): void =>
            host.error.set('Нет сети')
        );

        expect(textOf(qa(fixture, 'dynamic-list-error'))).toContain('Нет сети');
        expect(qa(fixture, 'host-table')).toBeNull();
        expect(qa(fixture, 'dynamic-list-pagination')).toBeNull();
        expect(qa(fixture, 'dynamic-list-toolbar')).not.toBeNull();

        (qa(fixture, 'dynamic-list-retry')?.nativeElement as HTMLButtonElement).click();

        expect(fixture.componentInstance.retryCount).toBe(1);
    });

    it('SC-UKV-1283 — ошибка важнее загрузки и подгрузки', (): void => {
        const fixture: ComponentFixture<ErrorHostComponent> = draw(ErrorHostComponent, (host: ErrorHostComponent): void => {
            host.loading.set(true);
            host.fetching.set(true);
            host.error.set('');
        });

        expect(qa(fixture, 'dynamic-list-loader')).toBeNull();
        expect(qa(fixture, 'dynamic-list-veil')).toBeNull();
        expect(textOf(qa(fixture, 'dynamic-list-error')).length).toBeGreaterThan(0);
    });

    it('SC-UKV-1283 — без ошибки записи и полоса страниц на месте', (): void => {
        const fixture: ComponentFixture<ErrorHostComponent> = draw(ErrorHostComponent);

        expect(qa(fixture, 'host-table')).not.toBeNull();
        expect(qa(fixture, 'dynamic-list-pagination')).not.toBeNull();
        expect(qa(fixture, 'dynamic-list-error')).toBeNull();
    });

    it('SC-UKV-1283 — свой вид ошибки получает текст и функцию повтора', (): void => {
        const fixture: ComponentFixture<OwnViewsHostComponent> = draw(OwnViewsHostComponent, (host: OwnViewsHostComponent): void =>
            host.error.set('Нет сети')
        );

        expect(textOf(qa(fixture, 'own-error'))).toBe('Нет сети');
        expect(qa(fixture, 'own-empty')).toBeNull();

        (qa(fixture, 'own-error')?.nativeElement as HTMLButtonElement).click();

        expect(fixture.componentInstance.retryCount).toBe(1);
    });

    it('свой вид пустого списка встаёт вместо заглушки по умолчанию', (): void => {
        const fixture: ComponentFixture<OwnViewsHostComponent> = draw(OwnViewsHostComponent);

        expect(textOf(qa(fixture, 'own-empty'))).toBe('заказов нет');
        expect(qa(fixture, 'dynamic-list-empty')).toBeNull();
    });
});

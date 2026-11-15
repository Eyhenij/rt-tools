import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtThreadListEmptyDirective, RtThreadListErrorDirective, RtThreadListRowDirective } from './rt-thread-list.directives';
import { IRtThreadList } from './rt-thread-list.model';
import { RtThreadListComponent } from './rt-thread-list.component';

interface IThread extends IRtThreadList.Row {
    readonly title: string;
}

const ROWS: ReadonlyArray<IThread> = [
    { id: 1, hasUnread: false, title: 'Заявка №1' },
    { id: 2, hasUnread: false, title: 'Заявка №2' },
    { id: 3, hasUnread: false, title: 'Заявка №3' },
];

/** Список с ошибкой, фильтрами и текстами заглушек от потребителя. */
@Component({
    selector: 'rt-thread-list-states-host',
    template: `
        <rt-thread-list
            [rows]="rows()"
            [loading]="loading()"
            [hasMore]="true"
            [error]="error()"
            [filtersActive]="filtersActive()"
            [nothingFoundTitle]="nothingFoundTitle()"
            (retry)="retryCount = retryCount + 1">
            <ng-template rtThreadListRow let-row>
                <span qa-dataid="row-title">{{ row.title }}</span>
            </ng-template>
        </rt-thread-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtThreadListComponent, RtThreadListRowDirective],
})
class StatesHostComponent {
    public readonly rows: WritableSignal<ReadonlyArray<IThread>> = signal<ReadonlyArray<IThread>>([]);
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
    public readonly error: WritableSignal<string | null> = signal<string | null>(null);
    public readonly filtersActive: WritableSignal<boolean> = signal<boolean>(false);
    public readonly nothingFoundTitle: WritableSignal<string> = signal<string>('');
    public retryCount: number = 0;
}

/** Список со своими шаблонами пустого состояния и ошибки. */
@Component({
    selector: 'rt-thread-list-own-views-host',
    template: `
        <rt-thread-list [rows]="[]" [error]="error()" [filtersActive]="true" (retry)="retryCount = retryCount + 1">
            <ng-template rtThreadListEmpty let-filtered>
                <span qa-dataid="own-empty">{{ filtered ? 'filtered' : 'plain' }}</span>
            </ng-template>
            <ng-template rtThreadListError let-message let-retry="retry">
                <button qa-dataid="own-error" type="button" (click)="retry()">{{ message }}</button>
            </ng-template>
        </rt-thread-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtThreadListComponent, RtThreadListEmptyDirective, RtThreadListErrorDirective],
})
class OwnViewsHostComponent {
    public readonly error: WritableSignal<string | null> = signal<string | null>(null);
    public retryCount: number = 0;
}

function setup(): ComponentFixture<StatesHostComponent> {
    return createRtFixture(StatesHostComponent, {}, { skipInitialDetect: true });
}

describe('RtThreadListComponent — ошибка и заглушки', (): void => {
    it('SC-UKV-1267 — ошибка главнее загрузки', (): void => {
        const fixture: ComponentFixture<StatesHostComponent> = setup();
        fixture.componentInstance.loading.set(true);
        fixture.componentInstance.error.set('Нет сети');
        fixture.detectChanges();

        expect(qa(fixture, 'thread-list-error')).not.toBeNull();
        expect(textOf(qa(fixture, 'empty-state-title'))).toBe('Нет сети');
        expect(qa(fixture, 'thread-list-retry')).not.toBeNull();
        expect(qaAll(fixture, 'thread-list-row-skeleton').length).toBe(0);
    });

    it('SC-UKV-1268 — ошибка догрузки оставляет строки', (): void => {
        const fixture: ComponentFixture<StatesHostComponent> = setup();
        fixture.componentInstance.rows.set(ROWS);
        fixture.componentInstance.error.set('Нет сети');
        fixture.detectChanges();

        expect(qaAll(fixture, 'row-title').length).toBe(3);
        expect(textOf(qa(fixture, 'thread-list-load-error'))).toContain('Нет сети');
        expect(qa(fixture, 'thread-list-error')).toBeNull();
        expect(qa(fixture, 'thread-list-load-more')).toBeNull();

        (qa(fixture, 'thread-list-retry')?.nativeElement as HTMLButtonElement).click();

        expect(fixture.componentInstance.retryCount).toBe(1);
    });

    it('SC-UKV-1269 — кнопка «Повторить» шлёт retry', (): void => {
        const fixture: ComponentFixture<StatesHostComponent> = setup();
        fixture.componentInstance.error.set('Нет сети');
        fixture.detectChanges();

        (qa(fixture, 'thread-list-retry')?.nativeElement as HTMLButtonElement).click();

        expect(fixture.componentInstance.retryCount).toBe(1);
    });

    it('SC-UKV-1270 — без текста ошибки стоят подписи кита', (): void => {
        const fixture: ComponentFixture<StatesHostComponent> = setup();
        fixture.componentInstance.error.set('');
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'empty-state-title'))).toBe('Could not load');
        expect(textOf(qa(fixture, 'empty-state-description'))).toBe('Check the connection and try again.');
    });

    it('SC-UKV-1271 — при фильтрах «ничего не найдено» берёт свой текст', (): void => {
        const fixture: ComponentFixture<StatesHostComponent> = setup();
        fixture.componentInstance.filtersActive.set(true);
        fixture.componentInstance.nothingFoundTitle.set('Ничего не нашлось');
        fixture.detectChanges();

        expect(qa(fixture, 'thread-list-nothing-found')).not.toBeNull();
        expect(textOf(qa(fixture, 'empty-state-title'))).toBe('Ничего не нашлось');
        expect(qa(fixture, 'empty-state-icon')).not.toBeNull();
    });

    it('SC-UKV-1272 — свой шаблон пустого получает признак filtered', (): void => {
        const fixture: ComponentFixture<OwnViewsHostComponent> = createRtFixture(OwnViewsHostComponent);

        expect(textOf(qa(fixture, 'own-empty'))).toBe('filtered');
        expect(qa(fixture, 'thread-list-nothing-found')).toBeNull();
    });

    it('SC-UKV-1273 — свой шаблон ошибки получает текст и retry', (): void => {
        const fixture: ComponentFixture<OwnViewsHostComponent> = createRtFixture(OwnViewsHostComponent);
        fixture.componentInstance.error.set('Нет сети');
        fixture.detectChanges();

        (qa(fixture, 'own-error')?.nativeElement as HTMLButtonElement).click();

        expect(textOf(qa(fixture, 'own-error'))).toBe('Нет сети');
        expect(fixture.componentInstance.retryCount).toBe(1);
        expect(qa(fixture, 'thread-list-error')).toBeNull();
    });
});

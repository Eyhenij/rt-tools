import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtBarListEmptyDirective, RtBarListErrorDirective } from './rt-bar-list-states.directive';
import { IRtBarList } from './rt-bar-list.model';
import { RtBarListComponent } from './rt-bar-list.component';

const ROWS: ReadonlyArray<IRtBarList.Row> = [{ id: 'direct', title: 'Прямые заходы', value: '52%', sharePercent: 52 }];

/** Список со строками и заголовком — ошибка включается сигналом. */
@Component({
    selector: 'rt-bar-list-error-host',
    template: `
        <rt-bar-list title="Источники" [rows]="rows" [error]="error()" (retry)="retryCount = retryCount + 1" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBarListComponent],
})
class ErrorHostComponent {
    public readonly rows: ReadonlyArray<IRtBarList.Row> = ROWS;
    public readonly error: WritableSignal<string | null> = signal<string | null>(null);
    public retryCount: number = 0;
}

/** Пустой список со своими видами пустоты и ошибки. */
@Component({
    selector: 'rt-bar-list-own-views-host',
    template: `
        <rt-bar-list [rows]="[]" [error]="error()" (retry)="retryCount = retryCount + 1">
            <ng-template rtBarListEmpty>
                <span qa-dataid="own-empty">источников нет</span>
            </ng-template>
            <ng-template rtBarListError let-message let-retry="retry">
                <button qa-dataid="own-error" type="button" (click)="retry()">{{ message }}</button>
            </ng-template>
        </rt-bar-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBarListComponent, RtBarListEmptyDirective, RtBarListErrorDirective],
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

describe('RtBarListComponent — ошибка загрузки и свои виды', (): void => {
    it('SC-UKV-1284 — на ошибке полос нет, заголовок на месте, «Повторить» поднимает retry', (): void => {
        const fixture: ComponentFixture<ErrorHostComponent> = draw(ErrorHostComponent, (host: ErrorHostComponent): void =>
            host.error.set('Нет сети')
        );

        expect(qa(fixture, 'bar-list-rows')).toBeNull();
        expect(textOf(qa(fixture, 'bar-list-title'))).toBe('Источники');
        expect(textOf(qa(fixture, 'bar-list-error'))).toContain('Нет сети');

        (qa(fixture, 'bar-list-retry')?.nativeElement as HTMLButtonElement).click();

        expect(fixture.componentInstance.retryCount).toBe(1);
    });

    it('SC-UKV-1284 — без ошибки полосы на месте', (): void => {
        const fixture: ComponentFixture<ErrorHostComponent> = draw(ErrorHostComponent);

        expect(qa(fixture, 'bar-list-rows')).not.toBeNull();
        expect(qa(fixture, 'bar-list-error')).toBeNull();
    });

    it('SC-UKV-1284 — свой вид ошибки получает текст и функцию повтора', (): void => {
        const fixture: ComponentFixture<OwnViewsHostComponent> = draw(OwnViewsHostComponent, (host: OwnViewsHostComponent): void =>
            host.error.set('Нет сети')
        );

        expect(textOf(qa(fixture, 'own-error'))).toBe('Нет сети');

        (qa(fixture, 'own-error')?.nativeElement as HTMLButtonElement).click();

        expect(fixture.componentInstance.retryCount).toBe(1);
    });

    it('SC-UKV-1286 — свой вид пустого списка встаёт, а заглушки по умолчанию нет', (): void => {
        const fixture: ComponentFixture<OwnViewsHostComponent> = draw(OwnViewsHostComponent);

        expect(textOf(qa(fixture, 'own-empty'))).toBe('источников нет');
        expect(qa(fixture, 'bar-list-empty')).toBeNull();
    });
});

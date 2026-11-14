import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
    CdkCell,
    CdkCellDef,
    CdkColumnDef,
    CdkHeaderCell,
    CdkHeaderCellDef,
    CdkHeaderRow,
    CdkHeaderRowDef,
    CdkRow,
    CdkRowDef,
} from '@angular/cdk/table';
import { ChangeDetectionStrategy, Component, Type, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtTableComponent } from './rt-table.component';
import { RtTableEmptyStateDirective, RtTableErrorDirective } from './rt-table-states.directive';

interface ITourRow {
    readonly id: number;
    readonly title: string;
}

const ROWS: ReadonlyArray<ITourRow> = [
    { id: 1, title: 'Тур в Сочи' },
    { id: 2, title: 'Тур в Казань' },
];

const COLUMNS: ReadonlyArray<string> = ['title'];

const CDK: ReadonlyArray<Type<unknown>> = [
    CdkColumnDef,
    CdkHeaderCellDef,
    CdkHeaderCell,
    CdkCellDef,
    CdkCell,
    CdkHeaderRowDef,
    CdkHeaderRow,
    CdkRowDef,
    CdkRow,
];

/** Таблица с ошибкой, загрузкой и полосой страниц приложения рядом — так её ставит экран. */
@Component({
    selector: 'rt-table-error-host',
    template: `
        <table
            rt-table
            ariaLabel="Туры"
            [dataSource]="rows()"
            [columns]="columns"
            [cards]="false"
            [loading]="loading()"
            [error]="error()"
            (retry)="retryCount = retryCount + 1">
            <ng-container cdkColumnDef="title">
                <th *cdkHeaderCellDef cdk-header-cell qa-dataid="head-title">Название</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
            </ng-container>
            <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
            <tr *cdkRowDef="let row; columns: columns" cdk-row qa-dataid="table-row"></tr>
        </table>
        <nav qa-dataid="host-pagination">страницы</nav>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTableComponent, CDK],
})
class ErrorHostComponent {
    public readonly columns: ReadonlyArray<string> = COLUMNS;
    public readonly rows: WritableSignal<ReadonlyArray<ITourRow>> = signal<ReadonlyArray<ITourRow>>([]);
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
    public readonly error: WritableSignal<string | null> = signal<string | null>(null);
    public retryCount: number = 0;
}

/** Пустая таблица со своим видом по прежней ссылке `#rtTableEmpty`. */
@Component({
    selector: 'rt-table-empty-ref-host',
    template: `
        <table rt-table ariaLabel="Туры" [dataSource]="[]" [columns]="columns" [cards]="false">
            <ng-container cdkColumnDef="title">
                <th *cdkHeaderCellDef cdk-header-cell>Название</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
            </ng-container>
            <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
            <tr *cdkRowDef="let row; columns: columns" cdk-row></tr>
            <ng-template #rtTableEmpty>
                <span qa-dataid="own-empty">туров нет</span>
            </ng-template>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTableComponent, CDK],
})
class EmptyRefHostComponent {
    public readonly columns: ReadonlyArray<string> = COLUMNS;
}

/**
 * Пустая таблица со своим видом директивой — по имени из сигнала. Вторым шаблоном стоит прежняя
 * ссылка `#rtTableEmpty`: директива должна победить её.
 */
@Component({
    selector: 'rt-table-empty-directive-host',
    template: `
        <table rt-table ariaLabel="Туры" [dataSource]="[]" [columns]="columns" [cards]="false">
            <ng-container cdkColumnDef="title">
                <th *cdkHeaderCellDef cdk-header-cell>Название</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
            </ng-container>
            <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
            <tr *cdkRowDef="let row; columns: columns" cdk-row></tr>
            @if (byStateName()) {
                <ng-template rtTableEmptyState>
                    <span qa-dataid="own-directive-empty">директива</span>
                </ng-template>
            } @else {
                <ng-template rtTableEmpty>
                    <span qa-dataid="own-directive-empty">директива</span>
                </ng-template>
            }
            @if (withReference()) {
                <ng-template #rtTableEmpty>
                    <span qa-dataid="own-reference-empty">ссылка</span>
                </ng-template>
            }
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTableComponent, RtTableEmptyStateDirective, CDK],
})
class EmptyDirectiveHostComponent {
    public readonly columns: ReadonlyArray<string> = COLUMNS;
    public readonly byStateName: WritableSignal<boolean> = signal<boolean>(false);
    public readonly withReference: WritableSignal<boolean> = signal<boolean>(false);
}

/** Таблица со своим видом ошибки директивой. */
@Component({
    selector: 'rt-table-own-error-host',
    template: `
        <table
            rt-table
            ariaLabel="Туры"
            error="Нет сети"
            [dataSource]="[]"
            [columns]="columns"
            [cards]="false"
            (retry)="retryCount = retryCount + 1">
            <ng-container cdkColumnDef="title">
                <th *cdkHeaderCellDef cdk-header-cell>Название</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
            </ng-container>
            <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
            <tr *cdkRowDef="let row; columns: columns" cdk-row></tr>
            <ng-template rtTableError let-message let-retry="retry">
                <button qa-dataid="own-error" type="button" (click)="retry()">{{ message }}</button>
            </ng-template>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTableComponent, RtTableErrorDirective, CDK],
})
class OwnErrorHostComponent {
    public readonly columns: ReadonlyArray<string> = COLUMNS;
    public retryCount: number = 0;
}

/** Стили таблицы: что прячет строки при ошибке, jsdom не считает — читаем из источника. */
const STYLES: string = readFileSync(join(__dirname, 'rt-table.component.scss'), 'utf8');

function draw<T>(component: new () => T, patch: (host: T) => void = (): void => undefined): ComponentFixture<T> {
    const fixture: ComponentFixture<T> = createRtFixture(component, {}, { skipInitialDetect: true });

    patch(fixture.componentInstance);
    fixture.detectChanges();

    return fixture;
}

describe('RtTableComponent — ошибка загрузки и свои виды', (): void => {
    it('SC-UKV-1279 — ошибка важнее загрузки: вместо строк-заготовок заглушка с заголовком и «Повторить»', (): void => {
        const fixture: ComponentFixture<ErrorHostComponent> = draw(ErrorHostComponent, (host: ErrorHostComponent): void => {
            host.loading.set(true);
            host.error.set('Нет сети');
        });

        expect(qa(fixture, 'table-skeleton-row')).toBeNull();
        expect(textOf(qa(fixture, 'table-error'))).toContain('Нет сети');
        expect(qa(fixture, 'table-retry')).not.toBeNull();

        (qa(fixture, 'table-retry')?.nativeElement as HTMLButtonElement).click();

        expect(fixture.componentInstance.retryCount).toBe(1);
    });

    it('SC-UKV-1279 — без ошибки та же загрузка рисует строки-заготовки', (): void => {
        const fixture: ComponentFixture<ErrorHostComponent> = draw(ErrorHostComponent, (host: ErrorHostComponent): void =>
            host.loading.set(true)
        );

        expect(qa(fixture, 'table-skeleton-row')).not.toBeNull();
        expect(qa(fixture, 'table-error')).toBeNull();
    });

    it('SC-UKV-1280 — при ошибке шапка и полоса страниц остаются, строки спрятаны', (): void => {
        const fixture: ComponentFixture<ErrorHostComponent> = draw(ErrorHostComponent, (host: ErrorHostComponent): void => {
            host.rows.set(ROWS);
            host.error.set('');
        });

        expect(qa(fixture, 'head-title')).not.toBeNull();
        expect(qa(fixture, 'host-pagination')).not.toBeNull();
        expect(qa(fixture, 'table-error-row')).not.toBeNull();
        expect(classesOf(el(fixture, 'table'))).toContain('rt-table--error');
        expect(STYLES).toMatch(/&--error \.cdk-row \{\s*display: none;/);
    });

    it('SC-UKV-1280 — пустая ошибка показывает подпись кита', (): void => {
        const fixture: ComponentFixture<ErrorHostComponent> = draw(ErrorHostComponent, (host: ErrorHostComponent): void =>
            host.error.set('')
        );

        expect(textOf(qa(fixture, 'table-error')).length).toBeGreaterThan(0);
        expect(qa(fixture, 'table-empty')).toBeNull();
    });

    it('SC-UKV-1281 — шаблон по ссылке #rtTableEmpty встаёт вместо вида по умолчанию', (): void => {
        const fixture: ComponentFixture<EmptyRefHostComponent> = draw(EmptyRefHostComponent);

        expect(textOf(qa(fixture, 'own-empty'))).toBe('туров нет');
        expect(qa(fixture, 'table-empty')).toBeNull();
    });

    it('SC-UKV-1281 — шаблон директивой rtTableEmpty встаёт вместо вида по умолчанию', (): void => {
        const fixture: ComponentFixture<EmptyDirectiveHostComponent> = draw(EmptyDirectiveHostComponent);

        expect(textOf(qa(fixture, 'own-directive-empty'))).toBe('директива');
        expect(qa(fixture, 'table-empty')).toBeNull();
    });

    it('SC-UKV-1281 — второе имя rtTableEmptyState работает так же', (): void => {
        const fixture: ComponentFixture<EmptyDirectiveHostComponent> = draw(
            EmptyDirectiveHostComponent,
            (host: EmptyDirectiveHostComponent): void => host.byStateName.set(true)
        );

        expect(textOf(qa(fixture, 'own-directive-empty'))).toBe('директива');
        expect(qa(fixture, 'table-empty')).toBeNull();
    });

    it('SC-UKV-1281 — объявлены директива и ссылка #rtTableEmpty: побеждает директива', (): void => {
        const fixture: ComponentFixture<EmptyDirectiveHostComponent> = draw(
            EmptyDirectiveHostComponent,
            (host: EmptyDirectiveHostComponent): void => host.withReference.set(true)
        );

        expect(textOf(qa(fixture, 'own-directive-empty'))).toBe('директива');
        expect(qa(fixture, 'own-reference-empty')).toBeNull();
    });

    it('SC-UKV-1285 — свой вид ошибки таблицы получает текст и функцию повтора', (): void => {
        const fixture: ComponentFixture<OwnErrorHostComponent> = draw(OwnErrorHostComponent);

        expect(textOf(qa(fixture, 'own-error'))).toBe('Нет сети');
        expect(qa(fixture, 'table-error')).toBeNull();

        (qa(fixture, 'own-error')?.nativeElement as HTMLButtonElement).click();

        expect(fixture.componentInstance.retryCount).toBe(1);
    });
});

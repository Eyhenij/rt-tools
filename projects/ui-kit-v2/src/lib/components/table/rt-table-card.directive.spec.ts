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
import { ChangeDetectionStrategy, Component, DebugElement, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { BreakpointsService } from '../../platform';
import { createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtTableCardDirective } from './rt-table-card.directive';
import { RtTableComponent } from './rt-table.component';

interface ITourRow {
    readonly id: number;
    readonly title: string;
    readonly city: string;
}

const ROWS: ReadonlyArray<ITourRow> = [
    { id: 1, title: 'Тур в Сочи', city: 'Сочи' },
    { id: 2, title: 'Тур в Казань', city: 'Казань' },
];

/** Своя разметка карточки объявляется шаблоном внутри таблицы — иначе директиве нечего захватывать. */
@Component({
    selector: 'rt-table-card-host',
    template: `
        <table rt-table #t="rtTable" ariaLabel="Туры" [dataSource]="rows()" [columns]="columns">
            <ng-container cdkColumnDef="title">
                <th *cdkHeaderCellDef cdk-header-cell>Название</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
            </ng-container>
            <ng-container cdkColumnDef="city">
                <th *cdkHeaderCellDef cdk-header-cell>Город</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.city }}</td>
            </ng-container>
            @if (withCard()) {
                <ng-template rtTableCard let-row [rtTableCardRowType]="rows()">
                    <div qa-dataid="own-card">{{ row.title }} · {{ row.city }}</div>
                </ng-template>
            }
            <tr *cdkHeaderRowDef="t.displayedColumns()" cdk-header-row></tr>
            <tr *cdkRowDef="let row; columns: t.displayedColumns()" cdk-row></tr>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtTableComponent,
        RtTableCardDirective,
        CdkColumnDef,
        CdkHeaderCellDef,
        CdkHeaderCell,
        CdkCellDef,
        CdkCell,
        CdkHeaderRowDef,
        CdkHeaderRow,
        CdkRowDef,
        CdkRow,
    ],
})
class TableCardHostComponent {
    public readonly columns: ReadonlyArray<string> = ['title', 'city'];
    public readonly rows: WritableSignal<ReadonlyArray<ITourRow>> = signal<ReadonlyArray<ITourRow>>(ROWS);
    public readonly withCard: WritableSignal<boolean> = signal<boolean>(true);
}

/** Карточки рисуются только на узком экране, а ширину в тестовой среде никто не измеряет. */
class NarrowBreakpointsService {
    public readonly narrow: () => boolean = (): boolean => true;
}

function setupNarrow(withCard: boolean = true): ComponentFixture<TableCardHostComponent> {
    const fixture: ComponentFixture<TableCardHostComponent> = createRtFixture(
        TableCardHostComponent,
        {},
        { skipInitialDetect: true, providers: [{ provide: BreakpointsService, useClass: NarrowBreakpointsService }] }
    );

    fixture.componentInstance.withCard.set(withCard);
    fixture.detectChanges();

    return fixture;
}

describe('RtTableCardDirective', (): void => {
    it('на узком экране карточку рисует объявленный шаблон, а не список полей', (): void => {
        const fixture: ComponentFixture<TableCardHostComponent> = setupNarrow();

        expect(qaAll(fixture, 'own-card').map((node: DebugElement): string => textOf(node))).toEqual([
            'Тур в Сочи · Сочи',
            'Тур в Казань · Казань',
        ]);
        expect(qa(fixture, 'table-card-field')).toBeNull();
    });

    it('без шаблона та же таблица возвращается к списку «подпись: значение»', (): void => {
        // Пара нужна целиком: своя карточка выглядит исправной и тогда, когда
        // она затирает разметку по умолчанию у всех таблиц разом.
        const fixture: ComponentFixture<TableCardHostComponent> = setupNarrow(false);

        expect(qa(fixture, 'own-card')).toBeNull();
        expect(qaAll(fixture, 'table-card-field').length).toBe(4);
    });

    it('на широком экране своя карточка не показывается — там строки таблицы', (): void => {
        const fixture: ComponentFixture<TableCardHostComponent> = createRtFixture(TableCardHostComponent);

        expect(qa(fixture, 'own-card')).toBeNull();
        expect(qa(fixture, 'table-cards')).toBeNull();
    });
});

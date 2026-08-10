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
import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qaAll } from '../../../testing/rt-kit-testing';
import { IRtTable } from './rt-table.model';
import { RtMenuItemComponent } from '../menu/rt-menu-item.component';
import { RtTableRowActionsDirective } from './rt-table-row-actions.directive';
import { RtTableComponent } from './rt-table.component';

interface ITourRow {
    readonly id: number;
    readonly title: string;
    readonly archived: boolean;
}

const ROWS: ReadonlyArray<ITourRow> = [
    { id: 1, title: 'Тур в Сочи', archived: false },
    { id: 2, title: 'Тур в Казань', archived: true },
];

/** Панель меню живёт в перекрытии CDK — ищется по документу, а не по фикстуре. */
function menuPanel(): HTMLElement | null {
    return document.querySelector('[qa-dataid="menu-panel"]');
}

@Component({
    selector: 'rt-table-row-actions-host',
    template: `
        <table
            rt-table
            #t="rtTable"
            ariaLabel="Туры"
            [dataSource]="rows()"
            [columns]="columns"
            [showRowActions]="true"
            [rowHasActions]="hasActions()">
            <ng-container cdkColumnDef="title">
                <th *cdkHeaderCellDef cdk-header-cell>Название</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
            </ng-container>
            @if (withActions()) {
                <ng-template rtTableRowActions let-row [rtTableRowActionsRowType]="rows()">
                    <rt-menu-item icon="ico-edit" [label]="'Открыть ' + row.title" (selected)="picked = row.id" />
                </ng-template>
            }
            <tr *cdkHeaderRowDef="t.displayedColumns()" cdk-header-row></tr>
            <tr *cdkRowDef="let row; columns: t.displayedColumns()" cdk-row></tr>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtTableComponent,
        RtTableRowActionsDirective,
        RtMenuItemComponent,
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
class RowActionsHostComponent {
    public readonly columns: ReadonlyArray<string> = ['title'];
    public readonly rows: WritableSignal<ReadonlyArray<ITourRow>> = signal<ReadonlyArray<ITourRow>>(ROWS);
    public readonly withActions: WritableSignal<boolean> = signal<boolean>(true);
    public readonly hasActions: WritableSignal<IRtTable.RowActionsPredicate<ITourRow> | null> =
        signal<IRtTable.RowActionsPredicate<ITourRow> | null>(null);
    public picked: number = 0;
}

function setup(): ComponentFixture<RowActionsHostComponent> {
    return createRtFixture(RowActionsHostComponent);
}

/** Кнопка меню строки: клик идёт по самому контролу, а не по обёртке. */
function openMenuOfRow(fixture: ComponentFixture<RowActionsHostComponent>, index: number): void {
    const trigger: HTMLElement = qaAll(fixture, 'menu-trigger')[index].nativeElement as HTMLElement;

    (trigger.querySelector('[qa-dataid="icon-button-control"]') as HTMLElement).click();
    fixture.detectChanges();
}

describe('RtTableRowActionsDirective', (): void => {
    it('ячейка действий появляется у каждой строки', (): void => {
        expect(qaAll(setup(), 'table-row-actions').length).toBe(2);
    });

    it('кнопку меню рисует объявленный шаблон — без него ячейка остаётся пустой', (): void => {
        // Пара нужна целиком: колонка на месте в обоих случаях, и по одной
        // ячейке не видно, дошёл шаблон до строки или нет.
        const fixture: ComponentFixture<RowActionsHostComponent> = setup();

        expect(qaAll(fixture, 'menu-trigger').length).toBe(2);

        fixture.componentInstance.withActions.set(false);
        fixture.detectChanges();

        expect(qaAll(fixture, 'table-row-actions').length).toBe(2);
        expect(qaAll(fixture, 'menu-trigger').length).toBe(0);
    });

    it('предикат гасит кнопку у строки без действий, не трогая соседнюю', (): void => {
        const fixture: ComponentFixture<RowActionsHostComponent> = setup();

        fixture.componentInstance.hasActions.set((row: ITourRow): boolean => !row.archived);
        fixture.detectChanges();

        expect(qaAll(fixture, 'menu-trigger').length).toBe(1);
    });

    it('пункт меню получает ту строку, у которой меню открыли', (): void => {
        const fixture: ComponentFixture<RowActionsHostComponent> = setup();

        openMenuOfRow(fixture, 1);

        expect(menuPanel()).not.toBeNull();
        expect(menuPanel()?.textContent).toContain('Открыть Тур в Казань');
    });

    it('выбор пункта отдаёт наружу эту же строку', (): void => {
        const fixture: ComponentFixture<RowActionsHostComponent> = setup();

        openMenuOfRow(fixture, 1);
        (menuPanel()?.querySelector('rt-menu-item') as HTMLElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.picked).toBe(2);
    });

    it('строки различимы по подписи пункта — контекст шаблона у каждой свой', (): void => {
        const fixture: ComponentFixture<RowActionsHostComponent> = setup();

        openMenuOfRow(fixture, 0);

        const labels: string[] = Array.from(menuPanel()?.querySelectorAll('[qa-dataid="menu-item-label"]') ?? []).map(
            (node: Element): string => (node.textContent ?? '').trim()
        );

        expect(labels).toEqual(['Открыть Тур в Сочи']);
    });
});

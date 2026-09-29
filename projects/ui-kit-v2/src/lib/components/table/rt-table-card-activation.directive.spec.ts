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
import { createRtFixture, qaAll } from '../../../testing/rt-kit-testing';
import { RtTableRowDirective } from './rt-table-row.directive';
import { RtTableComponent } from './rt-table.component';

interface ITourRow {
    readonly id: number;
    readonly title: string;
}

const ROWS: ReadonlyArray<ITourRow> = [
    { id: 1, title: 'Тур в Сочи' },
    { id: 2, title: 'Тур в Казань' },
];

const COLUMNS: ReadonlyArray<string> = ['title', 'remove'];

/** Список, как у приложения: строка открывает запись через `rtTableRow`, в строке своя кнопка. */
@Component({
    selector: 'rt-table-card-host',
    template: `
        <table rt-table ariaLabel="Туры" [dataSource]="rows" [columns]="columns" [clickable]="clickable()">
            <ng-container cdkColumnDef="title">
                <th *cdkHeaderCellDef cdk-header-cell>Название</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
            </ng-container>
            <ng-container cdkColumnDef="remove">
                <th *cdkHeaderCellDef cdk-header-cell>Удалить</th>
                <td *cdkCellDef="let row" cdk-cell>
                    <button type="button" qa-dataid="remove" (click)="removed.push(row.id)">Удалить</button>
                </td>
            </ng-container>
            <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
            <tr *cdkRowDef="let row; columns: columns" cdk-row rtTableRow (activated)="opened.push(row.id)"></tr>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtTableComponent,
        RtTableRowDirective,
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
class CardHostComponent {
    public readonly columns: ReadonlyArray<string> = COLUMNS;
    public readonly rows: ReadonlyArray<ITourRow> = ROWS;
    public readonly clickable: WritableSignal<boolean> = signal<boolean>(true);
    public readonly opened: number[] = [];
    public readonly removed: number[] = [];
}

/** Карточки рисуются только на узком экране — ширину подменяем. */
class NarrowBreakpointsService {
    public readonly narrow: () => boolean = (): boolean => true;
}

function setup(clickable: boolean = true): ComponentFixture<CardHostComponent> {
    const fixture: ComponentFixture<CardHostComponent> = createRtFixture(
        CardHostComponent,
        {},
        { skipInitialDetect: true, providers: [{ provide: BreakpointsService, useClass: NarrowBreakpointsService }] }
    );
    fixture.componentInstance.clickable.set(clickable);
    fixture.detectChanges();
    return fixture;
}

function cards(fixture: ComponentFixture<CardHostComponent>): HTMLElement[] {
    return qaAll(fixture, 'table-card').map((node: DebugElement): HTMLElement => node.nativeElement as HTMLElement);
}

function press(target: HTMLElement, key: string): KeyboardEvent {
    const event: KeyboardEvent = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
}

describe('RtTableCardActivationDirective', (): void => {
    it('нажатие на карточку вызывает (activated) строки с тем же номером', (): void => {
        const fixture: ComponentFixture<CardHostComponent> = setup();

        cards(fixture)[1].click();

        expect(fixture.componentInstance.opened).toEqual([2]);
    });

    it('Enter и пробел на карточке открывают запись, пробел не прокручивает страницу', (): void => {
        const fixture: ComponentFixture<CardHostComponent> = setup();

        press(cards(fixture)[0], 'Enter');
        const space: KeyboardEvent = press(cards(fixture)[0], ' ');

        expect(fixture.componentInstance.opened).toEqual([1, 1]);
        expect(space.defaultPrevented).toBe(true);
    });

    it('нажатие по кнопке внутри карточки открытием не считается', (): void => {
        const fixture: ComponentFixture<CardHostComponent> = setup();
        const button: HTMLElement = cards(fixture)[0].querySelector('[qa-dataid="remove"]') as HTMLElement;

        button.click();

        expect(fixture.componentInstance.removed).toEqual([1]);
        expect(fixture.componentInstance.opened).toEqual([]);
    });

    it('при clickable карточка берёт фокус, без него не берёт и не отзывается', (): void => {
        expect(cards(setup()).map((card: HTMLElement): string | null => card.getAttribute('tabindex'))).toEqual(['0', '0']);

        const fixture: ComponentFixture<CardHostComponent> = setup(false);
        cards(fixture)[0].click();

        expect(cards(fixture)[0].hasAttribute('tabindex')).toBe(false);
        expect(fixture.componentInstance.opened).toEqual([]);
    });
});

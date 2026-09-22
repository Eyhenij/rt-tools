import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createRtFixture, qa, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { RtIconButtonComponent } from '../../icon-button/rt-icon-button.component';
import { RtIconComponent } from '../../icon/rt-icon.component';
import { RtTooltipDirective } from '../../tooltip/rt-tooltip.directive';
import { RtDataTableIconDirective } from '../rt-data-table-icon.directive';
import { IRtDataTableRowHost, RT_DATA_TABLE_ROW_HOST, RtDataTableRowClickDirective } from '../rt-data-table-row-click.directive';
import { ERtDataTableColumnType, IRtDataTable } from '../rt-data-table.model';
import { RtDataTableCellComponent } from './rt-data-table-cell.component';

interface IEntity extends Record<string, unknown> {
    id: number;
    share: number | null;
    title: string | null;
}

/** Двойник буфера: настоящий в среде без браузера ничего не кладёт и молчит об этом. */
class ClipboardDouble {
    public readonly copied: string[] = [];

    public copy(text: string): boolean {
        this.copied.push(text);

        return true;
    }
}

/** Двойник таблицы: записывает нажатия строки. */
class RowHostStub implements IRtDataTableRowHost<IEntity> {
    public readonly clicks: IEntity[] = [];

    public onRowClick(row: IEntity): void {
        this.clicks.push(row);
    }

    public onRowDoubleClick(): void {
        return;
    }
}

function columnOf(extra: Partial<IRtDataTable.Column<IEntity>>): IRtDataTable.Column<IEntity> {
    return {
        align: 'left',
        propName: 'title',
        type: ERtDataTableColumnType.TEXT,
        copyable: false,
        header: { align: 'left', label: 'Название' },
        ...extra,
    };
}

@Component({
    selector: 'rt-data-table-cell-host',
    template: `
        <div [rtDataTableRowClick]="row()">
            @if (withTemplate()) {
                <rt-data-table-cell [row]="row()" [column]="column()" [iconTemplate]="iconTpl.template" />
            } @else {
                <rt-data-table-cell [row]="row()" [column]="column()" />
            }
        </div>

        <ng-template #iconTpl="rtDataTableIcon" rtDataTableIcon let-name let-row="row">
            <b qa-dataid="own-icon">{{ name }}:{{ row?.id }}</b>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataTableCellComponent, RtDataTableIconDirective, RtDataTableRowClickDirective],
})
class CellHostComponent {
    public readonly row: WritableSignal<IEntity> = signal<IEntity>({ id: 1, share: 0.25, title: 'Тур в Сочи' });
    public readonly column: WritableSignal<IRtDataTable.Column<IEntity>> = signal<IRtDataTable.Column<IEntity>>(columnOf({}));
    public readonly withTemplate: WritableSignal<boolean> = signal(false);
}

let clipboard: ClipboardDouble;
let rowHost: RowHostStub;

function setup(
    column: Partial<IRtDataTable.Column<IEntity>>,
    row?: IEntity,
    withTemplate: boolean = false
): ComponentFixture<CellHostComponent> {
    clipboard = new ClipboardDouble();
    rowHost = new RowHostStub();

    const fixture: ComponentFixture<CellHostComponent> = createRtFixture(
        CellHostComponent,
        {},
        {
            skipInitialDetect: true,
            providers: [
                { provide: Clipboard, useValue: clipboard },
                { provide: RT_DATA_TABLE_ROW_HOST, useValue: rowHost },
            ],
        }
    );

    fixture.componentInstance.column.set(columnOf(column));
    fixture.componentInstance.withTemplate.set(withTemplate);
    if (row) {
        fixture.componentInstance.row.set(row);
    }
    fixture.detectChanges();

    return fixture;
}

function cellText(fixture: ComponentFixture<CellHostComponent>): string {
    return textOf(qa(fixture, 'data-table-cell-text'));
}

function hover(fixture: ComponentFixture<CellHostComponent>): void {
    fixture.debugElement.query(By.directive(RtDataTableCellComponent)).nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
}

function kitIconNames(fixture: ComponentFixture<CellHostComponent>): string[] {
    return fixture.debugElement
        .queryAll(By.directive(RtIconComponent))
        .filter((icon: { nativeElement: HTMLElement }) => !icon.nativeElement.closest('rt-icon-button'))
        .map((icon: { componentInstance: RtIconComponent }) => icon.componentInstance.name());
}

describe('RtDataTableCellComponent', () => {
    it('SC-UKV-262 — пустое значение рисуется прочерком, ноль — нулём', () => {
        const empty: ComponentFixture<CellHostComponent> = setup({}, { id: 1, share: 0, title: null });

        expect(cellText(empty)).toBe('—');

        const zero: ComponentFixture<CellHostComponent> = setup({ propName: 'share' }, { id: 1, share: 0, title: null });

        expect(cellText(zero)).toBe('0');
    });

    it('SC-UKV-263 — подсказку с целым значением получает только обрезанное', () => {
        const fixture: ComponentFixture<CellHostComponent> = setup({});
        const text: HTMLElement = qa(fixture, 'data-table-cell-text')?.nativeElement as HTMLElement;
        const tooltip: RtTooltipDirective = qa(fixture, 'data-table-cell-text')?.injector.get(RtTooltipDirective) as RtTooltipDirective;

        Object.defineProperty(text, 'scrollWidth', { configurable: true, value: 100 });
        Object.defineProperty(text, 'clientWidth', { configurable: true, value: 100 });
        hover(fixture);

        expect(tooltip.text()).toBe('');

        Object.defineProperty(text, 'scrollWidth', { configurable: true, value: 300 });
        hover(fixture);

        expect(tooltip.text()).toBe('Тур в Сочи');
    });

    it('SC-UKV-264 — колонка переделывает показанное, и копируется показанное', () => {
        const fixture: ComponentFixture<CellHostComponent> = setup({
            propName: 'share',
            copyable: true,
            transform: (value: unknown): string => `${Number(value) * 100} %`,
        });

        qa(fixture, 'data-table-cell-copy')?.injector.get(RtIconButtonComponent).clicked.emit(new MouseEvent('click'));

        expect(cellText(fixture)).toBe('25 %');
        expect(clipboard.copied).toEqual(['25 %']);
    });

    it('SC-UKV-265 — значок стоит на объявленной стороне со стилем, посчитанным по значению строки', () => {
        const fixture: ComponentFixture<CellHostComponent> = setup({
            icon: { glyph: 'star', placement: 'right' },
            iconTransform: (value: unknown): string => (value === 'Тур в Сочи' ? 'color: red' : 'color: blue'),
        });

        expect(qa(fixture, 'data-table-cell-prefix')).toBeNull();
        expect(qa(fixture, 'data-table-cell-suffix')).not.toBeNull();

        const icon: HTMLElement = fixture.debugElement.query(By.directive(RtIconComponent)).nativeElement as HTMLElement;

        expect(icon.style.color).toBe('red');
    });

    it('SC-UKV-266 — у копируемой ячейки с пустым значением кнопки копирования нет', () => {
        const fixture: ComponentFixture<CellHostComponent> = setup({ copyable: true }, { id: 1, share: null, title: null });

        hover(fixture);

        expect(cellText(fixture)).toBe('—');
        expect(qa(fixture, 'data-table-cell-copy')).toBeNull();
    });

    it('SC-UKV-267 — вид колонки, кроме пользовательского, рисует значение как пришло', () => {
        const fixture: ComponentFixture<CellHostComponent> = setup(
            { propName: 'share', type: ERtDataTableColumnType.PERCENT },
            { id: 1, share: 0.25, title: null }
        );

        expect(cellText(fixture)).toBe('0.25');
    });

    it('SC-UKV-308 — кнопка две секунды говорит, что скопировала, и строку не нажимает', () => {
        jest.useFakeTimers();
        const fixture: ComponentFixture<CellHostComponent> = setup({ copyable: true });
        const copy: HTMLElement = qa(fixture, 'data-table-cell-copy')?.nativeElement as HTMLElement;
        const button: RtIconButtonComponent = qa(fixture, 'data-table-cell-copy')?.injector.get(
            RtIconButtonComponent
        ) as RtIconButtonComponent;

        copy.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        button.clicked.emit(new MouseEvent('click'));
        fixture.detectChanges();

        expect(button.icon()).toBe('check');
        expect(button.ariaLabel()).toBe('Copied!');
        expect(rowHost.clicks).toEqual([]);

        jest.advanceTimersByTime(2000);
        fixture.detectChanges();

        expect(button.icon()).toBe('copy');
        jest.useRealTimers();
    });

    it('SC-UKV-318 — имя значка первого кита рисует набор кита по паре из перечня', () => {
        const fixture: ComponentFixture<CellHostComponent> = setup({ icon: { glyph: 'content_copy', placement: 'left' } });

        expect(kitIconNames(fixture)).toEqual(['copy']);
    });

    it('SC-UKV-319 — имя без пары в перечне значка не рисует, значение остаётся', () => {
        const fixture: ComponentFixture<CellHostComponent> = setup({ icon: { glyph: 'delete_forever', placement: 'left' } });

        expect(kitIconNames(fixture)).toEqual([]);
        expect(cellText(fixture)).toBe('Тур в Сочи');
    });

    it('SC-UKV-320 — шаблон значка рисует значок ячейки и получает имя и строку', () => {
        const fixture: ComponentFixture<CellHostComponent> = setup({ icon: { glyph: 'content_copy', placement: 'left' } }, undefined, true);

        expect(qaAll(fixture, 'own-icon').map(textOf)).toEqual(['content_copy:1']);
        expect(kitIconNames(fixture)).toEqual([]);
    });
});

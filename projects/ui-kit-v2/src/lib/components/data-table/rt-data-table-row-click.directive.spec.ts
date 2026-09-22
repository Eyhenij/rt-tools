import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
    IRtDataTableRowHost,
    RT_DATA_TABLE_ROW_HOST,
    RtDataTableRowClickDirective,
    RtDataTableStopRowClickDirective,
} from './rt-data-table-row-click.directive';

interface IEntity {
    id: number;
}

/** Двойник таблицы: записывает, о чём строка ему сообщила. */
class RowHostStub implements IRtDataTableRowHost<IEntity> {
    public readonly clicks: IEntity[] = [];
    public readonly doubleClicks: IEntity[] = [];

    public onRowClick(row: IEntity): void {
        this.clicks.push(row);
    }

    public onRowDoubleClick(row: IEntity): void {
        this.doubleClicks.push(row);
    }
}

@Component({
    selector: 'rt-test-row-host',
    template: `
        <div qa-dataid="row" [rtDataTableRowClick]="row">
            <span qa-dataid="text">Заказ</span>
            <span qa-dataid="opt-out" rtDataTableStopRowClick>Картинка</span>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataTableRowClickDirective, RtDataTableStopRowClickDirective],
})
class RowHostComponent {
    public readonly row: IEntity = { id: 3 };
}

describe('RtDataTableRowClickDirective', () => {
    let fixture: ComponentFixture<RowHostComponent>;
    let host: RowHostStub;

    function node(qa: string): HTMLElement {
        return fixture.nativeElement.querySelector(`[qa-dataid="${qa}"]`);
    }

    function press(target: HTMLElement, type: 'mousedown' | 'dblclick'): void {
        target.dispatchEvent(new MouseEvent(type, { bubbles: true }));
    }

    beforeEach(() => {
        host = new RowHostStub();

        TestBed.configureTestingModule({
            imports: [RowHostComponent],
            providers: [{ provide: RT_DATA_TABLE_ROW_HOST, useValue: host }],
        });

        fixture = TestBed.createComponent(RowHostComponent);
        fixture.detectChanges();
    });

    it('SC-UKV-257 — двойное нажатие на строку сообщается с её записью', () => {
        press(node('text'), 'dblclick');

        expect(host.doubleClicks).toEqual([{ id: 3 }]);
    });

    it('о нажатии строка сообщает, когда кнопка опускается', () => {
        press(node('text'), 'mousedown');

        expect(host.clicks).toEqual([{ id: 3 }]);
    });

    it('SC-UKV-258 — двойное нажатие внутри отказавшейся части не сообщается', () => {
        press(node('opt-out'), 'mousedown');
        press(node('opt-out'), 'dblclick');

        expect(host.doubleClicks).toEqual([]);
        expect(host.clicks).toEqual([]);
    });

    it('SC-UKV-274 — нажатие внутри отказавшейся части строку не задействует', () => {
        press(node('opt-out'), 'mousedown');

        expect(host.clicks).toEqual([]);
    });
});

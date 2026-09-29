import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
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
    /** Порядок сообщений: двойное нажатие приходит после двух одинарных, и это видно только здесь. */
    public readonly order: string[] = [];

    public onRowClick(row: IEntity): void {
        this.clicks.push(row);
        this.order.push('click');
    }

    public onRowDoubleClick(row: IEntity): void {
        this.doubleClicks.push(row);
        this.order.push('doubleClick');
    }
}

@Component({
    selector: 'rt-test-row-host',
    template: `
        <div qa-dataid="row" [rtDataTableRowClick]="row" [isTableRowClickable]="clickable()">
            <span qa-dataid="text">Заказ</span>
            <span qa-dataid="opt-out" rtDataTableStopRowClick>Картинка</span>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataTableRowClickDirective, RtDataTableStopRowClickDirective],
})
class RowHostComponent {
    public readonly row: IEntity = { id: 3 };
    public readonly clickable: WritableSignal<boolean> = signal(true);
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

    it('SC-UKV-300 — нажатие сообщается на опускании кнопки, до двойного нажатия', () => {
        press(node('text'), 'mousedown');
        press(node('text'), 'mousedown');
        press(node('text'), 'dblclick');

        expect(host.order).toEqual(['click', 'click', 'doubleClick']);
        expect(host.clicks).toEqual([{ id: 3 }, { id: 3 }]);
        expect(host.doubleClicks).toEqual([{ id: 3 }]);
    });

    it('SC-UKV-301 — строка, не сделанная нажимаемой, не сообщает ничего', () => {
        fixture.componentInstance.clickable.set(false);
        fixture.detectChanges();

        press(node('text'), 'mousedown');
        press(node('text'), 'dblclick');

        expect(host.order).toEqual([]);
    });
});

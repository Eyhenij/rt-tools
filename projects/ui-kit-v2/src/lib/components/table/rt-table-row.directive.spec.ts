import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtTableRowDirective } from './rt-table-row.directive';

/** Строка с вложенной кнопкой: активация строки и действие внутри неё не должны спорить. */
@Component({
    selector: 'rt-table-row-host',
    template: `
        <div rtTableRow qa-dataid="row" (activated)="opened = opened + 1">
            <span qa-dataid="row-text">Тур в Сочи</span>
            <button qa-dataid="row-button" type="button" (click)="removed = removed + 1">Удалить</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTableRowDirective],
})
class RowHostComponent {
    public opened: number = 0;
    public removed: number = 0;
}

function setup(): ComponentFixture<RowHostComponent> {
    return createRtFixture(RowHostComponent);
}

function node(fixture: ComponentFixture<RowHostComponent>, id: string): HTMLElement {
    return qa(fixture, id)?.nativeElement as HTMLElement;
}

/** Клавиша приходит от того же узла, что и в браузере, — от того, на котором стоит фокус. */
function press(target: HTMLElement, key: string): KeyboardEvent {
    const event: KeyboardEvent = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });

    target.dispatchEvent(event);

    return event;
}

describe('RtTableRowDirective', (): void => {
    it('строка попадает в обход с клавиатуры', (): void => {
        expect(node(setup(), 'row').getAttribute('tabindex')).toBe('0');
    });

    it('клик по строке отдаёт активацию', (): void => {
        const fixture: ComponentFixture<RowHostComponent> = setup();

        node(fixture, 'row-text').click();

        expect(fixture.componentInstance.opened).toBe(1);
    });

    it('клик по кнопке внутри строки активацией не считается', (): void => {
        // Иначе переход по строке спорил бы с действием внутри неё, и удаление
        // одновременно открывало бы карточку удалённого.
        const fixture: ComponentFixture<RowHostComponent> = setup();

        node(fixture, 'row-button').click();

        expect(fixture.componentInstance.removed).toBe(1);
        expect(fixture.componentInstance.opened).toBe(0);
    });

    it('Enter и пробел активируют строку так же, как клик', (): void => {
        const fixture: ComponentFixture<RowHostComponent> = setup();

        press(node(fixture, 'row'), 'Enter');
        press(node(fixture, 'row'), ' ');

        expect(fixture.componentInstance.opened).toBe(2);
    });

    it('пробел не пролистывает страницу', (): void => {
        const fixture: ComponentFixture<RowHostComponent> = setup();

        const event: KeyboardEvent = press(node(fixture, 'row'), ' ');

        expect(event.defaultPrevented).toBe(true);
    });

    it('клавиша, нажатая на кнопке внутри строки, строку не активирует', (): void => {
        const fixture: ComponentFixture<RowHostComponent> = setup();

        press(node(fixture, 'row-button'), 'Enter');

        expect(fixture.componentInstance.opened).toBe(0);
    });
});

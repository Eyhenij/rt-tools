import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../../testing/rt-kit-testing';
import { RtDateWheelDirective } from './rt-date-wheel.directive';

/** Колонка из трёх значений одного круга: барабану нужны только её узел и номер выбранного. */
@Component({
    selector: 'rt-date-wheel-host',
    template: `
        <ul
            qa-dataid="wheel"
            tabindex="0"
            [rtDateWheel]="enabled()"
            [rtDateWheelIndex]="index()"
            [rtDateWheelLoop]="3"
            (rtDateWheelPick)="picked.set($event)">
            <li>00</li>
            <li>01</li>
            <li>02</li>
        </ul>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDateWheelDirective],
})
class DateWheelHostComponent {
    public readonly enabled: WritableSignal<boolean> = signal<boolean>(true);
    public readonly index: WritableSignal<number> = signal<number>(0);
    public readonly picked: WritableSignal<number | null> = signal<number | null>(null);
}

function setup(enabled: boolean, index: number): ComponentFixture<DateWheelHostComponent> {
    const fixture: ComponentFixture<DateWheelHostComponent> = createRtFixture(DateWheelHostComponent, {}, { skipInitialDetect: true });

    fixture.componentInstance.enabled.set(enabled);
    fixture.componentInstance.index.set(index);
    fixture.detectChanges();

    return fixture;
}

function press(fixture: ComponentFixture<DateWheelHostComponent>, key: string): KeyboardEvent {
    const event: KeyboardEvent = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });

    (qa(fixture, 'wheel')?.nativeElement as HTMLElement).dispatchEvent(event);
    fixture.detectChanges();

    return event;
}

describe('RtDateWheelDirective', (): void => {
    it('стрелка вниз просит следующее значение круга', (): void => {
        const fixture: ComponentFixture<DateWheelHostComponent> = setup(true, 0);

        const event: KeyboardEvent = press(fixture, 'ArrowDown');

        expect(fixture.componentInstance.picked()).toBe(1);
        expect(event.defaultPrevented).toBe(true);
    });

    it('стрелка вверх с первого значения уходит на последнее: круг без конца', (): void => {
        const fixture: ComponentFixture<DateWheelHostComponent> = setup(true, 0);

        press(fixture, 'ArrowUp');

        expect(fixture.componentInstance.picked()).toBe(2);
    });

    it('стрелка вниз с последнего значения возвращает к первому', (): void => {
        const fixture: ComponentFixture<DateWheelHostComponent> = setup(true, 2);

        press(fixture, 'ArrowDown');

        expect(fixture.componentInstance.picked()).toBe(0);
    });

    it('выключенный барабан клавиши не трогает: колонка остаётся списком', (): void => {
        const fixture: ComponentFixture<DateWheelHostComponent> = setup(false, 0);

        const event: KeyboardEvent = press(fixture, 'ArrowDown');

        expect(fixture.componentInstance.picked()).toBeNull();
        expect(event.defaultPrevented).toBe(false);
    });

    it('без выбранного значения стрелке нечего сдвигать', (): void => {
        const fixture: ComponentFixture<DateWheelHostComponent> = setup(true, -1);

        press(fixture, 'ArrowDown');

        expect(fixture.componentInstance.picked()).toBeNull();
    });
});
